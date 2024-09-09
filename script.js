document.addEventListener('DOMContentLoaded', function () {
  let body = document.body;
  let questions = [];
  let score = 0;
  let questionIndex = 0;
  let selectedGame = '';

  // Fare hareketini algıla ve arka plan rengini tatlı mor tonlarında değiştir
  window.addEventListener('mousemove', function (e) {
    let x = e.clientX / window.innerWidth;
    let y = e.clientY / window.innerHeight;

    let baseR = 150 + (x * 50); 
    let baseG = 50 + (y * 50);   
    let baseB = 200 + (x * 30);

    body.style.background = `linear-gradient(${45 + (x * 90)}deg, rgba(${baseR}, ${baseG}, ${baseB}, 1), rgba(${baseR - 50}, ${baseG + 30}, ${baseB - 30}, 1))`;
  });

  // Oyun seçimi ekranını göster
  function showGameSelectionScreen() {
    const gameSelectionContainer = document.getElementById('game-selection-container');
    gameSelectionContainer.style.display = 'block';
    document.getElementById('quiz-container').style.display = 'none';
    document.getElementById('result-container').style.display = 'none';

    const gameButtons = document.querySelectorAll('.game-btn');
    gameButtons.forEach(button => {
      button.addEventListener('click', function () {
        selectedGame = this.getAttribute('data-game');
        startQuiz(); 
      });
    });
  }

  // Testi başlat
  function startQuiz() {
    score = 0;
    questionIndex = 0;

    // Seçilen oyunun JSON dosyasını yükle
    fetch(`${selectedGame}.json`)
      .then(response => response.json())
      .then(data => {
        questions = shuffleArray(data).slice(0, 10); 
        loadQuestion();
      });
  }

  function loadQuestion() {
    const quizContainer = document.getElementById('quiz-container');
    quizContainer.style.display = 'block';
    document.getElementById('game-selection-container').style.display = 'none';
    document.getElementById('result-container').style.display = 'none';

    const currentQuestion = questions[questionIndex];
    quizContainer.innerHTML = '';

    const questionElement = document.createElement('h2');
    questionElement.textContent = currentQuestion.question;
    quizContainer.appendChild(questionElement);

    // Şıkları karıştır
    const shuffledOptions = shuffleArray([...currentQuestion.options]);

    const optionsContainer = document.createElement('div');
    optionsContainer.classList.add('options-grid');
    shuffledOptions.forEach((option, index) => {
      const optionLabel = document.createElement('label');
      optionLabel.classList.add('option-box');
      const optionInput = document.createElement('input');
      optionInput.type = 'radio';
      optionInput.name = 'option';
      optionInput.value = index;

      // Doğru cevabın yeni indeksini bul ve karşılaştır
      optionInput.addEventListener('change', function () {
        const correctAnswerIndex = shuffledOptions.indexOf(currentQuestion.options[currentQuestion.correctAnswer]);
        handleAnswerSelection(index, correctAnswerIndex);
      });

      optionLabel.appendChild(optionInput);
      optionLabel.appendChild(document.createTextNode(option));
      optionsContainer.appendChild(optionLabel);
    });
    quizContainer.appendChild(optionsContainer);
  }

  function handleAnswerSelection(selectedIndex, correctAnswerIndex) {
    if (selectedIndex === correctAnswerIndex) {
      score++;
    }
    questionIndex++;
    if (questionIndex < questions.length) {
      loadQuestion();
    } else {
      showResult();
    }
  }

  function showResult() {
    const quizContainer = document.getElementById('quiz-container');
    quizContainer.style.display = 'none';
    const resultContainer = document.getElementById('result-container');
    resultContainer.style.display = 'block';
    const finalScore = ((score / questions.length) * 100).toFixed(0);

    // Puan aralıklarına göre mesajlar doğru sırayla kontrol ediliyor
    if (finalScore == 100) {
      resultContainer.innerHTML = `<h2>Puanınız: ${finalScore} / 100</h2><p>Tebrikler! FromSoftware seni ayakta alkışlıyor!</p>`;
    } else if (finalScore >= 80) {
      resultContainer.innerHTML = `<h2>Puanınız: ${finalScore} / 100</h2><p>En iyisi olmasan da Solaire seni hâlâ seviyor! \\o/</p>`;
    } else if (finalScore >= 60) {
      resultContainer.innerHTML = `<h2>Puanınız: ${finalScore} / 100</h2><p>Flask içmeyi yeni öğrenmişsin. Daha fazla çabalaman lazım!</p>`;
    } else {
      resultContainer.innerHTML = `<h2>Puanınız: ${finalScore} / 100</h2><p>Yeterli değilsin!</p>`;
    }

    resultContainer.innerHTML += `
      <button id="retry-btn" class="button">Tekrar Dene</button>
      <button id="share-btn" class="button">Sonucu Paylaş</button>
    `;

    document.getElementById('share-btn').addEventListener('click', function () {
      const tweetText = `Soulslike Bilgi Yarışması'nda ${finalScore} puan aldım! Sen de deneyebilirsin! https://vittoriocodes.github.io`;
      const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
      window.open(tweetUrl, '_blank');
    });

    document.getElementById('retry-btn').addEventListener('click', function () {
      showGameSelectionScreen();
    });
  }

  // Şıkları karıştır
  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  showGameSelectionScreen();
});
