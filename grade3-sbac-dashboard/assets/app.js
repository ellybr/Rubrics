/* ============================================================
   GRADE 3 SBAC-STYLE MATH PRACTICE — App Logic
   Standalone, no frameworks, no external dependencies.

   HOW IT WORKS (big picture):
   1. On page load, we fetch the list of questions from data/grade3.json
   2. We show one question at a time inside the #app div
   3. The student picks an answer, then clicks "Check Answer"
   4. We highlight correct / incorrect and show an explanation
   5. The student clicks "Next" to move forward
   6. After the last question, we show a summary screen
   7. The student can click "Try Again" to reset and start over

   ITEM TYPES SUPPORTED:
   - multiple_choice  → radio-style buttons (A, B, C, D)
   - multi_select     → checkbox-style buttons (select all that apply)
   - short_response   → text box; graded by "firstword", "firstnumber", or "exact"
   - table_input      → read a data table, then answer sub-questions
   ============================================================ */

"use strict"; // Catch common coding mistakes early

/* ------------------------------------------------------------
   STATE — one object that holds everything the app needs to know
   ------------------------------------------------------------ */
const state = {
  items:        [],   // array of question objects loaded from JSON
  currentIndex: 0,   // which question we're on (0 = first)
  score:        0,   // how many questions answered correctly
  results:      [],  // array of { correct: true/false, item: {...} } per question
  checked:      false, // whether the student has checked their answer on this question
};

/* ------------------------------------------------------------
   BOOT — runs as soon as the page finishes loading
   ------------------------------------------------------------ */
document.addEventListener("DOMContentLoaded", () => {
  loadQuestions();
});

/* ------------------------------------------------------------
   loadQuestions
   Fetches the JSON file and kicks off the quiz.
   'async/await' lets us wait for the network request to finish
   without freezing the browser tab.
   ------------------------------------------------------------ */
async function loadQuestions() {
  try {
    // fetch() asks the browser to download the JSON file
    const response = await fetch("data/grade3.json");
    if (!response.ok) {
      throw new Error(`Could not load questions (HTTP ${response.status})`);
    }
    // .json() converts the raw text into a JavaScript object
    const data = await response.json();

    state.items = data.items;

    // Update the subtitle in the header now that we know the data
    const subtitleEl = document.getElementById("header-subtitle");
    if (subtitleEl) subtitleEl.textContent = data.subtitle || "";

    // Show the first question
    showQuestion(0);

  } catch (err) {
    // If anything goes wrong, show a friendly error message
    document.getElementById("app").innerHTML =
      `<div class="loading-screen">
         <p>Sorry, the questions couldn't load. Please refresh the page.</p>
         <p style="color:#94a3b8;font-size:0.8rem;margin-top:8px">${escapeHtml(err.message)}</p>
       </div>`;
  }
}

/* ------------------------------------------------------------
   showQuestion(index)
   Renders question number `index` (0-based) into the #app div.
   Called every time the student moves to a new question.
   ------------------------------------------------------------ */
function showQuestion(index) {
  // Reset the "has checked answer" flag for this new question
  state.checked = false;

  const item = state.items[index];
  const total = state.items.length;

  // Update the header progress indicators
  updateProgress(index, total);

  // Build the question card HTML
  const app = document.getElementById("app");
  app.innerHTML = buildQuestionCard(item, index, total);

  // Wire up the interactive bits (buttons, inputs, event listeners)
  attachAnswerHandlers(item, index, total);

  // Scroll to the top so the question header is visible
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/* ------------------------------------------------------------
   updateProgress(currentIndex, total)
   Updates the header progress label and bar fill.
   ------------------------------------------------------------ */
function updateProgress(index, total) {
  const label = document.getElementById("progress-label");
  const fill  = document.getElementById("progress-bar-fill");
  const track = document.getElementById("progress-bar-track");

  if (label) label.textContent = `Question ${index + 1} of ${total}`;

  // Progress percentage based on questions *completed before this one*
  const pct = total > 0 ? Math.round((index / total) * 100) : 0;
  if (fill)  fill.style.width = pct + "%";
  if (track) track.setAttribute("aria-valuenow", pct);
}

/* ------------------------------------------------------------
   buildQuestionCard(item, index, total)
   Returns the HTML string for one question card.
   ------------------------------------------------------------ */
function buildQuestionCard(item, index, total) {
  const diffClass = item.difficulty || "medium"; // easy | medium | hard

  // Decide which label goes on the "Next" / "Finish" button
  const isLast   = index === total - 1;
  const nextLabel = isLast ? "Finish Quiz" : "Next Question →";
  const nextClass = isLast ? "btn btn-finish" : "btn btn-secondary";

  return `
    <div class="question-card" id="question-card">

      <!-- Meta row: claim badge, standard, difficulty -->
      <div class="question-meta">
        <span class="claim-badge" data-claim="${escapeHtml(item.claim)}">${escapeHtml(item.claim)}</span>
        <span class="standard-badge">${escapeHtml(item.standard)}</span>
        <span class="difficulty-badge ${diffClass}">${capitalize(diffClass)}</span>
      </div>

      <!-- Question text (pre-wrap so picture-graph newlines render correctly) -->
      <p class="question-text" id="question-text">${escapeHtml(item.question)}</p>

      <!-- Answer area — different for each item type -->
      <div id="answer-area">
        ${buildAnswerArea(item)}
      </div>

      <!-- Buttons -->
      <div class="answer-controls" id="answer-controls">
        <button class="btn btn-primary" id="check-btn">Check Answer</button>
        <button class="${nextClass}" id="next-btn" style="display:none">
          ${nextLabel}
        </button>
      </div>

      <!-- Feedback panel — hidden until check is clicked -->
      <div id="feedback-panel" style="display:none"></div>

    </div>
  `;
}

/* ------------------------------------------------------------
   buildAnswerArea(item)
   Returns the inner HTML for the answer area.
   Dispatches to the right builder based on item.type.
   ------------------------------------------------------------ */
function buildAnswerArea(item) {
  switch (item.type) {
    case "multiple_choice": return buildMultipleChoice(item);
    case "multi_select":    return buildMultiSelect(item);
    case "short_response":  return buildShortResponse(item);
    case "table_input":     return buildTableInput(item);
    default:
      return `<p style="color:#dc2626">Unknown question type: ${escapeHtml(item.type)}</p>`;
  }
}

/* ------------------------------------------------------------
   buildMultipleChoice(item)
   Creates A/B/C/D radio-style buttons.
   ------------------------------------------------------------ */
function buildMultipleChoice(item) {
  const letters = ["A", "B", "C", "D", "E", "F"]; // supports up to 6 choices
  const buttons = item.choices.map((text, i) => `
    <button class="mc-option" data-index="${i}" type="button">
      <span class="mc-letter">${letters[i]}</span>
      <span>${escapeHtml(text)}</span>
    </button>
  `).join("");

  return `<div class="mc-options" id="mc-options">${buttons}</div>`;
}

/* ------------------------------------------------------------
   buildMultiSelect(item)
   Creates checkbox-style buttons (select ALL that apply).
   ------------------------------------------------------------ */
function buildMultiSelect(item) {
  const buttons = item.choices.map((text, i) => `
    <button class="mc-option" data-index="${i}" type="button" aria-pressed="false">
      <span class="check-indicator" aria-hidden="true">✓</span>
      <span>${escapeHtml(text)}</span>
    </button>
  `).join("");

  return `
    <p class="multi-select-hint">Select ALL that apply.</p>
    <div class="mc-options" id="mc-options">${buttons}</div>
  `;
}

/* ------------------------------------------------------------
   buildShortResponse(item)
   Creates a text input (single line for numbers, textarea for explanations).
   We use a <textarea> for everything so longer answers fit comfortably.
   ------------------------------------------------------------ */
function buildShortResponse(item) {
  const placeholder = item.placeholder || "Type your answer here…";
  return `
    <div class="short-response-area">
      <textarea
        class="short-response-input"
        id="short-response-input"
        placeholder="${escapeHtml(placeholder)}"
        rows="3"
        aria-label="Answer"
      ></textarea>
    </div>
  `;
}

/* ------------------------------------------------------------
   buildTableInput(item)
   Renders a data table, then a text input for each sub-question.
   ------------------------------------------------------------ */
function buildTableInput(item) {
  // Build the table
  const headerCells = item.table.headers
    .map(h => `<th>${escapeHtml(h)}</th>`)
    .join("");

  const rows = item.table.rows.map(row => {
    const cells = row.map(cell => `<td>${escapeHtml(cell)}</td>`).join("");
    return `<tr>${cells}</tr>`;
  }).join("");

  const tableHtml = `
    <div class="data-table-wrapper">
      <table class="data-table">
        <thead><tr>${headerCells}</tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;

  // Build a text input for each sub-question
  const subQHtml = item.subQuestions.map((sq, i) => `
    <div class="sub-question" id="sub-question-${i}">
      <label class="sub-question-label" for="sq-input-${i}">
        ${escapeHtml(sq.label)}
      </label>
      <input
        class="sub-question-input"
        id="sq-input-${i}"
        type="text"
        placeholder="Your answer…"
        data-sq-index="${i}"
      />
    </div>
  `).join("");

  return `
    ${tableHtml}
    <div class="sub-questions" id="sub-questions">${subQHtml}</div>
  `;
}

/* ------------------------------------------------------------
   attachAnswerHandlers(item, index, total)
   Wires up all the click / keypress listeners for one question.
   Called once right after buildQuestionCard() renders the HTML.
   ------------------------------------------------------------ */
function attachAnswerHandlers(item, index, total) {
  const checkBtn = document.getElementById("check-btn");
  const nextBtn  = document.getElementById("next-btn");

  // --- Multiple choice: clicking a button selects it ---
  if (item.type === "multiple_choice") {
    document.querySelectorAll("#mc-options .mc-option").forEach(btn => {
      btn.addEventListener("click", () => {
        if (state.checked) return; // locked after checking
        // Deselect all, then select this one
        document.querySelectorAll("#mc-options .mc-option").forEach(b => {
          b.classList.remove("selected");
        });
        btn.classList.add("selected");
      });
    });
  }

  // --- Multi-select: clicking toggles selection ---
  if (item.type === "multi_select") {
    document.querySelectorAll("#mc-options .mc-option").forEach(btn => {
      btn.addEventListener("click", () => {
        if (state.checked) return; // locked after checking
        const isSelected = btn.classList.contains("selected");
        btn.classList.toggle("selected", !isSelected);
        btn.setAttribute("aria-pressed", String(!isSelected));
      });
    });
  }

  // --- Short response: pressing Enter checks the answer ---
  if (item.type === "short_response") {
    const input = document.getElementById("short-response-input");
    if (input) {
      input.addEventListener("keydown", e => {
        // Shift+Enter = newline (for explanations), plain Enter = check
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          if (!state.checked) checkBtn.click();
        }
      });
    }
  }

  // --- Check Answer button ---
  checkBtn.addEventListener("click", () => {
    handleCheck(item);
  });

  // --- Next / Finish button ---
  nextBtn.addEventListener("click", () => {
    const next = index + 1;
    if (next < total) {
      showQuestion(next);
    } else {
      showSummary();
    }
  });
}

/* ------------------------------------------------------------
   handleCheck(item)
   Reads the student's answer, grades it, shows visual feedback.
   ------------------------------------------------------------ */
function handleCheck(item) {
  if (state.checked) return; // prevent double-checking

  const answer = getUserAnswer(item);

  // If nothing is selected yet, nudge the student without an alert
  if (answer === null) {
    const checkBtn = document.getElementById("check-btn");
    checkBtn.textContent = "Please answer first!";
    setTimeout(() => { checkBtn.textContent = "Check Answer"; }, 1500);
    return;
  }

  state.checked = true;

  // Grade the answer
  const correct = checkAnswer(item, answer);

  // Update score + results log
  if (correct) state.score++;
  state.results.push({ correct, item });

  // Visually mark correct / wrong
  markAnswers(item, answer, correct);

  // Show the explanation panel
  showFeedback(item, correct);

  // Show Next / Finish button, hide Check button
  document.getElementById("check-btn").style.display = "none";
  document.getElementById("next-btn").style.display  = "inline-flex";

  // Update progress bar to reflect answered questions
  updateProgress(state.results.length - 1, state.items.length);
}

/* ------------------------------------------------------------
   getUserAnswer(item)
   Returns the student's current answer in a type-specific format.
   Returns null if nothing has been selected / typed.
   ------------------------------------------------------------ */
function getUserAnswer(item) {
  switch (item.type) {

    case "multiple_choice": {
      // Find the button with the "selected" class; return its index
      const selected = document.querySelector("#mc-options .mc-option.selected");
      return selected ? parseInt(selected.dataset.index, 10) : null;
    }

    case "multi_select": {
      // Collect indices of all selected buttons
      const selected = Array.from(
        document.querySelectorAll("#mc-options .mc-option.selected")
      ).map(b => parseInt(b.dataset.index, 10));
      return selected.length > 0 ? selected : null;
    }

    case "short_response": {
      const input = document.getElementById("short-response-input");
      const val = input ? input.value.trim() : "";
      return val.length > 0 ? val : null;
    }

    case "table_input": {
      // Collect one answer per sub-question
      const answers = item.subQuestions.map((_, i) => {
        const el = document.getElementById(`sq-input-${i}`);
        return el ? el.value.trim() : "";
      });
      // If all are empty, return null
      return answers.some(a => a.length > 0) ? answers : null;
    }

    default:
      return null;
  }
}

/* ------------------------------------------------------------
   checkAnswer(item, answer)
   Returns true if the answer is correct, false otherwise.
   ------------------------------------------------------------ */
function checkAnswer(item, answer) {
  switch (item.type) {

    case "multiple_choice":
      // answer is an integer index; item.correct is the correct index
      return answer === item.correct;

    case "multi_select": {
      // Both arrays must contain exactly the same indices (order doesn't matter)
      const correctSet  = new Set(item.correct);
      const answerSet   = new Set(answer);
      if (correctSet.size !== answerSet.size) return false;
      for (const val of correctSet) {
        if (!answerSet.has(val)) return false;
      }
      return true;
    }

    case "short_response":
      return gradeShortResponse(item, answer);

    case "table_input": {
      // All sub-questions must be correct
      return item.subQuestions.every((sq, i) => {
        const raw = (answer[i] || "").trim().toLowerCase();
        return raw === sq.correct.trim().toLowerCase();
      });
    }

    default:
      return false;
  }
}

/* ------------------------------------------------------------
   gradeShortResponse(item, raw)
   Applies the gradeAs strategy to grade a text answer.

   item.gradeAs can be:
     "firstword"   → only check the first word (used for Yes/No questions)
     "firstnumber" → extract the first number in the answer (used for numeric answers)
     "exact"       → the trimmed answer must match exactly (default)
   ------------------------------------------------------------ */
function gradeShortResponse(item, raw) {
  const normalized = raw.trim().toLowerCase();
  const correct    = item.correct; // the correct answer string

  if (item.gradeAs === "firstword") {
    // Split on whitespace, take just the first word
    const firstWord = normalized.split(/\s+/)[0];
    return firstWord === correct.trim().toLowerCase();
  }

  if (item.gradeAs === "firstnumber") {
    // Find the first sequence of digits in the student's answer
    const match = normalized.match(/\d+/);
    if (!match) return false;
    return match[0] === correct.trim().toLowerCase();
  }

  // Default: exact match (case-insensitive)
  return normalized === correct.trim().toLowerCase();
}

/* ------------------------------------------------------------
   markAnswers(item, answer, correct)
   Adds visual CSS classes to show which choices were right/wrong.
   ------------------------------------------------------------ */
function markAnswers(item, answer, correct) {
  switch (item.type) {

    case "multiple_choice": {
      const buttons = document.querySelectorAll("#mc-options .mc-option");
      buttons.forEach((btn, i) => {
        if (i === item.correct) {
          // Always highlight the correct answer in green
          btn.classList.add("is-correct");
        } else if (i === answer && !correct) {
          // Highlight the wrong selection in red
          btn.classList.add("is-wrong");
        } else {
          // Dim everything else
          btn.classList.add("dimmed");
        }
        btn.disabled = true;
      });
      break;
    }

    case "multi_select": {
      const buttons = document.querySelectorAll("#mc-options .mc-option");
      const answerSet  = new Set(answer);
      const correctSet = new Set(item.correct);

      buttons.forEach((btn, i) => {
        const wasSelected = answerSet.has(i);
        const shouldSelect = correctSet.has(i);

        if (wasSelected && shouldSelect) {
          btn.classList.add("is-correct"); // selected and correct
        } else if (wasSelected && !shouldSelect) {
          btn.classList.add("is-wrong");   // selected but wrong
        } else if (!wasSelected && shouldSelect) {
          btn.classList.add("is-correct"); // missed — still show as correct
          btn.classList.add("dimmed");     // but dimmed to show it was missed
        } else {
          btn.classList.add("dimmed");     // not selected and not correct
        }
        btn.disabled = true;
      });
      break;
    }

    case "short_response": {
      const input = document.getElementById("short-response-input");
      if (input) {
        input.classList.add(correct ? "is-correct" : "is-wrong");
        input.disabled = true;
      }
      break;
    }

    case "table_input": {
      // Mark each sub-question input individually
      item.subQuestions.forEach((sq, i) => {
        const inp = document.getElementById(`sq-input-${i}`);
        if (!inp) return;
        const val = (answer[i] || "").trim().toLowerCase();
        const isSubCorrect = val === sq.correct.trim().toLowerCase();
        inp.classList.add(isSubCorrect ? "is-correct" : "is-wrong");
        inp.disabled = true;
      });
      break;
    }
  }
}

/* ------------------------------------------------------------
   showFeedback(item, correct)
   Renders the explanation panel below the question.
   ------------------------------------------------------------ */
function showFeedback(item, correct) {
  const panel = document.getElementById("feedback-panel");
  if (!panel) return;

  const icon    = correct ? "✅" : "❌";
  const heading = correct ? "Correct!" : "Not quite.";
  const cssClass = correct ? "feedback-correct" : "feedback-incorrect";

  panel.className = `feedback-panel ${cssClass}`;
  panel.style.display = "block";
  panel.innerHTML = `
    <div class="feedback-header">
      <span class="feedback-icon">${icon}</span>
      <span>${heading}</span>
    </div>
    <div class="feedback-explanation">${escapeHtml(item.explanation)}</div>
  `;
}

/* ------------------------------------------------------------
   showSummary()
   Replaces the question card with the results summary screen.
   Called after the student clicks "Finish Quiz" on the last question.
   ------------------------------------------------------------ */
function showSummary() {
  const total = state.items.length;
  const score = state.score;
  const pct   = total > 0 ? Math.round((score / total) * 100) : 0;

  // Choose a star rating based on percentage
  let stars = "⭐";
  if (pct >= 90) stars = "⭐⭐⭐";
  else if (pct >= 60) stars = "⭐⭐";

  // Choose a heading message
  let heading = "Good effort!";
  if (pct >= 90)      heading = "Outstanding work!";
  else if (pct >= 75) heading = "Great job!";
  else if (pct >= 60) heading = "Nice work!";

  // Update the header progress to 100%
  const fill  = document.getElementById("progress-bar-fill");
  const label = document.getElementById("progress-label");
  if (fill)  fill.style.width = "100%";
  if (label) label.textContent = "Quiz Complete";

  // Build per-item result rows
  const resultItems = state.results.map((r, i) => {
    const icon = r.correct ? "✅" : "❌";
    const cssClass = r.correct ? "result-correct" : "result-incorrect";
    // Trim the question text to the first line for a compact preview
    const preview = r.item.question.split("\n")[0];
    return `
      <li class="result-item ${cssClass}">
        <div class="result-item-top">
          <span class="result-status-icon">${icon}</span>
          <span class="result-question-preview">${i + 1}. ${escapeHtml(preview)}</span>
        </div>
        ${!r.correct
          ? `<div class="result-explanation">${escapeHtml(r.item.explanation)}</div>`
          : ""}
      </li>
    `;
  }).join("");

  // Render the conic-gradient score ring (CSS trick — uses inline style)
  const ringPct = pct;
  const ringGradient = `conic-gradient(var(--primary) ${ringPct}%, var(--neutral-200) ${ringPct}%)`;

  const app = document.getElementById("app");
  app.innerHTML = `
    <div class="summary-card">
      <div class="summary-stars">${stars}</div>
      <h2 class="summary-heading">${heading}</h2>
      <p class="summary-score-text">
        You got <span class="summary-score-number">${score} out of ${total}</span> correct.
      </p>

      <!-- Score ring -->
      <div class="score-ring-wrapper">
        <div class="score-ring" style="background: ${ringGradient}">
          <div class="score-ring-inner">
            <span class="score-ring-pct">${pct}%</span>
          </div>
        </div>
      </div>

      <!-- Per-item results -->
      <ul class="result-list" aria-label="Question results">
        ${resultItems}
      </ul>

      <!-- Try Again -->
      <button class="btn btn-restart" id="restart-btn">
        Try Again
      </button>
    </div>
  `;

  // Wire up the restart button
  document.getElementById("restart-btn").addEventListener("click", resetApp);

  // Scroll to top
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/* ------------------------------------------------------------
   resetApp()
   Clears all state and returns to question 1.
   Called when the student clicks "Try Again".
   ------------------------------------------------------------ */
function resetApp() {
  state.currentIndex = 0;
  state.score        = 0;
  state.results      = [];
  state.checked      = false;
  showQuestion(0);
}

/* ------------------------------------------------------------
   escapeHtml(str)
   Converts special characters to HTML entities.
   This prevents a student's text input from being treated as HTML,
   which would be a security risk (XSS).

   Example: escapeHtml('<b>hello</b>') → '&lt;b&gt;hello&lt;/b&gt;'
   ------------------------------------------------------------ */
function escapeHtml(str) {
  if (typeof str !== "string") return String(str);
  return str
    .replace(/&/g,  "&amp;")
    .replace(/</g,  "&lt;")
    .replace(/>/g,  "&gt;")
    .replace(/"/g,  "&quot;")
    .replace(/'/g,  "&#039;");
}

/* ------------------------------------------------------------
   capitalize(str)
   Uppercases just the first letter. Used for difficulty labels.
   ------------------------------------------------------------ */
function capitalize(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}
