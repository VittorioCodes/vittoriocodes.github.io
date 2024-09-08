document.addEventListener('DOMContentLoaded', function () {
    let questions = [];
    let score = 0;
    let questionIndex = 0;
  
    // Soruları JSON dosyasından çek
    fetch('questions.json')
      .then(response => response.json())
      .then(data => {
        questions = data;
        questions = shuffleArray(questions).slice(0, 10); // Rastgele 10 soru seç
        loadQuestion();
      });
  
    function loadQuestion() {
      const quizContainer = document.getElementById('quiz-container');
      quizContainer.innerHTML = '';
  
      const currentQuestion = questions[questionIndex];
      const questionElement = document.createElement('h2');
      questionElement.textContent = currentQuestion.question;
      quizContainer.appendChild(questionElement);
  
      currentQuestion.options.forEach((option, index) => {
        const optionLabel = document.createElement('label');
        const optionInput = document.createElement('input');
        optionInput.type = 'radio';
        optionInput.name = 'option';
        optionInput.value = index;
        optionLabel.appendChild(optionInput);
        optionLabel.appendChild(document.createTextNode(option));
        quizContainer.appendChild(optionLabel);
        quizContainer.appendChild(document.createElement('br'));
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
  
    // Testi gönder butonu
    document.getElementById('submit-btn').addEventListener('click', function () {
      const selectedOption = document.querySelector('input[name="option"]:checked');
      if (selectedOption) {
        const answer = parseInt(selectedOption.value);
        if (answer === questions[questionIndex].correctAnswer) {
          score++;
        }
        questionIndex++;
        if (questionIndex < questions.length) {
          loadQuestion();
        } else {
          showResult();
        }
      } else {
        alert('Lütfen bir seçenek işaretleyin');
      }
    });
  
    function showResult() {
      document.getElementById('quiz-container').innerHTML = '';
      document.getElementById('result-container').textContent = `Puanınız: ${score} / ${questions.length}`;
    }
  });
  