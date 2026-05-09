import React, { useState, useEffect } from "react";
import { Check, Plus, Trash2, ArrowUp, ArrowDown, Edit2, X, Flame, Award, AlertCircle } from "lucide-react";

const DEFAULT_HABITS = [
  { id: "h1", name: "Wake up at 6:30 AM", time: "Morning" },
  { id: "h2", name: "Ginger warm water", time: "Morning" },
  { id: "h3", name: "7 soaked almonds", time: "Morning" },
  { id: "h4", name: "Workout (any form, 30 min minimum)", time: "Morning" },
  { id: "h5", name: "Read Bhagavad Gita", time: "Morning" },
  { id: "h6", name: "Pray", time: "Morning" },
  { id: "h7", name: "Nari Soundarya malt (after breakfast)", time: "Morning" },
  { id: "h8", name: "Protein shake", time: "Daytime" },
  { id: "h9", name: "Read 10 pages of a book", time: "Daytime" },
  { id: "h10", name: "CCF, Spearmint, or Balance Brew tea", time: "Evening" },
  { id: "h11", name: "Oil massage feet", time: "Night" },
  { id: "h12", name: "No chai or coffee", time: "All-day", note: "Irritates your gut badly. Pause and remember the after-effect." },
  { id: "h13", name: "No caffeine after 4 PM", time: "All-day" },
  { id: "h14", name: "No sugar", time: "All-day" },
  { id: "h15", name: "No maida, no fried in meals", time: "All-day" },
  { id: "h16", name: "No dinner after 7 PM", time: "All-day" },
  { id: "h17", name: "Intentional social media usage", time: "All-day" },
];

const TIME_GROUPS = ["Morning", "Daytime", "Evening", "Night", "All-day"];
const TIME_LABELS = {
  "Morning": "Morning",
  "Daytime": "Daytime",
  "Evening": "Evening",
  "Night": "Night",
  "All-day": "All-day rules",
};

function formatDate(date) {
  return date.toISOString().split("T")[0];
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

// ---------- Storage ----------
function loadHabits() {
  try {
    const raw = localStorage.getItem("habits_list_v2");
    if (!raw) {
      localStorage.setItem("habits_list_v2", JSON.stringify(DEFAULT_HABITS));
      return DEFAULT_HABITS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_HABITS;
  }
}

function saveHabits(habits) {
  localStorage.setItem("habits_list_v2", JSON.stringify(habits));
}

function loadCompletions(dateKey) {
  try {
    const raw = localStorage.getItem(`habits:${dateKey}`);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveCompletions(dateKey, completions) {
  localStorage.setItem(`habits:${dateKey}`, JSON.stringify(completions));
}

// ---------- Streak calculation ----------
function calculateStreaks(habitId) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let currentStreak = 0;
  let cursor = new Date(today);

  const todayDone = (loadCompletions(formatDate(today))[habitId] === true);
  if (!todayDone) {
    cursor = addDays(today, -1);
  }

  while (true) {
    const completions = loadCompletions(formatDate(cursor));
    if (completions[habitId] === true) {
      currentStreak++;
      cursor = addDays(cursor, -1);
    } else {
      break;
    }
    if (currentStreak > 730) break;
  }

  if (todayDone) currentStreak++;

  let bestStreak = 0;
  let runningStreak = 0;
  for (let i = 365; i >= 0; i--) {
    const d = addDays(today, -i);
    const completions = loadCompletions(formatDate(d));
    if (completions[habitId] === true) {
      runningStreak++;
      if (runningStreak > bestStreak) bestStreak = runningStreak;
    } else {
      runningStreak = 0;
    }
  }

  return { current: currentStreak, best: bestStreak };
}

// ---------- Main component ----------
export default function HabitsModule() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayKey = formatDate(today);

  const [habits, setHabits] = useState([]);
  const [completions, setCompletions] = useState({});
  const [editorOpen, setEditorOpen] = useState(false);
  const [streaksMap, setStreaksMap] = useState({});

  useEffect(() => {
    setHabits(loadHabits());
    setCompletions(loadCompletions(todayKey));
  }, [todayKey]);

  useEffect(() => {
    const map = {};
    habits.forEach((h) => {
      map[h.id] = calculateStreaks(h.id);
    });
    setStreaksMap(map);
  }, [habits, completions]);

  function toggleHabit(id) {
    const updated = { ...completions, [id]: !completions[id] };
    setCompletions(updated);
    saveCompletions(todayKey, updated);
  }

  function persistHabits(newList) {
    setHabits(newList);
    saveHabits(newList);
  }

  function addHabit(name, time, note) {
    if (!name.trim()) return;
    const newHabit = {
      id: `h-${Date.now()}`,
      name: name.trim(),
      time: time || "Daytime",
      ...(note && note.trim() ? { note: note.trim() } : {}),
    };
    persistHabits([...habits, newHabit]);
  }

  function deleteHabit(id) {
    if (!confirm("Delete this habit? Past completion data will stay.")) return;
    persistHabits(habits.filter((h) => h.id !== id));
  }

  function updateHabit(id, updates) {
    persistHabits(habits.map((h) => h.id === id ? { ...h, ...updates } : h));
  }

  function moveHabit(id, direction) {
    const idx = habits.findIndex((h) => h.id === id);
    if (idx === -1) return;
    const newIdx = direction === "up" ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= habits.length) return;
    const newList = [...habits];
    [newList[idx], newList[newIdx]] = [newList[newIdx], newList[idx]];
    persistHabits(newList);
  }

  const grouped = TIME_GROUPS.map((time) => ({
    time,
    items: habits.filter((h) => h.time === time),
  })).filter((g) => g.items.length > 0);

  const totalDone = habits.filter((h) => completions[h.id]).length;
  const total = habits.length;
  const pct = total > 0 ? Math.round((totalDone / total) * 100) : 0;

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 20px" }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, color: "#8A7B5E", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>
          Today
        </div>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
          <h1 style={{ fontFamily: "Fraunces, serif", fontSize: 32, fontWeight: 500, margin: 0, letterSpacing: "-0.02em", lineHeight: 1.1 }}>
            {today.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </h1>
          <button className="ft-btn ft-btn-ghost" onClick={() => setEditorOpen(true)}>
            <Edit2 size={13} /> Edit habits
          </button>
        </div>
        <div style={{ fontFamily: "Fraunces, serif", fontStyle: "italic", fontSize: 17, color: "#6B5530", marginTop: 8 }}>
          The quiet practices.
        </div>
      </div>

      {total > 0 && (
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 12, color: "#6B5530" }}>
            <span>{totalDone} of {total} complete</span>
            <span>{pct}%</span>
          </div>
          <div className="progress-bar"><div className="progress-fill" style={{ width: `${pct}%` }} /></div>
        </div>
      )}

      {grouped.map((group) => (
        <div key={group.time} style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "#8A7B5E", marginBottom: 10, fontWeight: 500 }}>
            {TIME_LABELS[group.time]}
          </div>
          {group.items.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              completed={!!completions[habit.id]}
              streak={streaksMap[habit.id] || { current: 0, best: 0 }}
              onToggle={() => toggleHabit(habit.id)}
            />
          ))}
        </div>
      ))}

      {habits.length === 0 && (
        <div style={{ padding: "40px 24px", background: "#FCFAF5", border: "1px dashed #C8B894", borderRadius: 12, textAlign: "center" }}>
          <div style={{ fontFamily: "Fraunces, serif", fontSize: 20, fontStyle: "italic", color: "#6B5530" }}>
            No habits yet.
          </div>
          <div style={{ fontSize: 13, color: "#8A7B5E", marginTop: 8, marginBottom: 16 }}>
            Add your first habit to start a streak.
          </div>
          <button className="ft-btn" onClick={() => setEditorOpen(true)}>
            <Plus size={14} /> Add habit
          </button>
        </div>
      )}

      {editorOpen && (
        <HabitEditorModal
          habits={habits}
          onAdd={addHabit}
          onDelete={deleteHabit}
          onUpdate={updateHabit}
          onMove={moveHabit}
          onClose={() => setEditorOpen(false)}
        />
      )}
    </div>
  );
}

function HabitCard({ habit, completed, streak, onToggle }) {
  return (
    <div className={`ft-exercise ${completed ? "done" : ""}`} style={{ padding: "14px 16px" }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <div className={`ft-checkbox ${completed ? "checked" : ""}`} onClick={onToggle} style={{ marginTop: 2 }}>
          {completed && <Check size={14} color="#F4F1EA" strokeWidth={3} />}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="ft-name" style={{ fontWeight: 500, fontSize: 15 }}>
            {habit.name}
          </div>
          {habit.note && !completed && (
            <div style={{ fontSize: 12, color: "#B8860B", fontStyle: "italic", marginTop: 4, display: "flex", alignItems: "flex-start", gap: 4, lineHeight: 1.4 }}>
              <AlertCircle size={11} style={{ marginTop: 3, flexShrink: 0 }} />
              <span>{habit.note}</span>
            </div>
          )}
          <div style={{ display: "flex", gap: 12, marginTop: 6, alignItems: "center", fontSize: 11, color: "#8A7B5E" }}>
            {streak.current > 0 && (
              <span style={{ display: "flex", alignItems: "center", gap: 3, color: streak.current >= 7 ? "#B8860B" : "#6B5530", fontWeight: 500 }}>
                <Flame size={11} /> {streak.current} day{streak.current !== 1 ? "s" : ""}
              </span>
            )}
            {streak.best > streak.current && streak.best > 0 && (
              <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
                <Award size={11} /> best {streak.best}
              </span>
            )}
            {streak.current === 0 && streak.best === 0 && (
              <span style={{ fontStyle: "italic", color: "#B8AC92" }}>start a streak today</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function HabitEditorModal({ habits, onAdd, onDelete, onUpdate, onMove, onClose }) {
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newTime, setNewTime] = useState("Morning");
  const [newNote, setNewNote] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editTime, setEditTime] = useState("");
  const [editNote, setEditNote] = useState("");

  function handleAdd() {
    if (!newName.trim()) return;
    onAdd(newName, newTime, newNote);
    setNewName(""); setNewTime("Morning"); setNewNote("");
    setAdding(false);
  }

  function startEdit(habit) {
    setEditingId(habit.id);
    setEditName(habit.name);
    setEditTime(habit.time);
    setEditNote(habit.note || "");
  }

  function saveEdit() {
    onUpdate(editingId, {
      name: editName.trim(),
      time: editTime,
      note: editNote.trim() || undefined,
    });
    setEditingId(null);
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 style={{ fontFamily: "Fraunces, serif", fontSize: 22, fontWeight: 500, margin: 0 }}>
            Edit habits
          </h2>
          <button onClick={onClose} className="ft-icon-btn"><X size={20} /></button>
        </div>

        <div style={{ fontSize: 12, color: "#8A7B5E", marginBottom: 16, lineHeight: 1.5 }}>
          Reorder, rename, add a reminder note, or delete. Past streak data is preserved on delete.
        </div>

        {habits.map((habit, idx) => (
          <div key={habit.id} style={{ padding: 12, background: "#FCFAF5", border: "1px solid #E8DFCB", borderRadius: 10, marginBottom: 6 }}>
            {editingId === habit.id ? (
              <div>
                <span className="ft-field-label">Name</span>
                <input className="ft-input" value={editName} onChange={(e) => setEditName(e.target.value)} style={{ marginBottom: 10 }} />
                <span className="ft-field-label">Time</span>
                <select
                  value={editTime}
                  onChange={(e) => setEditTime(e.target.value)}
                  style={{ width: "100%", padding: 8, marginBottom: 10, border: "1px solid #C8B894", borderRadius: 6, background: "#FCFAF5", fontFamily: "inherit", fontSize: 14 }}
                >
                  {TIME_GROUPS.map((t) => <option key={t} value={t}>{TIME_LABELS[t]}</option>)}
                </select>
                <span className="ft-field-label">Reminder note (optional)</span>
                <input
                  className="ft-input"
                  value={editNote}
                  onChange={(e) => setEditNote(e.target.value)}
                  placeholder="why this matters / a gentle warning"
                  style={{ marginBottom: 10 }}
                />
                <div style={{ display: "flex", gap: 6 }}>
                  <button className="ft-btn" style={{ padding: "6px 12px", fontSize: 12 }} onClick={saveEdit}>Save</button>
                  <button className="ft-btn ft-btn-ghost" style={{ padding: "6px 12px", fontSize: 12 }} onClick={() => setEditingId(null)}>Cancel</button>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{habit.name}</div>
                  <div style={{ fontSize: 11, color: "#8A7B5E", marginTop: 2 }}>
                    {TIME_LABELS[habit.time]}{habit.note ? " · has reminder" : ""}
                  </div>
                </div>
                <button className="ft-icon-btn" onClick={() => onMove(habit.id, "up")} disabled={idx === 0}>
                  <ArrowUp size={14} />
                </button>
                <button className="ft-icon-btn" onClick={() => onMove(habit.id, "down")} disabled={idx === habits.length - 1}>
                  <ArrowDown size={14} />
                </button>
                <button className="ft-icon-btn" onClick={() => startEdit(habit)}>
                  <Edit2 size={14} />
                </button>
                <button className="ft-icon-btn" onClick={() => onDelete(habit.id)}>
                  <Trash2 size={14} />
                </button>
              </div>
            )}
          </div>
        ))}

        {adding ? (
          <div style={{ padding: 14, background: "#FCFAF5", border: "1px solid #6B5530", borderRadius: 10, marginTop: 12 }}>
            <span className="ft-field-label">Habit name</span>
            <input
              autoFocus
              className="ft-input"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. 10-min meditation"
              style={{ marginBottom: 10, fontSize: 14 }}
            />
            <span className="ft-field-label">Time of day</span>
            <select
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              style={{ width: "100%", padding: 8, marginBottom: 10, border: "1px solid #C8B894", borderRadius: 6, background: "#FCFAF5", fontFamily: "inherit", fontSize: 14 }}
            >
              {TIME_GROUPS.map((t) => <option key={t} value={t}>{TIME_LABELS[t]}</option>)}
            </select>
            <span className="ft-field-label">Reminder note (optional)</span>
            <input
              className="ft-input"
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="why this matters / a gentle warning"
              style={{ marginBottom: 12, fontSize: 14 }}
            />
            <div style={{ display: "flex", gap: 8 }}>
              <button className="ft-btn" onClick={handleAdd}>Add</button>
              <button className="ft-btn ft-btn-ghost" onClick={() => setAdding(false)}>Cancel</button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setAdding(true)}
            style={{
              width: "100%", padding: "12px 16px", marginTop: 8,
              background: "transparent", border: "1.5px dashed #C8B894",
              borderRadius: 10, color: "#6B5530", fontFamily: "inherit",
              fontSize: 13, cursor: "pointer", display: "flex",
              alignItems: "center", justifyContent: "center", gap: 6,
            }}
          >
            <Plus size={14} /> Add habit
          </button>
        )}

        <button className="ft-btn" onClick={onClose} style={{ width: "100%", justifyContent: "center", marginTop: 16 }}>
          Done
        </button>
      </div>
    </div>
  );
}
