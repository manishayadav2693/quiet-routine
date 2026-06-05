import React, { useState, useEffect } from "react";
import { Settings, Download, X, Dumbbell, Sprout, Heart } from "lucide-react";
import FitnessModule from "./Fitness.jsx";
import HabitsModule from "./Habits.jsx";
import WellnessModule from "./Wellness.jsx";

function loadApiKey() { return localStorage.getItem("anthropic_api_key") || ""; }
function saveApiKey(key) {
  if (key) localStorage.setItem("anthropic_api_key", key);
  else localStorage.removeItem("anthropic_api_key");
}
function loadActiveModule() { return localStorage.getItem("active_module") || "fitness"; }
function saveActiveModule(m) { localStorage.setItem("active_module", m); }

// Sunday reflection helpers
function getThisWeekKey() {
  const now = new Date();
  // ISO week (Mon-Sun); use Sunday's date as the week key
  const day = now.getDay();
  const diff = day === 0 ? 0 : 7 - day;
  const sunday = new Date(now);
  sunday.setDate(now.getDate() + diff);
  return sunday.toISOString().split("T")[0];
}

function loadReflection(weekKey) {
  const raw = localStorage.getItem(`reflection:${weekKey}`);
  return raw ? JSON.parse(raw) : null;
}

function saveReflection(weekKey, data) {
  localStorage.setItem(`reflection:${weekKey}`, JSON.stringify(data));
}

function reflectionDismissedThisWeek(weekKey) {
  const r = loadReflection(weekKey);
  return r && (r.note || r.skipped);
}

export default function App() {
  const [activeModule, setActiveModule] = useState(loadActiveModule());
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [showIosBanner, setShowIosBanner] = useState(false);
  const [showReflection, setShowReflection] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
      if (!localStorage.getItem("install_dismissed")) setShowInstallBanner(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  useEffect(() => {
    const ua = window.navigator.userAgent;
    const iOS = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
    const standalone = window.navigator.standalone || window.matchMedia('(display-mode: standalone)').matches;
    if (iOS && !standalone && !localStorage.getItem("ios_install_dismissed")) {
      setShowIosBanner(true);
    }
  }, []);

  // Show Sunday reflection if it's Sunday and not yet handled this week
  useEffect(() => {
    const today = new Date();
    const isSunday = today.getDay() === 0;
    if (isSunday && activeModule === "fitness") {
      const weekKey = getThisWeekKey();
      if (!reflectionDismissedThisWeek(weekKey)) {
        setShowReflection(true);
      }
    }
  }, [activeModule]);

  function switchModule(m) {
    setActiveModule(m);
    saveActiveModule(m);
  }

  async function handleInstall() {
    if (installPrompt) {
      installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      if (outcome === "accepted") {
        setShowInstallBanner(false);
        setInstallPrompt(null);
      }
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#F4F1EA" }}>
      <Styles />

      {showInstallBanner && installPrompt && (
        <div className="install-banner">
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "Fraunces, serif", fontSize: 15, fontWeight: 500 }}>Install on your phone</div>
            <div style={{ fontSize: 12, color: "#6B5530", marginTop: 2 }}>One tap. Opens like a real app.</div>
          </div>
          <button className="ft-btn" onClick={handleInstall}><Download size={14} /> Install</button>
          <button className="ft-icon-btn" onClick={() => { setShowInstallBanner(false); localStorage.setItem("install_dismissed", "1"); }}>
            <X size={16} />
          </button>
        </div>
      )}

      {showIosBanner && (
        <div className="install-banner">
          <div style={{ flex: 1, fontSize: 12, color: "#3D3528", lineHeight: 1.4 }}>
            <strong>Add to Home Screen:</strong> tap the share icon below, then "Add to Home Screen".
          </div>
          <button className="ft-icon-btn" onClick={() => { setShowIosBanner(false); localStorage.setItem("ios_install_dismissed", "1"); }}>
            <X size={16} />
          </button>
        </div>
      )}

      <div style={{ borderBottom: "1px solid #E8DFCB", background: "#F4F1EA", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <div>
            <div style={{ fontFamily: "Fraunces, serif", fontSize: 22, fontWeight: 500, letterSpacing: "-0.02em" }}>
              The Quiet Routine
            </div>
            <div style={{ fontSize: 11, color: "#8A7B5E", marginTop: 2, letterSpacing: "0.04em", textTransform: "uppercase" }}>
              {activeModule === "fitness" ? "Strength · Glute · Hip" : activeModule === "habits" ? "Daily practices" : "Skin · Cycle · Patterns"}
            </div>
          </div>
          <button className="ft-btn ft-btn-ghost" onClick={() => setSettingsOpen(true)} style={{ padding: "8px 12px" }}>
            <Settings size={14} />
          </button>
        </div>

        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 20px 12px", display: "flex", gap: 6 }}>
          <button className={`module-tab ${activeModule === "fitness" ? "active" : ""}`} onClick={() => switchModule("fitness")}>
            <Dumbbell size={14} /> Fitness
          </button>
          <button className={`module-tab ${activeModule === "habits" ? "active" : ""}`} onClick={() => switchModule("habits")}>
            <Sprout size={14} /> Habits
          </button>
          <button className={`module-tab ${activeModule === "wellness" ? "active" : ""}`} onClick={() => switchModule("wellness")}>
  <Heart size={14} /> Wellness
</button>
        </div>
      </div>

      {showReflection && activeModule === "fitness" && (
        <SundayReflectionCard onDismiss={() => setShowReflection(false)} />
      )}

      {activeModule === "fitness" && <FitnessModule onOpenSettings={() => setSettingsOpen(true)} />}
      {activeModule === "habits" && <HabitsModule />}
      {activeModule === "wellness" && <WellnessModule />}

      {settingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)} />}
    </div>
  );
}

function SundayReflectionCard({ onDismiss }) {
  const [note, setNote] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const weekKey = getThisWeekKey();

  // Compute weekly summary from local data
  const summary = computeWeeklySummary();
  const deferred = getDeferredSessions();

  function submit() {
    saveReflection(weekKey, { note: note.trim(), savedAt: new Date().toISOString() });
    setSubmitted(true);
    setTimeout(onDismiss, 1500);
  }

  function skip() {
    saveReflection(weekKey, { skipped: true, savedAt: new Date().toISOString() });
    onDismiss();
  }

  function carryForward() {
    // Move all deferred sessions into next week's carry-over queue
    const queue = JSON.parse(localStorage.getItem("carry_queue") || "[]");
    deferred.forEach((d) => {
      queue.push({ ...d, carriedFrom: weekKey });
    });
    localStorage.setItem("carry_queue", JSON.stringify(queue));
    // Mark all deferred as resolved
    deferred.forEach((d) => {
      const stored = JSON.parse(localStorage.getItem(`workout:${d.date}`) || "{}");
      stored.status = "carried";
      localStorage.setItem(`workout:${d.date}`, JSON.stringify(stored));
    });
    skip();
  }

  function releaseAll() {
    deferred.forEach((d) => {
      const stored = JSON.parse(localStorage.getItem(`workout:${d.date}`) || "{}");
      stored.status = "released";
      localStorage.setItem(`workout:${d.date}`, JSON.stringify(stored));
    });
    skip();
  }

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "16px 20px 0" }}>
      <div style={{ background: "#ECE4CF", borderRadius: 12, padding: 20, position: "relative" }}>
        <button onClick={skip} className="ft-icon-btn" style={{ position: "absolute", top: 8, right: 8 }}>
          <X size={14} />
        </button>
        <div style={{ fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "#8A7B5E", marginBottom: 8, fontWeight: 600 }}>
          This week
        </div>
        <div style={{ fontFamily: "Fraunces, serif", fontStyle: "italic", fontSize: 16, color: "#2A2419", lineHeight: 1.5, marginBottom: 12 }}>
          {summary}
        </div>

        {deferred.length > 0 && !submitted && (
          <div style={{ marginBottom: 16, padding: 12, background: "#FCFAF5", border: "1px solid #C8B894", borderRadius: 8 }}>
            <div style={{ fontSize: 12, color: "#6B5530", marginBottom: 8, lineHeight: 1.5 }}>
              {deferred.length === 1 ? "One session" : `${deferred.length} sessions`} deferred and not made up: {" "}
              <strong>{deferred.map(d => d.title).join(", ")}</strong>
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              <button className="ft-btn" style={{ padding: "6px 12px", fontSize: 12 }} onClick={carryForward}>
                Carry to next week
              </button>
              <button className="ft-btn ft-btn-ghost" style={{ padding: "6px 12px", fontSize: 12 }} onClick={releaseAll}>
                Let it go
              </button>
            </div>
          </div>
        )}

        {!submitted ? (
          <>
            <div style={{ fontSize: 12, color: "#6B5530", marginBottom: 8 }}>
              Anything to remember for next week?
            </div>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="One sentence. Or skip."
              style={{
                width: "100%", minHeight: 60, padding: 10,
                background: "#FCFAF5", border: "1px solid #C8B894",
                borderRadius: 8, fontFamily: "inherit", fontSize: 13,
                color: "#2A2419", resize: "vertical", outline: "none"
              }}
            />
            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              <button className="ft-btn" onClick={submit} disabled={!note.trim()} style={{ opacity: note.trim() ? 1 : 0.5 }}>
                Save
              </button>
              <button className="ft-btn ft-btn-ghost" onClick={skip}>Skip this week</button>
            </div>
          </>
        ) : (
          <div style={{ fontFamily: "Fraunces, serif", fontStyle: "italic", color: "#6B5530", fontSize: 14 }}>
            Saved. See you next Sunday.
          </div>
        )}
      </div>
    </div>
  );
}

// Find deferred sessions in the current week that haven't been made up
function getDeferredSessions() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const deferred = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().split("T")[0];
    try {
      const raw = localStorage.getItem(`workout:${key}`);
      if (raw) {
        const data = JSON.parse(raw);
        if (data.status === "deferred") {
          deferred.push({ date: key, title: data.title, location: data.location, exercises: data.exercises });
        }
      }
    } catch {}
  }
  return deferred;
}

function computeWeeklySummary() {
  // Look at last 7 days
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let sessionsTrained = 0;
  let sessionsPlanned = 0;
  let habitDone = 0;
  let habitTotal = 0;

  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().split("T")[0];

    // Workout sessions
    try {
      const w = localStorage.getItem(`workout:${key}`);
      if (w) {
        const data = JSON.parse(w);
        if (!data.isRest) {
          sessionsPlanned++;
          const done = data.exercises?.filter((e) => e.completed).length || 0;
          if (done > 0 || data.partial) sessionsTrained++;
        }
      }
    } catch {}

    // Habits
    try {
      const h = localStorage.getItem(`habits:${key}`);
      if (h) {
        const data = JSON.parse(h);
        const habitListRaw = localStorage.getItem("habits_list_v2");
        const habits = habitListRaw ? JSON.parse(habitListRaw) : [];
        habits.forEach((hb) => {
          habitTotal++;
          if (data[hb.id] === true) habitDone++;
        });
      }
    } catch {}
  }

  const habitRate = habitTotal > 0 ? Math.round((habitDone / habitTotal) * 100) : 0;
  const parts = [];
  if (sessionsPlanned > 0) parts.push(`Trained ${sessionsTrained} of ${sessionsPlanned} sessions`);
  if (habitTotal > 0) parts.push(`Habit consistency ${habitRate}%`);
  if (parts.length === 0) return "A quiet week. Whatever happened, here you are.";
  return parts.join(". ") + ".";
}

function SettingsModal({ onClose }) {
  const [apiKey, setApiKey] = useState(loadApiKey());
  const [showKey, setShowKey] = useState(false);

  function save() {
    saveApiKey(apiKey.trim());
    onClose();
  }

  function exportData() {
    const data = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      data[key] = localStorage.getItem(key);
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `quiet-routine-backup-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function importData(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (!confirm(`Restore ${Object.keys(data).length} entries? This will overwrite current data.`)) return;
        Object.entries(data).forEach(([k, v]) => localStorage.setItem(k, v));
        alert("Restored. Reloading…");
        location.reload();
      } catch (err) {
        alert("Invalid backup file: " + err.message);
      }
    };
    reader.readAsText(file);
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 style={{ fontFamily: "Fraunces, serif", fontSize: 22, fontWeight: 500, margin: 0 }}>Settings</h2>
          <button onClick={onClose} className="ft-icon-btn"><X size={20} /></button>
        </div>

        <div style={{ marginBottom: 24 }}>
          <span className="ft-field-label">Anthropic API Key</span>
          <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
            <input
              className="ft-input"
              type={showKey ? "text" : "password"}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-ant-..."
              style={{ flex: 1 }}
            />
            <button className="ft-btn ft-btn-ghost" onClick={() => setShowKey(!showKey)} style={{ padding: "6px 12px" }}>
              {showKey ? "Hide" : "Show"}
            </button>
          </div>
          <div style={{ fontSize: 11, color: "#8A7B5E", marginTop: 8, lineHeight: 1.5 }}>
            Required for the AI Coach. Get one at console.anthropic.com. Stored only on this device — never sent anywhere except Anthropic's API.
          </div>
        </div>

        <div style={{ marginBottom: 24, padding: 16, background: "#ECE4CF", borderRadius: 10 }}>
          <div style={{ fontFamily: "Fraunces, serif", fontStyle: "italic", fontSize: 14, marginBottom: 6 }}>Backup your data</div>
          <div style={{ fontSize: 12, color: "#6B5530", marginBottom: 10, lineHeight: 1.5 }}>
            Your training history and habit streaks live only on this phone. Export weekly so you don't lose them.
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button className="ft-btn ft-btn-ghost" onClick={exportData}>
              <Download size={14} /> Export JSON
            </button>
            <label className="ft-btn ft-btn-ghost" style={{ cursor: "pointer" }}>
              Restore
              <input type="file" accept="application/json" onChange={importData} style={{ display: "none" }} />
            </label>
          </div>
        </div>

        <button className="ft-btn" onClick={save} style={{ width: "100%", justifyContent: "center" }}>Save</button>
      </div>
    </div>
  );
}

function Styles() {
  return (
    <style>{`
      .ft-checkbox {
        width: 24px; height: 24px;
        border: 1.5px solid #B8AC92;
        border-radius: 6px;
        display: flex; align-items: center; justify-content: center;
        cursor: pointer;
        transition: all 0.15s ease;
        flex-shrink: 0;
        background: #FCFAF5;
      }
      .ft-checkbox:active { transform: scale(0.92); }
      .ft-checkbox.checked { background: #6B5530; border-color: #6B5530; }

      .ft-exercise {
        padding: 14px 16px;
        background: #FCFAF5;
        border: 1px solid #E8DFCB;
        border-radius: 10px;
        margin-bottom: 8px;
        transition: all 0.15s ease;
      }
      .ft-exercise.done { background: #F0EAD8; opacity: 0.75; }
      .ft-exercise.done .ft-name { text-decoration: line-through; color: #8A7B5E; }
      .ft-exercise.partial { background: #F4EDD9; border-color: #D4B878; }
      .ft-exercise.ai-updated {
        border-color: #B8860B;
        box-shadow: 0 0 0 2px rgba(184,134,11,0.1);
      }

      .ft-input {
        background: transparent;
        border: none;
        border-bottom: 1px dashed #C8B894;
        padding: 6px 6px;
        font-size: 14px;
        font-family: inherit;
        color: #2A2419;
        width: 100%;
        outline: none;
      }
      .ft-input:focus { border-bottom-color: #6B5530; }
      .ft-input::placeholder { color: #B8AC92; font-style: italic; }

      .ft-field-label {
        font-size: 10px;
        color: #8A7B5E;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        font-weight: 500;
        margin-bottom: 4px;
        display: block;
      }

      .ft-day-pill {
        display: flex; flex-direction: column; align-items: center;
        padding: 8px 2px; border-radius: 10px; cursor: pointer;
        transition: all 0.15s ease; border: 1.5px solid transparent;
        min-width: 0;
      }
      .ft-day-pill:active { transform: scale(0.97); }
      .ft-day-pill.active { background: #2A2419; color: #F4F1EA; }
      .ft-day-pill.today { border-color: #B8860B; }

      .ft-btn {
        background: #2A2419; color: #F4F1EA;
        border: none; padding: 9px 14px;
        border-radius: 8px; cursor: pointer;
        font-family: inherit; font-size: 13px; font-weight: 500;
        display: inline-flex; align-items: center; gap: 6px;
        transition: all 0.15s ease;
      }
      .ft-btn:active { transform: scale(0.96); }
      .ft-btn:disabled { opacity: 0.5; cursor: not-allowed; }
      .ft-btn-ghost {
        background: transparent; color: #6B5530;
        border: 1px solid #C8B894;
      }
      .ft-btn-ai {
        background: linear-gradient(135deg, #6B5530, #B8860B);
        color: #F4F1EA;
      }
      .ft-btn-cycle {
        background: transparent;
        color: #B8385C;
        border: 1px solid #E8B5C4;
      }

      .ft-icon-btn {
        background: transparent;
        border: none;
        padding: 6px;
        cursor: pointer;
        color: #B8AC92;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.15s ease;
      }
      .ft-icon-btn:active { color: #6B5530; }
      .ft-icon-btn:disabled { opacity: 0.3; }

      .progress-bar {
        height: 4px; background: #E8DFCB; border-radius: 2px; overflow: hidden;
      }
      .progress-fill {
        height: 100%; background: #6B5530; transition: width 0.3s ease;
      }

      .modal-backdrop {
        position: fixed; inset: 0; background: rgba(42,36,25,0.5);
        display: flex; align-items: center; justify-content: center;
        z-index: 50; padding: 16px;
      }
      .modal {
        background: #FCFAF5; border-radius: 14px;
        padding: 24px; max-width: 540px; width: 100%;
        max-height: 85vh; overflow-y: auto;
        border: 1px solid #E8DFCB;
      }

      .install-banner {
        background: #ECE4CF;
        padding: 12px 16px;
        display: flex;
        align-items: center;
        gap: 12px;
        border-bottom: 1px solid #C8B894;
      }

      .module-tab {
        flex: 1;
        padding: 10px 14px;
        background: transparent;
        border: 1px solid #E8DFCB;
        border-radius: 8px;
        cursor: pointer;
        font-family: inherit;
        font-size: 13px;
        font-weight: 500;
        color: #8A7B5E;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        transition: all 0.15s ease;
      }
      .module-tab.active {
        background: #2A2419;
        color: #F4F1EA;
        border-color: #2A2419;
      }
      .module-tab:active { transform: scale(0.98); }

      .spin { animation: spin 1s linear infinite; }
      @keyframes spin { from { transform: rotate(0); } to { transform: rotate(360deg); } }

      .greeting-line {
        font-family: 'Fraunces', serif;
        font-style: italic;
        font-size: 15px;
        color: #6B5530;
        line-height: 1.4;
        margin-bottom: 12px;
      }

      .cycle-pill {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        color: #B8385C;
        font-weight: 500;
        font-size: 12px;
      }

      @media (max-width: 720px) {
        .ft-grid { grid-template-columns: 1fr !important; }
        .ft-week { gap: 4px !important; }
        h1 { font-size: 26px !important; }
      }
    `}</style>
  );
}
