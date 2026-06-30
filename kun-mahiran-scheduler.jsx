import React, { useState, useEffect, useRef } from "react";
import { CalendarDays, LayoutGrid, Settings, Lock, UserCheck, Star, Check, LogOut, ArrowRight, ArrowLeft, AlertTriangle, Plus, X, Users, KeyRound, ClipboardList, Inbox, Pencil, Send, MapPin } from "lucide-react";

/* كُن ماهراً · سالزبيري — لوحة الأسبوع */

const PRIMARY = "ابتدائي", MIDDLE = "متوسط", SECONDARY = "ثانوي";
const isUpper = (s) => s === MIDDLE || s === SECONDARY;
const DAYS = [{ id: "sat", name: "السبت" }, { id: "mon", name: "الاثنين" }, { id: "wed", name: "الأربعاء" }];

const GROUPS = [
  { id: "abubakr", name: "أبو بكر", stage: PRIMARY }, { id: "omar", name: "عمر", stage: PRIMARY },
  { id: "othman", name: "عثمان", stage: PRIMARY }, { id: "ali", name: "علي", stage: PRIMARY },
  { id: "talha", name: "طلحة", stage: PRIMARY }, { id: "zubair", name: "الزبير", stage: MIDDLE },
  { id: "saad", name: "سعد", stage: MIDDLE }, { id: "saeed", name: "سعيد", stage: MIDDLE },
  { id: "abuubaida", name: "أبو عبيدة", stage: SECONDARY }, { id: "abdulrahman", name: "عبدالرحمن", stage: SECONDARY },
  { id: "usama", name: "أسامة بن زيد", stage: SECONDARY },
];
const GBY = Object.fromEntries(GROUPS.map((g) => [g.id, g]));

const SLOTS_PRIMARY = [
  { id: "reception", name: "استقبال", time: "3:45 – 4:10", fixed: true, fixedActivity: "استقبال" },
  { id: "h1", name: "الحصة ١", time: "4:10 – 4:50", fixed: false },
  { id: "h2", name: "الحصة ٢", time: "4:55 – 5:40", fixed: false },
  { id: "h3", name: "الحصة ٣", time: "5:45 – 6:30", fixed: false },
  { id: "caf", name: "الكافتيريا", time: "6:30 – 6:50", fixed: true, fixedActivity: "كافتيريا" },
  { id: "maghrib", name: "خاطرة + صلاة المغرب", time: "6:50 – 7:05", fixed: true, fixedActivity: "خاطرة + صلاة المغرب" },
  { id: "h4", name: "الحصة الأخيرة", time: "7:05 – 8:00", fixed: false },
];
const SLOTS_UPPER = [
  { id: "reception", name: "استقبال", time: "3:45 – 4:10", fixed: true, fixedActivity: "استقبال" },
  { id: "h1", name: "الحصة ١", time: "4:10 – 4:50", fixed: false },
  { id: "h2", name: "الحصة ٢", time: "4:55 – 5:40", fixed: false },
  { id: "h3", name: "الحصة ٣", time: "5:45 – 6:50", fixed: false },
  { id: "maghrib", name: "خاطرة + صلاة المغرب", time: "6:50 – 7:05", fixed: true, fixedActivity: "خاطرة + صلاة المغرب" },
  { id: "caf", name: "الكافتيريا", time: "7:05 – 7:20", fixed: true, fixedActivity: "كافتيريا" },
  { id: "hL", name: "الحصة الأخيرة", time: "7:20 – 8:00", fixed: false },
];
const slotsFor = (stage) => (stage === PRIMARY ? SLOTS_PRIMARY : SLOTS_UPPER);
function blocksOf(stage, slotId) {
  const p = { reception: [0], h1: [1], h2: [2], h3: [3], caf: [4], maghrib: [5], h4: [6, 7] };
  const u = { reception: [0], h1: [1], h2: [2], h3: [3, 4], maghrib: [5], caf: [6], hL: [7] };
  return (stage === PRIMARY ? p : u)[slotId] || [];
}

const QURAN = "حلقة قرآن", SWIM = "سباحة", ESCAPE_R = "سكيب روم", INDOOR = "ألعاب داخلية", FOOTBALL = "كرة قدم", CHALLENGES = "تحديات", CULTURE = "نشاط ثقافي", CINEMA = "سينما تربوية", CROSSFIT = "كروسفيت", CUSTOM = "نشاط خاص";
const EMOJI = { [QURAN]: "📖", [SWIM]: "🏊", [ESCAPE_R]: "🧩", [INDOOR]: "🎲", [FOOTBALL]: "⚽", [CHALLENGES]: "🎯", [CULTURE]: "🎨", [CINEMA]: "🎬", [CROSSFIT]: "🏋️", [CUSTOM]: "✨", "استقبال": "👋", "كافتيريا": "🍽️", "خاطرة + صلاة المغرب": "🕌" };
const emojiFor = (name, workshops) => EMOJI[name] || (workshops && workshops.some((w) => w.name === name) ? "🛠️" : "✨");
const ALL_FACILITIES = ["ملعب 1", "ملعب 2", "صالة تحت 1", "صالة تحت 2", "المسبح", "المصلى", "الكافتيريا", "B1", "B2", "B3", "B4", "B5", "B6", "F1", "F2", "F3", "F4"];

const quranTimes = (g) => g.id === "usama" ? [] : (isUpper(g.stage) ? [{ d: "sat", s: "h1" }, { d: "mon", s: "h2" }] : [{ d: "sat", s: "h2" }, { d: "mon", s: "h1" }]);
const SWIM_TIMES = {
  abubakr: [{ d: "mon", s: "h2" }, { d: "wed", s: "h1" }], omar: [{ d: "mon", s: "h2" }, { d: "wed", s: "h1" }],
  othman: [{ d: "mon", s: "h3" }, { d: "wed", s: "h2" }], ali: [{ d: "mon", s: "h3" }, { d: "wed", s: "h2" }],
  talha: [{ d: "mon", s: "h4" }, { d: "wed", s: "h3" }],
  zubair: [{ d: "sat", s: "h2" }], saad: [{ d: "sat", s: "h2" }], saeed: [{ d: "sat", s: "h3" }],
  abuubaida: [{ d: "sat", s: "h3" }], abdulrahman: [{ d: "sat", s: "hL" }], usama: [],
};
const ESCAPE_TIMES = { saeed: [{ d: "mon", s: "h1" }], abuubaida: [{ d: "mon", s: "h1" }], abdulrahman: [{ d: "mon", s: "h1" }], zubair: [{ d: "mon", s: "h3" }], saad: [{ d: "mon", s: "h3" }], usama: [{ d: "mon", s: "h3" }] };
const INDOOR_TIMES = { abubakr: [{ d: "sat", s: "h1" }], omar: [{ d: "sat", s: "h1" }], othman: [{ d: "sat", s: "h1" }], ali: [{ d: "sat", s: "h3" }], talha: [{ d: "sat", s: "h3" }] };
const hit = (list, d, s) => !!list && list.some((x) => x.d === d && x.s === s);

let EXTERNALS = [];
function baseMandatory(group, day, slot) {
  if (slot.fixed) return { name: slot.fixedActivity, kind: slot.id === "maghrib" ? "must" : "period" };
  if (hit(quranTimes(group), day, slot.id)) return { name: QURAN, kind: "must" };
  if (hit(SWIM_TIMES[group.id], day, slot.id)) return { name: SWIM, kind: "must" };
  if (hit(ESCAPE_TIMES[group.id], day, slot.id)) return { name: ESCAPE_R, kind: "must" };
  if (hit(INDOOR_TIMES[group.id], day, slot.id)) return { name: INDOOR, kind: "must" };
  for (const e of EXTERNALS) if (e.day === day && (e.slots || [e.slot]).includes(slot.id) && slotsFor(group.stage).some((x) => x.id === slot.id)) return { name: e.name, kind: "ext" };
  return null;
}
function mandatoryFor(group, day, slot) {
  const b = baseMandatory(group, day, slot); if (b) return b;
  if (DEFAULT_FB[group.id] && DEFAULT_FB[group.id][day] === slot.id) return { name: FOOTBALL, kind: "must" };
  return null;
}
function facilitiesFor(group, name, day, workshops) {
  if (name === FOOTBALL) return group.stage === PRIMARY ? ["صالة تحت 1", "ملعب 2", "ملعب 1"] : ["ملعب 1", "ملعب 2"];
  if (name === QURAN) return ["المصلى", "B1", "B2", "B3", "B4"];
  if (name === SWIM) return ["المسبح"];
  if (name === ESCAPE_R || name === INDOOR) return ["صالة تحت 2", "B5", "B6"];
  if (name === CHALLENGES) return ["B1", "B2", "B3", "B4"];
  if (name === CULTURE || name === CINEMA) return ["F1", "F2", "F3"];
  if (name === CROSSFIT) return ["صالة تحت 1", "صالة تحت 2"];
  if (workshops && workshops.some((w) => w.name === name)) return ["F1", "F2", "F3", "F4"];
  return null;
}
const facCap = (f) => (f === "المسبح" ? 2 : 1);
const FREE_CHOICES = [CHALLENGES, CULTURE, CINEMA, CROSSFIT];
const clone = (o) => JSON.parse(JSON.stringify(o));
const hasOv = (week, day, sid) => week && week.overrides && week.overrides[day] && Object.prototype.hasOwnProperty.call(week.overrides[day], sid);
const cellAt = (week, day, sid) => (week && week.cells && week.cells[day] && week.cells[day][sid]) || null;

function effectiveActivity(group, week, day, slot) {
  if (hasOv(week, day, slot.id)) return week.overrides[day][slot.id];
  const m = mandatoryFor(group, day, slot); if (m) return m.name;
  const c = cellAt(week, day, slot.id);
  return c ? c.activity : null;
}
function displayActivity(group, week, day, slot) {
  if (hasOv(week, day, slot.id)) return week.overrides[day][slot.id];
  const m = mandatoryFor(group, day, slot); if (m) return m.name;
  const c = cellAt(week, day, slot.id);
  if (c && c.activity === CUSTOM) return (c.customName || "نشاط خاص");
  return c ? c.activity : null;
}

function assignDay(all, day, workshops) {
  const occ = {}; const res = {};
  const bump = (b, f) => { occ[b] = occ[b] || {}; occ[b][f] = (occ[b][f] || 0) + 1; };
  const freeAt = (blocks, f) => blocks.every((b) => ((occ[b] && occ[b][f]) || 0) < facCap(f));
  for (const g of GROUPS) {
    for (const slot of slotsFor(g.stage)) {
      const a = effectiveActivity(g, all[g.id], day, slot);
      const key = g.id + "|" + slot.id;
      if (!a || slot.fixed) { res[key] = { activity: a, facility: null, overflow: false }; continue; }
      let fac;
      if (a === CUSTOM) { const c = cellAt(all[g.id], day, slot.id); const place = c && c.customPlace; if (!place) { res[key] = { activity: a, facility: null, overflow: false }; continue; } fac = [place]; }
      else { fac = facilitiesFor(g, a, day, workshops); if (!fac) { res[key] = { activity: a, facility: null, overflow: false }; continue; } }
      const blocks = blocksOf(g.stage, slot.id);
      let placed = null;
      for (const f of fac) { if (freeAt(blocks, f)) { blocks.forEach((b) => bump(b, f)); placed = f; break; } }
      res[key] = { activity: a, facility: placed, overflow: placed === null };
    }
  }
  return res;
}
function occExcept(all, group, day, slotId, workshops) {
  const tmp = clone(all[group.id] || emptyWeek(group));
  tmp.cells[day][slotId] = { activity: null, customName: "", customPlace: "" };
  tmp.overrides = tmp.overrides || {}; tmp.overrides[day] = tmp.overrides[day] || {}; tmp.overrides[day][slotId] = null;
  const res = assignDay({ ...all, [group.id]: tmp }, day, workshops);
  const occ = {};
  for (const key in res) {
    const r = res[key]; if (!r.facility) continue;
    const [gid, sid] = key.split("|");
    blocksOf(GBY[gid].stage, sid).forEach((b) => { occ[b] = occ[b] || {}; occ[b][r.facility] = (occ[b][r.facility] || 0) + 1; });
  }
  return occ;
}
function canPlace(occ, group, day, slot, name, workshops) {
  const fac = facilitiesFor(group, name, day, workshops); if (!fac) return true;
  const blocks = blocksOf(group.stage, slot.id);
  return fac.some((f) => blocks.every((b) => ((occ[b] && occ[b][f]) || 0) < facCap(f)));
}
function facilityFree(occ, group, slot, facility) {
  const blocks = blocksOf(group.stage, slot.id);
  return blocks.every((b) => ((occ[b] && occ[b][facility]) || 0) < facCap(facility));
}

function fbRequiredDays(group) { if (group.id === "usama") return []; return group.stage === PRIMARY ? DAYS.map((d) => d.id) : ["sat", "mon"]; }
function computeDefaultFB() {
  const out = {}; GROUPS.forEach((g) => (out[g.id] = {}));
  for (const d of DAYS) {
    const groups = GROUPS.filter((g) => fbRequiredDays(g).includes(d.id));
    const freeSlots = (g) => slotsFor(g.stage).filter((s) => !s.fixed && !baseMandatory(g, d.id, s));
    const order = [...groups].sort((a, b) => freeSlots(a).length - freeSlots(b).length);
    const occ = {};
    const fit = (g, sid, f) => blocksOf(g.stage, sid).every((b) => ((occ[b] && occ[b][f]) || 0) < facCap(f));
    const put = (g, sid, f, v) => blocksOf(g.stage, sid).forEach((b) => { occ[b] = occ[b] || {}; occ[b][f] = ((occ[b] && occ[b][f]) || 0) + v; });
    const chosen = {};
    const bt = (i) => {
      if (i === order.length) return true;
      const g = order[i];
      for (const s of freeSlots(g)) for (const f of facilitiesFor(g, FOOTBALL, d.id)) {
        if (fit(g, s.id, f)) { put(g, s.id, f, 1); chosen[g.id] = s.id; if (bt(i + 1)) return true; put(g, s.id, f, -1); delete chosen[g.id]; }
      }
      return false;
    };
    bt(0);
    for (const g of order) if (chosen[g.id]) out[g.id][d.id] = chosen[g.id];
  }
  return out;
}
const DEFAULT_FB = computeDefaultFB();

function emptyWeek(group) {
  const cells = {}, subs = {};
  for (const d of DAYS) { cells[d.id] = {}; for (const s of slotsFor(group.stage)) cells[d.id][s.id] = { activity: null, customName: "", customPlace: "" }; subs[d.id] = { on: false, substitute: null, reason: "" }; }
  return { cells, subs, overrides: {}, status: "draft" };
}
function emptySlotsOn(group, week, dayId) {
  return slotsFor(group.stage).filter((s) => !s.fixed && !effectiveActivity(group, week, dayId, s));
}
function emptySlots(group, week) { let out = []; for (const d of DAYS) out = out.concat(emptySlotsOn(group, week, d.id).map((s) => ({ day: d, slot: s }))); return out; }
const isComplete = (group, week) => emptySlots(group, week).length === 0;
function countWorkshopEff(group, week, name) {
  let n = 0; for (const d of DAYS) for (const s of slotsFor(group.stage)) if (!s.fixed && effectiveActivity(group, week, d.id, s) === name) n++; return n;
}

const HAS = typeof window !== "undefined" && window.storage && typeof window.storage.get === "function";
const mem = new Map();
const store = {
  async get(k) { if (HAS) { try { const r = await window.storage.get(k, true); return r ? JSON.parse(r.value) : null; } catch (e) { return null; } } return mem.has(k) ? JSON.parse(mem.get(k)) : null; },
  async set(k, v) { const s = JSON.stringify(v); if (HAS) { try { await window.storage.set(k, s, true); } catch (e) {} } else mem.set(k, s); },
  async list(p) { if (HAS) { try { const r = await window.storage.list(p, true); return r && r.keys ? r.keys : []; } catch (e) { return []; } } return [...mem.keys()].filter((k) => k.startsWith(p)); },
};
const GP = "kunMahiran:v3:group:", SUBS_K = "kunMahiran:v3:subs", WS_K = "kunMahiran:v3:ws", EXT_K = "kunMahiran:v3:ext", CODES_K = "kunMahiran:v3:codes";
const DEF_SUBS = ["سالم", "ماجد", "يوسف"];
const DEF_WS = [{ id: "w_photo", name: "ورشة التصوير", limit: 1, period: "term", cap: 1, code: "9162" }, { id: "w_wudu", name: "ورشة الوضوء", limit: 1, period: "term", cap: 1, code: "7503" }];
const DEF_CODES = { coordinator: "4071", supervisor: "2350", staff: [{ id: "swim", code: "6184", label: "كابتن السباحة — د. خالد", acts: [SWIM] }, { id: "fb", code: "5729", label: "كابتن كرة القدم — عبدالله السلطان", acts: [FOOTBALL] }, { id: "saleh", code: "3846", label: "صالح العربيد — سكيب روم وألعاب داخلية", acts: [ESCAPE_R, INDOOR] }] };
const periodLabel = (p) => (p === "term" ? "خلال الفصل" : "أسبوعياً");
const statusLabel = (s) => (s === "approved" ? "معتمد" : s === "pending" ? "بانتظار الاعتماد" : "قيد الإعداد");
const rid = () => Math.floor(1000 + Math.random() * 9000).toString();
const SLOT_LABELS = { h1: "الحصة ١", h2: "الحصة ٢", h3: "الحصة ٣", h4: "الأخيرة (ابتدائي)", hL: "الأخيرة (متوسط/ثانوي)" };
const groupEmoji = (g) => (g.stage === PRIMARY ? "🧒" : "🧑");

export default function App() {
  const [screen, setScreen] = useState("landing");
  const [role, setRole] = useState(null);
  const [staffCtx, setStaffCtx] = useState(null);
  const [groupId, setGroupId] = useState(null);
  const [parentGid, setParentGid] = useState(null);
  const [pdView, setPdView] = useState("simple");
  const [editingGid, setEditingGid] = useState(null);
  const [all, setAll] = useState({});
  const [subs, setSubs] = useState(DEF_SUBS);
  const [workshops, setWorkshops] = useState(DEF_WS);
  const [externals, setExternals] = useState([]);
  const [codes, setCodes] = useState(DEF_CODES);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [cellErr, setCellErr] = useState({});
  const [dayErr, setDayErr] = useState({});
  const [boardDay, setBoardDay] = useState("sat");
  const [coTab, setCoTab] = useState("board");
  const [codeInput, setCodeInput] = useState("");
  const [codeMsg, setCodeMsg] = useState("");
  const [showRules, setShowRules] = useState(false);
  const [newSub, setNewSub] = useState("");
  const [wsf, setWsf] = useState({ name: "", limit: 1, period: "term", cap: 1 });
  const [extf, setExtf] = useState({ name: "", day: "sat", slots: [] });
  const tT = useRef(null), pT = useRef(null);

  EXTERNALS = externals;

  useEffect(() => { load().then(() => setLoading(false)); }, []);
  async function load() {
    const keys = await store.list(GP); const sc = {};
    for (const k of keys) { const gid = k.slice(GP.length); const w = await store.get(k); if (w) sc[gid] = w; }
    let s = await store.get(SUBS_K); if (!Array.isArray(s)) { s = DEF_SUBS.slice(); await store.set(SUBS_K, s); }
    let w = await store.get(WS_K); if (!Array.isArray(w)) { w = clone(DEF_WS); await store.set(WS_K, w); }
    let e = await store.get(EXT_K); if (!Array.isArray(e)) { e = []; await store.set(EXT_K, e); }
    let c = await store.get(CODES_K); if (!c || !c.coordinator) { c = clone(DEF_CODES); await store.set(CODES_K, c); }
    setAll(sc); setSubs(s); setWorkshops(w); setExternals(e); setCodes(c); EXTERNALS = e;
  }
  const showToast = (m) => { setToast(m); if (tT.current) clearTimeout(tT.current); tT.current = setTimeout(() => setToast(null), 1500); };
  const sErr = (d, s, m) => setCellErr((p) => ({ ...p, [d + "_" + s]: m }));
  const cErr = (d, s) => setCellErr((p) => { const n = { ...p }; delete n[d + "_" + s]; return n; });
  const dig4 = (v) => v.replace(/[^0-9]/g, "").slice(0, 4);

  function tryCode(val) {
    const c = (val !== undefined ? val : codeInput).trim();
    if (c.length !== 4) return;
    if (c === codes.coordinator) { setRole("coordinator"); setCoTab("board"); setScreen("coord"); reset(); return; }
    if (c === codes.supervisor) { setRole("supervisor"); setScreen("supSelect"); reset(); return; }
    const st = codes.staff.find((x) => x.code === c);
    if (st) { setRole("staff"); setStaffCtx({ label: st.label, acts: st.acts }); setScreen("staff"); reset(); return; }
    const wk = workshops.find((x) => x.code === c);
    if (wk) { setRole("staff"); setStaffCtx({ label: wk.name, acts: [wk.name] }); setScreen("staff"); reset(); return; }
    setCodeMsg("الكود غير صحيح. تأكّد وحاول مرة ثانية.");
  }
  const reset = () => { setCodeInput(""); setCodeMsg(""); };
  function logout() { setRole(null); setStaffCtx(null); setGroupId(null); setEditingGid(null); setScreen("landing"); }

  async function enterGroup(gid) {
    if (!all[gid]) { const w = emptyWeek(GBY[gid]); await store.set(GP + gid, w); setAll((p) => ({ ...p, [gid]: w })); }
    setGroupId(gid); setScreen("sup");
  }
  async function enterGroupSilently(gid) { const w = emptyWeek(GBY[gid]); await store.set(GP + gid, w); setAll((p) => ({ ...p, [gid]: w })); }

  function persist(gid, w, deb) { if (deb) { if (pT.current) clearTimeout(pT.current); pT.current = setTimeout(() => store.set(GP + gid, w), 600); } else store.set(GP + gid, w); }
  function commitGid(gid, w, deb, msg) { setAll((p) => ({ ...p, [gid]: w })); persist(gid, w, deb); if (!deb) showToast(msg || "تم الحفظ"); }
  const markDraft = (w, isCoord) => { if (!isCoord && w.status === "approved") w.status = "draft"; };
  const writeCodes = (c) => { setCodes(c); store.set(CODES_K, c); };
  const writeWs = (w) => { setWorkshops(w); store.set(WS_K, w); };

  function editCell(gid, isCoord, day, slot, name) {
    const g = GBY[gid]; const w = clone(all[gid]);
    const mand = mandatoryFor(g, day, slot);
    const isMand = mand && (mand.kind === "must" || mand.kind === "ext");
    const cur = effectiveActivity(g, all[gid], day, slot);
    const ensureOv = () => { w.overrides = w.overrides || {}; w.overrides[day] = w.overrides[day] || {}; };
    const finish = () => { markDraft(w, isCoord); commitGid(gid, w, false); cErr(day, slot.id); };
    if (cur === name) { if (isMand) { ensureOv(); w.overrides[day][slot.id] = null; } else { w.cells[day][slot.id] = { activity: null, customName: "", customPlace: "" }; } finish(); return; }
    if (isMand && name === mand.name) { ensureOv(); delete w.overrides[day][slot.id]; finish(); return; }
    if (name !== CUSTOM) {
      const wk = workshops.find((x) => x.name === name);
      if (wk && countWorkshopEff(g, all[gid], name) + 1 > wk.limit) { sErr(day, slot.id, "وصلت الحد المسموح لـ" + name + " (" + wk.limit + " " + periodLabel(wk.period) + ")."); return; }
      const occ = occExcept(all, g, day, slot.id, workshops);
      if (!canPlace(occ, g, day, slot, name, workshops)) { const f = facilitiesFor(g, name, day, workshops); sErr(day, slot.id, "تعارض: مرافق " + name + " (" + f.join("، ") + ") محجوزة بهذي الفترة. اختر نشاط أو وقت ثاني."); return; }
    }
    if (isMand) { ensureOv(); w.overrides[day][slot.id] = name; } else { w.cells[day][slot.id] = { activity: name, customName: "", customPlace: "" }; }
    finish();
  }
  function setCustomCell(gid, isCoord, day, slotId, patch) { const w = clone(all[gid]); w.cells[day][slotId] = { ...w.cells[day][slotId], ...patch }; markDraft(w, isCoord); commitGid(gid, w, true); }
  function setCustomFacility(gid, isCoord, day, slot, facility) {
    if (facility) { const occ = occExcept(all, GBY[gid], day, slot.id, workshops); if (!facilityFree(occ, GBY[gid], slot, facility)) { sErr(day, slot.id, "المكان " + facility + " محجوز بهذي الفترة. اختر مكان ثاني."); return; } }
    cErr(day, slot.id); setCustomCell(gid, isCoord, day, slot.id, { customPlace: facility });
  }
  function toggleSub(gid, isCoord, day, on) {
    if (on) {
      const used = new Set(); GROUPS.forEach((g) => { if (g.id === gid) return; const s = all[g.id] && all[g.id].subs && all[g.id].subs[day]; if (s && s.on && s.substitute) used.add(s.substitute); });
      const sub = subs.find((s) => !used.has(s));
      if (!sub) { setDayErr((p) => ({ ...p, [day]: "ما فيه بديل متاح لهذا اليوم. أضِف بديلاً من الإعدادات." })); return; }
      const w = clone(all[gid]); w.subs[day] = { on: true, substitute: sub, reason: w.subs[day].reason || "" }; markDraft(w, isCoord); commitGid(gid, w, false);
    } else { const w = clone(all[gid]); w.subs[day] = { on: false, substitute: null, reason: "" }; markDraft(w, isCoord); commitGid(gid, w, false); }
    setDayErr((p) => { const n = { ...p }; delete n[day]; return n; });
  }
  const setReason = (gid, isCoord, day, v) => { const w = clone(all[gid]); w.subs[day] = { ...w.subs[day], reason: v }; markDraft(w, isCoord); commitGid(gid, w, true); };
  function submitForApproval(gid) { const w = clone(all[gid]); w.status = "pending"; commitGid(gid, w, false, "تم الإرسال للاعتماد"); }
  function approveGroup(gid) { const w = clone(all[gid]); w.status = "approved"; commitGid(gid, w, false, "تم الاعتماد ✓"); }

  const saveSubs = (n) => { setSubs(n); store.set(SUBS_K, n); showToast("تم الحفظ"); };
  const saveWs = (n) => { setWorkshops(n); store.set(WS_K, n); showToast("تم الحفظ"); };
  const saveExt = (n) => { setExternals(n); store.set(EXT_K, n); EXTERNALS = n; showToast("تم الحفظ"); };

  /* ----- لوحة عامة (المنسّق): بالأوقات + التعارض ----- */
  function OverviewBoard(day) {
    const res = assignDay(all, day, workshops);
    const sections = [{ t: "الابتدائي", gs: GROUPS.filter((g) => g.stage === PRIMARY) }, { t: "المتوسط / الثانوي", gs: GROUPS.filter((g) => isUpper(g.stage)) }];
    const bad = GROUPS.filter((g) => slotsFor(g.stage).some((s) => res[g.id + "|" + s.id] && res[g.id + "|" + s.id].overflow));
    return (
      <>
        <div className="seg">{DAYS.map((d) => <button key={d.id} className={boardDay === d.id ? "on" : ""} onClick={() => setBoardDay(d.id)}>{d.name}</button>)}</div>
        {bad.length ? <div className="banner bad"><AlertTriangle size={14} /> تعارض مرافق: {bad.map((g) => g.name).join("، ")}</div> : <div className="banner ok"><Check size={14} /> لا توجد تعارضات بهذا اليوم.</div>}
        {sections.map((sec) => (
          <div key={sec.t} className="bsec">
            <div className="bsec-t">{sec.t}</div>
            <div className="bgrid">
              {sec.gs.map((g) => { const w = all[g.id]; return (
                <div className="bcard" key={g.id}>
                  <div className="bcard-h">مجموعة {g.name}<span className={"ministat " + (w ? w.status : "draft")}>{statusLabel(w ? w.status : "draft")}</span></div>
                  {slotsFor(g.stage).map((s) => {
                    const label = displayActivity(g, w, day, s) || "—";
                    const r = res[g.id + "|" + s.id]; const ov = r && r.overflow;
                    const sub = w && w.subs && w.subs[day]; const showSub = !s.fixed && sub && sub.on;
                    return <div className={"brow" + (ov ? " ov" : "")} key={s.id}><span className="btime">{s.time}</span><span className="bact">{label}{r && r.facility ? <em className="bfac"> · {r.facility}</em> : null}{showSub ? <em className="bsub"> · بديل: {sub.substitute}</em> : null}</span></div>;
                  })}
                </div>
              ); })}
            </div>
          </div>
        ))}
      </>
    );
  }

  /* ----- أولياء الأمور / أفراد المجموعة ----- */
  function ParentsLanding() {
    const sections = [{ t: "الابتدائي", gs: GROUPS.filter((g) => g.stage === PRIMARY) }, { t: "المتوسط / الثانوي", gs: GROUPS.filter((g) => isUpper(g.stage)) }];
    return (
      <>
        <div className="parents-note">اختر المجموعة لعرض برنامجها الأسبوعي. 👨‍👩‍👧</div>
        {sections.map((sec) => (
          <div key={sec.t} className="bsec"><div className="bsec-t">{sec.t}</div>
            <div className="ggrid">{sec.gs.map((g) => { const ap = all[g.id] && all[g.id].status === "approved"; return (
              <button key={g.id} className="pgcard" onClick={() => { setParentGid(g.id); setPdView("simple"); setBoardDay("sat"); }}>
                <div className="pg-emoji">{groupEmoji(g)}</div><div className="gn">مجموعة {g.name}</div><div className={"pg-badge " + (ap ? "ok" : "wait")}>{ap ? "جاهز" : "قيد الإعداد"}</div>
              </button>
            ); })}</div>
          </div>
        ))}
      </>
    );
  }
  function ParentDetail(gid) {
    const g = GBY[gid]; const w = all[gid]; const approved = w && w.status === "approved";
    const simple = approved ? slotsFor(g.stage).map((s) => ({ s, name: displayActivity(g, w, boardDay, s) })).filter((x) => x.name) : [];
    let full = [];
    if (approved) { const res = assignDay(all, boardDay, workshops); full = slotsFor(g.stage).map((s) => { const name = displayActivity(g, w, boardDay, s); const r = res[g.id + "|" + s.id]; return { s, name, place: r && r.facility }; }).filter((x) => x.name); }
    return (
      <>
        <button className="back" onClick={() => setParentGid(null)}><ArrowLeft size={16} /> كل المجموعات</button>
        <div className="pd-head"><div className="pd-emoji">{groupEmoji(g)}</div><div><div className="pd-name">مجموعة {g.name}</div><div className="pd-stage">{g.stage}</div></div></div>
        <div className="seg">{DAYS.map((d) => <button key={d.id} className={boardDay === d.id ? "on" : ""} onClick={() => setBoardDay(d.id)}>{d.name}</button>)}</div>
        {!approved ? (
          <div className="pd-wait"><div className="pd-wait-emoji">⏳</div><div className="pd-wait-t">البرنامج قيد الإعداد</div><div className="muted">سيظهر برنامج المجموعة هنا بعد اعتماده. تابعنا قريباً 🌟</div></div>
        ) : (
          <>
            <div className="seg pdview"><button className={pdView === "simple" ? "on" : ""} onClick={() => setPdView("simple")}>البرنامج</button><button className={pdView === "full" ? "on" : ""} onClick={() => setPdView("full")}>المواعيد والأماكن 📍</button></div>
            {pdView === "simple" ? (
              <div className="pd-list">{simple.map(({ s, name }) => <div className="pd-item" key={s.id}><span className="pd-i-emoji">{emojiFor(name, workshops)}</span><span className="pd-i-name">{name}</span></div>)}{simple.length === 0 && <div className="muted" style={{ padding: 16 }}>لا توجد أنشطة لهذا اليوم.</div>}</div>
            ) : (
              <div className="pd-list">{full.map(({ s, name, place }) => <div className="pd-item full" key={s.id}><span className="pd-time">{s.time}</span><span className="pd-i-emoji">{emojiFor(name, workshops)}</span><span className="pd-i-name">{name}</span>{place ? <span className="pd-place"><MapPin size={13} /> {place}</span> : null}</div>)}{full.length === 0 && <div className="muted" style={{ padding: 16 }}>لا توجد أنشطة لهذا اليوم.</div>}</div>
            )}
          </>
        )}
      </>
    );
  }

  /* ----- محرّر ----- */
  function Editor(gid, isCoord) {
    const g = GBY[gid]; const w = all[gid];
    const empties = emptySlots(g, w); const complete = empties.length === 0;
    const freeChips = [...FREE_CHOICES, ...workshops.map((x) => x.name), CUSTOM];
    const slots = slotsFor(g.stage).filter((s) => s.id !== "reception" && s.id !== "caf");
    return (
      <>
        {!isCoord && <div className="card statusbar"><span className={"stat " + (w.status || "draft")}>{statusLabel(w.status || "draft")}</span></div>}
        {isCoord && <div className="card coordnote"><Pencil size={15} /> تعديل مجموعة {g.name} — تقدر تغيّر أو تشيل حتى الأنشطة الإجبارية 🔒.</div>}
        <div className="card">
          <button className="rules-btn" onClick={() => setShowRules((v) => !v)}><span><AlertTriangle size={15} /> القواعد الثابتة ({g.stage})</span><span>{showRules ? "▲" : "▼"}</span></button>
          {showRules && <div className="rules">
            <div className="rule"><Lock size={14} /> القرآن إجباري ({isUpper(g.stage) ? "السبت ح١، الاثنين ح٢" : "السبت ح٢، الاثنين ح١"}){g.id === "usama" ? " — هذي المجموعة بدون قرآن" : ""}.</div>
            <div className="rule"><Lock size={14} /> السباحة و{isUpper(g.stage) ? "سكيب روم" : "ألعاب داخلية"} وكرة القدم إجبارية ومثبتة بمواعيدها (مثل السباحة).</div>
            <div className="rule"><UserCheck size={14} /> الورش (★) اختيارية بحد أقصى. تقدر تطلب بديلاً لأي يوم.</div>
          </div>}
        </div>
        <div className="pills">{complete ? <span className="pill ok"><Check size={14} /> الجدول مكتمل</span> : <span className="pill warn"><AlertTriangle size={14} /> باقي {empties.length} حصص فاضية</span>}</div>
        <div className="week">
          {DAYS.map((d) => {
            const sub = w.subs[d.id]; const de = emptySlotsOn(g, w, d.id).length;
            return (
              <div className="daycol" key={d.id}>
                <div className="dayhead">يوم {d.name}{de ? <span className="need">باقي {de}</span> : null}</div>
                <div className="subbar"><span className="sublabel"><UserCheck size={15} /> طلب بديل لهذا اليوم</span><button className={"switch" + (sub.on ? " on" : "")} onClick={() => toggleSub(gid, isCoord, d.id, !sub.on)} aria-pressed={sub.on}><span /></button></div>
                {sub.on && <><div className="ribbon"><UserCheck size={14} /> بديل اليوم: <b>&nbsp;{sub.substitute}</b></div><input className="inp full" placeholder="السبب (اختياري)" value={sub.reason} onChange={(e) => setReason(gid, isCoord, d.id, e.target.value)} /></>}
                {dayErr[d.id] && <div className="err">{dayErr[d.id]}</div>}
                {slots.map((s) => renderCell(gid, isCoord, d.id, s, freeChips))}
              </div>
            );
          })}
        </div>
        {!isCoord && (
          <div className="card submit-card">
            {!complete && <p className="muted" style={{ margin: "0 0 10px" }}>كمّل كل الحصص الفاضية ({empties.length}) عشان ترسل الجدول للاعتماد.</p>}
            {complete && w.status !== "approved" && w.status !== "pending" && <p className="muted" style={{ margin: "0 0 10px" }}>الجدول مكتمل ✓ — جاهز للإرسال.</p>}
            {w.status === "pending" && <p className="muted" style={{ margin: "0 0 10px" }}>تم الإرسال، بانتظار اعتماد المنسّق.</p>}
            {w.status === "approved" && <p className="muted" style={{ margin: "0 0 10px" }}>الجدول معتمد ✓.</p>}
            <button className="btn primary big" disabled={!complete || w.status === "pending" || w.status === "approved"} onClick={() => submitForApproval(gid)}><Send size={16} /> إرسال للاعتماد</button>
          </div>
        )}
      </>
    );
  }

  function renderCell(gid, isCoord, day, slot, freeChips) {
    const g = GBY[gid]; const w = all[gid];
    if (slot.fixed) return (
      <div className="slot mand" key={slot.id}>
        <div className="slot-h"><span className="time">{slot.time}</span><span className="bmand"><Lock size={11} /> إجباري</span></div>
        <div className="slot-n">{slot.name}</div><div className="slot-a">{emojiFor(slot.fixedActivity, workshops)} {slot.fixedActivity}</div>
      </div>
    );
    const mand = mandatoryFor(g, day, slot);
    const isMand = mand && (mand.kind === "must" || mand.kind === "ext");
    const cur = effectiveActivity(g, w, day, slot);
    if (isMand && !isCoord) return (
      <div className="slot mand" key={slot.id}>
        <div className="slot-h"><span className="time">{slot.time}</span><span className="bmand"><Lock size={11} /> إجباري</span></div>
        <div className="slot-n">{slot.name}</div><div className="slot-a">{emojiFor(mand.name, workshops)} {mand.name}</div>
      </div>
    );
    const occ = occExcept(all, g, day, slot.id, workshops);
    const chips = isMand ? [mand.name, ...FREE_CHOICES, ...workshops.map((x) => x.name)] : freeChips;
    const c = w.cells[day][slot.id];
    return (
      <div className="slot" key={slot.id}>
        <div className="slot-h"><span className="time">{slot.time}</span><span className="slot-tag">{slot.name}{isCoord && isMand ? " · إجباري" : ""}</span></div>
        <div className="chips">
          {chips.map((name) => {
            const isWs = workshops.some((x) => x.name === name);
            const isCustom = name === CUSTOM;
            const isMandName = isMand && name === mand.name;
            const sel = cur === name;
            let disabled = false, note = "";
            if (!sel && !isCustom && !isMandName) {
              if (!canPlace(occ, g, day, slot, name, workshops)) { disabled = true; note = " (ممتلئ)"; }
              if (isWs) { const wk = workshops.find((x) => x.name === name); if (countWorkshopEff(g, w, name) + 1 > wk.limit) { disabled = true; note = " (انتهى نصيبك)"; } }
            }
            return <button key={name} className={"chip" + (sel ? " sel" : "") + (isWs ? " ws" : "") + (isCustom ? " sp" : "") + (isMandName ? " mn" : "")} disabled={disabled} onClick={() => editCell(gid, isCoord, day, slot, name)}>{isWs ? "★ " : isMandName ? "🔒 " : ""}{name}{isCustom ? " ✎" : ""}{note}</button>;
          })}
        </div>
        {!isMand && c.activity === CUSTOM && <div className="custom">
          <input className="inp full" placeholder="اسم النشاط" value={c.customName} onChange={(e) => setCustomCell(gid, isCoord, day, slot.id, { customName: e.target.value })} />
          <select className="inp full" value={c.customPlace || ""} onChange={(e) => setCustomFacility(gid, isCoord, day, slot, e.target.value)}><option value="">المكان… (اختر مرفقاً)</option>{ALL_FACILITIES.map((f) => <option key={f} value={f}>{f}</option>)}</select>
        </div>}
        {cellErr[day + "_" + slot.id] && <div className="err">{cellErr[day + "_" + slot.id]}</div>}
      </div>
    );
  }

  function StaffView() {
    const rows = [];
    for (const d of DAYS) { const res = assignDay(all, d.id, workshops); for (const g of GROUPS) for (const s of slotsFor(g.stage)) { const a = effectiveActivity(g, all[g.id], d.id, s); if (a && staffCtx.acts.includes(a)) { const r = res[g.id + "|" + s.id]; rows.push({ group: g.name, dayId: d.id, time: s.time, act: a, place: r && r.facility }); } } }
    return (
      <div className="card">
        <div className="staff-h"><ClipboardList size={18} /> حصصك هذا الأسبوع</div>
        {rows.length === 0 && <p className="muted">ما فيه حصص مسجّلة لك حالياً. تظهر هنا أول ما تختار المجموعات أنشطتك.</p>}
        {DAYS.map((d) => { const day = rows.filter((r) => r.dayId === d.id); if (!day.length) return null; return (
          <div key={d.id} className="staff-day"><div className="staff-day-t">يوم {d.name}</div>{day.map((r, i) => <div className="staff-row" key={i}><span className="time">{r.time}</span><span className="staff-g">مجموعة {r.group}</span><span className="staff-a">{emojiFor(r.act, workshops)} {r.act}</span><span className="staff-p"><MapPin size={12} /> {r.place || "—"}</span></div>)}</div>
        ); })}
      </div>
    );
  }

  function Approvals() {
    const pending = GROUPS.filter((g) => all[g.id] && all[g.id].status === "pending");
    const approved = GROUPS.filter((g) => all[g.id] && all[g.id].status === "approved").length;
    return (
      <div className="card">
        <div className="ch"><Inbox size={16} style={{ verticalAlign: "-3px" }} /> طلبات الاعتماد</div>
        <p className="muted" style={{ margin: "6px 0 12px" }}>المعتمدة: {approved} / {GROUPS.length}</p>
        {pending.length === 0 && <p className="muted">ما فيه طلبات تنتظر الاعتماد حالياً. ✅</p>}
        {pending.map((g) => (
          <div className="li" key={g.id}>
            <div><b>مجموعة {g.name}</b><div className="muted">{g.stage} · بانتظار الاعتماد</div></div>
            <div style={{ display: "flex", gap: 8 }}><button className="btn" onClick={() => { setEditingGid(g.id); setCoTab("groups"); }}>عرض</button><button className="btn primary" onClick={() => approveGroup(g.id)}><Check size={15} /> اعتماد</button></div>
          </div>
        ))}
      </div>
    );
  }

  function CoordGroups() {
    if (editingGid) return (<><button className="back" onClick={() => setEditingGid(null)}><ArrowLeft size={16} /> كل المجموعات</button>{Editor(editingGid, true)}</>);
    const sections = [{ t: "الابتدائي", gs: GROUPS.filter((g) => g.stage === PRIMARY) }, { t: "المتوسط / الثانوي", gs: GROUPS.filter((g) => isUpper(g.stage)) }];
    return (<>
      <div className="ch" style={{ marginBottom: 12 }}><Pencil size={16} style={{ verticalAlign: "-3px" }} /> اختر مجموعة لتعديلها</div>
      {sections.map((sec) => (<div key={sec.t} className="bsec"><div className="bsec-t">{sec.t}</div><div className="ggrid">{sec.gs.map((g) => { const st = all[g.id] ? all[g.id].status : "draft"; return (
        <button key={g.id} className="gbtn" onClick={() => { if (!all[g.id]) enterGroupSilently(g.id); setEditingGid(g.id); }}><div className="gn">مجموعة {g.name}</div><div className={"ministat " + st} style={{ marginTop: 4 }}>{statusLabel(st)}</div></button>
      ); })}</div></div>))}
    </>);
  }

  function CoordSettings() {
    return (
      <>
        <div className="card">
          <div className="ch">الورش <span className="muted">(تظهر للمشرفين بعلامة ★)</span></div>
          {workshops.map((w) => <div className="li" key={w.id}><div><b>{w.name}</b><div className="muted">الحد {w.limit} {periodLabel(w.period)} · تتسع {w.cap}</div></div><button className="icon danger" onClick={() => saveWs(workshops.filter((x) => x.id !== w.id))}><X size={16} /></button></div>)}
          <div className="form">
            <input className="inp" placeholder="اسم الورشة" value={wsf.name} onChange={(e) => setWsf({ ...wsf, name: e.target.value })} style={{ flex: "1 1 150px" }} />
            <label className="fl">الحد<input className="inp num" type="number" min="1" value={wsf.limit} onChange={(e) => setWsf({ ...wsf, limit: e.target.value })} /></label>
            <select className="inp auto" value={wsf.period} onChange={(e) => setWsf({ ...wsf, period: e.target.value })}><option value="term">خلال الفصل</option><option value="week">أسبوعياً</option></select>
            <label className="fl">السعة<input className="inp num" type="number" min="1" value={wsf.cap} onChange={(e) => setWsf({ ...wsf, cap: e.target.value })} /></label>
            <button className="btn primary" onClick={() => { const n = wsf.name.trim(); if (!n || workshops.some((w) => w.name === n)) return; saveWs([...workshops, { id: "w_" + Date.now(), name: n, limit: Math.max(1, parseInt(wsf.limit) || 1), period: wsf.period, cap: Math.max(1, parseInt(wsf.cap) || 1), code: rid() }]); setWsf({ name: "", limit: 1, period: "term", cap: 1 }); }}><Plus size={16} /> إضافة</button>
          </div>
        </div>
        <div className="card">
          <div className="ch">نشاط خارجي <span className="muted">(إجباري على الجميع — اختر حصصه)</span></div>
          {externals.map((e) => <div className="li" key={e.id}><div><b>{emojiFor(e.name, workshops)} {e.name}</b><div className="muted">{DAYS.find((d) => d.id === e.day).name} · {(e.slots || [e.slot]).map((s) => SLOT_LABELS[s]).join("، ")}</div></div><button className="icon danger" onClick={() => saveExt(externals.filter((x) => x.id !== e.id))}><X size={16} /></button></div>)}
          <div className="form" style={{ alignItems: "stretch", flexDirection: "column" }}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <input className="inp" placeholder="اسم النشاط الخارجي" value={extf.name} onChange={(e) => setExtf({ ...extf, name: e.target.value })} style={{ flex: "1 1 150px" }} />
              <select className="inp auto" value={extf.day} onChange={(e) => setExtf({ ...extf, day: e.target.value })}>{DAYS.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}</select>
            </div>
            <div className="extslots">{["h1", "h2", "h3", "h4", "hL"].map((sid) => { const on = extf.slots.includes(sid); return <button key={sid} className={"chip" + (on ? " sel" : "")} onClick={() => setExtf({ ...extf, slots: on ? extf.slots.filter((x) => x !== sid) : [...extf.slots, sid] })}>{SLOT_LABELS[sid]}</button>; })}</div>
            <button className="btn primary" style={{ alignSelf: "flex-start" }} onClick={() => { const n = extf.name.trim(); if (!n || extf.slots.length === 0) return; saveExt([...externals, { id: "e_" + Date.now(), name: n, day: extf.day, slots: extf.slots }]); setExtf({ name: "", day: "sat", slots: [] }); }}><Plus size={16} /> إضافة</button>
          </div>
        </div>
        <div className="card">
          <div className="ch">البدلاء</div>
          <div className="chipsrow">{subs.map((s) => <span className="tag" key={s}>{s}<button onClick={() => saveSubs(subs.filter((x) => x !== s))}><X size={11} /></button></span>)}<span style={{ display: "inline-flex", gap: 6 }}><input className="inp" placeholder="اسم بديل" value={newSub} onChange={(e) => setNewSub(e.target.value)} /><button className="btn" onClick={() => { const n = newSub.trim(); if (n && !subs.includes(n)) saveSubs([...subs, n]); setNewSub(""); }}><Plus size={16} /></button></span></div>
        </div>
        <div className="card">
          <div className="ch"><KeyRound size={15} style={{ verticalAlign: "-2px" }} /> أكواد الدخول <span className="muted">(عدّلها مباشرة — ٤ أرقام، تُحفظ تلقائياً)</span></div>
          <div className="codes">
            <div className="crow"><span>المنسّق (أنت)</span><input className="code-edit" inputMode="numeric" value={codes.coordinator} onChange={(e) => writeCodes({ ...codes, coordinator: dig4(e.target.value) })} /></div>
            <div className="crow"><span>المشرفون (كود موحّد)</span><input className="code-edit" inputMode="numeric" value={codes.supervisor} onChange={(e) => writeCodes({ ...codes, supervisor: dig4(e.target.value) })} /></div>
            {codes.staff.map((s, i) => <div className="crow" key={s.id}><span>{s.label}</span><input className="code-edit" inputMode="numeric" value={s.code} onChange={(e) => writeCodes({ ...codes, staff: codes.staff.map((x, idx) => idx === i ? { ...x, code: dig4(e.target.value) } : x) })} /></div>)}
            {workshops.map((w, i) => <div className="crow" key={w.id}><span>{w.name}</span><input className="code-edit" inputMode="numeric" value={w.code} onChange={(e) => writeWs(workshops.map((x, idx) => idx === i ? { ...x, code: dig4(e.target.value) } : x))} /></div>)}
          </div>
        </div>
      </>
    );
  }

  const Header = ({ sub, right }) => (
    <div className="appbar"><div className="appbar-in">
      <div className="brand"><span className="logo">م</span><div><div className="bn">كُن ماهراً <span className="amp">·</span> سالزبيري</div><div className="bs">{sub || "لوحة الأسبوع"}</div></div></div>
      <div className="abright">{right}</div>
    </div></div>
  );

  if (loading) return <div className="root" dir="rtl"><style>{CSS}</style><div className="center muted">جارٍ التحميل…</div></div>;

  if (screen === "landing") return (
    <div className="root" dir="rtl"><style>{CSS}</style>
      <Header sub="برنامج الأنشطة الأسبوعي" right={<button className="btn glass" onClick={() => { reset(); setScreen("code"); }}><KeyRound size={16} /> دخول الفريق</button>} />
      <div className="wrap">{parentGid ? ParentDetail(parentGid) : ParentsLanding()}</div>
      {toast && <div className="toast">{toast}</div>}
    </div>
  );

  if (screen === "code") return (
    <div className="root" dir="rtl"><style>{CSS}</style>
      <div className="center"><div className="login">
        <div className="brand big"><span className="logo">م</span><div><div className="bn">كُن ماهراً <span className="amp">·</span> سالزبيري</div><div className="bs">تسجيل الدخول</div></div></div>
        <p className="muted" style={{ margin: "14px 0 16px" }}>أدخل الكود الخاص بك (مشرف، منسّق، أو كابتن/ورشة). الدخول تلقائي بعد ٤ أرقام.</p>
        <input className="code-inp" inputMode="numeric" autoFocus placeholder="• • • •" value={codeInput} onChange={(e) => { const v = dig4(e.target.value); setCodeInput(v); setCodeMsg(""); if (v.length === 4) tryCode(v); }} />
        {codeMsg && <div className="err" style={{ marginTop: 12 }}>{codeMsg}</div>}
        <div className="login-actions"><button className="btn ghost" onClick={() => { reset(); setScreen("landing"); }}><ArrowRight size={16} /> رجوع</button></div>
      </div></div>
    </div>
  );

  if (screen === "supSelect") return (
    <div className="root" dir="rtl"><style>{CSS}</style>
      <Header sub="اختر مجموعتك" right={<button className="btn glass" onClick={logout}><LogOut size={16} /> خروج</button>} />
      <div className="wrap"><div className="ch" style={{ marginBottom: 12 }}><Users size={16} style={{ verticalAlign: "-3px" }} /> اختر مجموعتك للدخول</div>
        <div className="ggrid">{GROUPS.map((g) => <button key={g.id} className="gbtn" onClick={() => enterGroup(g.id)}><div className="gn">مجموعة {g.name}</div><div className="gs2">{g.stage}</div></button>)}</div>
      </div>
    </div>
  );

  if (screen === "sup") { const g = GBY[groupId]; return (
    <div className="root" dir="rtl"><style>{CSS}</style>
      <Header sub={"مجموعة " + g.name + " · " + g.stage} right={<><button className="btn glass" onClick={() => setScreen("supSelect")}><Users size={16} /> تبديل المجموعة</button><button className="btn glass" onClick={logout}><LogOut size={16} /> خروج</button></>} />
      <div className="wrap">{Editor(groupId, false)}</div>
      {toast && <div className="toast">{toast}</div>}
    </div>
  ); }

  if (screen === "coord") return (
    <div className="root" dir="rtl"><style>{CSS}</style>
      <Header sub="المنسّق — إدارة كاملة" right={<button className="btn glass" onClick={logout}><LogOut size={16} /> خروج</button>} />
      <div className="wrap">
        <div className="tabs">
          <button className={"tab" + (coTab === "board" ? " on" : "")} onClick={() => setCoTab("board")}><LayoutGrid size={15} /> الجدول العام</button>
          <button className={"tab" + (coTab === "approvals" ? " on" : "")} onClick={() => setCoTab("approvals")}><Inbox size={15} /> الاعتمادات</button>
          <button className={"tab" + (coTab === "groups" ? " on" : "")} onClick={() => setCoTab("groups")}><Pencil size={15} /> المجموعات</button>
          <button className={"tab" + (coTab === "set" ? " on" : "")} onClick={() => setCoTab("set")}><Settings size={15} /> الإعدادات</button>
        </div>
        {coTab === "board" ? OverviewBoard(boardDay) : coTab === "approvals" ? Approvals() : coTab === "groups" ? CoordGroups() : CoordSettings()}
      </div>
      {toast && <div className="toast">{toast}</div>}
    </div>
  );

  if (screen === "staff") return (
    <div className="root" dir="rtl"><style>{CSS}</style>
      <Header sub={staffCtx.label} right={<button className="btn glass" onClick={logout}><LogOut size={16} /> خروج</button>} />
      <div className="wrap">{StaffView()}</div>
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
  return null;
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Readex+Pro:wght@400;500;600;700&family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&display=swap');
:root{ --p1:#7B3FA0; --p2:#5C2D80; --orange:#F5A623; --pink:#C8529A; --ink:#2D1B4E; --bg:#F4EFFA; --line:#EBE3F4; --tint:#F3EDFA; --muted:#8B82A3; --green:#1E9E6A; --green-bg:#E6F7EF; --amber:#9A6212; --amber-bg:#FEF1DA; --danger:#C0392B; --danger-bg:#FCEAE8; }
*{ box-sizing:border-box; }
.root{ background:var(--bg); min-height:100vh; color:var(--ink); font-family:'IBM Plex Sans Arabic','Readex Pro','Segoe UI',Tahoma,sans-serif; }
.muted{ color:var(--muted); font-size:13px; }
.center{ min-height:100vh; display:flex; align-items:center; justify-content:center; padding:20px; }
code{ direction:ltr; }
.appbar{ background:linear-gradient(135deg,var(--p1),var(--p2)); color:#fff; box-shadow:0 10px 30px rgba(92,45,128,.25); }
.appbar-in{ max-width:1120px; margin:0 auto; padding:14px 18px; display:flex; align-items:center; justify-content:space-between; gap:12px; flex-wrap:wrap; }
.brand{ display:flex; align-items:center; gap:11px; } .brand.big{ justify-content:center; }
.logo{ width:40px; height:40px; border-radius:12px; background:rgba(255,255,255,.18); display:grid; place-items:center; font-family:'Readex Pro',sans-serif; font-weight:700; font-size:21px; flex:0 0 auto; }
.center .logo,.login .logo{ background:linear-gradient(135deg,var(--p1),var(--p2)); color:#fff; }
.bn{ font-family:'Readex Pro',sans-serif; font-weight:700; font-size:18px; line-height:1.2; }
.center .bn,.login .bn{ color:var(--ink); }
.amp{ color:var(--orange); }
.bs{ font-size:12px; opacity:.85; } .center .bs,.login .bs{ color:var(--muted); opacity:1; }
.abright{ display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
.wrap{ max-width:1120px; margin:0 auto; padding:18px; }
.btn{ font:inherit; cursor:pointer; border-radius:11px; border:1px solid var(--line); background:#fff; color:var(--ink); padding:9px 15px; min-height:42px; display:inline-flex; align-items:center; gap:7px; transition:all .14s; }
.btn:hover{ background:#F4F0FA; } .btn:disabled{ opacity:.5; cursor:not-allowed; }
.btn.primary{ background:var(--p1); border-color:var(--p1); color:#fff; } .btn.primary:hover{ background:var(--p2); }
.btn.primary:disabled:hover{ background:var(--p1); }
.btn.ghost{ background:transparent; }
.btn.glass{ background:rgba(255,255,255,.16); border:none; color:#fff; } .btn.glass:hover{ background:rgba(255,255,255,.26); }
.btn.big{ font-size:15px; padding:12px 22px; min-height:50px; border-radius:13px; }
.btn:focus-visible,.tab:focus-visible,.chip:focus-visible,.gbtn:focus-visible,.pgcard:focus-visible,.switch:focus-visible,.seg button:focus-visible,.inp:focus-visible,.code-inp:focus-visible,.code-edit:focus-visible,.back:focus-visible{ outline:2px solid var(--p1); outline-offset:2px; }
.icon{ border:none; background:rgba(0,0,0,.05); border-radius:8px; width:32px; height:32px; cursor:pointer; display:grid; place-items:center; color:var(--ink); } .icon.danger{ color:var(--danger); }
.inp{ font:inherit; padding:9px 11px; border-radius:10px; border:1px solid var(--line); min-height:42px; background:#fff; color:var(--ink); }
.inp.full{ width:100%; margin-top:8px; } .inp.num{ width:62px; } .inp.auto{ width:auto; }
.login{ background:#fff; border:1px solid var(--line); border-radius:22px; padding:30px; max-width:430px; width:100%; box-shadow:0 18px 44px rgba(92,45,128,.14); }
.code-inp{ width:100%; text-align:center; font-size:30px; letter-spacing:14px; padding:14px; border-radius:14px; border:2px solid var(--line); background:var(--tint); color:var(--ink); font-family:'Readex Pro',sans-serif; }
.code-edit{ width:88px; text-align:center; font-family:'Readex Pro',sans-serif; font-weight:600; letter-spacing:3px; direction:ltr; padding:7px 8px; border-radius:9px; border:1.5px solid var(--line); background:var(--tint); color:var(--p2); font-size:15px; }
.login-actions{ display:flex; gap:10px; margin-top:18px; } .login-actions .btn{ flex:1; justify-content:center; }
.tabs{ display:flex; gap:8px; margin-bottom:16px; flex-wrap:wrap; }
.tab{ border:1px solid var(--line); background:#fff; border-radius:999px; padding:9px 16px; cursor:pointer; font:inherit; font-size:13px; display:inline-flex; align-items:center; gap:6px; color:var(--ink); }
.tab.on{ background:var(--p1); border-color:var(--p1); color:#fff; box-shadow:0 8px 20px rgba(123,63,160,.26); }
.ggrid{ display:grid; grid-template-columns:repeat(auto-fill,minmax(150px,1fr)); gap:10px; }
.gbtn{ text-align:right; border:1px solid var(--line); border-radius:14px; padding:14px; background:#fff; cursor:pointer; transition:all .14s; }
.gbtn:hover{ border-color:var(--p1); background:var(--tint); transform:translateY(-1px); }
.gn{ font-weight:600; } .gs2{ font-size:12px; color:var(--muted); margin-top:3px; }
.card{ background:#fff; border:1px solid var(--line); border-radius:18px; padding:16px; margin-bottom:16px; box-shadow:0 6px 20px rgba(123,63,160,.05); }
.ch{ font-family:'Readex Pro',sans-serif; font-weight:600; color:var(--p2); font-size:15px; }
.statusbar{ display:flex; align-items:center; gap:12px; flex-wrap:wrap; }
.submit-card{ text-align:center; }
.coordnote{ display:flex; align-items:center; gap:8px; color:var(--p2); background:var(--tint); font-size:13.5px; } .coordnote svg{ flex:0 0 auto; }
.stat{ font-size:13px; font-weight:600; padding:6px 14px; border-radius:999px; }
.stat.draft{ background:#EEE9F4; color:var(--muted); } .stat.pending{ background:var(--amber-bg); color:var(--amber); } .stat.approved{ background:var(--green-bg); color:var(--green); }
.ministat{ font-size:10.5px; font-weight:600; padding:2px 8px; border-radius:999px; margin-inline-start:auto; }
.ministat.draft{ background:#EEE9F4; color:var(--muted); } .ministat.pending{ background:var(--amber-bg); color:var(--amber); } .ministat.approved{ background:var(--green-bg); color:var(--green); }
.rules-btn{ width:100%; display:flex; justify-content:space-between; align-items:center; background:none; border:none; font:inherit; color:var(--ink); cursor:pointer; padding:0; }
.rules-btn span{ display:inline-flex; align-items:center; gap:6px; }
.rules{ margin-top:12px; }
.rule{ display:flex; gap:8px; align-items:flex-start; font-size:13px; line-height:1.6; padding:4px 0; } .rule svg{ flex:0 0 auto; margin-top:2px; color:var(--p1); }
.pills{ display:flex; gap:8px; flex-wrap:wrap; margin-bottom:14px; }
.pill{ display:inline-flex; align-items:center; gap:6px; font-size:13px; padding:7px 14px; border-radius:999px; }
.pill.ok{ background:var(--green-bg); color:var(--green); } .pill.warn{ background:var(--amber-bg); color:var(--amber); }
.week{ display:grid; grid-template-columns:repeat(3,1fr); gap:16px; }
@media (max-width:860px){ .week{ grid-template-columns:1fr; } }
.daycol{ display:flex; flex-direction:column; gap:10px; }
.dayhead{ font-family:'Readex Pro',sans-serif; font-weight:700; color:var(--p2); background:var(--tint); border-radius:12px; padding:10px; text-align:center; font-size:14px; display:flex; align-items:center; justify-content:center; gap:8px; flex-wrap:wrap; }
.need{ background:var(--amber-bg); color:var(--amber); border-radius:999px; padding:2px 9px; font-size:11px; font-weight:600; }
.subbar{ display:flex; align-items:center; justify-content:space-between; gap:8px; padding:10px 12px; border:1px solid var(--line); border-radius:12px; background:#fff; }
.sublabel{ display:flex; align-items:center; gap:7px; font-size:13px; } .sublabel svg{ color:var(--orange); }
.switch{ position:relative; width:46px; height:26px; border-radius:999px; background:#d9d2e6; border:none; cursor:pointer; transition:background .15s; flex:0 0 auto; }
.switch.on{ background:var(--orange); }
.switch span{ position:absolute; top:3px; right:3px; width:20px; height:20px; border-radius:50%; background:#fff; transition:right .15s; box-shadow:0 1px 3px rgba(0,0,0,.2); }
.switch.on span{ right:23px; }
.ribbon{ display:flex; align-items:center; gap:7px; background:var(--amber-bg); color:var(--amber); border:1px solid #F3D79A; border-radius:12px; padding:9px 12px; font-size:13px; }
.slot{ background:#fff; border:1px solid var(--line); border-radius:14px; padding:12px; }
.slot.mand{ background:var(--tint); border-color:#DFD2EF; }
.slot-h{ display:flex; align-items:center; justify-content:space-between; gap:8px; }
.time{ direction:ltr; unicode-bidi:isolate; font-variant-numeric:tabular-nums; color:var(--muted); font-size:12px; font-weight:600; }
.slot-tag{ font-size:12px; color:var(--muted); } .slot-n{ margin-top:8px; font-weight:600; } .slot-a{ margin-top:2px; color:var(--p1); font-weight:600; font-size:14px; }
.bmand{ font-size:11px; color:var(--p2); display:inline-flex; align-items:center; gap:4px; background:#fff; border:1px solid #DFD2EF; padding:2px 8px; border-radius:999px; }
.chips{ display:flex; flex-wrap:wrap; gap:7px; margin-top:10px; }
.chip{ border:1.5px solid var(--line); background:#fff; color:var(--ink); border-radius:999px; padding:7px 13px; font:inherit; font-size:12.5px; cursor:pointer; transition:all .12s; }
.chip:hover:not(:disabled){ border-color:var(--p1); } .chip:disabled{ opacity:.4; cursor:not-allowed; }
.chip.sel{ background:var(--p1); border-color:var(--p1); color:#fff; box-shadow:0 5px 14px rgba(123,63,160,.28); }
.chip.ws{ border-color:#F0C078; color:var(--amber); } .chip.ws.sel{ background:var(--orange); border-color:var(--orange); color:#fff; box-shadow:0 5px 14px rgba(245,166,35,.32); }
.chip.sp{ border-color:#E6A9CE; color:var(--pink); } .chip.sp.sel{ background:var(--pink); border-color:var(--pink); color:#fff; }
.chip.mn{ border-color:#C9B3E0; color:var(--p2); } .chip.mn.sel{ background:var(--p2); border-color:var(--p2); color:#fff; }
.custom{ margin-top:2px; }
.err{ color:var(--danger); font-size:12px; margin-top:8px; background:var(--danger-bg); padding:7px 9px; border-radius:8px; line-height:1.5; }
.seg{ display:inline-flex; border:1px solid var(--line); border-radius:999px; overflow:hidden; background:#fff; margin-bottom:14px; }
.seg.pdview{ margin-top:2px; }
.seg button{ border:none; background:transparent; padding:9px 20px; cursor:pointer; font:inherit; color:var(--ink); } .seg button.on{ background:var(--p1); color:#fff; }
.banner{ border-radius:12px; padding:10px 14px; font-size:13px; margin-bottom:14px; display:flex; align-items:center; gap:8px; }
.banner.bad{ background:var(--danger-bg); border:1px solid #EFC3BD; color:#8a2c20; } .banner.ok{ background:var(--green-bg); border:1px solid #BFE6D3; color:var(--green); }
.bsec{ margin-bottom:18px; } .bsec-t{ font-family:'Readex Pro',sans-serif; font-weight:700; color:var(--p2); margin-bottom:10px; font-size:15px; }
.bgrid{ display:grid; grid-template-columns:repeat(auto-fill,minmax(235px,1fr)); gap:12px; }
.bcard{ background:#fff; border:1px solid var(--line); border-radius:14px; overflow:hidden; }
.bcard-h{ background:var(--tint); color:var(--p2); font-weight:600; padding:9px 12px; font-size:14px; display:flex; align-items:center; gap:8px; }
.brow{ display:flex; gap:10px; padding:7px 12px; border-top:1px solid var(--line); font-size:13px; align-items:baseline; } .brow.ov{ background:var(--danger-bg); }
.btime{ direction:ltr; unicode-bidi:isolate; color:var(--muted); font-size:11px; font-weight:600; flex:0 0 auto; }
.bact{ font-weight:500; } .bsub{ color:var(--orange); font-style:normal; font-size:11px; } .bfac{ color:var(--p1); font-style:normal; font-size:11px; }
.parents-note{ background:#fff; border:1px solid var(--line); border-radius:14px; padding:13px 16px; font-size:14px; color:var(--p2); margin-bottom:16px; font-weight:500; }
.pgcard{ position:relative; text-align:center; border:1px solid var(--line); border-radius:18px; padding:18px 12px; background:#fff; cursor:pointer; transition:all .15s; display:flex; flex-direction:column; align-items:center; gap:6px; }
.pgcard:hover{ border-color:var(--p1); transform:translateY(-2px); box-shadow:0 12px 26px rgba(123,63,160,.12); }
.pg-emoji{ font-size:34px; line-height:1; }
.pg-badge{ font-size:11px; font-weight:600; padding:3px 10px; border-radius:999px; margin-top:2px; }
.pg-badge.ok{ background:var(--green-bg); color:var(--green); } .pg-badge.wait{ background:var(--amber-bg); color:var(--amber); }
.back{ display:inline-flex; align-items:center; gap:6px; border:none; background:none; color:var(--p1); font:inherit; font-size:14px; cursor:pointer; padding:4px 0; margin-bottom:12px; }
.pd-head{ display:flex; align-items:center; gap:14px; background:linear-gradient(135deg,var(--p1),var(--p2)); color:#fff; border-radius:18px; padding:18px 20px; margin-bottom:16px; }
.pd-emoji{ font-size:40px; line-height:1; }
.pd-name{ font-family:'Readex Pro',sans-serif; font-weight:700; font-size:20px; }
.pd-stage{ font-size:13px; opacity:.9; margin-top:2px; }
.pd-wait{ text-align:center; padding:40px 20px; background:#fff; border:1px solid var(--line); border-radius:18px; }
.pd-wait-emoji{ font-size:46px; } .pd-wait-t{ font-family:'Readex Pro',sans-serif; font-weight:700; color:var(--p2); font-size:18px; margin:10px 0 6px; }
.pd-list{ display:flex; flex-direction:column; gap:10px; }
.pd-item{ display:flex; align-items:center; gap:14px; background:#fff; border:1px solid var(--line); border-radius:14px; padding:14px 16px; box-shadow:0 4px 14px rgba(123,63,160,.05); }
.pd-item.full{ gap:12px; }
.pd-time{ direction:ltr; unicode-bidi:isolate; font-variant-numeric:tabular-nums; color:var(--p2); font-weight:600; font-size:12px; background:var(--tint); padding:5px 9px; border-radius:8px; flex:0 0 auto; }
.pd-i-emoji{ font-size:26px; line-height:1; width:34px; text-align:center; flex:0 0 auto; }
.pd-i-name{ font-weight:600; font-size:15.5px; color:var(--ink); }
.pd-place{ display:inline-flex; align-items:center; gap:4px; margin-inline-start:auto; color:var(--p1); font-size:12.5px; font-weight:600; background:var(--tint); padding:5px 10px; border-radius:999px; flex:0 0 auto; }
.staff-h{ display:flex; align-items:center; gap:8px; font-family:'Readex Pro',sans-serif; font-weight:600; color:var(--p2); font-size:16px; margin-bottom:8px; }
.staff-day{ margin-top:12px; } .staff-day-t{ font-weight:600; color:var(--p2); margin-bottom:6px; font-size:14px; }
.staff-row{ display:flex; gap:12px; align-items:center; padding:10px 12px; border:1px solid var(--line); border-radius:10px; margin-bottom:6px; font-size:13px; flex-wrap:wrap; }
.staff-g{ font-weight:600; } .staff-a{ color:var(--p1); }
.staff-p{ display:inline-flex; align-items:center; gap:4px; margin-inline-start:auto; color:var(--p2); font-weight:600; background:var(--tint); padding:4px 10px; border-radius:999px; }
.li{ display:flex; justify-content:space-between; align-items:center; gap:10px; padding:10px 0; border-bottom:1px solid var(--line); } .li b{ font-weight:600; }
.form{ display:flex; flex-wrap:wrap; gap:8px; align-items:flex-end; margin-top:12px; }
.fl{ display:flex; flex-direction:column; gap:4px; font-size:12px; color:var(--muted); }
.extslots{ display:flex; flex-wrap:wrap; gap:7px; }
.chipsrow{ display:flex; flex-wrap:wrap; gap:8px; align-items:center; margin-top:10px; }
.tag{ background:var(--tint); color:var(--p2); border-radius:999px; padding:6px 6px 6px 12px; display:inline-flex; align-items:center; gap:8px; font-size:13px; }
.tag button{ border:none; background:rgba(0,0,0,.08); border-radius:50%; width:19px; height:19px; cursor:pointer; display:grid; place-items:center; color:inherit; }
.codes{ margin-top:10px; } .crow{ display:flex; justify-content:space-between; align-items:center; gap:10px; padding:8px 0; border-bottom:1px solid var(--line); font-size:13px; }
.toast{ position:fixed; bottom:18px; left:50%; transform:translateX(-50%); background:var(--p2); color:#fff; padding:10px 16px; border-radius:999px; font-size:13px; box-shadow:0 8px 24px rgba(0,0,0,.25); z-index:50; }
@media (prefers-reduced-motion:reduce){ *{ animation:none !important; transition:none !important; } }
`;
