const categoryButtons = document.querySelectorAll(".category-button");
const nextButton = document.getElementById("nextButton");
const startButton = document.getElementById("startButton");
const shareButton = document.getElementById("shareButton");
const questionText = document.getElementById("questionText");
const timerNumber = document.getElementById("timerNumber");
const timerRing = document.getElementById("timerRing");

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

    categoryButtons.forEach((btn) => btn.classList.remove("selected"));
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

if (shareButton) {
  shareButton.addEventListener("click", () => {
    shareGame();
  });
}

function showRandomQuestion() {
  if (allQuestions.length === 0) return;

  const availableQuestions =
    selectedCategory === "Random"
      ? allQuestions
      : allQuestions.filter((item) => item.category === selectedCategory);

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

  unlockAudio();
  playSound(goSound);

  timeLeft = 5;
  timerNumber.textContent = timeLeft;
  updateTimerRing(5);

  setGameLocked(true);

  timerInterval = setInterval(() => {
    timeLeft = timeLeft - 1;
    timerNumber.textContent = timeLeft;
    updateTimerRing(timeLeft);

    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      timerInterval = null;

      timerNumber.textContent = "0";
      updateTimerRing(0);

      playSound(dingSound);
      playBuiltInDing();

      if (navigator.vibrate) {
        navigator.vibrate(120);
      }

      setGameLocked(false);
    }
  }, 1000);
}

function unlockAudio() {
  dingSound.volume = 0;
  dingSound.play()
    .then(() => {
      dingSound.pause();
      dingSound.currentTime = 0;
      dingSound.volume = 1;
    })
    .catch(() => {
      dingSound.volume = 1;
    });
}

function playSound(sound) {
  sound.pause();
  sound.currentTime = 0;

  sound.play().catch(() => {
    console.log("Sound could not play.");
  });
}

function playBuiltInDing() {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;

  const audioCtx = new AudioContext();

  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(
    1320,
    audioCtx.currentTime + 0.15
  );

  gainNode.gain.setValueAtTime(0.0001, audioCtx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.4, audioCtx.currentTime + 0.03);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.45);

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  oscillator.start(audioCtx.currentTime);
  oscillator.stop(audioCtx.currentTime + 0.5);
}

function setGameLocked(isLocked) {
  startButton.disabled = isLocked;
  nextButton.disabled = isLocked;

  if (shareButton) {
    shareButton.disabled = isLocked;
  }

  categoryButtons.forEach((button) => {
    button.disabled = isLocked;
  });
}

function updateTimerRing(secondsLeft) {
  if (!timerRing) return;

  const degrees = (secondsLeft / 5) * 360;
  timerRing.style.background = `conic-gradient(#b7221f ${degrees}deg, #151515 ${degrees}deg)`;
}

function shareGame() {
  const shareText =
    "I’m playing You Got 5 Seconds with Aggits. Think you can beat the clock?";
  const shareUrl = window.location.href;

  if (navigator.share) {
    navigator.share({
      title: "You Got 5 Seconds with Aggits",
      text: shareText,
      url: shareUrl
    });
  } else {
    navigator.clipboard.writeText(shareUrl);
    alert("Game link copied to clipboard!");
  }
}
