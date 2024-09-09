document.addEventListener('DOMContentLoaded', function () {
  let body = document.body;
  let questions = [];
  let score = 0;
  let questionIndex = 0;
  let selectedGame = '';
  let audio = new Audio(); // Müzik oynatıcı
  let isPlaying = false;

  // Fare hareketini algıla ve arka plan rengini tatlı mor tonlarında değiştir
  window.addEventListener('mousemove', function (e) {
    let x = e.clientX / window.innerWidth;
    let y = e.clientY / window.innerHeight;

    // Pastel tonlar için renkleri daha düşük doygunlukta hesaplıyoruz
    let baseR = 255 - (x * 100);  // Daha yumuşak kırmızı ton
    let baseG = 200 + (y * 30);   // Yumuşak yeşil ton
    let baseB = 255 - (x * 80);   // Yumuşak mavi ton

    // Pastel renk geçişleri oluşturuluyor
    body.style.background = `linear-gradient(${45 + (x * 90)}deg, rgba(${baseR}, ${baseG}, ${baseB}, 0.7), rgba(${baseR + 20}, ${baseG - 20}, ${baseB + 30}, 0.7))`;
  });

  // Müzik kontrol butonu ve ses seviyesi slider'ı
  const musicControl = document.getElementById('music-control');
  const toggleMusicBtn = document.getElementById('toggle-music-btn');
  const volumeSlider = document.getElementById('volume-slider');

  // Slider başlangıç değerini %50 olarak ayarla
  volumeSlider.value = 0.5;

  // Müzik başlatma/durdurma işlevi
  function toggleMusic() {
    if (isPlaying) {
      audio.pause();
      toggleMusicBtn.textContent = '🔇'; // Sesi kapatma simgesi
    } else {
      audio.play();
      toggleMusicBtn.textContent = '🔊'; // Sesi açma simgesi
    }
    isPlaying = !isPlaying;
  }

  toggleMusicBtn.addEventListener('click', toggleMusic);

  // Ses seviyesini ayarlama ve Slider renklendirme
  volumeSlider.addEventListener('input', function () {
    audio.volume = volumeSlider.value; // Ses seviyesini slider'ın değerine göre ayarla
    updateSliderColor(volumeSlider); // Slider'ın renkli kısmını güncelle
  });

  // Slider'ın dolan kısmını renklendirme
  function updateSliderColor(slider) {
    const value = (slider.value - slider.min) / (slider.max - slider.min) * 100; // Yüzdelik hesap
    slider.style.background = `linear-gradient(to right, red ${value}%, #ccc ${value}%)`;
  }

// Oyun seçimi ekranını göster
  function showGameSelectionScreen() {
    const gameSelectionContainer = document.getElementById('game-selection-container');
    gameSelectionContainer.style.display = 'block';
    document.getElementById('quiz-container').style.display = 'none';
    document.getElementById('result-container').style.display = 'none';
    musicControl.style.display = 'none'; // Müzik kontrol butonunu gizle

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

    // Seçilen oyunun müziğini yükle
    loadGameMusic(selectedGame);

    // Seçilen oyunun JSON dosyasını yükle
    fetch(`questions/${selectedGame}.json`)
      .then(response => response.json())
      .then(data => {
        questions = shuffleArray(data).slice(0, 10); 
        loadQuestion();
      });
  }

   // Oyun müziğini yükle ve çalmaya başla
   function loadGameMusic(game) {
    let musicFile = '';

    if (game === 'dark_souls_1') {
      musicFile = 'music/dark_souls_1.mp3';
    } else if (game === 'dark_souls_2') {
      musicFile = 'music/dark_souls_2.mp3';
    } else if (game === 'dark_souls_3') {
      musicFile = 'music/dark_souls_3.mp3';
    } else if (game === 'elden_ring') {
      musicFile = 'music/elden_ring.mp3';
    }

    audio.src = musicFile;
    audio.loop = true; // Müzik döngüde oynatılır
    audio.play();
    isPlaying = true;
    toggleMusicBtn.textContent = '🔊'; // Sesi açma simgesi
    musicControl.style.display = 'block'; // Müzik kontrol butonunu göster

    // Müzik başladığında slider rengini güncelle
    updateSliderColor(volumeSlider);
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

    // Solaire animasyonunu ekleyeceğimiz yer
    let solaireAnimation = '';

    // Puan aralıklarına göre mesajlar doğru sırayla kontrol ediliyor
    if (finalScore == 100) {
      resultContainer.innerHTML = `<h2>Puanınız: ${finalScore} / 100</h2><p>Tebrikler! FromSoftware seni ayakta alkışlıyor!</p>`;
    } else if (finalScore >= 80) {
      solaireAnimation = `<img src="images/solaire_pixel.gif" alt="Solaire" class="solaire-animation">`; // Solaire animasyonu
      resultContainer.innerHTML = `<h2>Puanınız: ${finalScore} / 100</h2><p>En iyisi olmasan da Solaire seni hâlâ seviyor! \\o/</p>${solaireAnimation}`;
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
