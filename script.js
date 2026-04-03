const durationSelect = document.getElementById("durationSelect");
const techniqueInput = document.getElementById("techniqueInput");
const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const resetBtn = document.getElementById("resetBtn");
const darkModeToggle = document.getElementById("darkModeToggle");

const timerDisplay = document.getElementById("timerDisplay");
const totalSessionsEl = document.getElementById("totalSessions");
const totalTimeEl = document.getElementById("totalTime");
const historyList = document.getElementById("historyList");

const quoteText = document.getElementById("quoteText");
const quoteAuthor = document.getElementById("quoteAuthor");
const refreshQuoteBtn = document.getElementById("refreshQuoteBtn");

let timerId = null;
let timeLeft = Number(durationSelect.value) * 60;
let selectedDuration = Number(durationSelect.value);
let totalSessions = 0;
let totalMeditatedTime = 0;
const history = [];

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
}

function updateTimerDisplay() {
  timerDisplay.textContent = formatTime(timeLeft);
}

function updateStats() {
  totalSessionsEl.textContent = `Total Sessions: ${totalSessions}`;
  totalTimeEl.textContent = `Total Time Meditated: ${totalMeditatedTime} minutes`;
}

function renderHistory() {
  historyList.innerHTML = "";

  if (history.length === 0) {
    historyList.innerHTML = '<li class="list-group-item text-muted empty-state">No completed sessions yet.</li>';
    return;
  }

  const items = [...history].reverse();
  items.forEach((entry) => {
    const listItem = document.createElement("li");
    listItem.className = "list-group-item";
    listItem.textContent = `${entry.date} - ${entry.duration} mins - ${entry.technique}`;
    historyList.appendChild(listItem);
  });
}

function completeSession() {
  totalSessions += 1;
  totalMeditatedTime += selectedDuration;

  const technique = techniqueInput.value.trim();
  const date = new Date().toLocaleDateString("en-GB");

  history.push({
    duration: selectedDuration,
    technique,
    date
  });

  updateStats();
  renderHistory();
}

function stopTimer() {
  if (timerId) {
    clearInterval(timerId);
    timerId = null;
  }
}

function startTimer() {
  if (timerId) {
    return;
  }

  if (techniqueInput.value.trim() === "") {
    alert("Please enter a meditation technique.");
    return;
  }

  if (timeLeft <= 0) {
    selectedDuration = Number(durationSelect.value);
    timeLeft = selectedDuration * 60;
    updateTimerDisplay();
  }

  timerId = setInterval(() => {
    timeLeft--;
    updateTimerDisplay();

    if (timeLeft <= 0) {
      stopTimer();
      completeSession();
    }
  }, 1000);
}

function pauseTimer() {
  stopTimer();
}

function resetTimer() {
  stopTimer();
  selectedDuration = Number(durationSelect.value);
  timeLeft = selectedDuration * 60;
  updateTimerDisplay();
}

function handleDurationChange() {
  selectedDuration = Number(durationSelect.value);
  if (!timerId) {
    timeLeft = selectedDuration * 60;
    updateTimerDisplay();
  }
}

function applyDarkMode(isDark) {
  document.body.classList.toggle("dark-mode", isDark);
  darkModeToggle.textContent = isDark ? "Light Mode" : "Dark Mode";
}

function handleDarkModeToggle() {
  const isDarkMode = !document.body.classList.contains("dark-mode");
  applyDarkMode(isDarkMode);
}

async function fetchQuote() {
  quoteText.textContent = "Loading quote...";
  quoteAuthor.textContent = "";

  try {
    const response = await fetch("https://api.allorigins.win/raw?url=https://dummyjson.com/quotes");

    if (!response.ok) {
      throw new Error(`Failed with status ${response.status}`);
    }

    const data = await response.json();

    if (!data.quotes || !Array.isArray(data.quotes) || data.quotes.length === 0) {
      throw new Error("No quotes available");
    }

    const randomIndex = Math.floor(Math.random() * data.quotes.length);
    const randomQuote = data.quotes[randomIndex];

    quoteText.textContent = randomQuote.quote;
    quoteAuthor.textContent = `- ${randomQuote.author}`;
  } catch (error) {
    quoteText.textContent = "Unable to fetch quote right now. Please try again.";
    quoteAuthor.textContent = "";
    console.error("Quote fetch error:", error);
  } finally {
    refreshQuoteBtn.disabled = false;
  }
}

startBtn.addEventListener("click", startTimer);
pauseBtn.addEventListener("click", pauseTimer);
resetBtn.addEventListener("click", resetTimer);
durationSelect.addEventListener("change", handleDurationChange);
darkModeToggle.addEventListener("click", handleDarkModeToggle);
refreshQuoteBtn.addEventListener("click", () => {
  refreshQuoteBtn.disabled = true;
  fetchQuote();
});

updateTimerDisplay();
updateStats();
renderHistory();
fetchQuote();
