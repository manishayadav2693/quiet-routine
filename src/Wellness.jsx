import React, { useState, useEffect, useMemo } from "react";
import { ChevronDown, ChevronRight, Calendar, TrendingUp, Sparkles, Save, Check } from "lucide-react";

// ============================================================
// SCHEMA — all sections and fields
// ============================================================
const SECTIONS = [
  {
    id: "sleep",
    title: "Sleep",
    fields: [
      { id: "bedtime", label: "Bedtime", type: "select", options: ["Before 9:30 PM", "9:30 PM", "10:00 PM", "10:30 PM", "11:00 PM", "11:30 PM", "12:00 AM", "12:30 AM", "1:00 AM", "After 1:00 AM"] },
      { id: "wakeTime", label: "Wake time", type: "select", options: ["Before 5:30 AM", "5:30 AM", "6:00 AM", "6:30 AM", "7:00 AM", "7:30 AM", "8:00 AM", "8:30 AM", "9:00 AM", "After 9:00 AM"] },
      { id: "sleepQuality", label: "Sleep quality", type: "select", options: ["Deep & restful", "Mostly good", "Okay", "Restless", "Very broken"] },
      { id: "wakeUps", label: "Wake-ups", type: "select", options: ["None", "Once", "Twice", "3+ times"] },
      { id: "morningEnergy", label: "Morning energy", type: "scale", labels: ["Exhausted", "Low", "Okay", "Good", "Fresh"] }
    ]
  },
  {
    id: "food",
    title: "Food & Eating",
    fields: [
      { id: "breakfastTime", label: "Breakfast time", type: "select", options: ["Skipped", "Before 7 AM", "7–8 AM", "8–9 AM", "9–10 AM", "10–11 AM", "After 11 AM"] },
      { id: "lunchTime", label: "Lunch time", type: "select", options: ["Skipped", "Before 12 PM", "12–1 PM", "1–2 PM", "2–3 PM", "After 3 PM"] },
      { id: "dinnerTime", label: "Dinner time", type: "select", options: ["Skipped", "Before 6 PM", "6–6:30 PM", "6:30–7 PM", "7–7:30 PM", "7:30–8 PM", "After 8 PM"] },
      { id: "dairy", label: "Dairy today", type: "multi", options: ["None", "Milk", "Paneer", "Ghee", "Curd", "Cheese", "Buttermilk"] },
      { id: "sugar", label: "Sugar / refined carbs", type: "select", options: ["None", "Minimal", "Moderate", "High", "Very high"] },
      { id: "coffee", label: "Coffee / Chai", type: "select", options: ["None", "1 cup morning", "1 cup afternoon", "2 cups", "3+ cups", "Cold coffee"] },
      { id: "coldFoods", label: "Cold foods/drinks", type: "select", options: ["None", "Room temp only", "1 cold item", "Multiple cold items"] },
      { id: "gheeMorning", label: "½ tsp ghee in morning", type: "toggle" },
      { id: "mealNotes", label: "Notes", type: "text", placeholder: "Anything unusual..." }
    ]
  },
  {
    id: "hydration",
    title: "Hydration",
    fields: [
      { id: "water", label: "Water intake", type: "select", options: ["< 1L", "1–1.5L", "1.5–2L", "2–2.5L", "2.5–3L", "3L+"] },
      { id: "fluids", label: "Other fluids", type: "multi", options: ["Coconut water", "Chaas", "Herbal tea", "Spearmint tea", "Coriander water", "Lemon water", "None"] }
    ]
  },
  {
    id: "gut",
    title: "Gut & Digestion",
    fields: [
      { id: "bm", label: "Bowel movement", type: "select", options: ["None today", "Type 1 — hard lumps", "Type 2 — lumpy", "Type 3 — cracked (good)", "Type 4 — smooth (ideal)", "Type 5 — soft blobs", "Type 6 — mushy", "Type 7 — watery"] },
      { id: "bmTime", label: "BM time", type: "select", options: ["Morning", "Afternoon", "Evening", "Multiple times", "N/A"] },
      { id: "bmCount", label: "Frequency", type: "select", options: ["0", "1", "2", "3+"] },
      { id: "bloating", label: "Bloating", type: "scale", labels: ["None", "Mild", "Moderate", "High", "Severe"] },
      { id: "gas", label: "Gas / discomfort", type: "toggle" }
    ]
  },
  {
    id: "cycle",
    title: "Cycle",
    fields: [
      { id: "cycleDay", label: "Cycle day", type: "select", options: Array.from({ length: 35 }, (_, i) => `Day ${i + 1}`) },
      { id: "phase", label: "Phase", type: "select", options: ["Menstrual", "Follicular", "Ovulatory", "Early luteal", "Late luteal (PMS)"] },
      { id: "pms", label: "PMS symptoms", type: "multi", options: ["Breast tenderness", "Bloating", "Cravings", "Mood swings", "Cramps", "Headache", "Fatigue", "None"] }
    ]
  },
  {
    id: "mind",
    title: "Body & Mind",
    fields: [
      { id: "stress", label: "Stress level", type: "scale", labels: ["None", "Mild", "Moderate", "High", "Overwhelming"] },
      { id: "mood", label: "Mood", type: "scale", labels: ["Low", "Off", "Neutral", "Good", "Great"] },
      { id: "afternoonEnergy", label: "Afternoon energy", type: "scale", labels: ["Exhausted", "Low", "Okay", "Good", "Fresh"] },
      { id: "eveningEnergy", label: "Evening energy", type: "scale", labels: ["Exhausted", "Low", "Okay", "Good", "Fresh"] },
      { id: "meditation", label: "Meditation done", type: "toggle" },
      { id: "events", label: "Significant events", type: "multi", options: ["Work deadline", "Conflict", "Social event", "Difficult news", "Travel logistics", "Late night work", "None"] }
    ]
  },
  {
    id: "movement",
    title: "Movement",
    fields: [
      { id: "workoutType", label: "Workout", type: "select", options: ["Rest", "Strength (dumbbells)", "Resistance bands", "Walk only", "Yoga", "Other cardio"] },
      { id: "intensity", label: "Intensity", type: "scale", labels: ["None", "Light", "Moderate", "High", "Very intense"] },
      { id: "workoutTime", label: "When", type: "select", options: ["N/A", "Morning", "Afternoon", "Evening"] },
      { id: "steps", label: "Steps", type: "select", options: ["< 3k", "3–5k", "5–7k", "7–10k", "10k+"] }
    ]
  },
  {
    id: "env",
    title: "Environment & Travel",
    fields: [
      { id: "location", label: "Location", type: "select", options: ["Delhi (home)", "Bhubaneswar", "Other travel", "Flight day"] },
      { id: "travel", label: "Travel day", type: "toggle" },
      { id: "ac", label: "AC exposure", type: "select", options: ["None", "< 2 hrs", "2–5 hrs", "5–10 hrs", "All day"] },
      { id: "outdoor", label: "Outdoor / UV", type: "select", options: ["None", "< 30 mins", "30 mins – 1 hr", "1–2 hrs", "2+ hrs"] },
      { id: "weather", label: "Weather", type: "select", options: ["Hot & dry", "Hot & humid", "Mild", "Cold & dry", "Cold & humid", "Rainy"] }
    ]
  },
  {
    id: "skincare",
    title: "Skincare",
    fields: [
      { id: "am", label: "Morning routine", type: "multi", options: ["Cleanser", "Hyphen serum", "TO Niacinamide", "Hustle serum", "Moisturiser", "SPF (Photon)", "Eye cream", "Skipped"] },
      { id: "pm", label: "Night routine", type: "multi", options: ["Double cleanse", "Cleanser only", "Hyphen serum", "TO Niacinamide", "Retinol", "Salicylic acid", "Azelaic/Tranexamic", "Spot treatment", "Moisturiser", "Eye cream", "Hydrocolloid patch", "Skipped"] },
      { id: "treatments", label: "Treatments", type: "multi", options: ["Multani mitti mask", "Clay mask", "Sheet mask", "Face scrub", "Gua sha", "Steam", "None"] },
      { id: "newProduct", label: "New product today", type: "toggle" },
      { id: "newProductName", label: "Which product", type: "text", showIf: "newProduct" }
    ]
  },
  {
    id: "supplements",
    title: "Supplements & Herbs",
    fields: [
      { id: "taken", label: "Taken today", type: "multi", options: ["Inositol", "Manjistha", "Spearmint tea", "Triphala", "Shatavari", "Neem capsule", "Zinc", "Omega-3", "Vitamin D", "B12", "Probiotic", "Magnesium", "Other", "None"] },
      { id: "spearmint", label: "Spearmint cups", type: "select", options: ["0", "1", "2", "3+"] }
    ]
  },
  {
    id: "skin",
    title: "Skin Status",
    fields: [
      { id: "overall", label: "Overall skin", type: "scale", labels: ["Very inflamed", "Multiple actives", "Some texture", "Mostly clear", "Clear & calm"] },
      { id: "newBumps", label: "New bumps today", type: "toggle" },
      { id: "activeCount", label: "Active pimples", type: "select", options: ["0", "1–2", "3–5", "6–10", "10+"] },
      { id: "zones", label: "Affected zones", type: "multi", options: ["Forehead", "T-zone", "Cheeks (left)", "Cheeks (right)", "Jawline", "Chin", "Around mouth", "Nose", "None"] },
      { id: "skinFeel", label: "Skin feel", type: "select", options: ["Comfortable", "Tight/dry", "Oily", "Combination", "Reactive/stinging", "Itchy"] },
      { id: "redness", label: "Redness", type: "scale", labels: ["None", "Mild", "Moderate", "High", "Very high"] },
      { id: "hydration", label: "Hydration feel", type: "scale", labels: ["Very dry", "Dry", "Normal", "Hydrated", "Plump"] },
      { id: "pih", label: "PIH visible", type: "toggle" },
      { id: "notes", label: "Notes", type: "text", placeholder: "Anything to remember..." }
    ]
  }
];

// ============================================================
// STORAGE HELPERS — matches existing app pattern (localStorage)
// ============================================================
function todayKey() {
  return new Date().toISOString().split("T")[0];
}

function loadEntry(dateKey) {
  try {
    const raw = localStorage.getItem(`wellness:${dateKey}`);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveEntry(dateKey, data) {
  localStorage.setItem(`wellness:${dateKey}`, JSON.stringify(data));
}

function loadRecentEntries(days = 30) {
  const entries = [];
  const today = new Date();
  for (let i = 0; i < days; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().split("T")[0];
    const data = loadEntry(key);
    if (Object.keys(data).length > 0) {
      entries.push({ date: key, data });
    }
  }
  return entries.reverse();
}

function loadApiKey() {
  return localStorage.getItem("anthropic_api_key") || "";
}

// ============================================================
// MAIN MODULE
// ============================================================
export default function WellnessModule() {
  const [view, setView] = useState("log"); // 'log' | 'patterns' | 'insights'

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "16px 20px 40px" }}>
      <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
        <button className={`module-tab ${view === "log" ? "active" : ""}`} onClick={() => setView("log")}>
          Daily Log
        </button>
        <button className={`module-tab ${view === "patterns" ? "active" : ""}`} onClick={() => setView("patterns")}>
          <Calendar size={14} /> Patterns
        </button>
        <button className={`module-tab ${view === "insights" ? "active" : ""}`} onClick={() => setView("insights")}>
          <Sparkles size={14} /> Insights
        </button>
      </div>

      {view === "log" && <DailyLogView />}
      {view === "patterns" && <PatternsView />}
      {view === "insights" && <InsightsView />}
    </div>
  );
}

// ============================================================
// DAILY LOG VIEW
// ============================================================
function DailyLogView() {
  const [dateKey, setDateKey] = useState(todayKey());
  const [entry, setEntry] = useState(() => loadEntry(todayKey()));
  const [expanded, setExpanded] = useState({ sleep: true }); // sleep open by default
  const [savedFlash, setSavedFlash] = useState(false);

  useEffect(() => {
    setEntry(loadEntry(dateKey));
  }, [dateKey]);

  function update(sectionId, fieldId, value) {
    const updated = { ...entry, [sectionId]: { ...(entry[sectionId] || {}), [fieldId]: value } };
    setEntry(updated);
    saveEntry(dateKey, updated);
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1200);
  }

  function toggleSection(id) {
    setExpanded(e => ({ ...e, [id]: !e[id] }));
  }

  const completion = useMemo(() => {
    const totalFields = SECTIONS.reduce((sum, s) => sum + s.fields.length, 0);
    let filled = 0;
    SECTIONS.forEach(s => {
      const sd = entry[s.id] || {};
      s.fields.forEach(f => {
        const v = sd[f.id];
        if (v !== undefined && v !== null && v !== "" && !(Array.isArray(v) && v.length === 0)) {
          filled++;
        }
      });
    });
    return Math.round((filled / totalFields) * 100);
  }, [entry]);

  const isToday = dateKey === todayKey();

  return (
    <div>
      <div className="greeting-line">
        {isToday ? "How was your day, Manisha?" : `Logging for ${formatDate(dateKey)}`}
      </div>

      <div style={{ background: "#FCFAF5", border: "1px solid #E8DFCB", borderRadius: 10, padding: 14, marginBottom: 16, display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: "#8A7B5E", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6, fontWeight: 600 }}>
            Today's log — {completion}% complete
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${completion}%` }} />
          </div>
        </div>
        {savedFlash && (
          <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#6B5530" }}>
            <Check size={12} /> Saved
          </div>
        )}
      </div>

      {SECTIONS.map(section => (
        <Section
          key={section.id}
          section={section}
          data={entry[section.id] || {}}
          expanded={expanded[section.id]}
          onToggle={() => toggleSection(section.id)}
          onUpdate={(fieldId, value) => update(section.id, fieldId, value)}
        />
      ))}
    </div>
  );
}

function Section({ section, data, expanded, onToggle, onUpdate }) {
  const filledCount = section.fields.filter(f => {
    const v = data[f.id];
    return v !== undefined && v !== null && v !== "" && !(Array.isArray(v) && v.length === 0);
  }).length;

  return (
    <div style={{ background: "#FCFAF5", border: "1px solid #E8DFCB", borderRadius: 10, marginBottom: 8, overflow: "hidden" }}>
      <button
        onClick={onToggle}
        style={{
          width: "100%", padding: "14px 16px", background: "transparent",
          border: "none", display: "flex", alignItems: "center", gap: 10,
          cursor: "pointer", fontFamily: "inherit", textAlign: "left"
        }}
      >
        {expanded ? <ChevronDown size={16} color="#8A7B5E" /> : <ChevronRight size={16} color="#8A7B5E" />}
        <span style={{ fontFamily: "Fraunces, serif", fontSize: 16, color: "#2A2419", flex: 1 }}>
          {section.title}
        </span>
        <span style={{ fontSize: 11, color: "#8A7B5E" }}>
          {filledCount}/{section.fields.length}
        </span>
      </button>

      {expanded && (
        <div style={{ padding: "0 16px 16px 16px", borderTop: "1px solid #F0EAD8" }}>
          {section.fields.map(field => {
            // Conditional field visibility
            if (field.showIf && !data[field.showIf]) return null;
            return (
              <Field
                key={field.id}
                field={field}
                value={data[field.id]}
                onChange={(v) => onUpdate(field.id, v)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

// ============================================================
// FIELD RENDERERS
// ============================================================
function Field({ field, value, onChange }) {
  return (
    <div style={{ marginTop: 14 }}>
      <label className="ft-field-label">{field.label}</label>
      {field.type === "select" && <SelectField field={field} value={value} onChange={onChange} />}
      {field.type === "multi" && <MultiField field={field} value={value || []} onChange={onChange} />}
      {field.type === "scale" && <ScaleField field={field} value={value} onChange={onChange} />}
      {field.type === "toggle" && <ToggleField value={value} onChange={onChange} />}
      {field.type === "text" && <TextField field={field} value={value || ""} onChange={onChange} />}
    </div>
  );
}

function SelectField({ field, value, onChange }) {
  return (
    <select
      value={value || ""}
      onChange={e => onChange(e.target.value)}
      style={{
        width: "100%", padding: "10px 12px", background: "#FCFAF5",
        border: "1px solid #C8B894", borderRadius: 8, fontFamily: "inherit",
        fontSize: 13, color: value ? "#2A2419" : "#B8AC92", outline: "none"
      }}
    >
      <option value="">Select...</option>
      {field.options.map(opt => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  );
}

function MultiField({ field, value, onChange }) {
  function toggle(opt) {
    if (value.includes(opt)) {
      onChange(value.filter(v => v !== opt));
    } else {
      onChange([...value, opt]);
    }
  }
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
      {field.options.map(opt => {
        const selected = value.includes(opt);
        return (
          <button
            key={opt}
            onClick={() => toggle(opt)}
            style={{
              padding: "6px 12px", borderRadius: 16, cursor: "pointer",
              fontFamily: "inherit", fontSize: 12, transition: "all 0.15s ease",
              background: selected ? "#2A2419" : "#FCFAF5",
              color: selected ? "#F4F1EA" : "#6B5530",
              border: selected ? "1px solid #2A2419" : "1px solid #C8B894"
            }}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

function ScaleField({ field, value, onChange }) {
  return (
    <div style={{ display: "flex", gap: 4 }}>
      {[1, 2, 3, 4, 5].map(n => {
        const selected = value === n;
        return (
          <button
            key={n}
            onClick={() => onChange(n)}
            style={{
              flex: 1, padding: "10px 4px", borderRadius: 8, cursor: "pointer",
              fontFamily: "inherit", fontSize: 11, transition: "all 0.15s ease",
              background: selected ? "#2A2419" : "#FCFAF5",
              color: selected ? "#F4F1EA" : "#8A7B5E",
              border: selected ? "1px solid #2A2419" : "1px solid #C8B894",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 2
            }}
          >
            <span style={{ fontWeight: 600, fontSize: 13 }}>{n}</span>
            <span style={{ fontSize: 9, opacity: 0.8 }}>{field.labels[n - 1]}</span>
          </button>
        );
      })}
    </div>
  );
}

function ToggleField({ value, onChange }) {
  return (
    <button
      onClick={() => onChange(!value)}
      style={{
        padding: "8px 16px", borderRadius: 20, cursor: "pointer",
        fontFamily: "inherit", fontSize: 12, transition: "all 0.15s ease",
        background: value ? "#2A2419" : "#FCFAF5",
        color: value ? "#F4F1EA" : "#6B5530",
        border: value ? "1px solid #2A2419" : "1px solid #C8B894"
      }}
    >
      {value ? "Yes" : "No"}
    </button>
  );
}

function TextField({ field, value, onChange }) {
  return (
    <input
      type="text"
      className="ft-input"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={field.placeholder || ""}
    />
  );
}

// ============================================================
// PATTERNS VIEW — calendar heatmap + stats
// ============================================================
function PatternsView() {
  const [entries] = useState(() => loadRecentEntries(30));

  if (entries.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: 40, color: "#8A7B5E" }}>
        <div className="greeting-line">No data yet. Start logging to see your patterns.</div>
      </div>
    );
  }

  return (
    <div>
      <div className="greeting-line">Your last {entries.length} days, mapped.</div>
      <SkinCalendar entries={entries} />
      <TriggerTimeline entries={entries} />
      <SummaryStats entries={entries} />
    </div>
  );
}

function SkinCalendar({ entries }) {
  const colors = ["#E8DFCB", "#D8956F", "#D4A85C", "#C5B97A", "#A8B884", "#7A9968"];
  // index 0 = no data, 1 = inflamed → 5 = clear

  return (
    <div style={{ background: "#FCFAF5", border: "1px solid #E8DFCB", borderRadius: 10, padding: 16, marginBottom: 12 }}>
      <div style={{ fontSize: 11, color: "#8A7B5E", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12, fontWeight: 600 }}>
        Skin status
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
        {entries.map(e => {
          const rating = e.data?.skin?.overall || 0;
          const travel = e.data?.env?.travel;
          const newProd = e.data?.skincare?.newProduct;
          return (
            <div
              key={e.date}
              title={`${e.date}: ${rating ? "rating " + rating : "no data"}`}
              style={{
                aspectRatio: "1", background: colors[rating],
                borderRadius: 6, position: "relative",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, color: rating >= 3 ? "#2A2419" : "#F4F1EA",
                fontWeight: 500
              }}
            >
              {new Date(e.date).getDate()}
              {travel && <span style={{ position: "absolute", top: 2, right: 3, fontSize: 8 }}>✈</span>}
              {newProd && <span style={{ position: "absolute", bottom: 2, right: 3, fontSize: 10 }}>•</span>}
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 12, fontSize: 10, color: "#8A7B5E", flexWrap: "wrap", alignItems: "center" }}>
        <span style={{ width: 10, height: 10, background: colors[1], borderRadius: 2 }}></span> Inflamed
        <span style={{ width: 10, height: 10, background: colors[3], borderRadius: 2, marginLeft: 4 }}></span> Texture
        <span style={{ width: 10, height: 10, background: colors[5], borderRadius: 2, marginLeft: 4 }}></span> Clear
      </div>
    </div>
  );
}

function TriggerTimeline({ entries }) {
  return (
    <div style={{ background: "#FCFAF5", border: "1px solid #E8DFCB", borderRadius: 10, padding: 16, marginBottom: 12 }}>
      <div style={{ fontSize: 11, color: "#8A7B5E", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4, fontWeight: 600 }}>
        Trigger stack
      </div>
      <div style={{ fontSize: 11, color: "#8A7B5E", marginBottom: 12, fontStyle: "italic" }}>
        Days with multiple stacked = higher flare risk
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
        {entries.map(e => {
          const d = e.data;
          const triggers = [];
          if (d.food?.dairy?.length > 0 && !d.food.dairy.includes("None")) triggers.push("🥛");
          if (["High", "Very high"].includes(d.food?.sugar)) triggers.push("🍬");
          if (["Restless", "Very broken"].includes(d.sleep?.sleepQuality)) triggers.push("😴");
          if (d.env?.travel) triggers.push("✈");
          if (d.mind?.stress >= 4) triggers.push("⚡");
          if (d.skincare?.pm?.includes("Retinol")) triggers.push("💊");
          if (d.skincare?.newProduct) triggers.push("🆕");
          if (d.cycle?.phase === "Late luteal (PMS)") triggers.push("🌸");

          return (
            <div key={e.date} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
              <div style={{ minHeight: 56, display: "flex", flexDirection: "column", gap: 2, fontSize: 12, alignItems: "center" }}>
                {triggers.slice(0, 4).map((t, i) => <span key={i}>{t}</span>)}
              </div>
              <span style={{ fontSize: 9, color: "#8A7B5E" }}>{new Date(e.date).getDate()}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SummaryStats({ entries }) {
  const stats = useMemo(() => {
    let clearDays = 0, dairyFreeDays = 0, travelDays = 0, goodGutDays = 0, spearmintDays = 0;
    entries.forEach(e => {
      const d = e.data;
      if ((d.skin?.overall || 0) >= 4) clearDays++;
      const dairy = d.food?.dairy;
      if (!dairy || dairy.length === 0 || (dairy.length === 1 && dairy.includes("None"))) dairyFreeDays++;
      if (d.env?.travel) travelDays++;
      const bm = d.gut?.bm;
      if (bm?.includes("Type 3") || bm?.includes("Type 4")) goodGutDays++;
      if (d.supplements?.spearmint && d.supplements.spearmint !== "0") spearmintDays++;
    });
    return { clearDays, dairyFreeDays, travelDays, goodGutDays, spearmintDays, total: entries.length };
  }, [entries]);

  const items = [
    { label: "Clear days", value: `${stats.clearDays}/${stats.total}` },
    { label: "Dairy-free", value: `${stats.dairyFreeDays}/${stats.total}` },
    { label: "Travel days", value: stats.travelDays },
    { label: "Good gut", value: `${stats.goodGutDays}/${stats.total}` },
    { label: "Spearmint days", value: stats.spearmintDays },
  ];

  return (
    <div style={{ background: "#FCFAF5", border: "1px solid #E8DFCB", borderRadius: 10, padding: 16 }}>
      <div style={{ fontSize: 11, color: "#8A7B5E", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12, fontWeight: 600 }}>
        This period
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))", gap: 10 }}>
        {items.map(item => (
          <div key={item.label} style={{ background: "#ECE4CF", padding: 12, borderRadius: 8, textAlign: "center" }}>
            <div style={{ fontFamily: "Fraunces, serif", fontSize: 20, color: "#2A2419", fontWeight: 500 }}>
              {item.value}
            </div>
            <div style={{ fontSize: 10, color: "#8A7B5E", marginTop: 2, textTransform: "uppercase", letterSpacing: "0.04em" }}>
              {item.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// INSIGHTS VIEW — AI Coach pattern analysis
// ============================================================
function InsightsView() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analysis, setAnalysis] = useState(() => {
    try {
      const cached = localStorage.getItem(`wellness:analysis:latest`);
      return cached ? JSON.parse(cached) : null;
    } catch { return null; }
  });

  const apiKey = loadApiKey();
  const entries = loadRecentEntries(30);

  async function runAnalysis() {
    if (!apiKey) {
      setError("Add your Anthropic API key in settings to enable insights.");
      return;
    }
    if (entries.length < 7) {
      setError(`Need at least 7 days of data. You have ${entries.length}.`);
      return;
    }

    setLoading(true);
    setError(null);

    const systemPrompt = `You are Manisha's wellness pattern analyst.

CONTEXT: Woman in early 30s, Delhi-based, travels to Bhubaneswar weekly. Pure vegetarian, doesn't eat after sunset. Combination + acne-prone skin, cyclical hormonal acne with PMS pattern, PIH from past breakouts. Works with Ayurvedic principles alongside modern science. Has gut sensitivity. Cycle ~24–25 days, jawline/chin breakouts in late luteal.

JOB: Analyse the daily log data and surface 3 patterns. Focus on:
1. CAUSAL — what triggers preceded skin flares 2–7 days later
2. PROTECTIVE — what correlates with clear skin
3. PREDICTIVE — what's coming based on current state

Return strict JSON only, no markdown:
{
  "summary": "1-2 sentence picture of her month",
  "trend": "improving|stable|worsening|fluctuating",
  "insights": [
    { "title": "max 8 words", "type": "trigger|protective|prediction", "confidence": "high|medium|low", "finding": "2-3 sentences", "evidence": "specific dates/data", "action": "one concrete thing" }
  ],
  "weeklyHighlights": { "bestSkinDays": [], "worstSkinDays": [], "patternsToWatch": "1 sentence" },
  "cycleInsight": "if cycle data exists, late luteal pattern"
}

Exactly 3 insights. Be specific not generic. Use her vocabulary (Vata, luteal, PIH, barrier).`;

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true"
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 2000,
          system: systemPrompt,
          messages: [{
            role: "user",
            content: `Today: ${todayKey()}\n\nDATA (${entries.length} days):\n${JSON.stringify(entries, null, 2)}`
          }]
        })
      });

      const data = await response.json();
      const textBlock = data.content?.find(b => b.type === "text");
      if (!textBlock) throw new Error("No response from API");

      const cleanJson = textBlock.text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(cleanJson);
      const withMeta = { ...parsed, generatedAt: new Date().toISOString(), daysAnalysed: entries.length };

      setAnalysis(withMeta);
      localStorage.setItem(`wellness:analysis:latest`, JSON.stringify(withMeta));
    } catch (e) {
      setError(`Analysis failed: ${e.message}`);
    }
    setLoading(false);
  }

  return (
    <div>
      <div className="greeting-line">What the data is telling us.</div>

      <div style={{ background: "#FCFAF5", border: "1px solid #E8DFCB", borderRadius: 10, padding: 16, marginBottom: 12 }}>
        <div style={{ fontSize: 12, color: "#6B5530", marginBottom: 12, lineHeight: 1.5 }}>
          {analysis
            ? `Last analysis: ${new Date(analysis.generatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} · ${analysis.daysAnalysed} days`
            : `${entries.length} days of data available. Need 7+ for analysis.`}
        </div>
        <button className="ft-btn ft-btn-ai" onClick={runAnalysis} disabled={loading || entries.length < 7}>
          <Sparkles size={14} /> {loading ? "Analysing..." : analysis ? "Re-analyse patterns" : "Analyse my patterns"}
        </button>
        {error && <div style={{ marginTop: 10, fontSize: 12, color: "#B8385C" }}>{error}</div>}
      </div>

      {analysis && (
        <>
          <div style={{ background: "#ECE4CF", borderRadius: 10, padding: 16, marginBottom: 12 }}>
            <div style={{ fontFamily: "Fraunces, serif", fontStyle: "italic", fontSize: 15, color: "#2A2419", lineHeight: 1.5, marginBottom: 8 }}>
              {analysis.summary}
            </div>
            <div style={{ fontSize: 11, color: "#8A7B5E", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Trend: {analysis.trend}
            </div>
          </div>

          {analysis.insights?.map((insight, i) => (
            <div key={i} style={{ background: "#FCFAF5", border: "1px solid #E8DFCB", borderRadius: 10, padding: 16, marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 10, background: typeBg(insight.type), color: "#2A2419", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>
                  {insight.type}
                </span>
                <span style={{ fontSize: 10, color: "#8A7B5E", textTransform: "uppercase" }}>
                  {insight.confidence} confidence
                </span>
              </div>
              <div style={{ fontFamily: "Fraunces, serif", fontSize: 15, color: "#2A2419", marginBottom: 8 }}>
                {insight.title}
              </div>
              <div style={{ fontSize: 13, color: "#3D3528", lineHeight: 1.6, marginBottom: 10 }}>
                {insight.finding}
              </div>
              <div style={{ fontSize: 11, color: "#8A7B5E", fontStyle: "italic", marginBottom: 12 }}>
                {insight.evidence}
              </div>
              <div style={{ padding: 12, background: "#F4EDD9", borderRadius: 8, fontSize: 12, color: "#6B5530", lineHeight: 1.5 }}>
                <strong style={{ color: "#2A2419" }}>This week:</strong> {insight.action}
              </div>
            </div>
          ))}

          {analysis.cycleInsight && (
            <div style={{ background: "#FCFAF5", border: "1px solid #E8B5C4", borderRadius: 10, padding: 16, marginBottom: 10 }}>
              <div style={{ fontSize: 11, color: "#B8385C", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6, fontWeight: 600 }}>
                Cycle insight
              </div>
              <div style={{ fontSize: 13, color: "#3D3528", lineHeight: 1.6 }}>
                {analysis.cycleInsight}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function typeBg(type) {
  if (type === "trigger") return "#F4D4D4";
  if (type === "protective") return "#D4E4D0";
  if (type === "prediction") return "#E5DAF0";
  return "#E8DFCB";
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
}
