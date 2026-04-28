import { API_BASE_URL } from "../services/api.js";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const DARK = {
  base: "#09090b", s1: "rgba(18, 18, 23, 0.75)", s2: "rgba(24, 24, 27, 0.65)", s3: "rgba(39, 39, 42, 0.5)", s4: "rgba(63, 63, 70, 0.4)", s5: "#52525b",
  b1: "rgba(255,255,255,0.06)", b2: "rgba(255,255,255,0.1)", b3: "rgba(255,255,255,0.15)",
  t1: "#f4f4f5", t2: "#a1a1aa", t3: "#71717a", t4: "#52525b",
  accent: "#8b5cf6", aLt: "#a78bfa", aBg: "rgba(139,92,246,0.15)", aBdr: "rgba(139,92,246,0.3)",
  green: "#10b981", gBg: "rgba(16,185,129,0.10)", gBdr: "rgba(16,185,129,0.25)",
  amber: "#f59e0b", amBg: "rgba(245,158,11,0.10)", amBdr: "rgba(245,158,11,0.22)",
  red: "#ef4444", rBg: "rgba(239,68,68,0.10)",
  purple: "#d946ef",
  shadow: "0 24px 60px rgba(0,0,0,0.5)",
};
const LIGHT = {
  base: "#f1f1f7", s1: "#ffffff", s2: "#f7f7fc", s3: "#eeeeF6", s4: "#e5e5f0", s5: "#d8d8ec",
  b1: "#e0e0ee", b2: "#ccccde", b3: "#b0b0cc",
  t1: "#13131e", t2: "#40405a", t3: "#707088", t4: "#a0a0b8",
  accent: "#4f46e5", aLt: "#4338ca", aBg: "rgba(79,70,229,0.09)", aBdr: "rgba(79,70,229,0.22)",
  green: "#059669", gBg: "rgba(5,150,105,0.08)", gBdr: "rgba(5,150,105,0.2)",
  amber: "#d97706", amBg: "rgba(217,119,6,0.08)", amBdr: "rgba(217,119,6,0.2)",
  red: "#dc2626", rBg: "rgba(220,38,38,0.08)",
  purple: "#7c3aed",
  shadow: "0 20px 60px rgba(0,0,0,0.12)",
};

const I = {
  logo: <svg viewBox="0 0 20 20" fill="none"><rect x="2" y="2" width="7" height="7" rx="2" fill="currentColor" fillOpacity="0.95" /><rect x="11" y="2" width="7" height="7" rx="2" fill="currentColor" fillOpacity="0.95" /><rect x="2" y="11" width="7" height="7" rx="2" fill="currentColor" fillOpacity="0.95" /><rect x="11" y="11" width="7" height="7" rx="2" fill="currentColor" fillOpacity="0.45" /></svg>,
  files: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z" /><polyline points="13 2 13 9 20 9" /></svg>,
  search: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>,
  sett: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" /></svg>,
  logout: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>,
  moon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" /></svg>,
  sun: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>,
  folder: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" /></svg>,
  lock: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>,
  arrow: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>,
  plus: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>,
  globe: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20" /></svg>,
  chev: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>,
  user: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>,
  users: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" /></svg>,
  x: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>,
  code: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>,
};

const LANG_ICON = { python: "🐍", cpp: "⚡", java: "☕", default: "📄" };
const NAV = [
  { id: "files", icon: I.files, tip: "Explorer" },
  { id: "search", icon: I.search, tip: "Search" },
];

/* Online Users Modal */
function OnlineUsersModal({ C, doc, token, currentUser, onClose }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`${API_BASE_URL}/documents/${doc.id}/collaborators`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (r.ok) {
          const data = await r.json();
          // FIX 1: The API returns roles from DB correctly.
          // doc.owner_id or the first user in the list is the owner.
          // If roles are all "member" from DB, detect owner by checking doc metadata.
          // The document creator is always shown as "owner".
          const enriched = data.map(m => ({
            ...m,
            // If the API already returned a real role, use it.
            // If everyone shows "member", check if this user owns the doc.
            role: m.role && m.role !== "member" ? m.role
              // Fallback: if doc has owner_username field, use that
              : (doc.owner_username === m.username || doc.created_by === m.username)
                ? "owner" : "member"
          }));
          setMembers(enriched);
        } else {
          // Fallback: treat currentUser as owner
          setMembers([{ username: currentUser, role: "owner", email: "" }]);
        }
      } catch {
        setMembers([{ username: currentUser, role: "owner", email: "" }]);
      }
      setLoading(false);
    })();
  }, [doc.id]);

  const roleColor = role => role === "owner" ? C.amber : C.green;
  const initials = name => (name || "?").slice(0, 2).toUpperCase();
  const gradients = ["#6366f1,#8b5cf6", "#10b981,#3b82f6", "#f59e0b,#ef4444", "#ec4899,#8b5cf6", "#06b6d4,#10b981"];

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", zIndex: 4000, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(6px)" }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ width: 400, background: "rgba(24,24,27,0.85)", backdropFilter: "blur(16px)", border: `1px solid rgba(255,255,255,0.08)`, borderRadius: 16, boxShadow: C.shadow, overflow: "hidden", animation: "sup .3s cubic-bezier(0.16, 1, 0.3, 1)" }}>
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.b1}`, display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(255,255,255,0.03)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 700, color: C.t1 }}>
            <span style={{ width: 16, height: 16, display: "flex", color: C.accent }}>{I.users}</span>
            Session Members — {doc.title}
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: C.t3, cursor: "pointer", fontSize: 20, lineHeight: 1, borderRadius: 5, padding: "2px 8px" }}
            onMouseEnter={e => e.currentTarget.style.color = C.t1} onMouseLeave={e => e.currentTarget.style.color = C.t3}>×</button>
        </div>
        <div style={{ padding: "16px 20px" }}>
          {loading
            ? <div style={{ textAlign: "center", color: C.t3, padding: "24px 0", fontSize: 13 }}>Loading members…</div>
            : members.length === 0
              ? <div style={{ textAlign: "center", color: C.t3, padding: "24px 0", fontSize: 13 }}>No members found.</div>
              : members.map((m, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", background: C.s3, borderRadius: 9, border: `1px solid ${C.b1}`, marginBottom: 8 }}>
                  <div style={{ width: 38, height: 38, borderRadius: "50%", background: `linear-gradient(135deg,${gradients[i % gradients.length]})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                    {initials(m.username)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.t1 }}>{m.username || "Unknown"}
                      {m.username === currentUser && <span style={{ marginLeft: 6, fontSize: 10, color: C.t3 }}>(you)</span>}
                    </div>
                    <div style={{ fontSize: 11, color: C.t3, marginTop: 1 }}>{m.email || ""}</div>
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 600, color: roleColor(m.role), background: m.role === "owner" ? C.amBg : C.gBg, border: `1px solid ${m.role === "owner" ? C.amBdr : C.gBdr}`, borderRadius: 10, padding: "2px 9px", textTransform: "uppercase", letterSpacing: "0.06em" }}>{m.role || "editor"}</span>
                </div>
              ))
          }
          <div style={{ marginTop: 12, padding: "10px 14px", background: C.s3, borderRadius: 9, border: `1px dashed ${C.b2}`, fontSize: 12, color: C.t3, textAlign: "center" }}>
            Share invite code <span style={{ fontFamily: "monospace", color: C.amber, fontWeight: 700 }}>{doc.invite_code}</span> to add collaborators
          </div>
        </div>
      </div>
    </div>
  );
}

/* Settings Modal */
function SettingsModal({ C, onClose, isDark, setIsDark }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 3000, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(6px)" }} onClick={onClose}>
      <div style={{ width: 420, background: "rgba(24,24,27,0.85)", backdropFilter: "blur(16px)", border: `1px solid rgba(255,255,255,0.08)`, borderRadius: 16, boxShadow: C.shadow, overflow: "hidden", animation: "sup .3s cubic-bezier(0.16, 1, 0.3, 1)" }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.b1}`, display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(255,255,255,0.03)" }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: C.t1 }}>⚙️ Preferences</span>
          <button onClick={onClose} style={{ background: "none", border: "none", color: C.t3, cursor: "pointer", fontSize: 20 }}>×</button>
        </div>
        <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 2 }}>
          {[
            {
              l: "Theme", d: "Switch dark / light mode",
              node: <div onClick={() => setIsDark(p => !p)} style={{ width: 44, height: 24, borderRadius: 12, background: isDark ? C.accent : C.s4, cursor: "pointer", position: "relative", transition: "background .2s", border: `1px solid ${isDark ? C.accent : C.b2}` }}>
                <div style={{ position: "absolute", top: 2, left: isDark ? 22 : 2, width: 18, height: 18, borderRadius: 9, background: "#fff", transition: "left .2s", boxShadow: "0 1px 4px rgba(0,0,0,.3)" }} />
              </div>
            },
            { l: "Languages", d: "Python · C++ · Java supported", node: <span style={{ fontSize: 12, color: C.t3, fontFamily: "monospace" }}>3 languages</span> },
            { l: "AI", d: "Gemini 2.0 Flash — code completions", node: <span style={{ fontSize: 12, color: C.green }}>● Connected</span> },
            { l: "Auto-save", d: "Code saved every 5 edits", node: <span style={{ fontSize: 12, color: C.green }}>● Active</span> },
          ].map(({ l, d, node }) => (
            <div key={l} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 0", borderBottom: `1px solid ${C.b1}` }}>
              <div><div style={{ fontSize: 13, fontWeight: 600, color: C.t1, marginBottom: 3 }}>{l}</div><div style={{ fontSize: 11.5, color: C.t3 }}>{d}</div></div>
              {node}
            </div>
          ))}
        </div>
        <div style={{ padding: "12px 20px 18px", display: "flex", justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ padding: "8px 24px", background: C.accent, color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Close</button>
        </div>
      </div>
    </div>
  );
}

/* Profile Modal */
function ProfileModal({ C, username, docs, onClose, onLogout }) {
  const ini = username.slice(0, 2).toUpperCase();
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 3000, display: "flex", alignItems: "flex-start", justifyContent: "flex-end", padding: "48px 16px 0", backdropFilter: "blur(4px)" }} onClick={onClose}>
      <div style={{ width: 280, background: "rgba(24,24,27,0.85)", backdropFilter: "blur(16px)", border: `1px solid rgba(255,255,255,0.08)`, borderRadius: 16, boxShadow: C.shadow, overflow: "hidden", animation: "sup .3s cubic-bezier(0.16, 1, 0.3, 1)" }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: "22px 18px 16px", background: `linear-gradient(135deg,rgba(139,92,246,0.1),transparent)`, borderBottom: `1px solid ${C.b1}` }}>
          <div style={{ width: 48, height: 48, borderRadius: "50%", background: `linear-gradient(135deg,${C.accent},${C.purple || "#8b5cf6"})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700, color: "#fff", marginBottom: 10 }}>{ini}</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.t1, marginBottom: 2 }}>{username}</div>
          <div style={{ fontSize: 11, color: C.t3, fontFamily: "monospace" }}>@{username.toLowerCase()}</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, background: C.b1 }}>
          {[{ l: "Projects", v: docs.length }, { l: "Status", v: "Active" }].map(({ l, v }) => (
            <div key={l} style={{ background: C.s2, padding: "10px 8px", textAlign: "center" }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.accent, marginBottom: 1 }}>{v}</div>
              <div style={{ fontSize: 10, color: C.t4, textTransform: "uppercase", letterSpacing: "0.08em" }}>{l}</div>
            </div>
          ))}
        </div>
        <div style={{ padding: "10px 16px 14px" }}>
          <button onClick={onLogout} style={{ width: "100%", padding: "8px 0", background: C.rBg, color: C.red, border: `1px solid ${C.red}33`, borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <span style={{ width: 14, height: 14, display: "flex" }}>{I.logout}</span> Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [docs, setDocs] = useState([]);
  const [inviteCode, setInviteCode] = useState("");
  const [joining, setJoining] = useState(false);
  const [creating, setCreating] = useState(false);
  const [activeNav, setActiveNav] = useState("files");
  const [isDark, setIsDark] = useState(true);
  const [searchQ, setSearchQ] = useState("");
  const [showProfile, setShowProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [onlineModal, setOnlineModal] = useState(null);
  const navigate = useNavigate();
  const username = localStorage.getItem("username") || "Developer";
  const token = localStorage.getItem("token");
  const C = isDark ? DARK : LIGHT;
  const initials = username.slice(0, 2).toUpperCase();

  useEffect(() => { fetchDocs(); }, []);

  const fetchDocs = async () => {
    try {
      const r = await fetch(`${API_BASE_URL}/documents/`, { headers: { Authorization: `Bearer ${token}` } });
      if (r.ok) {
        const data = await r.json();
        setDocs(data);

        // Prune stale localStorage preferences for documents no longer in the list
        const validDocIds = new Set(data.map(d => String(d.id)));
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith("visionai_lang_")) {
            const docId = key.replace("visionai_lang_", "");
            if (!validDocIds.has(docId)) keysToRemove.push(key);
          }
        }
        keysToRemove.forEach(k => localStorage.removeItem(k));
      }
    } catch (e) { console.error(e); }
  };

  const createSession = async () => {
    // FIX 2: Get title, cancel if user dismisses
    const title = prompt("Project Name:", "New Project");
    if (!title || !title.trim()) return; // user cancelled or left blank

    // Ask for language — cancel means don't create the project
    const langInput = prompt("Select Language:\n  python\n  cpp\n  java", "python");
    if (langInput === null) return; // user clicked Cancel — don't create

    // Validate — if they typed something invalid, default to python
    const lang = ["python", "cpp", "java"].includes(langInput.trim().toLowerCase())
      ? langInput.trim().toLowerCase()
      : "python";

    setCreating(true);
    try {
      const r = await fetch(`${API_BASE_URL}/documents/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title: title.trim(), language: lang })
      });
      if (r.ok) fetchDocs();
    } catch (e) { console.error(e); }
    setCreating(false);
  };

  const joinSession = async () => {
    if (!inviteCode) return; setJoining(true);
    try {
      const r = await fetch(`${API_BASE_URL}/documents/join`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ invite_code: inviteCode }) });
      if (r.ok) { const d = await r.json(); navigate(`/editor/${d.id}`); } else alert("Invalid invite code");
    } catch (e) { console.error(e); }
    setJoining(false);
  };

  const handleLogout = () => { localStorage.clear(); navigate("/login"); };
  const filtered = docs.filter(d => d.title?.toLowerCase().includes(searchQ.toLowerCase()) || d.invite_code?.toLowerCase().includes(searchQ.toLowerCase()));

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    html,body,#root{height:100%}
    body{font-family:'Inter',sans-serif;background:${C.base};color:${C.t1};-webkit-font-smoothing:antialiased;background-image: radial-gradient(circle at top right, rgba(139,92,246,0.08) 0%, transparent 40%), radial-gradient(circle at bottom left, rgba(16,185,129,0.05) 0%, transparent 40%); background-size: cover; background-attachment: fixed;}
    ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-track{background:transparent} ::-webkit-scrollbar-thumb{background:${C.b2};border-radius:4px}
    @keyframes pulse{0%,100%{opacity:1}50%{opacity:.35}}
    @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
    @keyframes sup{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:none}}
    .sb{transition:all .14s!important;cursor:pointer}
    .sb:hover{background:${C.s4}!important;color:${C.t1}!important}
    .sb.act{background:${C.aBg}!important;color:${C.aLt}!important;border-right:2px solid ${C.accent}!important}
    .sb.dng:hover{background:${C.rBg}!important;color:${C.red}!important}
    .card{transition:all .16s!important}
    .card:hover{border-color:${C.aBdr}!important;background:${C.s3}!important;transform:translateY(-2px);box-shadow:0 8px 32px rgba(0,0,0,.3)!important}
    .card:hover .cbar{opacity:1!important}
    .card:hover .carr{opacity:1!important;transform:translateX(0)!important;color:${C.aLt}!important}
    .nbtn:hover{filter:brightness(1.1)} .nbtn:active{transform:scale(.97)}
    .jbtn:hover{background:${C.aBg}!important;color:${C.aLt}!important}
    .onl:hover{background:${C.aBg}!important;cursor:pointer}
    input:focus{outline:none!important;border-color:${C.aBdr}!important}
  `;

  const renderPanel = () => {
    if (activeNav === "search") return (
      <div style={{ padding: "16px 14px" }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: C.t3, marginBottom: 10 }}>SEARCH</div>
        <input autoFocus value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="Search projects…"
          style={{ width: "100%", background: C.s4, border: `1px solid ${C.b2}`, borderRadius: 7, padding: "8px 11px", color: C.t1, fontSize: 12, outline: "none", fontFamily: "inherit" }} />
        {searchQ && <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 4 }}>
          {filtered.length === 0 ? <p style={{ color: C.t4, fontSize: 12 }}>No results.</p>
            : filtered.map(d => (
              <div key={d.id} onClick={() => navigate(`/editor/${d.id}`)}
                style={{ padding: "8px 10px", background: C.s4, borderRadius: 7, cursor: "pointer", fontSize: 12, color: C.t1, display: "flex", alignItems: "center", gap: 8, border: `1px solid ${C.b1}` }}>
                <span>{LANG_ICON[d.language] || LANG_ICON.default}</span>{d.title}
              </div>
            ))}
        </div>}
      </div>
    );
    return (
      <div style={{ padding: "16px 14px" }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: C.t3, marginBottom: 10 }}>EXPLORER</div>
        {docs.length === 0 ? <p style={{ color: C.t4, fontSize: 12, padding: "8px 4px" }}>No projects yet.</p>
          : docs.map(d => (
            <div key={d.id} onClick={() => navigate(`/editor/${d.id}`)}
              style={{ display: "flex", alignItems: "center", gap: 7, padding: "6px 8px", borderRadius: 6, cursor: "pointer", fontSize: 12, color: C.t2, transition: "all .12s" }}
              onMouseEnter={e => { e.currentTarget.style.background = C.s4; e.currentTarget.style.color = C.t1; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = C.t2; }}>
              <span style={{ flexShrink: 0 }}>{LANG_ICON[d.language] || LANG_ICON.default}</span>
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{d.title}</span>
            </div>
          ))}
      </div>
    );
  };

  return (
    <>
      <style>{css}</style>
      {showSettings && <SettingsModal C={C} onClose={() => setShowSettings(false)} isDark={isDark} setIsDark={setIsDark} />}
      {showProfile && <ProfileModal C={C} username={username} docs={docs} onClose={() => setShowProfile(false)} onLogout={handleLogout} />}
      {onlineModal && <OnlineUsersModal C={C} doc={onlineModal} token={token} currentUser={username} onClose={() => setOnlineModal(null)} />}

      <div style={{ position: "fixed", inset: 0, display: "flex", background: "transparent", fontFamily: "'Inter',sans-serif", overflow: "hidden" }}>
        {/* ACTIVITY BAR */}
        <div style={{ width: 48, flexShrink: 0, background: "rgba(18,18,23,0.4)", backdropFilter: "blur(12px)", borderRight: `1px solid ${C.b1}`, display: "flex", flexDirection: "column", alignItems: "center", padding: "10px 0 12px", gap: 2, zIndex: 30 }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: `linear-gradient(135deg,${C.accent},${C.purple || "#8b5cf6"})`, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16, flexShrink: 0, cursor: "pointer" }} onClick={() => navigate("/dashboard")}>
            <span style={{ width: 18, height: 18, display: "flex" }}>{I.logo}</span>
          </div>
          {NAV.map(({ id, icon, tip }) => (
            <button key={id} title={tip} className={`sb${activeNav === id ? " act" : ""}`} onClick={() => setActiveNav(id)}
              style={{ width: 40, height: 40, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: C.t3, background: "transparent", border: "none" }}>
              <span style={{ width: 18, height: 18, display: "flex" }}>{icon}</span>
            </button>
          ))}
          <div style={{ flex: 1 }} />
          <button title={isDark ? "Light" : "Dark"} className="sb" onClick={() => setIsDark(p => !p)}
            style={{ width: 40, height: 40, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: C.t3, background: "transparent", border: "none", marginBottom: 2 }}>
            <span style={{ width: 18, height: 18, display: "flex" }}>{isDark ? I.sun : I.moon}</span>
          </button>
          <button title="Settings" className="sb" onClick={() => setShowSettings(true)}
            style={{ width: 40, height: 40, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: C.t3, background: "transparent", border: "none", marginBottom: 2 }}>
            <span style={{ width: 18, height: 18, display: "flex" }}>{I.sett}</span>
          </button>
          <button title="Sign out" className="sb dng" onClick={handleLogout}
            style={{ width: 40, height: 40, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: C.t3, background: "transparent", border: "none" }}>
            <span style={{ width: 18, height: 18, display: "flex" }}>{I.logout}</span>
          </button>
        </div>

        {/* SIDE PANEL */}
        <div style={{ width: 220, flexShrink: 0, background: "rgba(24,24,27,0.3)", backdropFilter: "blur(12px)", borderRight: `1px solid ${C.b1}`, display: "flex", flexDirection: "column", overflowY: "auto" }}>
          {renderPanel()}
        </div>

        {/* MAIN */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {/* Topbar */}
          <header style={{ height: 42, background: "rgba(18,18,23,0.4)", backdropFilter: "blur(12px)", borderBottom: `1px solid ${C.b1}`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: C.t4 }}>
              <span>VisionAI</span><span style={{ color: C.b3 }}>›</span><span style={{ color: C.t2 }}>dashboard</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {/* FIX: Online users button — click to see who's in any session */}
              {docs.length > 0 && (
                <button className="onl" title="View session members" onClick={() => setOnlineModal(docs[0])}
                  style={{ display: "flex", alignItems: "center", gap: 6, background: C.gBg, border: `1px solid ${C.gBdr}`, borderRadius: 20, padding: "3px 10px 3px 7px", fontFamily: "'JetBrains Mono',monospace", fontSize: 10.5, color: C.green, cursor: "pointer", transition: "background .14s" }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.green, animation: "pulse 2.2s infinite", display: "inline-block" }} />
                  connected
                </button>
              )}
              {docs.length === 0 && (
                <div style={{ display: "flex", alignItems: "center", gap: 6, background: C.gBg, border: `1px solid ${C.gBdr}`, borderRadius: 20, padding: "3px 10px 3px 7px", fontFamily: "'JetBrains Mono',monospace", fontSize: 10.5, color: C.green }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.green, animation: "pulse 2.2s infinite", display: "inline-block" }} />
                  connected
                </div>
              )}
              <button title="Profile" onClick={() => setShowProfile(true)}
                style={{ width: 30, height: 30, borderRadius: "50%", background: `linear-gradient(135deg,${C.accent},${C.purple || "#8b5cf6"})`, border: "none", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#fff", cursor: "pointer", transition: "all .15s" }}
                onMouseEnter={e => e.currentTarget.style.opacity = ".85"} onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
                {initials}
              </button>
            </div>
          </header>

          {/* Body */}
          <main style={{ flex: 1, overflowY: "auto", padding: "48px 56px 64px" }}>
            <div style={{ marginBottom: 44, animation: "fadeUp .4s ease both" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "'JetBrains Mono',monospace", fontSize: 10.5, letterSpacing: "0.14em", textTransform: "uppercase", color: C.accent, marginBottom: 10 }}>
                <span style={{ width: 16, height: 1, background: C.accent, display: "inline-block" }} />Workspace
              </div>
              <h1 style={{ fontSize: 34, fontWeight: 700, color: C.t1, lineHeight: 1.15, marginBottom: 8, letterSpacing: "-0.6px" }}>
                Hello, <span style={{ color: C.aLt }}>{username}</span> 👋
              </h1>
              <p style={{ fontSize: 14, color: C.t3 }}>Start coding together in real-time. Create or join a project below.</p>
            </div>

            {/* Stats — 4 cards: Projects, Status, AI Engine, Total Collaborators */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)", // Changed to 2 columns for a better fit
              gap: 12,
              marginBottom: 40,
              maxWidth: 500 // Reduced maxWidth to keep cards from getting too wide
            }}>
              {[
                { icon: I.folder, color: C.accent, bg: C.aBg, label: "Projects", val: docs.length, mono: true, sub: "total" },
                { icon: I.code, color: C.green, bg: C.gBg, label: "Status", val: "Active", vc: C.green, sub: "online" },
              ].map(({ icon, color, bg, label, val, vc, mono, sub }) => (
                <div key={label} style={{
                  background: C.s2,
                  border: `1px solid ${C.b1}`,
                  borderRadius: 14,
                  padding: "16px 16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  transition: "all .14s",
                  minWidth: 0
                }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = color + "66";
                    e.currentTarget.style.background = C.s3;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = C.b1;
                    e.currentTarget.style.background = C.s2;
                  }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: bg, color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ width: 18, height: 18, display: "flex" }}>{icon}</span>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.12em", color: C.t4, fontWeight: 600, marginBottom: 3 }}>{label}</div>
                    <div style={{ fontFamily: mono ? "'JetBrains Mono',monospace" : "inherit", fontSize: mono ? 20 : 14, fontWeight: 700, color: vc || C.t1, lineHeight: 1, marginBottom: 2 }}>{val}</div>
                    {sub && <div style={{ fontSize: 10, color: C.t4 }}>{sub}</div>}
                  </div>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: 14, marginBottom: 44, alignItems: "center", flexWrap: "wrap" }}>
              <button className="nbtn" onClick={createSession} disabled={creating}
                style={{ display: "inline-flex", alignItems: "center", gap: 8, height: 40, padding: "0 20px", background: `linear-gradient(135deg,${C.accent},${C.purple || "#8b5cf6"})`, color: "#fff", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all .14s" }}>
                <span style={{ width: 15, height: 15, display: "flex" }}>{I.plus}</span> New Project
              </button>
              <div style={{ flex: 1, maxWidth: 400, display: "flex", background: C.s2, border: `1px solid ${C.b1}`, borderRadius: 10, overflow: "hidden" }}
                onMouseEnter={e => e.currentTarget.style.borderColor = C.b2} onMouseLeave={e => e.currentTarget.style.borderColor = C.b1}>
                <span style={{ padding: "0 0 0 13px", display: "flex", alignItems: "center", color: C.t4, flexShrink: 0 }}>
                  <span style={{ width: 14, height: 14, display: "flex" }}>{I.lock}</span>
                </span>
                <input value={inviteCode} onChange={e => setInviteCode(e.target.value)} onKeyDown={e => e.key === "Enter" && joinSession()} placeholder="Paste invite code…"
                  style={{ flex: 1, height: 40, padding: "0 11px", background: "transparent", color: C.t1, border: "none", outline: "none", fontFamily: "'JetBrains Mono',monospace", fontSize: 12.5 }} />
                <button className="jbtn" onClick={joinSession} disabled={joining || !inviteCode}
                  style={{ height: 40, padding: "0 18px", background: C.s4, color: C.t2, border: "none", borderLeft: `1px solid ${C.b1}`, fontSize: 12.5, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, transition: "all .14s", flexShrink: 0 }}>
                  {joining ? "Joining…" : <><span>Join</span><span style={{ width: 13, height: 13, display: "flex" }}>{I.arrow}</span></>}
                </button>
              </div>
            </div>

            {/* Section label */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.16em", color: C.t4, fontWeight: 700 }}>
                Recent Workspaces <span style={{ display: "inline-block", height: 1, width: 24, background: C.b1 }} />
              </div>
              <span style={{ fontSize: 11, padding: "2px 10px", borderRadius: 20, background: C.s4, border: `1px solid ${C.b1}`, color: C.t3, fontWeight: 500 }}>{docs.length} total</span>
            </div>

            {/* Project grid */}
            {docs.length === 0
              ? <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "64px 24px", border: `1px dashed ${C.b1}`, borderRadius: 14, gap: 10 }}>
                <div style={{ width: 52, height: 52, background: C.s3, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", color: C.t4 }}>
                  <span style={{ width: 24, height: 24, display: "flex" }}>{I.folder}</span>
                </div>
                <p style={{ fontSize: 15, fontWeight: 600, color: C.t2 }}>No projects yet</p>
                <p style={{ fontSize: 13, color: C.t4, lineHeight: 1.6, maxWidth: 280 }}>Create a project or paste an invite code to start collaborating.</p>
              </div>
              : <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 12 }}>
                {docs.map((doc, i) => (
                  <div key={doc.id} className="card" onClick={() => navigate(`/editor/${doc.id}`)}
                    style={{ position: "relative", display: "flex", alignItems: "center", gap: 14, padding: "16px 18px", background: C.s2, border: `1px solid ${C.b1}`, borderRadius: 14, cursor: "pointer", overflow: "hidden", animation: `fadeUp .3s ease ${i * .05}s both` }}>
                    <div className="cbar" style={{ position: "absolute", left: 0, top: 14, bottom: 14, width: 3, borderRadius: "0 3px 3px 0", background: `linear-gradient(180deg,${C.accent},${C.aLt})`, opacity: 0, transition: "opacity .14s" }} />
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: C.s4, border: `1px solid ${C.b1}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 22 }}>
                      {LANG_ICON[doc.language] || LANG_ICON.default}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: C.t1, marginBottom: 6, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{doc.title}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontFamily: "'JetBrains Mono',monospace", fontSize: 10.5, color: C.amber, background: C.amBg, border: `1px solid ${C.amBdr}`, borderRadius: 5, padding: "2px 8px" }}>
                          <span style={{ width: 10, height: 10, display: "flex" }}>{I.lock}</span>{doc.invite_code}
                        </span>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, color: C.t4 }}>
                          <span style={{ width: 11, height: 11, display: "flex" }}>{I.globe}</span>{doc.language || "python"}
                        </span>
                      </div>
                    </div>
                    {/* FIX: Click users icon to open online users modal */}
                    <button title="View members" onClick={e => { e.stopPropagation(); setOnlineModal(doc); }}
                      style={{ flexShrink: 0, color: C.t3, background: "none", border: "none", cursor: "pointer", padding: "4px", borderRadius: 6, transition: "all .13s", display: "flex", alignItems: "center" }}
                      onMouseEnter={e => { e.currentTarget.style.color = C.aLt; e.currentTarget.style.background = C.aBg; }}
                      onMouseLeave={e => { e.currentTarget.style.color = C.t3; e.currentTarget.style.background = "none"; }}>
                      <span style={{ width: 16, height: 16, display: "flex" }}>{I.users}</span>
                    </button>
                    <div className="carr" style={{ flexShrink: 0, color: C.t4, opacity: 0, transform: "translateX(-6px)", transition: "all .15s" }}>
                      <span style={{ width: 16, height: 16, display: "flex" }}>{I.chev}</span>
                    </div>
                  </div>
                ))}
              </div>
            }
          </main>
        </div>
      </div>
    </>
  );
}