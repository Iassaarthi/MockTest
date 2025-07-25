let questions = [];
let currentIndex = 0;
let selectedAnswers = {};
let timer;
let testDuration = 2 * 60 * 60;

window.onload = function () {
  document.getElementById("startBtn").addEventListener("click", startTest);
};

async function startTest() {
  const start = document.getElementById("start-container");
  const test = document.getElementById("test-container");
  start.style.display = "none";
  test.style.display = "block";

  const res = await fetch("questions.json");
  questions = await res.json();

  renderQuestion();
  renderQuestionButtons();
  startTimer();
}

function renderQuestion() {
  const container = document.getElementById("question-container");
  const q = questions[currentIndex];
  container.innerHTML = \`
    <div class="question">
      <p><strong>Q\${currentIndex + 1}: \${q.question}</strong></p>
      \${q.options.map((opt, i) => \`
        <label class="option">
          <input type="radio" name="q\${currentIndex}" value="\${i}" \${selectedAnswers[currentIndex] === i ? "checked" : ""} />
          \${opt}
        </label>\`).join("")}
    </div>
  \`;

  document.querySelectorAll(\`input[name="q\${currentIndex}"]\`).forEach(input => {
    input.addEventListener("change", e => {
      selectedAnswers[currentIndex] = parseInt(e.target.value);
    });
  });
}

function renderQuestionButtons() {
  const nav = document.getElementById("question-nav");
  nav.innerHTML = "";
  questions.forEach((_, idx) => {
    const btn = document.createElement("button");
    btn.innerText = idx + 1;
    btn.onclick = () => {
      currentIndex = idx;
      renderQuestion();
    };
    nav.appendChild(btn);
  });

  document.getElementById("prevBtn").onclick = () => {
    if (currentIndex > 0) {
      currentIndex--;
      renderQuestion();
    }
  };

  document.getElementById("nextBtn").onclick = () => {
    if (currentIndex < questions.length - 1) {
      currentIndex++;
      renderQuestion();
    }
  };

  document.getElementById("submitBtn").onclick = submitTest;
  window.onblur = () => {
    alert("Tab switch detected. Submitting test.");
    submitTest();
  };
}

function startTimer() {
  const timerDiv = document.getElementById("timer");
  timer = setInterval(() => {
    if (testDuration <= 0) {
      clearInterval(timer);
      alert("Time's up!");
      submitTest();
      return;
    }
    const h = String(Math.floor(testDuration / 3600)).padStart(2, '0');
    const m = String(Math.floor((testDuration % 3600) / 60)).padStart(2, '0');
    const s = String(testDuration % 60).padStart(2, '0');
    timerDiv.innerText = \`Time Left: \${h}:\${m}:\${s}\`;
    testDuration--;
  }, 1000);
}

function submitTest() {
  clearInterval(timer);
  document.getElementById("test-container").style.display = "none";

  const resultDiv = document.getElementById("results");
  resultDiv.style.display = "block";
  let correctCount = 0;

  questions.forEach((q, idx) => {
    const selected = selectedAnswers[idx];
    const correct = q.correct;

    const result = document.createElement("div");
    result.classList.add("question");
    result.innerHTML = \`
      <p><strong>Q\${idx + 1}: \${q.question}</strong></p>
      <p>Your Answer: \${selected !== undefined ? q.options[selected] : "<em>Not Answered</em>"}</p>
      <p>Correct Answer: \${q.options[correct]}</p>
      <p class="\${selected === correct ? "correct" : "incorrect"}">\${selected === correct ? "✔ Correct" : "✘ Incorrect"}</p>
      <p class="explanation">Explanation: \${q.explanation}</p>
    \`;
    resultDiv.appendChild(result);
    if (selected === correct) correctCount++;
  });

  const summary = document.createElement("h2");
  summary.innerText = \`Your Score: \${correctCount} / \${questions.length}\`;
  resultDiv.prepend(summary);
}