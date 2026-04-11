"use strict";

const ITEMS = [
  // ── Claim 1: Concepts & Procedures ──────────────────────────────────────
  {
    id: 1,
    claim: 1,
    standard: "3.OA.A.1",
    domain: "Operations and Algebraic Thinking",
    difficulty: "easy",
    type: "multiple_choice",
    question: "There are 4 bags. Each bag has 3 apples. Which equation shows how many apples there are in all?",
    options: ["4 + 3 = 7", "4 × 3 = 12", "4 − 3 = 1", "3 + 3 = 6"],
    correct: 1,
    explanation:
      "4 bags with 3 apples each means 4 equal groups of 3. Multiplication shows equal groups: 4 × 3 = 12 apples in all.",
    multistep: false,
    requiresExplanation: false,
  },
  {
    id: 2,
    claim: 1,
    standard: "3.OA.C.7",
    domain: "Operations and Algebraic Thinking",
    difficulty: "easy",
    type: "multiple_choice",
    question: "What is 7 × 8?",
    options: ["54", "56", "48", "63"],
    correct: 1,
    explanation:
      "7 × 8 = 56. You can skip-count by 8 seven times: 8, 16, 24, 32, 40, 48, 56.",
    multistep: false,
    requiresExplanation: false,
  },
  {
    id: 3,
    claim: 1,
    standard: "3.NF.A.1",
    domain: "Number and Operations — Fractions",
    difficulty: "medium",
    type: "multiple_choice",
    question:
      "A pizza is cut into 4 equal slices. Pedro eats 3 slices. What fraction of the pizza did Pedro eat?",
    options: ["1/4", "4/3", "3/4", "3/3"],
    correct: 2,
    explanation:
      "Pedro ate 3 out of 4 equal slices, so the fraction is 3/4. The bottom number (denominator) tells how many equal pieces exist; the top number (numerator) tells how many were eaten.",
    multistep: false,
    requiresExplanation: false,
  },
  {
    id: 4,
    claim: 1,
    standard: "3.NBT.A.1",
    domain: "Number and Operations in Base Ten",
    difficulty: "medium",
    type: "multiple_choice",
    question: "What is 347 rounded to the nearest hundred?",
    options: ["200", "300", "350", "400"],
    correct: 1,
    explanation:
      "Look at the tens digit: 4. Since 4 < 5, round down. 347 rounds to 300.",
    multistep: false,
    requiresExplanation: false,
  },

  // ── Claim 2: Problem Solving ─────────────────────────────────────────────
  {
    id: 5,
    claim: 2,
    standard: "3.OA.A.3",
    domain: "Operations and Algebraic Thinking",
    difficulty: "medium",
    type: "multiple_choice",
    question:
      "A teacher has 24 crayons. She puts them equally into 6 boxes. How many crayons are in each box?",
    options: ["3", "4", "6", "18"],
    correct: 1,
    explanation:
      "24 crayons shared equally among 6 boxes: 24 ÷ 6 = 4. There are 4 crayons in each box.",
    multistep: false,
    requiresExplanation: false,
  },
  {
    id: 6,
    claim: 2,
    standard: "3.MD.A.1",
    domain: "Measurement and Data",
    difficulty: "medium",
    type: "short_response",
    question:
      "Reading group starts at 8:15. It lasts 45 minutes.\n\nWhat time does reading group end? Write your answer like this: 9:00",
    correct: ["9:00"],
    gradeAs: "exact",
    explanation:
      "Start at 8:15. Add 45 minutes in steps: 8:15 + 30 min = 8:45, then 8:45 + 15 min = 9:00. Reading group ends at 9:00.",
    placeholder: "e.g., 9:00",
    multistep: true,
    requiresExplanation: false,
  },
  {
    id: 7,
    claim: 2,
    standard: "3.OA.B.5",
    domain: "Operations and Algebraic Thinking",
    difficulty: "hard",
    type: "multi_select",
    question: "Which of the following are equal to 6 × 7? Select ALL that apply.",
    options: ["7 × 6", "6 × 5 + 6 × 2", "6 + 7", "3 × 14", "5 × 7 + 7"],
    correct: [0, 1, 3, 4],
    explanation:
      "6 × 7 = 42. Check each choice: 7 × 6 = 42 ✓ (order doesn't change the product). 6×5 + 6×2 = 30 + 12 = 42 ✓ (distributive property). 6 + 7 = 13 ✗. 3 × 14 = 42 ✓. 5×7 + 7 = 35 + 7 = 42 ✓.",
    multistep: true,
    requiresExplanation: false,
  },

  // ── Claim 3: Communicating Reasoning ────────────────────────────────────
  {
    id: 8,
    claim: 3,
    standard: "3.OA.A.3",
    domain: "Operations and Algebraic Thinking",
    difficulty: "hard",
    type: "short_response",
    question:
      'Marco says 5 × 4 = 25. Is he right?\n\nType "Yes" or "No" — then explain how you know.',
    correct: ["no"],
    gradeAs: "firstword",
    explanation:
      "Marco is wrong. 5 × 4 = 20, not 25. Think of 5 groups of 4: 4 + 4 + 4 + 4 + 4 = 20. Marco may have confused it with 5 × 5 = 25.",
    placeholder: "Type Yes or No, then explain...",
    multistep: false,
    requiresExplanation: true,
  },
  {
    id: 9,
    claim: 3,
    standard: "3.NF.A.1",
    domain: "Number and Operations — Fractions",
    difficulty: "medium",
    type: "short_response",
    question:
      'Emma says 1/2 is bigger than 3/4 because 1 is smaller than 3.\n\nDo you agree? Type "Yes" or "No" — then explain why.',
    correct: ["no"],
    gradeAs: "firstword",
    explanation:
      "Emma is wrong. 3/4 is bigger than 1/2. When the bottom numbers are the same, more pieces means a bigger fraction. Since 1/2 = 2/4, and 2/4 < 3/4, Emma's reasoning is incorrect.",
    placeholder: "Type Yes or No, then explain...",
    multistep: false,
    requiresExplanation: true,
  },

  // ── Claim 4: Modeling & Data Analysis ───────────────────────────────────
  {
    id: 10,
    claim: 4,
    standard: "3.MD.B.3",
    domain: "Measurement and Data",
    difficulty: "easy",
    type: "table_input",
    question:
      "The table below shows how many books 4 students read this month. Use the data to answer the questions.",
    tableData: {
      headers: ["Student", "Books Read"],
      rows: [
        ["Ava", "6"],
        ["Ben", "4"],
        ["Clara", "9"],
        ["Dan", "3"],
      ],
    },
    subQuestions: [
      { label: "How many books did Clara read?", correct: "9" },
      { label: "How many more books did Ava read than Ben?", correct: "2" },
      { label: "How many books did all 4 students read in all?", correct: "22" },
    ],
    explanation:
      "Clara read 9 books (read directly from the table). Ava (6) − Ben (4) = 2 more books for Ava. Total: 6 + 4 + 9 + 3 = 22 books.",
    multistep: true,
    requiresExplanation: false,
  },
  {
    id: 11,
    claim: 4,
    standard: "3.MD.C.5",
    domain: "Measurement and Data",
    difficulty: "hard",
    type: "short_response",
    question:
      "A garden is shaped like a rectangle. It is 6 feet long and 4 feet wide.\n\nWhat is the area of the garden in square feet?",
    correct: ["24"],
    gradeAs: "firstnumber",
    explanation:
      "Area = length × width = 6 × 4 = 24 square feet. You can also picture 6 rows of 4 unit squares — that gives 24 squares total.",
    placeholder: "Type a number...",
    multistep: true,
    requiresExplanation: false,
  },
  {
    id: 12,
    claim: 4,
    standard: "3.G.A.1",
    domain: "Geometry",
    difficulty: "easy",
    type: "multi_select",
    question:
      "Which shapes ALWAYS have exactly 4 right angles? Select ALL that apply.",
    options: ["Rectangle", "Square", "Triangle", "Rhombus", "Trapezoid"],
    correct: [0, 1],
    explanation:
      "Rectangles and squares always have exactly 4 right angles (90°). Triangles have only 3 angles. A rhombus has 4 sides but its corner angles are usually not right angles. A trapezoid has 4 sides but not always 4 right angles.",
    multistep: false,
    requiresExplanation: false,
  },
];

// ── Constants ────────────────────────────────────────────────────────────────

const CLAIM_LABELS = [
  "All Items",
  "Claim 1: Concepts & Procedures",
  "Claim 2: Problem Solving",
  "Claim 3: Communicating Reasoning",
  "Claim 4: Modeling & Data Analysis",
];

const CLAIM_COLORS = ["", "#1d4ed8", "#059669", "#d97706", "#7c3aed"];
const CLAIM_BG = ["", "#eff6ff", "#f0fdf4", "#fffbeb", "#faf5ff"];
const DIFFICULTY_META = {
  easy:   { label: "Easy",   color: "#16a34a", bg: "#f0fdf4" },
  medium: { label: "Medium", color: "#d97706", bg: "#fffbeb" },
  hard:   { label: "Hard",   color: "#dc2626", bg: "#fef2f2" },
};

// ── State ────────────────────────────────────────────────────────────────────

let state = {};
let activeClaim = 0;

function initState() {
  ITEMS.forEach((item) => {
    state[item.id] = { checked: false, correct: false, value: null };
  });
}

// ── Grading ──────────────────────────────────────────────────────────────────

function gradeShortResponse(item, raw) {
  const trimmed = raw.trim();
  if (!trimmed) return false;
  const normalized = trimmed.toLowerCase();

  if (item.gradeAs === "firstword") {
    const first = normalized.split(/\s+/)[0];
    return item.correct.some((c) => first === c.toLowerCase());
  }
  if (item.gradeAs === "firstnumber") {
    const m = normalized.match(/\d+/);
    return m ? item.correct.some((c) => m[0] === c) : false;
  }
  // exact (default)
  return item.correct.some((c) => normalized === c.toLowerCase());
}

function gradeMultiSelect(item, selected) {
  const a = [...selected].sort().join(",");
  const b = [...item.correct].sort().join(",");
  return a === b;
}

function gradeTableInput(item, values) {
  return values.every((v, qi) => v.trim() === item.subQuestions[qi].correct);
}

// ── Rendering helpers ────────────────────────────────────────────────────────

function badge(text, color, bg) {
  return `<span class="sbac-badge" style="color:${color};background:${bg};border-color:${color}">${text}</span>`;
}

function claimBadge(c) {
  return badge(CLAIM_LABELS[c], CLAIM_COLORS[c], CLAIM_BG[c]);
}

function difficultyBadge(d) {
  const { label, color, bg } = DIFFICULTY_META[d];
  return badge(label, color, bg);
}

function letterOf(i) {
  return String.fromCharCode(65 + i);
}

// ── Answer-area renderers ────────────────────────────────────────────────────

function renderMC(item) {
  const s = state[item.id];
  const disabled = s.checked ? "disabled" : "";
  return `
    <div class="mc-options" role="radiogroup" aria-label="Answer choices">
      ${item.options
        .map((opt, i) => {
          let cls = "mc-option";
          if (s.checked) {
            if (i === item.correct) cls += " option-correct";
            else if (s.value === i) cls += " option-wrong";
          }
          return `
            <label class="${cls}">
              <input type="radio" name="item-${item.id}" value="${i}"
                ${s.value === i ? "checked" : ""} ${disabled} />
              <span class="option-letter">${letterOf(i)}</span>
              <span>${opt}</span>
            </label>`;
        })
        .join("")}
    </div>`;
}

function renderMultiSelect(item) {
  const s = state[item.id];
  const disabled = s.checked ? "disabled" : "";
  const selected = Array.isArray(s.value) ? s.value : [];
  return `
    <p class="select-hint">Select all that apply.</p>
    <div class="mc-options" role="group" aria-label="Answer choices">
      ${item.options
        .map((opt, i) => {
          let cls = "mc-option";
          const isSelected = selected.includes(i);
          if (s.checked) {
            if (item.correct.includes(i)) cls += " option-correct";
            else if (isSelected) cls += " option-wrong";
          }
          return `
            <label class="${cls}">
              <input type="checkbox" name="item-${item.id}" value="${i}"
                ${isSelected ? "checked" : ""} ${disabled} />
              <span class="option-letter">${letterOf(i)}</span>
              <span>${opt}</span>
            </label>`;
        })
        .join("")}
    </div>`;
}

function renderShortResponse(item) {
  const s = state[item.id];
  const disabled = s.checked ? "disabled" : "";
  const val = s.value || "";
  if (item.requiresExplanation) {
    return `<textarea class="sbac-textarea" id="sr-${item.id}"
      rows="3" placeholder="${item.placeholder || "Type your answer..."}"
      ${disabled}>${val}</textarea>`;
  }
  return `<input type="text" class="sbac-input" id="sr-${item.id}"
    placeholder="${item.placeholder || "Type your answer..."}"
    value="${val}" ${disabled} />`;
}

function renderTableInput(item) {
  const s = state[item.id];
  const disabled = s.checked ? "disabled" : "";
  const values = Array.isArray(s.value) ? s.value : [];
  return `
    <div class="data-table-wrapper">
      <table class="data-table">
        <thead>
          <tr>${item.tableData.headers.map((h) => `<th>${h}</th>`).join("")}</tr>
        </thead>
        <tbody>
          ${item.tableData.rows
            .map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`)
            .join("")}
        </tbody>
      </table>
    </div>
    <div class="sub-questions">
      ${item.subQuestions
        .map((sq, qi) => {
          const val = values[qi] || "";
          let sqCls = "sub-question";
          if (s.checked) {
            sqCls += val.trim() === sq.correct ? " sq-correct" : " sq-wrong";
          }
          const mark = s.checked
            ? `<span class="sq-mark">${val.trim() === sq.correct ? "✓" : "✗ (" + sq.correct + ")"}</span>`
            : "";
          return `
            <div class="${sqCls}">
              <label for="sq-${item.id}-${qi}">${qi + 1}. ${sq.label}</label>
              <input type="text" id="sq-${item.id}-${qi}" class="sq-input"
                value="${val}" placeholder="?" ${disabled} />
              ${mark}
            </div>`;
        })
        .join("")}
    </div>`;
}

function renderAnswerArea(item) {
  if (item.type === "multiple_choice") return renderMC(item);
  if (item.type === "multi_select") return renderMultiSelect(item);
  if (item.type === "short_response") return renderShortResponse(item);
  if (item.type === "table_input") return renderTableInput(item);
  return "";
}

function renderFeedback(item) {
  const s = state[item.id];
  if (!s.checked) return "";
  const correct = s.correct;
  const cls = correct ? "feedback-correct" : "feedback-incorrect";
  const icon = correct ? "✓" : "✗";
  const label = correct ? "Correct!" : "Not quite.";

  let answerLine = "";
  if (!correct) {
    if (item.type === "multiple_choice") {
      answerLine = `<p class="feedback-answer"><strong>Correct answer:</strong> ${letterOf(item.correct)}) ${item.options[item.correct]}</p>`;
    } else if (item.type === "multi_select") {
      answerLine = `<p class="feedback-answer"><strong>Correct selections:</strong> ${item.correct
        .map((i) => `${letterOf(i)}) ${item.options[i]}`)
        .join(", ")}</p>`;
    } else if (item.type === "short_response") {
      answerLine = `<p class="feedback-answer"><strong>Correct answer:</strong> ${item.correct[0]}</p>`;
    }
  }

  const explainNote =
    item.requiresExplanation && correct
      ? `<p class="feedback-note">Your Yes/No answer is correct. See the explanation below for a model response.</p>`
      : "";

  return `
    <div class="item-feedback ${cls}">
      <div class="feedback-header">
        <span class="feedback-icon">${icon}</span>
        <strong>${label}</strong>
      </div>
      ${explainNote}
      ${answerLine}
      <p class="feedback-explanation">${item.explanation}</p>
    </div>`;
}

// ── Item card ────────────────────────────────────────────────────────────────

function renderItemCard(item) {
  const s = state[item.id];
  let cardCls = "item-card";
  if (s.checked) cardCls += s.correct ? " card-correct" : " card-incorrect";

  const tags = [
    claimBadge(item.claim),
    difficultyBadge(item.difficulty),
    `<span class="standard-tag">${item.standard}</span>`,
    item.multistep ? `<span class="sbac-tag tag-multistep">Multi-step</span>` : "",
    item.requiresExplanation ? `<span class="sbac-tag tag-explain">Explain</span>` : "",
  ]
    .filter(Boolean)
    .join("");

  const checkBtn = !s.checked
    ? `<button class="check-btn" data-id="${item.id}">Check Answer</button>`
    : "";

  return `
    <div class="${cardCls}" id="item-card-${item.id}">
      <div class="item-header">
        <div class="item-badges">${tags}</div>
        <span class="item-num">Item ${item.id}</span>
      </div>
      <div class="item-question">${item.question.replace(/\n/g, "<br>")}</div>
      ${renderAnswerArea(item)}
      <div class="item-actions">${checkBtn}</div>
      ${renderFeedback(item)}
    </div>`;
}

// ── Progress & summary ───────────────────────────────────────────────────────

function updateProgress() {
  const answered = Object.values(state).filter((s) => s.checked).length;
  const correct = Object.values(state).filter((s) => s.correct).length;
  const total = ITEMS.length;

  document.getElementById("score-badge").textContent = `${correct} / ${total}`;
  document.getElementById("progress-bar").style.width =
    `${Math.round((answered / total) * 100)}%`;

  const summaryEl = document.getElementById("score-summary");
  if (answered === total) {
    summaryEl.hidden = false;
    renderSummary(summaryEl, correct, total);
  }
}

function renderSummary(el, correct, total) {
  const pct = Math.round((correct / total) * 100);
  const claimStats = [1, 2, 3, 4].map((c) => {
    const items = ITEMS.filter((i) => i.claim === c);
    const got = items.filter((i) => state[i.id].correct).length;
    return { c, got, total: items.length };
  });

  const congrats =
    correct === total
      ? `<p class="summary-congrats">Perfect score! Great work!</p>`
      : correct >= total * 0.75
      ? `<p class="summary-congrats">Nice job! Keep practicing.</p>`
      : `<p class="summary-congrats">Keep going — review the explanations above to strengthen your skills.</p>`;

  el.innerHTML = `
    <h2 class="summary-title">Your Score: ${correct} / ${total} <span class="summary-pct">(${pct}%)</span></h2>
    ${congrats}
    <div class="summary-grid">
      ${claimStats
        .map(
          ({ c, got, total: t }) => `
        <div class="summary-claim" style="border-color:${CLAIM_COLORS[c]}">
          <div class="summary-claim-label" style="color:${CLAIM_COLORS[c]}">${CLAIM_LABELS[c]}</div>
          <div class="summary-claim-score">${got} / ${t}</div>
          <div class="summary-bar-bg">
            <div class="summary-bar-fill"
              style="width:${Math.round((got / t) * 100)}%;background:${CLAIM_COLORS[c]}"></div>
          </div>
        </div>`
        )
        .join("")}
    </div>`;
}

// ── Claim tabs ───────────────────────────────────────────────────────────────

function renderClaimTabs() {
  const tabs = document.getElementById("claim-tabs");
  const counts = [
    ITEMS.length,
    ...[1, 2, 3, 4].map((c) => ITEMS.filter((i) => i.claim === c).length),
  ];
  tabs.innerHTML = CLAIM_LABELS.map(
    (label, idx) => `
    <button class="claim-tab${activeClaim === idx ? " active" : ""}" data-claim="${idx}">
      ${label} <span class="tab-count">${counts[idx]}</span>
    </button>`
  ).join("");

  tabs.querySelectorAll(".claim-tab").forEach((btn) => {
    btn.addEventListener("click", () => {
      activeClaim = Number(btn.dataset.claim);
      renderClaimTabs();
      renderItems();
    });
  });
}

// ── Items rendering ──────────────────────────────────────────────────────────

function renderItems() {
  const container = document.getElementById("items-container");
  const visible =
    activeClaim === 0 ? ITEMS : ITEMS.filter((i) => i.claim === activeClaim);
  container.innerHTML = visible.map(renderItemCard).join("");
  visible.forEach(attachHandlers);
}

function attachHandlers(item) {
  const btn = document.querySelector(`.check-btn[data-id="${item.id}"]`);
  if (btn) btn.addEventListener("click", () => checkAnswer(item.id));
}

// ── Answer checking ──────────────────────────────────────────────────────────

function checkAnswer(itemId) {
  const item = ITEMS.find((i) => i.id === itemId);
  const s = state[itemId];

  if (item.type === "multiple_choice") {
    const sel = document.querySelector(`input[name="item-${itemId}"]:checked`);
    if (!sel) return;
    s.value = Number(sel.value);
    s.checked = true;
    s.correct = s.value === item.correct;
  } else if (item.type === "multi_select") {
    const selected = Array.from(
      document.querySelectorAll(`input[name="item-${itemId}"]:checked`)
    ).map((el) => Number(el.value));
    s.value = selected;
    s.checked = true;
    s.correct = gradeMultiSelect(item, selected);
  } else if (item.type === "short_response") {
    const el = document.getElementById(`sr-${itemId}`);
    const raw = el ? el.value : "";
    s.value = raw;
    s.checked = true;
    s.correct = gradeShortResponse(item, raw);
  } else if (item.type === "table_input") {
    const values = item.subQuestions.map((_, qi) => {
      const el = document.getElementById(`sq-${itemId}-${qi}`);
      return el ? el.value : "";
    });
    s.value = values;
    s.checked = true;
    s.correct = gradeTableInput(item, values);
  }

  renderItems();
  updateProgress();
  // Scroll the checked card into view smoothly
  requestAnimationFrame(() => {
    const card = document.getElementById(`item-card-${itemId}`);
    if (card) card.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });
}

// ── Boot ─────────────────────────────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", () => {
  initState();
  renderClaimTabs();
  renderItems();
  updateProgress();
});
