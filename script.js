document.addEventListener('DOMContentLoaded', function () {
  let body = document.body;

  // Fare hareketini algıla ve arka plan rengini tatlı mor tonlarında değiştir
  window.addEventListener('mousemove', function (e) {
    let x = e.clientX / window.innerWidth;
    let y = e.clientY / window.innerHeight;

    // Mor tonlarına odaklanmış renk geçişi
    let baseR = 150 + (x * 50);  // Hafif kırmızımsı-mor tonları
    let baseG = 50 + (y * 50);   // Daha az yeşil ton, moru vurgulamak için
    let baseB = 200 + (x * 30);  // Mavi-mor tonlarını güçlendirmek için

    // Fare konumuna göre dinamik arka plan değişikliği
    body.style.background = `linear-gradient(${45 + (x * 90)}deg, rgba(${baseR}, ${baseG}, ${baseB}, 1), rgba(${baseR - 50}, ${baseG + 30}, ${baseB - 30}, 1))`;
  });

  let questions = [];
  let score = 0;
  let questionIndex = 0;

  // Başlangıç ekranını yükle
  showStartScreen();

  function showStartScreen() {
    const quizContainer = document.getElementById('quiz-container');
    quizContainer.style.display = 'block'; // Quiz ekranını tekrar görünür hale getirme
    document.getElementById('result-container').innerHTML = ''; // Sonuçları temizleme

    quizContainer.innerHTML = `
      <h2>Soulslike Bilgi Yarışmasına Hoş Geldiniz!</h2>
      <button id="start-btn" class="button">Teste Başla</button>
    `;

    // "Teste Başla" butonuna tıklanınca testi başlat
    document.getElementById('start-btn').addEventListener('click', function () {
      startQuiz();
    });
  }

  // Testi başlat
  function startQuiz() {
    score = 0; // Skoru sıfırla
    questionIndex = 0; // Soru indeksini sıfırla

    // Soruları JSON dosyasından çek
    fetch('questions.json')
      .then(response => response.json())
      .then(data => {
        questions = shuffleArray(data).slice(0, 10); // Rastgele 10 soru seç
        loadQuestion();
      });
  }

  function loadQuestion() {
    const quizContainer = document.getElementById('quiz-container');
    quizContainer.innerHTML = '';

    const currentQuestion = questions[questionIndex];

    // Şıkları karıştır ve doğru şık yeni sırasını bul
    const shuffledOptions = shuffleArray([...currentQuestion.options]);
    const correctAnswer = shuffledOptions.indexOf(currentQuestion.options[currentQuestion.correctAnswer]);

    // Soruyu ekle
    const questionElement = document.createElement('h2');
    questionElement.textContent = currentQuestion.question;
    quizContainer.appendChild(questionElement);

    // Şıkları 2x2 yerleştir
    const optionsContainer = document.createElement('div');
    optionsContainer.classList.add('options-grid');
    shuffledOptions.forEach((option, index) => {
      const optionLabel = document.createElement('label');
      optionLabel.classList.add('option-box');
      const optionInput = document.createElement('input');
      optionInput.type = 'radio';
      optionInput.name = 'option';
      optionInput.value = index;

      // Yanıt seçildiğinde sonucu işleme
      optionInput.addEventListener('change', function () {
        handleAnswerSelection(index, correctAnswer);
      });

      optionLabel.appendChild(optionInput);
      optionLabel.appendChild(document.createTextNode(option));
      optionsContainer.appendChild(optionLabel);
    });
    quizContainer.appendChild(optionsContainer);

    // Doğru cevabın sırasını güncelle
    questions[questionIndex].correctAnswer = correctAnswer;
  }

  // Şıkları karıştır
  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  // Yanıt seçildiğinde sonucu işle
  function handleAnswerSelection(selectedIndex, correctAnswer) {
    if (selectedIndex === correctAnswer) {
      score++;
    }
    questionIndex++;
    if (questionIndex < questions.length) {
      loadQuestion(); // Yeni soruyu yükle
    } else {
      showResult(); // Test bittiğinde sonucu göster
    }
  }

  function showResult() {
    document.getElementById('quiz-container').style.display = 'none'; // Soruların bulunduğu div'i gizle
    const resultContainer = document.getElementById('result-container');
    const finalScore = ((score / questions.length) * 100).toFixed(0); // Ondalık olmadan gösterim

    resultContainer.innerHTML = `<h2>Puanınız: ${finalScore} / 100</h2>`;

    // Puan aralığına göre mesaj göster
    if (finalScore === 100) {
      resultContainer.innerHTML += "<p>Tebrikler! FromSoftware seni ayakta alkışlıyor!</p>";
    } else if (finalScore >= 80) {
      resultContainer.innerHTML += "<p>En iyisi olmasan da Solaire seni hâlâ seviyor! \\o/</p>";
    } else if (finalScore >= 60) {
      resultContainer.innerHTML += "<p>Flask içmeyi yeni öğrenmişsin. Daha fazla çabalaman lazım!</p>";
    } else {
      resultContainer.innerHTML += "<p>Yeterli değilsin!</p>";
    }

    resultContainer.classList.add('result-style'); // Sonuç stilini uygula

    // Tekrar deneme ve paylaşma butonlarını ekle
    resultContainer.innerHTML += `
      <button id="retry-btn" class="button">Tekrar Dene</button>
      <button id="share-btn" class="button">Paylaş</button>
    `;

    // Tekrar Dene butonuna tıklanınca testi baştan başlat
    document.getElementById('retry-btn').addEventListener('click', function () {
      showStartScreen(); // Başlangıç ekranına dön ve testi sıfırla
    });

    // Paylaş butonuna tıklanınca X (Twitter) paylaşımını aç
    document.getElementById('share-btn').addEventListener('click', function () {
      const tweetText = `Soulslike Bilgi Yarışması'nda ${finalScore} puan aldım! Sen de deneyebilirsin!`;
      const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
      window.open(tweetUrl, '_blank');
    });
  }
});
