# Rubrics - Live Standard Tracker

A lightweight prototype for fast in-class formative assessment. Teachers can select a class, date, and standard, then log rubric levels, evidence, supports used, and strengths-based notes for each student.

## Features
- Sticky header with class/date/standard selectors.
- 4-level rubric with a distinct “Not Observed” state.
- One-tap rubric level buttons and keyboard shortcuts (1-4) on focused rows.
- Supports tracking framed as “supports used.”
- Auto-save with offline queueing and sync on reconnect.
- CSV exports for single sessions or longitudinal trends.

## Getting started

```bash
python app.py
```

Visit <http://localhost:5000>.

## Sample data
The app seeds:
- One class with 10 students
- One standard with a filled rubric
- Two sessions (two dates) and sample observations

## How to add a class, rubric, and enter live data
1. **Select a class/date/standard** in the sticky header.
2. **Add a standard** by entering a code (optional) and statement, then clicking **Add standard**.
3. **Paste or edit rubric descriptors** using the **Read rubric** button and saving the updated text (defaults to Emergent → Mastery labels).
4. **Enter live data** by tapping rubric levels, selecting evidence type, supports used, and adding notes.
5. **Use bulk actions** to mark all students as “Not Observed” or clear entries.
6. **Export** session or longitudinal data via the CSV buttons.
