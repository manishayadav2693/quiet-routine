import React, { useState, useEffect } from "react";
import { Check, Plus, ChevronLeft, ChevronRight, Trash2, MapPin, Dumbbell, Calendar, X, Edit2, ArrowUp, ArrowDown, Sparkles, Loader2, Droplet, MinusCircle, PauseCircle, Forward } from "lucide-react";

// ---------- Plan generation ----------
const DELHI_WORKOUTS = {
  saturday: {
    title: "Lower — Glute & Hip Focus",
    duration: 60,
    location: "delhi",
    exercises: [
      { name: "Barbell Hip Thrust", sets: 4, reps: "8–10", note: "Main glute builder. Pause 1 sec at top." },
      { name: "Goblet Squat", sets: 4, reps: "10" },
      { name: "Romanian Deadlift", sets: 3, reps: "10", note: "Slow 3-sec lower." },
      { name: "Bulgarian Split Squat (DB)", sets: 3, reps: "10 each leg" },
      { name: "Single-Leg Glute Bridge", sets: 3, reps: "12 each" },
      { name: "Side-Lying Hip Abduction", sets: 3, reps: "15 each" },
      { name: "5-min walk cooldown", sets: 1, reps: "—" },
    ],
  },
  sunday: {
    title: "Upper Full + Core",
    duration: 60,
    location: "delhi",
    exercises: [
      { name: "Dumbbell Bench Press", sets: 4, reps: "8–10" },
      { name: "Bent-Over Barbell Row", sets: 4, reps: "8–10" },
      { name: "Dumbbell Shoulder Press", sets: 3, reps: "10" },
      { name: "One-Arm Dumbbell Row", sets: 3, reps: "10 each" },
      { name: "Dumbbell Lateral Raise", sets: 3, reps: "12" },
      { name: "Hammer Curls", sets: 3, reps: "12" },
      { name: "Triceps Overhead Extension", sets: 3, reps: "12" },
      { name: "Plank", sets: 3, reps: "45 sec" },
      { name: "Dead Bug", sets: 3, reps: "10 each side" },
    ],
  },
  tuesday: {
    title: "Lower — Hamstring & Quad",
    duration: 35,
    location: "delhi",
    exercises: [
      { name: "Barbell Back Squat", sets: 4, reps: "8" },
      { name: "Dumbbell Romanian Deadlift", sets: 3, reps: "10" },
      { name: "Walking Lunges (DB)", sets: 3, reps: "10 each leg" },
      { name: "Calf Raises", sets: 3, reps: "15" },
    ],
  },
  thursday: {
    title: "Upper Pull",
    duration: 35,
    location: "delhi",
    exercises: [
      { name: "One-Arm Dumbbell Row", sets: 4, reps: "10 each" },
      { name: "Dumbbell Pullover", sets: 3, reps: "12" },
      { name: "Reverse Fly (DB)", sets: 3, reps: "12" },
      { name: "Hammer Curls", sets: 3, reps: "12" },
      { name: "Banded Face Pull", sets: 3, reps: "15" },
    ],
  },
};

const BHUBANESWAR_WORKOUTS = {
  tuesday: {
    title: "Lower — Bands",
    duration: 35,
    location: "bhubaneswar",
    exercises: [
      { name: "Banded Sumo Squat", sets: 4, reps: "12" },
      { name: "Banded Romanian Deadlift", sets: 3, reps: "12", note: "Stand on band, hold ends." },
      { name: "Banded Reverse Lunge", sets: 3, reps: "10 each" },
      { name: "Banded Hip Thrust", sets: 3, reps: "15" },
      { name: "Banded Lateral Walks", sets: 3, reps: "15 steps each side" },
    ],
  },
  thursday: {
    title: "Upper Pull — Bands",
    duration: 30,
    location: "bhubaneswar",
    exercises: [
      { name: "Banded Row", sets: 4, reps: "12", note: "Anchor in front." },
      { name: "Banded Lat Pulldown", sets: 3, reps: "12", note: "Anchor overhead." },
      { name: "Banded Pull-Apart", sets: 3, reps: "15" },
      { name: "Banded Biceps Curl", sets: 3, reps: "12" },
      { name: "Banded Face Pull", sets: 3, reps: "15" },
    ],
  },
};

const REST_DAY = { title: "Rest", duration: 0, location: "rest", exercises: [], isRest: true };
const WALK_DAY = {
  title: "Optional 20-min Walk",
  duration: 20,
  location: "rest",
  exercises: [{ name: "Brisk Walk", sets: 1, reps: "20 min" }],
  isRest: true,
};

function getWorkoutForDay(date, travelDays) {
  const dayIdx = date.getDay();
  const isoDate = date.toISOString().split("T")[0];
  const inBhubaneswar = travelDays.includes(isoDate);
  if (dayIdx === 6) return { ...DELHI_WORKOUTS.saturday };
  if (dayIdx === 0) return { ...DELHI_WORKOUTS.sunday };
  if (dayIdx === 1) return { ...REST_DAY };
  if (dayIdx === 5) return { ...REST_DAY };
  if (dayIdx === 3) return { ...WALK_DAY };
  if (dayIdx === 2) return inBhubaneswar ? { ...BHUBANESWAR_WORKOUTS.tuesday } : { ...DELHI_WORKOUTS.tuesday };
  if (dayIdx === 4) return inBhubaneswar ? { ...BHUBANESWAR_WORKOUTS.thursday } : { ...DELHI_WORKOUTS.thursday };
  return { ...REST_DAY };
}

function startOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}
function addDays(date, days) { const d = new Date(date); d.setDate(d.getDate() + days); return d; }
function formatDate(date) { return date.toISOString().split("T")[0]; }
function formatLong(date) { return date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }); }
function isSameDay(a, b) { return a.toDateString() === b.toDateString(); }

function loadProgress(dateKey) {
  try { const raw = localStorage.getItem(`workout:${dateKey}`); return raw ? JSON.parse(raw) : null; } catch { return null; }
}
function saveProgress(dateKey, data) {
  try { localStorage.setItem(`workout:${dateKey}`, JSON.stringify(data)); } catch (e) { console.error(e); }
}
function loadTravelDays() {
  try { const raw = localStorage.getItem("travelDays"); return raw ? JSON.parse(raw) : []; } catch { return []; }
}
function saveTravelDays(days) {
  try { localStorage.setItem("travelDays", JSON.stringify(days)); } catch (e) { console.error(e); }
}
function loadApiKey() { return localStorage.getItem("anthropic_api_key") || ""; }

function loadHistoricalSessions(fromDate, toDate) {
  const sessions = [];
  let cursor = new Date(fromDate);
  while (cursor <= toDate) {
    const key = formatDate(cursor);
    const stored = loadProgress(key);
    if (stored && !stored.isRest) {
      const hasLogged = stored.exercises.some((e) => e.completed || e.actualWeight || e.actualReps);
      if (hasLogged) sessions.push({ date: key, ...stored });
    }
    cursor = addDays(cursor, 1);
  }
  return sessions;
}

// ---------- CYCLE TRACKING ----------
const AVG_CYCLE_LENGTH = 25;
const PHASE_NAMES = {
  menstrual: "Menstrual",
  follicular: "Follicular",
  ovulation: "Ovulation",
  luteal: "Luteal",
};

function loadCycleStart() { return localStorage.getItem("cycle_last_start") || null; }
function saveCycleStart(iso) { localStorage.setItem("cycle_last_start", iso); }

function getCyclePhase(daysSinceStart) {
  if (daysSinceStart === null || daysSinceStart < 0) return null;
  const dayInCycle = (daysSinceStart % AVG_CYCLE_LENGTH) + 1;
  if (dayInCycle <= 5) return { phase: "menstrual", day: dayInCycle, total: AVG_CYCLE_LENGTH };
  if (dayInCycle <= 13) return { phase: "follicular", day: dayInCycle, total: AVG_CYCLE_LENGTH };
  if (dayInCycle <= 16) return { phase: "ovulation", day: dayInCycle, total: AVG_CYCLE_LENGTH };
  return { phase: "luteal", day: dayInCycle, total: AVG_CYCLE_LENGTH };
}

function getDaysSince(startISO, currentDate) {
  if (!startISO) return null;
  const start = new Date(startISO);
  start.setHours(0, 0, 0, 0);
  const ms = currentDate.getTime() - start.getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

// ---------- DEFERRED SESSIONS & CARRY QUEUE ----------
// A session has status: undefined (default) | "deferred" | "released" | "carried" | "made_up"
function getDeferredThisWeek(weekStart) {
  const deferred = [];
  for (let i = 0; i < 7; i++) {
    const d = addDays(weekStart, i);
    const key = formatDate(d);
    const stored = loadProgress(key);
    if (stored && stored.status === "deferred") {
      deferred.push({ date: key, title: stored.title, location: stored.location, exercises: stored.exercises });
    }
  }
  return deferred;
}

function getCarryQueue() {
  try { return JSON.parse(localStorage.getItem("carry_queue") || "[]"); } catch { return []; }
}

function saveCarryQueue(queue) {
  localStorage.setItem("carry_queue", JSON.stringify(queue));
}

function popFromCarryQueue() {
  const queue = getCarryQueue();
  if (queue.length === 0) return null;
  const item = queue.shift();
  saveCarryQueue(queue);
  return item;
}

// ---------- CONTEXTUAL GREETING ----------
function getGreeting(isToday, workoutTitle, isRest, cyclePhase) {
  if (!isToday) return null;

  if (cyclePhase) {
    if (cyclePhase.phase === "menstrual" && cyclePhase.day <= 2) {
      return "Honour the slow-down. Nothing today is mandatory.";
    }
    if (cyclePhase.phase === "menstrual") {
      return "Move gently. Listen first, lift second.";
    }
    if (cyclePhase.phase === "follicular" && !isRest) {
      return "Strong window. Your body wants to push today.";
    }
    if (cyclePhase.phase === "ovulation" && !isRest) {
      return "Peak strength phase. Aim high — the data will follow.";
    }
    if (cyclePhase.phase === "luteal" && !isRest) {
      return "Steady week. Maintain, don't strain.";
    }
  }

  if (isRest) return "Rest. The work is in the recovery.";
  if (workoutTitle?.includes("Glute") || workoutTitle?.includes("Hip")) {
    return "Train today. Hip thrusts are the priority.";
  }
  if (workoutTitle?.includes("Upper") && workoutTitle?.includes("Pull")) {
    return "Train today. Show up for the rows.";
  }
  if (workoutTitle?.includes("Upper")) {
    return "Train today. Press strong, breathe deep.";
  }
  return "Train today. One small step, every session.";
}

// ---------- Module ----------
export default function FitnessModule({ onOpenSettings }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [selectedDate, setSelectedDate] = useState(today);
  const [weekStart, setWeekStart] = useState(startOfWeek(today));
  const [progress, setProgress] = useState(null);
  const [travelDays, setTravelDays] = useState([]);
  const [travelModalOpen, setTravelModalOpen] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [cycleModalOpen, setCycleModalOpen] = useState(false);
  const [deferModalOpen, setDeferModalOpen] = useState(false);
  const [resurfaceModalOpen, setResurfaceModalOpen] = useState(false);
  const [cycleStart, setCycleStart] = useState(loadCycleStart());

  useEffect(() => { setTravelDays(loadTravelDays()); }, []);

  useEffect(() => {
    const dateKey = formatDate(selectedDate);
    const stored = loadProgress(dateKey);
    if (stored) {
      setProgress(stored);
    } else {
      const workout = getWorkoutForDay(selectedDate, travelDays);
      // Check for carry queue items on workout days only (not rest)
      let exercises = workout.exercises.map((ex, i) => ({
        id: `pre-${i}-${Date.now()}`,
        ...ex,
        completed: false, actualWeight: "", actualReps: "", actualNotes: "",
      }));
      let title = workout.title;
      let carryNote = null;

      // Auto-merge carry queue on Monday/first workout day of week
      if (!workout.isRest && isSameDay(selectedDate, new Date(new Date().setHours(0,0,0,0)))) {
        const queue = getCarryQueue();
        if (queue.length > 0) {
          // Pop the first item that matches current location type (Delhi/Bhubaneswar)
          // Actually simpler: just take first item, append its exercises
          const item = queue[0];
          if (item) {
            carryNote = `Carried over from last week: ${item.title}. Add what you can to today.`;
            // Don't auto-add exercises — just note it. User decides.
          }
        }
      }

      setProgress({
        title: workout.title,
        duration: workout.duration,
        location: workout.location,
        isRest: workout.isRest || false,
        partial: false,
        status: undefined,
        carryNote,
        exercises,
        sessionNote: "",
      });
    }
  }, [selectedDate, travelDays]);

  const [weekProgressMap, setWeekProgressMap] = useState({});
  useEffect(() => {
    const map = {};
    for (let i = 0; i < 7; i++) {
      const d = addDays(weekStart, i);
      const key = formatDate(d);
      const stored = loadProgress(key);
      if (stored) {
        const total = stored.exercises.length;
        const done = stored.exercises.filter((e) => e.completed).length;
        map[key] = { done, total, isRest: stored.isRest, partial: stored.partial, status: stored.status };
      } else {
        const w = getWorkoutForDay(d, travelDays);
        map[key] = { done: 0, total: w.exercises.length, isRest: w.isRest, partial: false, status: undefined };
      }
    }
    setWeekProgressMap(map);
  }, [weekStart, travelDays, progress]);

  function persist(updated) {
    setProgress(updated);
    saveProgress(formatDate(selectedDate), updated);
  }

  function toggleExercise(id) {
    persist({ ...progress, exercises: progress.exercises.map((e) => e.id === id ? { ...e, completed: !e.completed } : e) });
  }

  function updateExerciseField(id, field, value) {
    persist({ ...progress, exercises: progress.exercises.map((e) => e.id === id ? { ...e, [field]: value } : e) });
  }

  function deleteExercise(id) {
    persist({ ...progress, exercises: progress.exercises.filter((e) => e.id !== id) });
  }

  function moveExercise(id, direction) {
    const idx = progress.exercises.findIndex((e) => e.id === id);
    if (idx === -1) return;
    const newIdx = direction === "up" ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= progress.exercises.length) return;
    const newList = [...progress.exercises];
    [newList[idx], newList[newIdx]] = [newList[newIdx], newList[idx]];
    persist({ ...progress, exercises: newList });
  }

  function addExercise(name, sets, reps) {
    if (!name.trim()) return;
    const newEx = {
      id: `custom-${Date.now()}`,
      name: name.trim(),
      sets: parseInt(sets) || 3,
      reps: reps.trim() || "10",
      completed: false, actualWeight: "", actualReps: "", actualNotes: "",
      isCustom: true,
    };
    persist({ ...progress, exercises: [...progress.exercises, newEx] });
  }

  function updateSessionNote(note) { persist({ ...progress, sessionNote: note }); }

  function markPartial() {
    persist({ ...progress, partial: true });
  }

  function unmarkPartial() {
    persist({ ...progress, partial: false });
  }

  // ---- Deferral flow ----
  function letItGo() {
    persist({ ...progress, status: "released" });
    setDeferModalOpen(false);
  }

  function deferThisWeek() {
    persist({ ...progress, status: "deferred" });
    setDeferModalOpen(false);
  }

  function carryToNextWeek() {
    // Add to carry queue with origin metadata
    const queue = getCarryQueue();
    queue.push({
      title: progress.title,
      location: progress.location,
      duration: progress.duration,
      exercises: progress.exercises.map(e => ({ name: e.name, sets: e.sets, reps: e.reps, note: e.note })),
      carriedFrom: formatDate(selectedDate),
    });
    saveCarryQueue(queue);
    persist({ ...progress, status: "carried" });
    setDeferModalOpen(false);
  }

  function resumeDeferredSession(deferredItem) {
    // Load deferred session's exercises onto today's date
    const newProgress = {
      title: deferredItem.title + " (made up)",
      duration: deferredItem.exercises ? 60 : 35,
      location: deferredItem.location,
      isRest: false,
      partial: false,
      status: undefined,
      exercises: deferredItem.exercises.map((ex, i) => ({
        id: `resume-${i}-${Date.now()}`,
        name: ex.name, sets: ex.sets, reps: ex.reps, note: ex.note,
        completed: false, actualWeight: "", actualReps: "", actualNotes: "",
      })),
      sessionNote: "",
    };
    persist(newProgress);
    // Mark original as made up
    const original = loadProgress(deferredItem.date);
    if (original) {
      original.status = "made_up";
      saveProgress(deferredItem.date, original);
    }
    setResurfaceModalOpen(false);
  }

  function toggleTravelDay(dateKey) {
    const updated = travelDays.includes(dateKey) ? travelDays.filter((d) => d !== dateKey) : [...travelDays, dateKey];
    setTravelDays(updated);
    saveTravelDays(updated);
  }

  function applyAiSuggestions(updatedExercises) {
    persist({ ...progress, exercises: updatedExercises });
  }

  function handleSaveCycle(dateStr) {
    const iso = new Date(dateStr).toISOString();
    saveCycleStart(iso);
    setCycleStart(iso);
    setCycleModalOpen(false);
  }

  if (!progress) return null;

  const isToday = isSameDay(selectedDate, today);
  const daysSinceCycle = cycleStart ? getDaysSince(cycleStart, selectedDate) : null;
  const cyclePhase = getCyclePhase(daysSinceCycle);
  const greeting = getGreeting(isToday, progress.title, progress.isRest, cyclePhase);

  const totalEx = progress.exercises.length;
  const doneEx = progress.exercises.filter((e) => e.completed).length;
  const pct = totalEx > 0 ? Math.round((doneEx / totalEx) * 100) : 0;
  const showPartialOption = !progress.isRest && doneEx > 0 && doneEx < totalEx && !progress.partial && !progress.status;

  // Training debt for current week
  const deferredThisWeek = getDeferredThisWeek(weekStart);
  const carryQueueLen = getCarryQueue().length;

  // Show "couldn't train today" button only on workout days that aren't done/deferred/released
  const showCouldntTrainButton = !progress.isRest && doneEx === 0 && !progress.status && !progress.partial && isToday;

  // On rest days (or any day), if there's a deferred session this week, show resume prompt
  const showResumePrompt = progress.isRest && deferredThisWeek.length > 0 && isToday;

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 20px" }}>

      {/* Training debt banner */}
      {(deferredThisWeek.length > 0 || carryQueueLen > 0) && (
        <div style={{ marginBottom: 16, padding: "10px 14px", background: "#FCFAF5", border: "1px solid #E8D5A8", borderRadius: 10, display: "flex", alignItems: "center", gap: 10, fontSize: 12, color: "#6B5530", lineHeight: 1.5 }}>
          <PauseCircle size={14} color="#B8860B" style={{ flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            {deferredThisWeek.length > 0 && (
              <span>Owed this week · {deferredThisWeek.length} session{deferredThisWeek.length > 1 ? "s" : ""} · {deferredThisWeek.map(d => d.title.replace(/Lower — /, "").replace(/Upper /, "")).join(", ")}</span>
            )}
            {deferredThisWeek.length === 0 && carryQueueLen > 0 && (
              <span>Carried from last week · {carryQueueLen} session{carryQueueLen > 1 ? "s" : ""} pending</span>
            )}
          </div>
        </div>
      )}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, gap: 8 }}>
        <button onClick={() => setWeekStart(addDays(weekStart, -7))} style={{ background: "transparent", border: "none", cursor: "pointer", padding: 6, color: "#6B5530" }}>
          <ChevronLeft size={20} />
        </button>
        <div style={{ fontFamily: "Fraunces, serif", fontSize: 16, fontWeight: 500 }}>
          Week of {weekStart.toLocaleDateString("en-US", { month: "long", day: "numeric" })}
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button className="ft-btn ft-btn-ai" onClick={() => setAiModalOpen(true)} style={{ padding: "8px 12px" }}>
            <Sparkles size={13} /> AI
          </button>
          <button
            className={cyclePhase ? "ft-btn ft-btn-cycle" : "ft-btn ft-btn-ghost"}
            onClick={() => setCycleModalOpen(true)}
            style={{ padding: "8px 12px" }}
          >
            <Droplet size={13} />
          </button>
          <button className="ft-btn ft-btn-ghost" onClick={() => setTravelModalOpen(true)} style={{ padding: "8px 12px" }}>
            <MapPin size={13} />
          </button>
          <button onClick={() => setWeekStart(addDays(weekStart, 7))} style={{ background: "transparent", border: "none", cursor: "pointer", padding: 6, color: "#6B5530" }}>
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="ft-week" style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6, marginBottom: 28 }}>
        {Array.from({ length: 7 }).map((_, i) => {
          const d = addDays(weekStart, i);
          const dKey = formatDate(d);
          const isActive = isSameDay(d, selectedDate);
          const isTodayDay = isSameDay(d, today);
          const wp = weekProgressMap[dKey];
          const inTravel = travelDays.includes(dKey);
          return (
            <div key={i} className={`ft-day-pill ${isActive ? "active" : ""} ${isTodayDay ? "today" : ""}`} onClick={() => setSelectedDate(d)}>
              <div style={{ fontSize: 10, opacity: 0.7, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                {d.toLocaleDateString("en-US", { weekday: "short" })}
              </div>
              <div style={{ fontFamily: "Fraunces, serif", fontSize: 20, fontWeight: 500, marginTop: 2 }}>
                {d.getDate()}
              </div>
              <div style={{ display: "flex", gap: 3, marginTop: 4, alignItems: "center", height: 6 }}>
                {wp && wp.isRest && <div style={{ width: 4, height: 4, borderRadius: 2, background: isActive ? "#F4F1EA" : "#C8B894", opacity: 0.6 }} />}
                {wp && !wp.isRest && wp.status === "deferred" && (
                  <div style={{
                    width: 7, height: 7, borderRadius: "50%",
                    border: `1.5px dashed ${isActive ? "#F4F1EA" : "#B8860B"}`,
                  }} />
                )}
                {wp && !wp.isRest && wp.status === "released" && (
                  <div style={{ width: 4, height: 4, borderRadius: 2, background: isActive ? "#F4F1EA" : "#C8B894", opacity: 0.4 }} />
                )}
                {wp && !wp.isRest && wp.status === "carried" && (
                  <div style={{ fontSize: 8, color: isActive ? "#F4F1EA" : "#8A7B5E", lineHeight: 1 }}>→</div>
                )}
                {wp && !wp.isRest && !wp.status && wp.partial && (
                  <div style={{
                    width: 6, height: 6, borderRadius: 3,
                    background: `linear-gradient(90deg, ${isActive ? "#F4F1EA" : "#6B5530"} 50%, transparent 50%)`,
                    border: `1px solid ${isActive ? "#F4F1EA" : "#6B5530"}`
                  }} />
                )}
                {wp && !wp.isRest && !wp.status && !wp.partial && wp.total > 0 && (
                  wp.done === wp.total ? (
                    <div style={{ width: 6, height: 6, borderRadius: 3, background: isActive ? "#F4F1EA" : "#6B5530" }} />
                  ) : wp.done > 0 ? (
                    <div style={{ width: 6, height: 6, borderRadius: 3, background: isActive ? "#F4F1EA" : "#B8860B" }} />
                  ) : null
                )}
                {inTravel && <div style={{ fontSize: 9, opacity: 0.7 }}>✈</div>}
              </div>
            </div>
          );
        })}
      </div>

      {greeting && (
        <div className="greeting-line">{greeting}</div>
      )}

      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, color: "#8A7B5E", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>
          {isToday ? "Today" : ""}
        </div>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
          <h1 style={{ fontFamily: "Fraunces, serif", fontSize: 32, fontWeight: 500, margin: 0, letterSpacing: "-0.02em", lineHeight: 1.1 }}>
            {formatLong(selectedDate)}
          </h1>
          <div style={{ display: "flex", gap: 12, alignItems: "center", fontSize: 12, color: "#6B5530", flexWrap: "wrap" }}>
            {progress.duration > 0 && (
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <Calendar size={12} /> {progress.duration} min
              </span>
            )}
            {progress.location !== "rest" && (
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                {progress.location === "delhi" ? <Dumbbell size={12} /> : <MapPin size={12} />}
                {progress.location === "delhi" ? "Delhi · Weights" : "Bhubaneswar · Bands"}
              </span>
            )}
            {cyclePhase && (
              <span className="cycle-pill">
                <Droplet size={12} /> {PHASE_NAMES[cyclePhase.phase]} · Day {cyclePhase.day}
              </span>
            )}
          </div>
        </div>
        <div style={{ fontFamily: "Fraunces, serif", fontStyle: "italic", fontSize: 17, color: "#6B5530", marginTop: 8 }}>
          {progress.title}
        </div>
      </div>

      {totalEx > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 12, color: "#6B5530" }}>
            <span>{doneEx} of {totalEx} complete{progress.partial ? " · partial session" : ""}</span>
            <span>{pct}%</span>
          </div>
          <div className="progress-bar"><div className="progress-fill" style={{ width: `${pct}%` }} /></div>
        </div>
      )}

      <div className="ft-grid" style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 28 }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "#8A7B5E", marginBottom: 12, fontWeight: 500 }}>
            Exercises
          </div>

          {progress.isRest && progress.exercises.length === 0 && (
            <div style={{ padding: "40px 24px", background: "#FCFAF5", border: "1px dashed #C8B894", borderRadius: 12, textAlign: "center" }}>
              <div style={{ fontFamily: "Fraunces, serif", fontSize: 22, fontStyle: "italic", color: "#6B5530" }}>Rest day.</div>
              <div style={{ fontSize: 13, color: "#8A7B5E", marginTop: 8 }}>Recovery is when the muscle is built.</div>
            </div>
          )}

          {progress.exercises.map((ex, idx) => (
            <ExerciseCard
              key={ex.id}
              exercise={ex}
              isFirst={idx === 0}
              isLast={idx === progress.exercises.length - 1}
              onToggle={() => toggleExercise(ex.id)}
              onUpdate={(field, value) => updateExerciseField(ex.id, field, value)}
              onDelete={() => deleteExercise(ex.id)}
              onMoveUp={() => moveExercise(ex.id, "up")}
              onMoveDown={() => moveExercise(ex.id, "down")}
              showLog={progress.location !== "rest"}
            />
          ))}

          {/* Status banners — released, deferred, carried */}
          {progress.status === "released" && (
            <div style={{ marginTop: 12, padding: 14, background: "#ECE4CF", borderRadius: 10 }}>
              <div style={{ fontFamily: "Fraunces, serif", fontStyle: "italic", fontSize: 14, color: "#2A2419" }}>
                Let go.
              </div>
              <div style={{ fontSize: 11, color: "#6B5530", marginTop: 4 }}>
                Body said no. Tomorrow continues as planned.
              </div>
            </div>
          )}

          {progress.status === "deferred" && (
            <div style={{ marginTop: 12, padding: 14, background: "#FCFAF5", border: "1px solid #E8D5A8", borderRadius: 10 }}>
              <div style={{ fontFamily: "Fraunces, serif", fontStyle: "italic", fontSize: 14, color: "#2A2419", display: "flex", alignItems: "center", gap: 6 }}>
                <PauseCircle size={14} color="#B8860B" /> Deferred to this week.
              </div>
              <div style={{ fontSize: 11, color: "#6B5530", marginTop: 4 }}>
                Will resurface on a rest day. Or settle it on Sunday.
              </div>
            </div>
          )}

          {progress.status === "carried" && (
            <div style={{ marginTop: 12, padding: 14, background: "#FCFAF5", border: "1px solid #E8D5A8", borderRadius: 10 }}>
              <div style={{ fontFamily: "Fraunces, serif", fontStyle: "italic", fontSize: 14, color: "#2A2419", display: "flex", alignItems: "center", gap: 6 }}>
                <Forward size={14} color="#B8860B" /> Carried to next week.
              </div>
              <div style={{ fontSize: 11, color: "#6B5530", marginTop: 4 }}>
                Added to next week's plan from the start.
              </div>
            </div>
          )}

          {progress.status === "made_up" && (
            <div style={{ marginTop: 12, padding: 14, background: "#ECE4CF", borderRadius: 10 }}>
              <div style={{ fontFamily: "Fraunces, serif", fontStyle: "italic", fontSize: 14, color: "#2A2419" }}>
                Made up later in the week.
              </div>
            </div>
          )}

          {showPartialOption && (
            <div style={{ marginTop: 12, padding: 14, background: "#FCFAF5", border: "1px dashed #C8B894", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ fontSize: 13, color: "#2A2419", fontWeight: 500 }}>Showing up counts.</div>
                <div style={{ fontSize: 11, color: "#8A7B5E", marginTop: 2 }}>
                  Done what you could? Mark it as a partial session.
                </div>
              </div>
              <button className="ft-btn ft-btn-ghost" onClick={markPartial}>
                <MinusCircle size={13} /> I did less
              </button>
            </div>
          )}

          {progress.partial && (
            <div style={{ marginTop: 12, padding: 14, background: "#ECE4CF", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ fontFamily: "Fraunces, serif", fontStyle: "italic", fontSize: 14, color: "#2A2419" }}>
                  Got it. Today counted.
                </div>
                <div style={{ fontSize: 11, color: "#6B5530", marginTop: 4 }}>
                  Marked as a partial session.
                </div>
              </div>
              <button className="ft-btn ft-btn-ghost" onClick={unmarkPartial} style={{ fontSize: 11, padding: "6px 10px" }}>
                Undo
              </button>
            </div>
          )}

          {/* "Couldn't train today" entry point */}
          {showCouldntTrainButton && (
            <div style={{ marginTop: 16, padding: 14, background: "transparent", border: "1px dashed #C8B894", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 180, fontSize: 12, color: "#8A7B5E" }}>
                Body or schedule got in the way?
              </div>
              <button className="ft-btn ft-btn-ghost" onClick={() => setDeferModalOpen(true)} style={{ fontSize: 12 }}>
                Couldn't train today
              </button>
            </div>
          )}

          {/* Resume deferred session prompt on rest days */}
          {showResumePrompt && (
            <div style={{ marginTop: 16, padding: 16, background: "#FCFAF5", border: "1px solid #E8D5A8", borderRadius: 10 }}>
              <div style={{ fontFamily: "Fraunces, serif", fontStyle: "italic", fontSize: 14, color: "#2A2419", marginBottom: 6 }}>
                You have {deferredThisWeek.length === 1 ? "a session" : `${deferredThisWeek.length} sessions`} deferred from this week.
              </div>
              <div style={{ fontSize: 12, color: "#6B5530", marginBottom: 12, lineHeight: 1.5 }}>
                Today's a rest day. Train it now if you feel up to it, or keep resting — either is right.
              </div>
              <button className="ft-btn" onClick={() => setResurfaceModalOpen(true)}>
                <Forward size={13} /> Train deferred session
              </button>
            </div>
          )}

          <AddExerciseForm onAdd={addExercise} />
        </div>

        <div>
          <div style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "#8A7B5E", marginBottom: 12, fontWeight: 500 }}>
            Session Note
          </div>
          <textarea
            value={progress.sessionNote || ""}
            onChange={(e) => updateSessionNote(e.target.value)}
            placeholder="How did it feel? Energy, sleep, soreness…"
            style={{
              width: "100%", minHeight: 120, padding: 14,
              background: "#FCFAF5", border: "1px solid #E8DFCB",
              borderRadius: 10, fontFamily: "inherit", fontSize: 14,
              color: "#2A2419", resize: "vertical", outline: "none"
            }}
          />

          <div style={{ marginTop: 20, padding: 16, background: "#ECE4CF", borderRadius: 10, fontSize: 12, color: "#6B5530", lineHeight: 1.6 }}>
            <div style={{ fontFamily: "Fraunces, serif", fontStyle: "italic", fontSize: 14, marginBottom: 6, color: "#2A2419" }}>The rule</div>
            Each week, on every lift: add a rep, add a set, or add load. One small step, every session.
          </div>
        </div>
      </div>

      {travelModalOpen && (
        <TravelModal weekStart={weekStart} travelDays={travelDays} onToggle={toggleTravelDay} onClose={() => setTravelModalOpen(false)} />
      )}

      {cycleModalOpen && (
        <CycleModal
          cycleStart={cycleStart}
          onSave={handleSaveCycle}
          onClose={() => setCycleModalOpen(false)}
        />
      )}

      {deferModalOpen && (
        <DeferModal
          progressTitle={progress.title}
          cyclePhase={cyclePhase}
          existingDeferredCount={deferredThisWeek.length}
          existingDeferred={deferredThisWeek}
          onLetGo={letItGo}
          onDefer={deferThisWeek}
          onCarry={carryToNextWeek}
          onReleaseExisting={(date) => {
            // Release the existing deferred to make room for a new defer
            const stored = loadProgress(date);
            if (stored) {
              stored.status = "released";
              saveProgress(date, stored);
              // Now defer current
              persist({ ...progress, status: "deferred" });
            }
            setDeferModalOpen(false);
          }}
          onClose={() => setDeferModalOpen(false)}
        />
      )}

      {resurfaceModalOpen && (
        <ResurfaceModal
          deferred={deferredThisWeek}
          onResume={resumeDeferredSession}
          onClose={() => setResurfaceModalOpen(false)}
        />
      )}

      {aiModalOpen && (
        <AiCoachModal
          currentSession={progress}
          currentDate={selectedDate}
          cyclePhase={cyclePhase}
          onApply={applyAiSuggestions}
          onClose={() => setAiModalOpen(false)}
          onOpenSettings={() => { setAiModalOpen(false); onOpenSettings(); }}
        />
      )}
    </div>
  );
}

function ExerciseCard({ exercise, isFirst, isLast, onToggle, onUpdate, onDelete, onMoveUp, onMoveDown, showLog }) {
  const [expanded, setExpanded] = useState(false);
  const hasLog = exercise.actualWeight || exercise.actualReps || exercise.actualNotes;

  return (
    <div className={`ft-exercise ${exercise.completed ? "done" : ""} ${exercise.aiUpdated ? "ai-updated" : ""}`}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <div className={`ft-checkbox ${exercise.completed ? "checked" : ""}`} onClick={onToggle} style={{ marginTop: 2 }}>
          {exercise.completed && <Check size={14} color="#F4F1EA" strokeWidth={3} />}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
            <div style={{ flex: 1 }}>
              <div className="ft-name" style={{ fontWeight: 500, fontSize: 15 }}>
                {exercise.name}
                {exercise.aiUpdated && (
                  <span style={{ marginLeft: 8, fontSize: 10, color: "#B8860B", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>
                    ✨ updated
                  </span>
                )}
              </div>
              <div style={{ fontSize: 12, color: "#8A7B5E", marginTop: 2 }}>
                {exercise.sets} × {exercise.reps}
              </div>
              {exercise.note && !exercise.completed && (
                <div style={{ fontSize: 11, color: "#B8860B", fontStyle: "italic", marginTop: 4 }}>
                  ↳ {exercise.note}
                </div>
              )}
            </div>
            <div style={{ display: "flex", gap: 0, alignItems: "center" }}>
              <button className="ft-icon-btn" onClick={onMoveUp} disabled={isFirst}><ArrowUp size={14} /></button>
              <button className="ft-icon-btn" onClick={onMoveDown} disabled={isLast}><ArrowDown size={14} /></button>
              {showLog && (
                <button onClick={() => setExpanded(!expanded)} className="ft-icon-btn" style={{ background: hasLog ? "#ECE4CF" : "transparent", color: hasLog ? "#6B5530" : "#B8AC92" }}>
                  <Edit2 size={14} />
                </button>
              )}
              {exercise.isCustom && (
                <button onClick={onDelete} className="ft-icon-btn"><Trash2 size={14} /></button>
              )}
            </div>
          </div>

          {expanded && showLog && (
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px dashed #E8DFCB", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <span className="ft-field-label">Weight / Band</span>
                <input className="ft-input" value={exercise.actualWeight} onChange={(e) => onUpdate("actualWeight", e.target.value)} placeholder="e.g. 30 kg" />
              </div>
              <div>
                <span className="ft-field-label">Reps Done</span>
                <input className="ft-input" value={exercise.actualReps} onChange={(e) => onUpdate("actualReps", e.target.value)} placeholder="e.g. 8, 8, 7, 6" />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <span className="ft-field-label">Note</span>
                <input className="ft-input" value={exercise.actualNotes} onChange={(e) => onUpdate("actualNotes", e.target.value)} placeholder="form, RPE, anything" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AddExerciseForm({ onAdd }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [sets, setSets] = useState("3");
  const [reps, setReps] = useState("10");

  function handleAdd() {
    onAdd(name, sets, reps);
    setName(""); setSets("3"); setReps("10");
    setOpen(false);
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} style={{
        width: "100%", padding: "14px 16px", marginTop: 8,
        background: "transparent", border: "1.5px dashed #C8B894",
        borderRadius: 10, color: "#6B5530", fontFamily: "inherit",
        fontSize: 13, cursor: "pointer", display: "flex",
        alignItems: "center", justifyContent: "center", gap: 6,
      }}>
        <Plus size={14} /> Add exercise
      </button>
    );
  }

  return (
    <div style={{ padding: 16, background: "#FCFAF5", border: "1px solid #6B5530", borderRadius: 10, marginTop: 8 }}>
      <div style={{ marginBottom: 12 }}>
        <span className="ft-field-label">Exercise name</span>
        <input autoFocus className="ft-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Banded Glute Bridge" style={{ fontSize: 14 }} />
      </div>
      <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
        <div style={{ flex: 1 }}>
          <span className="ft-field-label">Sets</span>
          <input className="ft-input" value={sets} onChange={(e) => setSets(e.target.value)} placeholder="3" />
        </div>
        <div style={{ flex: 2 }}>
          <span className="ft-field-label">Reps</span>
          <input className="ft-input" value={reps} onChange={(e) => setReps(e.target.value)} placeholder="10 or 8–10" />
        </div>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button className="ft-btn" onClick={handleAdd}>Add</button>
        <button className="ft-btn ft-btn-ghost" onClick={() => setOpen(false)}>Cancel</button>
      </div>
    </div>
  );
}

function TravelModal({ weekStart, travelDays, onToggle, onClose }) {
  const weeks = Array.from({ length: 4 }).map((_, w) => addDays(weekStart, w * 7));
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <h2 style={{ fontFamily: "Fraunces, serif", fontSize: 22, fontWeight: 500, margin: 0 }}>Travel days</h2>
          <button onClick={onClose} className="ft-icon-btn"><X size={20} /></button>
        </div>
        <div style={{ fontSize: 13, color: "#6B5530", marginBottom: 18, lineHeight: 1.5 }}>
          Tap days when you're in <strong>Bhubaneswar</strong>. Tue & Thu on those days will switch to bands.
        </div>
        {weeks.map((ws, wi) => (
          <div key={wi} style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "#8A7B5E", marginBottom: 8 }}>
              Week of {ws.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6 }}>
              {Array.from({ length: 7 }).map((_, i) => {
                const d = addDays(ws, i);
                const dKey = formatDate(d);
                const isOn = travelDays.includes(dKey);
                const dayIdx = d.getDay();
                const isWeekend = dayIdx === 0 || dayIdx === 6;
                return (
                  <button
                    key={i}
                    onClick={() => !isWeekend && onToggle(dKey)}
                    disabled={isWeekend}
                    style={{
                      padding: "10px 4px", borderRadius: 8,
                      border: isOn ? "1.5px solid #6B5530" : "1px solid #E8DFCB",
                      background: isOn ? "#6B5530" : isWeekend ? "#F0EAD8" : "#FCFAF5",
                      color: isOn ? "#F4F1EA" : isWeekend ? "#B8AC92" : "#2A2419",
                      cursor: isWeekend ? "not-allowed" : "pointer",
                      fontFamily: "inherit", fontSize: 12,
                      display: "flex", flexDirection: "column", alignItems: "center"
                    }}
                  >
                    <div style={{ fontSize: 9, opacity: 0.7, textTransform: "uppercase" }}>
                      {d.toLocaleDateString("en-US", { weekday: "short" })}
                    </div>
                    <div style={{ fontFamily: "Fraunces, serif", fontSize: 16, fontWeight: 500 }}>{d.getDate()}</div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
        <button className="ft-btn" onClick={onClose} style={{ width: "100%", justifyContent: "center" }}>Done</button>
      </div>
    </div>
  );
}

function CycleModal({ cycleStart, onSave, onClose }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [date, setDate] = useState(
    cycleStart ? new Date(cycleStart).toISOString().split("T")[0] : today.toISOString().split("T")[0]
  );

  const currentPhase = cycleStart ? getCyclePhase(getDaysSince(cycleStart, today)) : null;
  const nextPeriodETA = cycleStart ? (() => {
    const start = new Date(cycleStart);
    const next = new Date(start);
    next.setDate(start.getDate() + AVG_CYCLE_LENGTH);
    return next;
  })() : null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 style={{ fontFamily: "Fraunces, serif", fontSize: 22, fontWeight: 500, margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
            <Droplet size={20} color="#B8385C" /> Cycle
          </h2>
          <button onClick={onClose} className="ft-icon-btn"><X size={20} /></button>
        </div>

        {currentPhase && (
          <div style={{ padding: 14, background: "#F8E8ED", borderRadius: 10, marginBottom: 18, border: "1px solid #E8B5C4" }}>
            <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "#8B4A60", marginBottom: 4, fontWeight: 600 }}>
              Today
            </div>
            <div style={{ fontFamily: "Fraunces, serif", fontStyle: "italic", fontSize: 18, color: "#2A2419" }}>
              {PHASE_NAMES[currentPhase.phase]} · Day {currentPhase.day}
            </div>
            <div style={{ fontSize: 12, color: "#8B4A60", marginTop: 6, lineHeight: 1.5 }}>
              {currentPhase.phase === "menstrual" && "Lower intensity. Hip thrusts can wait if you need them to."}
              {currentPhase.phase === "follicular" && "Strong window. Good time to push for new PRs on big lifts."}
              {currentPhase.phase === "ovulation" && "Peak strength phase. Aim high — your body's primed."}
              {currentPhase.phase === "luteal" && "Maintenance week. Focus on form, not load."}
            </div>
            {nextPeriodETA && (
              <div style={{ fontSize: 11, color: "#8B4A60", marginTop: 10, opacity: 0.8 }}>
                Next period estimated: {nextPeriodETA.toLocaleDateString("en-US", { month: "long", day: "numeric" })}
              </div>
            )}
          </div>
        )}

        <div style={{ marginBottom: 16 }}>
          <span className="ft-field-label">Last period start date</span>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            max={today.toISOString().split("T")[0]}
            style={{
              width: "100%", padding: 10, marginTop: 4,
              border: "1px solid #C8B894", borderRadius: 8,
              background: "#FCFAF5", fontFamily: "inherit", fontSize: 14
            }}
          />
          <div style={{ fontSize: 11, color: "#8A7B5E", marginTop: 8, lineHeight: 1.5 }}>
            Cycle estimated at 25 days. Update this each month when your period starts.
          </div>
        </div>

        <div style={{ padding: 14, background: "#ECE4CF", borderRadius: 10, marginBottom: 16, fontSize: 12, color: "#6B5530", lineHeight: 1.5 }}>
          <div style={{ fontFamily: "Fraunces, serif", fontStyle: "italic", fontSize: 13, marginBottom: 4, color: "#2A2419" }}>
            How this is used
          </div>
          The AI Coach reads your phase to calibrate today's intensity. Your body, your call — the app informs, doesn't dictate.
        </div>

        <button className="ft-btn" onClick={() => onSave(date)} style={{ width: "100%", justifyContent: "center" }}>
          Save
        </button>
      </div>
    </div>
  );
}

function DeferModal({ progressTitle, cyclePhase, existingDeferredCount, existingDeferred, onLetGo, onDefer, onCarry, onReleaseExisting, onClose }) {
  const isMenstrualEarly = cyclePhase && cyclePhase.phase === "menstrual" && cyclePhase.day <= 2;
  const isMenstrual = cyclePhase && cyclePhase.phase === "menstrual";
  const hasExistingDeferred = existingDeferredCount >= 1;

  // Recommended option, given context
  const recommendedKey = isMenstrualEarly ? "release" : (isMenstrual ? "release" : "defer");

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h2 style={{ fontFamily: "Fraunces, serif", fontSize: 22, fontWeight: 500, margin: 0 }}>
            Couldn't train today
          </h2>
          <button onClick={onClose} className="ft-icon-btn"><X size={20} /></button>
        </div>

        <div style={{ fontSize: 13, color: "#6B5530", marginBottom: 18, lineHeight: 1.5 }}>
          {isMenstrualEarly && (
            <>Day {cyclePhase.day} of your period. This isn't laziness — it's biology. The most honest move is often to let it go.</>
          )}
          {!isMenstrualEarly && isMenstrual && (
            <>You're in your menstrual phase. Listen to your body first.</>
          )}
          {!isMenstrual && (
            <>What got in the way matters less than what you do next. Three options.</>
          )}
        </div>

        {hasExistingDeferred && (
          <div style={{ padding: 12, background: "#FCF4E8", border: "1px solid #E8D5A8", borderRadius: 8, marginBottom: 16, fontSize: 12, color: "#6B5530", lineHeight: 1.5 }}>
            <strong>One deferred session already this week:</strong> {existingDeferred[0].title}.
            <br />
            To defer this one, you'd need to let that one go first.
          </div>
        )}

        {/* Option A: Let it go */}
        <DeferOption
          recommended={recommendedKey === "release"}
          icon={<MinusCircle size={16} color="#6B5530" />}
          title="Let it go"
          subtitle="Release this session entirely. No debt, no carry-over. Tomorrow continues as planned."
          onClick={onLetGo}
        />

        {/* Option B: Defer this week */}
        {!hasExistingDeferred ? (
          <DeferOption
            recommended={recommendedKey === "defer"}
            icon={<PauseCircle size={16} color="#B8860B" />}
            title="Defer to this week"
            subtitle="Resurface on a rest day. Settle by Sunday — make it up, carry forward, or release."
            onClick={onDefer}
          />
        ) : (
          <DeferOption
            icon={<PauseCircle size={16} color="#B8860B" />}
            title="Release the other deferred & defer this one"
            subtitle={`Lets go of "${existingDeferred[0].title}" and defers today's session instead.`}
            onClick={() => onReleaseExisting(existingDeferred[0].date)}
          />
        )}

        {/* Option C: Carry to next week */}
        <DeferOption
          icon={<Forward size={16} color="#B8860B" />}
          title="Carry to next week"
          subtitle="Adds today's session to next week's plan from the start."
          onClick={onCarry}
        />

        <button className="ft-btn ft-btn-ghost" onClick={onClose} style={{ width: "100%", justifyContent: "center", marginTop: 12 }}>
          Cancel
        </button>
      </div>
    </div>
  );
}

function DeferOption({ recommended, icon, title, subtitle, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%",
        textAlign: "left",
        background: recommended ? "#ECE4CF" : "#FCFAF5",
        border: recommended ? "1.5px solid #6B5530" : "1px solid #E8DFCB",
        borderRadius: 10,
        padding: "14px 16px",
        marginBottom: 8,
        cursor: "pointer",
        fontFamily: "inherit",
        display: "block",
        transition: "all 0.15s",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
        {icon}
        <div style={{ fontSize: 15, fontWeight: 500, color: "#2A2419" }}>{title}</div>
        {recommended && (
          <span style={{ marginLeft: "auto", fontSize: 9, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "#6B5530", background: "#FCFAF5", padding: "2px 6px", borderRadius: 4 }}>
            Suggested
          </span>
        )}
      </div>
      <div style={{ fontSize: 12, color: "#8A7B5E", lineHeight: 1.5, paddingLeft: 24 }}>
        {subtitle}
      </div>
    </button>
  );
}

function ResurfaceModal({ deferred, onResume, onClose }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h2 style={{ fontFamily: "Fraunces, serif", fontSize: 22, fontWeight: 500, margin: 0 }}>
            Train deferred session
          </h2>
          <button onClick={onClose} className="ft-icon-btn"><X size={20} /></button>
        </div>

        <div style={{ fontSize: 13, color: "#6B5530", marginBottom: 18, lineHeight: 1.5 }}>
          Pick which session to bring forward to today. Today's exercises will be replaced with this session.
        </div>

        {deferred.map((d, i) => (
          <button
            key={i}
            onClick={() => onResume(d)}
            style={{
              width: "100%",
              textAlign: "left",
              background: "#FCFAF5",
              border: "1px solid #E8DFCB",
              borderRadius: 10,
              padding: "14px 16px",
              marginBottom: 8,
              cursor: "pointer",
              fontFamily: "inherit",
              display: "block",
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 500, color: "#2A2419", marginBottom: 4 }}>{d.title}</div>
            <div style={{ fontSize: 11, color: "#8A7B5E" }}>
              Originally {new Date(d.date).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })} · {d.exercises.length} exercises
            </div>
          </button>
        ))}

        <button className="ft-btn ft-btn-ghost" onClick={onClose} style={{ width: "100%", justifyContent: "center", marginTop: 12 }}>
          Keep resting
        </button>
      </div>
    </div>
  );
}

function AiCoachModal({ currentSession, currentDate, cyclePhase, onApply, onClose, onOpenSettings }) {
  const [step, setStep] = useState("ready");
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);
  const apiKey = loadApiKey();

  async function runAnalysis() {
    if (!apiKey) {
      setError("Add your Anthropic API key in Settings first.");
      setStep("error");
      return;
    }
    setStep("loading");
    setError(null);

    try {
      const fromDate = addDays(currentDate, -28);
      const sessions = loadHistoricalSessions(fromDate, addDays(currentDate, -1));

      // Compute training debt context
      const recentDeferred = sessions.filter(s => s.status === "deferred").map(s => s.title);
      const recentReleased = sessions.filter(s => s.status === "released").map(s => ({ date: s.date, title: s.title }));

      const context = {
        today: {
          date: formatDate(currentDate),
          title: currentSession.title,
          location: currentSession.location,
          cycle_phase: cyclePhase ? `${PHASE_NAMES[cyclePhase.phase]} · Day ${cyclePhase.day} of ${cyclePhase.total}` : null,
          exercises: currentSession.exercises.map((e) => ({
            id: e.id, name: e.name,
            prescribed_sets: e.sets, prescribed_reps: e.reps,
          })),
        },
        history: sessions.filter(s => s.status !== "released" && s.status !== "deferred" && s.status !== "carried").map((s) => ({
          date: s.date, title: s.title, location: s.location,
          partial: s.partial || false,
          exercises: s.exercises
            .filter((e) => e.completed || e.actualWeight || e.actualReps)
            .map((e) => ({
              name: e.name,
              prescribed: `${e.sets} × ${e.reps}`,
              actual_weight: e.actualWeight || null,
              actual_reps: e.actualReps || null,
              notes: e.actualNotes || null,
              completed: e.completed,
            })),
          session_note: s.sessionNote || null,
        })),
        training_debt: {
          deferred_sessions_pending: recentDeferred,
          released_sessions_recent: recentReleased,
        },
      };

      const cycleGuidance = cyclePhase ? `

CYCLE PHASE GUIDANCE:
- Menstrual (Days 1-5): Reduce intensity 10-20% if she logged feeling rough. Suggest KEEP or slight reduction. Don't push for new PRs.
- Follicular (Days 6-13): Best time for progressive overload. Lean toward INCREASE_LOAD or INCREASE_REPS.
- Ovulation (Days 14-16): Peak strength. Aim for PRs on main lifts.
- Luteal (Days 17-25): Maintenance. KEEP or slight INCREASE_REPS. Avoid new max efforts.

Today she is in: ${PHASE_NAMES[cyclePhase.phase]} (Day ${cyclePhase.day}). Adjust suggestions accordingly.` : "";

      const prompt = `You are a strength coach for a returning lifter in her early 30s training to lose 4 kg, lose 3 inches off her hips, and build muscle. She trains 4 days/week (Sat & Sun 60 min, Tue & Thu 30–45 min). She has weights in Delhi and only resistance bands when traveling to Bhubaneswar. She is vegetarian.${cycleGuidance}

Today's planned session, her recent training history, and any training debt:

${JSON.stringify(context, null, 2)}

Important:
- "history" only includes ACTUALLY COMPLETED sessions. Released and deferred sessions are excluded so you don't think she trained when she didn't.
- "training_debt.released_sessions_recent" tells you which sessions she released (didn't train, didn't make up). If a muscle group has been recently released, do NOT progressively overload it — she's had less stimulus than the plan implies.
- "training_debt.deferred_sessions_pending" are sessions she might still make up this week. Don't count them as trained yet.

Analyze her recent progress and suggest progressive overload adjustments to TODAY'S session. For each exercise:
- KEEP: same prescription
- INCREASE_LOAD: keep sets/reps, note in coach_note that she should add weight/heavier band
- INCREASE_REPS: bump rep target up
- INCREASE_SETS: add a set
- SWAP: replace with a better variation (rare)

Rules:
- Only ONE progression lever per exercise per week
- Respect equipment: bands for Bhubaneswar, weights for Delhi
- If history is sparse (< 2 prior sessions), KEEP and note "build baseline first"
- If recent sessions for this muscle group were RELEASED (not made up), KEEP — she's had less volume than the plan
- If recent sessions were marked PARTIAL, lean toward KEEP (recovery may be needed)
- Be conservative — small wins compound

Respond ONLY with valid JSON, no markdown:
{
  "summary": "2-3 sentences. Mention cycle phase if relevant. Mention if released sessions affected your suggestions.",
  "suggestions": [
    {
      "exercise_id": "id",
      "exercise_name": "name",
      "action": "KEEP" | "INCREASE_LOAD" | "INCREASE_REPS" | "INCREASE_SETS" | "SWAP",
      "new_sets": number,
      "new_reps": "string",
      "new_name": "only different if SWAP",
      "coach_note": "1-2 sentences explaining WHY"
    }
  ]
}`;

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-5",
          max_tokens: 2000,
          messages: [{ role: "user", content: prompt }],
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`API error ${response.status}: ${errText.slice(0, 200)}`);
      }
      const data = await response.json();
      const text = data.content.filter((b) => b.type === "text").map((b) => b.text).join("\n").trim();
      const cleaned = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(cleaned);

      setAnalysis({ ...parsed, sessionsAnalyzed: sessions.length });
      setStep("result");
    } catch (e) {
      console.error(e);
      setError(e.message || "Something went wrong");
      setStep("error");
    }
  }

  function applySuggestions() {
    if (!analysis) return;
    const updated = currentSession.exercises.map((ex) => {
      const sug = analysis.suggestions.find((s) => s.exercise_id === ex.id);
      if (!sug || sug.action === "KEEP") return ex;
      return {
        ...ex,
        name: sug.action === "SWAP" ? sug.new_name : ex.name,
        sets: sug.new_sets,
        reps: sug.new_reps,
        note: sug.coach_note,
        aiUpdated: true,
      };
    });
    onApply(updated);
    onClose();
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <h2 style={{ fontFamily: "Fraunces, serif", fontSize: 22, fontWeight: 500, margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
            <Sparkles size={20} color="#B8860B" /> AI Coach
          </h2>
          <button onClick={onClose} className="ft-icon-btn"><X size={20} /></button>
        </div>

        {step === "ready" && (
          <>
            <div style={{ fontSize: 13, color: "#6B5530", marginBottom: 20, lineHeight: 1.6 }}>
              I'll look at your last 4 weeks of logged sessions {cyclePhase && <span>and your <strong>{PHASE_NAMES[cyclePhase.phase]} phase</strong></span>} and suggest progressive overload tweaks for <strong>today's workout</strong>.
              <br /><br />
              <span style={{ color: "#8A7B5E", fontSize: 12 }}>
                {!apiKey && <span style={{ color: "#B8860B" }}>⚠ Add your API key in Settings first.<br /><br /></span>}
                Works best after 2–3 logged sessions.
              </span>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="ft-btn ft-btn-ai" onClick={runAnalysis} style={{ flex: 1, justifyContent: "center" }} disabled={!apiKey}>
                <Sparkles size={14} /> Analyze my progress
              </button>
              {!apiKey && <button className="ft-btn ft-btn-ghost" onClick={onOpenSettings}>Settings</button>}
            </div>
          </>
        )}

        {step === "loading" && (
          <div style={{ padding: "40px 0", textAlign: "center" }}>
            <Loader2 size={32} color="#6B5530" className="spin" style={{ margin: "0 auto" }} />
            <div style={{ fontFamily: "Fraunces, serif", fontStyle: "italic", fontSize: 16, color: "#6B5530", marginTop: 16 }}>
              Reading your training journal…
            </div>
          </div>
        )}

        {step === "error" && (
          <div>
            <div style={{ padding: 16, background: "#F4E4D6", border: "1px solid #D4A878", borderRadius: 10, color: "#6B3520", fontSize: 13, marginBottom: 16 }}>
              {error}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="ft-btn ft-btn-ghost" onClick={() => setStep("ready")}>Try again</button>
              {error?.includes("API key") && <button className="ft-btn" onClick={onOpenSettings}>Settings</button>}
            </div>
          </div>
        )}

        {step === "result" && analysis && (
          <>
            <div style={{ padding: 14, background: "#ECE4CF", borderRadius: 10, marginBottom: 16, fontSize: 13, color: "#2A2419", lineHeight: 1.6 }}>
              <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", color: "#8A7B5E", marginBottom: 6, fontWeight: 600 }}>
                Coach's read · {analysis.sessionsAnalyzed} sessions analyzed
              </div>
              <div style={{ fontFamily: "Fraunces, serif", fontStyle: "italic" }}>
                {analysis.summary}
              </div>
            </div>

            <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "#8A7B5E", marginBottom: 10, fontWeight: 600 }}>
              Suggestions for today
            </div>

            {analysis.suggestions.map((s, i) => (
              <div key={i} style={{ padding: 14, background: "#FCFAF5", border: "1px solid #E8DFCB", borderRadius: 10, marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 6 }}>
                  <div style={{ fontWeight: 500, fontSize: 14 }}>{s.exercise_name}</div>
                  <ActionBadge action={s.action} />
                </div>
                <div style={{ fontSize: 12, color: "#6B5530", marginBottom: 6 }}>
                  → <strong>{s.new_sets} × {s.new_reps}</strong>
                  {s.action === "SWAP" && s.new_name !== s.exercise_name && (
                    <span style={{ color: "#B8860B" }}> · swap to {s.new_name}</span>
                  )}
                </div>
                <div style={{ fontSize: 12, color: "#8A7B5E", lineHeight: 1.5, fontStyle: "italic" }}>
                  {s.coach_note}
                </div>
              </div>
            ))}

            <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
              <button className="ft-btn ft-btn-ai" onClick={applySuggestions} style={{ flex: 1, justifyContent: "center" }}>
                <Check size={14} /> Apply to today
              </button>
              <button className="ft-btn ft-btn-ghost" onClick={onClose}>Close</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ActionBadge({ action }) {
  const config = {
    KEEP: { bg: "#E8DFCB", color: "#6B5530", label: "Keep" },
    INCREASE_LOAD: { bg: "#D4A878", color: "#3D2510", label: "↑ Load" },
    INCREASE_REPS: { bg: "#C8B894", color: "#3D2510", label: "↑ Reps" },
    INCREASE_SETS: { bg: "#B8860B", color: "#FCFAF5", label: "↑ Sets" },
    SWAP: { bg: "#6B5530", color: "#F4F1EA", label: "Swap" },
  };
  const c = config[action] || config.KEEP;
  return (
    <span style={{
      padding: "2px 8px", borderRadius: 4, fontSize: 10,
      textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600,
      background: c.bg, color: c.color, whiteSpace: "nowrap"
    }}>
      {c.label}
    </span>
  );
}
