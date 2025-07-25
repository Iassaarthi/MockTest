let questions = [];
let selectedAnswers = {};
let timer;
let testDuration = 2 * 60 * 60; // 2 hours in seconds

window.onload = async function () {
  const response = await fetch("questions.json");
  questions = await response.json();
  displayQuestions();
  startTimer();

  document.getElementById("submitBtn").addEventListener("click", submitTest);

  window.onblur = function () {
    alert("Tab switch detected. Test will be auto-submitted.");
    submitTest();
  };
};

function displayQuestions() {
  const form = document.getElementById("quizForm");
  questions.forEach((q, idx) => {
    const div = document.createElement("div");
    div.classList.add("question");
    div.innerHTML = `
      <p><strong>Q${idx + 1}: ${q.question}</strong></p>
      ${q.options
        .map(
          (opt, i) =>
            `<label class="option">
              <input type="radio" name="q${idx}" value="${i}" />
              ${opt}
            </label><br/>`
        )
        .join("")}
    `;
    form.appendChild(div);
  });
}

function startTimer() {
  const timerDiv = document.getElementById("timer");

  timer = setInterval(() => {
    if (testDuration <= 0) {
      clearInterval(timer);
      alert("Time is up! Submitting the test.");
      submitTest();
      return;
    }

    const hours = String(Math.floor(testDuration / 3600)).padStart(2, "0");
    const minutes = String(Math.floor((testDuration % 3600) / 60)).padStart(
      2,
      "0"
    );
    const seconds = String(testDuration % 60).padStart(2, "0");

    timerDiv.innerText = `Time Left: ${hours}:${minutes}:${seconds}`;
    testDuration--;
  }, 1000);
}

function submitTest() {
  clearInterval(timer);

  const form = document.getElementById("quizForm");
  const inputs = form.querySelectorAll("input[type='radio']:checked");

  inputs.forEach((input) => {
    const name = input.name;
    const idx = parseInt(name.slice(1));
    selectedAnswers[idx] = parseInt(input.value);
  });

  document.getElementById("container").style.display = "none";
  showResults();
}

function showResults() {
  const resultDiv = document.getElementById("results");
  resultDiv.style.display = "block";

  let correctCount = 0;
  questions.forEach((q, idx) => {
    const selected = selectedAnswers[idx];
    const correct = q.correct;

    const result = document.createElement("div");
    result.classList.add("question");
    result.innerHTML = `
      <p><strong>Q${idx + 1}: ${q.question}</strong></p>
      <p>Your Answer: ${
        selected !== undefined ? q.options[selected] : "<em>Not Answered</em>"
      }</p>
      <p>Correct Answer: ${q.options[correct]}</p>
      <p class="${selected === correct ? "correct" : "incorrect"}">
        ${
          selected === correct
            ? "✔ Correct"
            : selected === undefined
            ? "✘ Not Answered"
            : "✘ Incorrect"
        }
      </p>
      <p class="explanation">Explanation: ${q.explanation}</p>
    `;
    resultDiv.appendChild(result);

    if (selected === correct) correctCount++;
  });

  const summary = document.createElement("h2");
  summary.innerHTML = `Your Score: ${correctCount} / ${questions.length}`;
  resultDiv.prepend(summary);
}