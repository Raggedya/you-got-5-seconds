const categoryButtons = document.querySelectorAll(".category-button");
const nextButton = document.getElementById("nextButton");
const startButton = document.getElementById("startButton");
const questionText = document.getElementById("questionText");
const timerNumber = document.getElementById("timerNumber");

const goSound = new Audio("assets/go.mp3");
const dingSound = new Audio("assets/ding.mp3");

let selectedCategory = "Cars";
let allQuestions = [];
let timerInterval = null;
let timeLeft = 5;

fetch("YG5S_Master_Question_Database.csv")
  .then((response) => response.text())
  .then((csvText) => {
    allQuestions = parseCSV(csvText);
    console.log("Questions loaded:", allQuestions.length);
    showRandomQuestion();
  });

function parseCSV(csvText) {
  const lines = csvText.trim().split("\n");
  const rows = lines.slice(1);

  return rows.map((line) => {
    const parts = line.split(",");
    return {
      id: parts[0],
      category: parts[1],
      question: parts.slice(2).join(",").trim()
    };
  });
}

categoryButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (timerInterval) return;

    categoryButtons.forEach((btn) => {
      btn.classList.remove("selected");
    });

    button.classList.add("selected");
    selectedCategory = button.dataset.category;

    showRandomQuestion();
  });
});

nextButton.addEventListener("click", () => {
  if (timerInterval) return;
  showRandomQuestion();
});

startButton.addEventListener("click", () => {
  startTimer();
});

function showRandomQuestion() {
  if (allQuestions.length === 0) return;

  let availableQuestions;

  if (selectedCategory === "Random") {
    availableQuestions = allQuestions;
  } else {
    availableQuestions = allQuestions.filter((item) => {
      return item.category === selectedCategory;
    });
  }

  if (availableQuestions.length === 0) {
    questionText.textContent = "No questions found.";
    return;
  }

  const randomIndex = Math.floor(Math.random() * availableQuestions.length);
  const chosenQuestion = availableQuestions[randomIndex];

  questionText.textContent = chosenQuestion.question;
}

function startTimer() {
  if (timerInterval) return;

  playSound(goSound);

  timeLeft = 5;
  timerNumber.textContent = timeLeft;

  startButton.disabled = true;
  nextButton.disabled = true;

  timerInterval = setInterval(() => {
    timeLeft = timeLeft - 1;
    timerNumber.textContent = timeLeft;

    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      timerInterval = null;

      timerNumber.textContent = "0";

      playSound(dingSound);

      startButton.disabled = false;
      nextButton.disabled = false;
    }
  }, 1000);
}

function playSound(sound) {
  sound.currentTime = 0;
  sound.play().catch(() => {
    console.log("Sound could not play.");
  });
}function setGameLocked(isLocked) {
  startButton.disabled = isLocked;
  nextButton.disabled = isLocked;

  categoryButtons.forEach((button) => {
    button.disabled = isLocked;
  });
}