const rosterBody = document.getElementById("roster-body");
const classSelect = document.getElementById("class-select");
const standardSelect = document.getElementById("standard-select");
const sessionSelect = document.getElementById("session-select");
const dateInput = document.getElementById("date-input");
const focusNote = document.getElementById("focus-note");
const readRubricButton = document.getElementById("read-rubric");
const rubricDialog = document.getElementById("rubric-dialog");
const rubricContent = document.getElementById("rubric-content");
const closeRubricButton = document.getElementById("close-rubric");
const saveRubricButton = document.getElementById("save-rubric");
const standardCodeInput = document.getElementById("standard-code");
const standardStatementInput = document.getElementById("standard-statement");
const addStandardButton = document.getElementById("add-standard");
const filterLevel = document.getElementById("filter-level");
const filterEvidence = document.getElementById("filter-evidence");
const filterSupports = document.getElementById("filter-supports");
const privacyToggle = document.getElementById("privacy-toggle");
const addStudentButton = document.getElementById("add-student");
const newStudentInput = document.getElementById("new-student");
const bulkNotObserved = document.getElementById("bulk-not-observed");
const bulkClear = document.getElementById("bulk-clear");
const exportSession = document.getElementById("export-session");
const exportLongitudinal = document.getElementById("export-longitudinal");
const offlineBanner = document.getElementById("offline-banner");

let classes = [];
let standards = [];
let rubrics = {};
let currentSession = null;
let observations = new Map();
let students = [];

const evidenceTypes = ["Oral", "Written", "Work Sample", "Observation", "Small Group", "Exit Ticket", "Other"];
const supportsOptions = [
  "sentence frames",
  "manipulatives",
  "read aloud",
  "extra time",
  "partner",
  "translated directions",
  "other",
];

const offlineQueue = JSON.parse(localStorage.getItem("offlineQueue") || "[]");

function saveQueue() {
  localStorage.setItem("offlineQueue", JSON.stringify(offlineQueue));
}

function setOfflineBanner() {
  if (navigator.onLine) {
    offlineBanner.classList.remove("visible");
  } else {
    offlineBanner.classList.add("visible");
  }
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return response.json();
}

async function loadInitial() {
  classes = await fetchJson("/api/classes");
  const standardData = await fetchJson("/api/standards");
  standards = standardData.standards;
  rubrics = standardData.rubrics;

  classSelect.innerHTML = classes.map((cls) => `<option value="${cls.id}">${cls.name}</option>`).join("");
  standardSelect.innerHTML = standards
    .map((standard) => {
      const label = standard.code ? `${standard.code} - ${standard.statement}` : standard.statement;
      return `<option value="${standard.id}">${label}</option>`;
    })
    .join("");

  if (classes.length && standards.length) {
    await loadSessions();
  }
}

async function loadSessions() {
  const classId = Number(classSelect.value);
  const standardId = Number(standardSelect.value);
  const sessions = await fetchJson(`/api/sessions?class_id=${classId}&standard_id=${standardId}`);

  const options = sessions
    .map((session) => `<option value="${session.id}">${session.date}</option>`)
    .join("");
  sessionSelect.innerHTML = options;

  if (sessions.length) {
    sessionSelect.value = sessions[0].id;
    await loadSession(Number(sessions[0].id));
  } else {
    await createSession();
  }
}

async function createSession() {
  const payload = {
    class_id: Number(classSelect.value),
    date: dateInput.value,
    standard_id: Number(standardSelect.value),
    focus_note: focusNote.value || null,
  };
  const session = await fetchJson("/api/session", { method: "POST", body: JSON.stringify(payload) });
  await loadSessions();
  sessionSelect.value = session.id;
  await loadSession(session.id);
}

async function loadSession(sessionId) {
  const data = await fetchJson(`/api/session/${sessionId}`);
  currentSession = data.session;
  observations = new Map(data.observations.map((obs) => [obs.student_id, obs]));
  students = data.students;
  focusNote.value = data.session.focus_note || "";
  dateInput.value = data.session.date;
  renderRoster();
  renderRubric(data.rubric);
}

function renderRubric(rubric) {
  if (!rubric) {
    rubricContent.innerHTML = "<p>No rubric assigned yet.</p>";
    return;
  }
  rubricContent.innerHTML = Object.entries(rubric.levels)
    .map(
      ([level, text]) => `
        <div class="rubric-level">
          <label for="rubric-level-${level}"><strong>Level ${level}</strong></label>
          <textarea id="rubric-level-${level}" data-level="${level}">${text}</textarea>
        </div>
      `
    )
    .join("");
}

function displayName(student) {
  if (!privacyToggle.checked) {
    return student.name;
  }
  const parts = student.name.split(" ");
  if (parts.length === 1) {
    return student.name;
  }
  return `${parts[0]} ${parts[parts.length - 1][0]}.`;
}

function matchesFilters(obs) {
  const levelValue = filterLevel.value;
  const evidenceValue = filterEvidence.value;
  const supportsValue = filterSupports.value;

  if (levelValue) {
    const label = obs?.level ? String(obs.level) : "Not Observed";
    if (label !== levelValue) {
      return false;
    }
  }

  if (evidenceValue) {
    if ((obs?.evidence_type || "") !== evidenceValue) {
      return false;
    }
  }

  if (supportsValue) {
    const list = obs?.supports || [];
    if (!list.includes(supportsValue)) {
      return false;
    }
  }

  return true;
}

function renderRoster() {
  rosterBody.innerHTML = "";
  students.forEach((student) => {
    const obs = observations.get(student.id);
    if (!matchesFilters(obs)) {
      return;
    }

    const row = document.createElement("tr");
    row.tabIndex = 0;
    row.dataset.studentId = student.id;
    row.innerHTML = `
      <td>
        <div class="student-name">${displayName(student)}</div>
      </td>
      <td>
        <div class="level-buttons" role="group" aria-label="Rubric levels for ${student.name}">
          ${[1, 2, 3, 4]
            .map(
              (level) => `
                <button class="level-button" data-level="${level}" type="button">
                  ${level}
                  <div class="level-label">Level</div>
                </button>
              `
            )
            .join("")}
          <button class="level-button not-observed" data-level="none" type="button">
            N/O
            <div class="level-label">Not Observed</div>
          </button>
        </div>
      </td>
      <td>
        <select class="evidence-select" aria-label="Evidence type">
          <option value="">Select</option>
          ${evidenceTypes.map((item) => `<option value="${item}">${item}</option>`).join("")}
        </select>
      </td>
      <td>
        <div class="supports">
          ${supportsOptions
            .map(
              (support) => `
                <label>
                  <input type="checkbox" value="${support}" />
                  <span>${support}</span>
                </label>
              `
            )
            .join("")}
        </div>
      </td>
      <td>
        <textarea class="notes" rows="2" placeholder="Evidence I saw..."></textarea>
      </td>
    `;

    rosterBody.appendChild(row);

    if (obs) {
      const levelButtons = row.querySelectorAll(".level-button");
      levelButtons.forEach((button) => {
        if (obs.level === Number(button.dataset.level)) {
          button.classList.add("active");
        }
        if (!obs.level && button.dataset.level === "none") {
          button.classList.add("active");
        }
      });

      const evidenceSelect = row.querySelector(".evidence-select");
      evidenceSelect.value = obs.evidence_type || "";

      const supportsInputs = row.querySelectorAll(".supports input");
      supportsInputs.forEach((input) => {
        if ((obs.supports || []).includes(input.value)) {
          input.checked = true;
        }
      });

      row.querySelector(".notes").value = obs.note || "";
    }

    attachRowHandlers(row, student.id);
  });
}

function attachRowHandlers(row, studentId) {
  const levelButtons = row.querySelectorAll(".level-button");
  levelButtons.forEach((button) => {
    button.addEventListener("click", async () => {
      const levelValue = button.dataset.level === "none" ? null : Number(button.dataset.level);
      levelButtons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");
      await saveObservation(studentId, { level: levelValue });
    });
  });

  const evidenceSelect = row.querySelector(".evidence-select");
  evidenceSelect.addEventListener("change", async () => {
    await saveObservation(studentId, { evidence_type: evidenceSelect.value || null });
  });

  const supportsInputs = row.querySelectorAll(".supports input");
  supportsInputs.forEach((input) => {
    input.addEventListener("change", async () => {
      const selected = Array.from(supportsInputs)
        .filter((item) => item.checked)
        .map((item) => item.value);
      await saveObservation(studentId, { supports: selected });
    });
  });

  const notes = row.querySelector(".notes");
  notes.addEventListener("blur", async () => {
    await saveObservation(studentId, { note: notes.value || null });
  });

  row.addEventListener("keydown", async (event) => {
    if (["1", "2", "3", "4"].includes(event.key)) {
      const button = row.querySelector(`.level-button[data-level="${event.key}"]`);
      if (button) {
        button.click();
      }
    }
  });
}

async function saveObservation(studentId, updates) {
  if (!currentSession) {
    return;
  }
  const existing = observations.get(studentId) || { student_id: studentId, supports: [] };
  const payload = {
    session_id: currentSession.id,
    student_id: studentId,
    level: updates.level ?? existing.level ?? null,
    evidence_type: updates.evidence_type ?? existing.evidence_type ?? null,
    supports: updates.supports ?? existing.supports ?? [],
    note: updates.note ?? existing.note ?? null,
    created_by: "teacher",
  };

  if (!navigator.onLine) {
    offlineQueue.push(payload);
    saveQueue();
    observations.set(studentId, payload);
    return;
  }

  const saved = await fetchJson("/api/observation", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  observations.set(studentId, saved);
}

async function syncOfflineQueue() {
  if (!navigator.onLine || offlineQueue.length === 0) {
    return;
  }
  while (offlineQueue.length > 0) {
    const payload = offlineQueue.shift();
    await fetchJson("/api/observation", { method: "POST", body: JSON.stringify(payload) });
  }
  saveQueue();
}

function applyFilters() {
  renderRoster();
}

readRubricButton.addEventListener("click", () => rubricDialog.showModal());
closeRubricButton.addEventListener("click", () => rubricDialog.close());
saveRubricButton.addEventListener("click", async () => {
  if (!currentSession) {
    return;
  }
  const levels = {};
  rubricContent.querySelectorAll("textarea").forEach((textarea) => {
    levels[textarea.dataset.level] = textarea.value.trim();
  });
  const payload = {
    level1_text: levels["1"],
    level2_text: levels["2"],
    level3_text: levels["3"],
    level4_text: levels["4"],
  };
  const rubric = await fetchJson(`/api/rubric/${currentSession.standard_id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  rubrics[currentSession.standard_id] = rubric;
  rubricDialog.close();
});

classSelect.addEventListener("change", loadSessions);
standardSelect.addEventListener("change", loadSessions);
sessionSelect.addEventListener("change", async () => loadSession(Number(sessionSelect.value)));
dateInput.addEventListener("change", createSession);

focusNote.addEventListener("blur", async () => {
  if (!currentSession) {
    return;
  }
  await fetchJson(`/api/session/${currentSession.id}`, {
    method: "PUT",
    body: JSON.stringify({
      date: currentSession.date,
      focus_note: focusNote.value || null,
    }),
  });
});

addStudentButton.addEventListener("click", async () => {
  const name = newStudentInput.value.trim();
  if (!name || !currentSession) {
    return;
  }
  const student = await fetchJson("/api/students", {
    method: "POST",
    body: JSON.stringify({ name, class_id: currentSession.class_id }),
  });
  students.push(student);
  newStudentInput.value = "";
  renderRoster();
});

addStandardButton.addEventListener("click", async () => {
  const statement = standardStatementInput.value.trim();
  if (!statement) {
    return;
  }
  const payload = {
    code: standardCodeInput.value.trim() || null,
    statement,
    level1_text: "Emergent Learner",
    level2_text: "Approaching Proficiency",
    level3_text: "Proficient",
    level4_text: "Mastery",
  };
  const result = await fetchJson("/api/standards", { method: "POST", body: JSON.stringify(payload) });
  standards.push(result.standard);
  rubrics[result.standard.id] = result.rubric;
  standardSelect.innerHTML = standards
    .map((standard) => {
      const label = standard.code ? `${standard.code} - ${standard.statement}` : standard.statement;
      return `<option value="${standard.id}">${label}</option>`;
    })
    .join("");
  standardSelect.value = result.standard.id;
  standardCodeInput.value = "";
  standardStatementInput.value = "";
  await loadSessions();
});

bulkNotObserved.addEventListener("click", async () => {
  await Promise.all(
    students.map((student) => saveObservation(student.id, { level: null }))
  );
  renderRoster();
});

bulkClear.addEventListener("click", async () => {
  await Promise.all(
    students.map((student) => saveObservation(student.id, { level: null, note: null, supports: [], evidence_type: null }))
  );
  renderRoster();
});

exportSession.addEventListener("click", () => {
  if (currentSession) {
    window.location.href = `/api/export/session/${currentSession.id}`;
  }
});

exportLongitudinal.addEventListener("click", () => {
  if (currentSession) {
    window.location.href = `/api/export/longitudinal?class_id=${currentSession.class_id}&standard_id=${currentSession.standard_id}`;
  }
});

[filterLevel, filterEvidence, filterSupports, privacyToggle].forEach((element) => {
  element.addEventListener("change", applyFilters);
});

window.addEventListener("online", () => {
  setOfflineBanner();
  syncOfflineQueue();
});
window.addEventListener("offline", setOfflineBanner);

setOfflineBanner();
loadInitial();
