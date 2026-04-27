import Editor, { useMonaco } from "@monaco-editor/react";
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { connectSocket, sendMessage, disconnectSocket } from "../services/socket";
import { restoreVersion } from "../services/api";

const DARK = {
  bg0: "#09090b", bg1: "#121217", bg2: "#18181b", bg3: "#27272a", bg4: "#3f3f46", bg5: "#52525b",
  b: "#27272a", bh: "#3f3f46",
  accent: "#8b5cf6", aLt: "#a78bfa", aBg: "rgba(139,92,246,0.15)", aBdr: "rgba(139,92,246,0.3)",
  green: "#10b981", gBg: "rgba(16,185,129,0.10)", gBdr: "rgba(16,185,129,0.25)",
  amber: "#f59e0b", amBg: "rgba(245,158,11,0.10)", amBdr: "rgba(245,158,11,0.22)",
  purple: "#d946ef", pBg: "rgba(217,70,239,0.15)", pBdr: "rgba(217,70,239,0.3)",
  red: "#ef4444", rBg: "rgba(239,68,68,0.10)", rBdr: "rgba(239,68,68,0.3)",
  t0: "#f0f0fa", t1: "#c4c4e0", t2: "#8888a8", t3: "#585870", t4: "#383850",
  mono: "'JetBrains Mono','Fira Code',monospace",
  sans: "'Inter','Segoe UI',sans-serif",
  mt: "vs-dark",
};
const LIGHT = {
  bg0: "#f1f1f7", bg1: "#ffffff", bg2: "#f7f7fc", bg3: "#eeeef6", bg4: "#e4e4f0", bg5: "#d4d4e8",
  b: "#dcdcec", bh: "#c4c4d8",
  accent: "#4f46e5", aLt: "#4338ca", aBg: "rgba(79,70,229,0.09)", aBdr: "rgba(79,70,229,0.22)",
  green: "#059669", gBg: "rgba(5,150,105,0.08)", gBdr: "rgba(5,150,105,0.2)",
  amber: "#d97706", amBg: "rgba(217,119,6,0.08)", amBdr: "rgba(217,119,6,0.2)",
  purple: "#7c3aed", pBg: "rgba(124,58,237,0.08)", pBdr: "rgba(124,58,237,0.22)",
  red: "#dc2626", rBg: "rgba(220,38,38,0.08)", rBdr: "rgba(220,38,38,0.28)",
  t0: "#13131e", t1: "#28284a", t2: "#54547a", t3: "#80809a", t4: "#a8a8bc",
  mono: "'JetBrains Mono','Fira Code',monospace",
  sans: "'Inter','Segoe UI',sans-serif",
  mt: "light",
};

const GS = ({ C }) => <style>{`
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  html,body,#root{height:100%}
  body{font-family:${C.sans};background:${C.bg0};color:${C.t0};-webkit-font-smoothing:antialiased}
  ::-webkit-scrollbar{width:5px;height:5px}
  ::-webkit-scrollbar-track{background:transparent}
  ::-webkit-scrollbar-thumb{background:${C.bg5};border-radius:4px}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes ping{0%{transform:scale(1);opacity:.7}100%{transform:scale(2.4);opacity:0}}
  @keyframes sdwn{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}
  @keyframes sup{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
  @keyframes fin{from{opacity:0}to{opacity:1}}
  @keyframes notifIn{from{opacity:0;transform:translateX(110%)}to{opacity:1;transform:translateX(0)}}
  @keyframes tdot{0%,80%,100%{transform:scale(0);opacity:.5}40%{transform:scale(1);opacity:1}}
  .sbi{transition:all .13s!important;cursor:pointer;border:none}
  .sbi:hover{background:${C.bg4}!important;color:${C.t0}!important}
  .sbi.act{background:${C.aBg}!important;color:${C.aLt}!important;border-right:2px solid ${C.accent}!important}
  .sbi.dng:hover{background:${C.rBg}!important;color:${C.red}!important}
  .ti:hover .tx{opacity:1!important}
  .tx{opacity:0;transition:opacity .12s!important}
  .tx:hover{background:${C.bg5}!important;opacity:1!important}
  .pi:hover{background:${C.bg4}!important}
  .fr:hover{background:${C.bg3}!important}
  .mi:hover{background:${C.bg4}!important;color:${C.t0}!important}
  .mdi:hover{background:${C.accent}!important;color:#fff!important}
  .mdi.dis{opacity:.4;pointer-events:none}
  .md{animation:sdwn .15s ease}
  .rb:hover{filter:brightness(1.12)}
  .rb:active{transform:scale(.97)}
  .sbs{cursor:pointer;transition:background .1s!important}
  .sbs:hover{background:rgba(255,255,255,.14)!important}
  .toast{animation:notifIn .3s ease}
  .tt{transition:all .1s!important;cursor:pointer}
  .tt:hover{background:${C.bg4}!important}
  .tt.act{background:${C.bg3}!important;color:${C.t0}!important;border-top:2px solid ${C.accent}!important}
  input:focus,textarea:focus,select:focus{outline:2px solid ${C.aBdr}!important;outline-offset:-1px}
  .ai-user{background:linear-gradient(135deg, ${C.aBg}, transparent);border:1px solid ${C.aBdr};border-radius:14px 14px 2px 14px;padding:10px 14px;align-self:flex-end;max-width:88%;box-shadow:0 4px 12px rgba(0,0,0,0.1);backdrop-filter:blur(8px);}
  .ai-bot{background:linear-gradient(135deg, ${C.bg3}, transparent);border:1px solid ${C.b};border-radius:14px 14px 14px 2px;padding:10px 14px;align-self:flex-start;max-width:88%;box-shadow:0 4px 12px rgba(0,0,0,0.1);backdrop-filter:blur(8px);}
  .ext-card{transition:all .2s cubic-bezier(0.4, 0, 0.2, 1)!important}
  .ext-card:hover{border-color:${C.bh}!important;transform:translateY(-2px);box-shadow:0 8px 16px rgba(0,0,0,0.15);}
  .glass-modal{background:rgba(24, 24, 27, 0.85);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,0.08);box-shadow:0 24px 60px rgba(0,0,0,0.6);}
`}</style>;

const Ic = {
  files: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z" /><polyline points="13 2 13 9 20 9" /></svg>,
  search: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>,
  upload: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>,
  folder: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" /></svg>,
  hist: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><polyline points="12 8 12 12 14 14" /><path d="M3.05 11a9 9 0 1 0 .5-4.5" /><polyline points="3 3 3 7 7 7" /></svg>,
  chat: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>,
  git: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="18" r="3" /><circle cx="6" cy="6" r="3" /><path d="M6 21V9a9 9 0 009 9" /></svg>,
  ext: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /><path d="M3 17.5A3.5 3.5 0 006.5 21H10v-3.5A3.5 3.5 0 006.5 14H3v3.5z" /></svg>,
  sett: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" /></svg>,
  logout: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>,
  moon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" /></svg>,
  sun: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>,
  invite: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" y1="8" x2="19" y2="14" /><line x1="22" y1="11" x2="16" y2="11" /></svg>,
  play: <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3" /></svg>,
  file: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z" /><polyline points="13 2 13 9 20 9" /></svg>,
  fld: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" /></svg>,
  cD: <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9" /></svg>,
  cR: <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6" /></svg>,
  x: <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>,
  term: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 17 10 11 4 5" /><line x1="12" y1="19" x2="20" y2="19" /></svg>,
  bell: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" /></svg>,
  users: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" /></svg>,
  nf: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="12" y1="18" x2="12" y2="12" /><line x1="9" y1="15" x2="15" y2="15" /></svg>,
  save: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg>,
  dn: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>,
  plus: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>,
  github: <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" /></svg>,
  bb: <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="8" height="8" rx="2" /><rect x="13" y="3" width="8" height="8" rx="2" /><rect x="3" y="13" width="8" height="8" rx="2" /><rect x="13" y="13" width="8" height="8" rx="2" /></svg>,
  trash: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" /><path d="M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" /></svg>,
  info: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>,
  spark: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>,
  check: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>,
};

const LEXT = { python: "py", cpp: "cpp", java: "java" };
const LICON = { python: "🐍", cpp: "⚡", java: "☕" };
const EXT_L = { py: "python", cpp: "cpp", java: "java", html: "html", css: "css", json: "json", txt: "plaintext", md: "markdown" };

const NAV = [
  { id: "files", icon: Ic.files, tip: "Explorer" },
  { id: "search", icon: Ic.search, tip: "Search" },
  { id: "git", icon: Ic.git, tip: "Source Control" },
  { id: "ext", icon: Ic.ext, tip: "Extensions" },
  { id: "hist", icon: Ic.hist, tip: "Version History" },
  { id: "chat", icon: Ic.chat, tip: "Group Chat" },
  { id: "ai", icon: Ic.spark, tip: "AI Chat" },
];

const MENUS = {
  File: [
    { l: "New File", s: "Ctrl+N", a: "new-file" },
    { l: "Open File…", s: "Ctrl+O", a: "open-upload" },
    { l: "Save", s: "Ctrl+S", a: "save" },
    { l: "Save As…", s: "Ctrl+Shift+S", a: "save-as" },
    { t: "sep" },
    { l: "Upload File…", a: "open-upload" },
    { l: "Open Folder…", a: "open-folder" },
    { t: "sep" },
    { l: "Exit", a: "exit" },
  ],
  Edit: [
    { l: "Undo", s: "Ctrl+Z", a: "undo" },
    { l: "Redo", s: "Ctrl+Y", a: "redo" },
    { t: "sep" },
    { l: "Cut", s: "Ctrl+X", a: "cut" },
    { l: "Copy", s: "Ctrl+C", a: "copy" },
    { l: "Paste", s: "Ctrl+V", a: "paste" },
    { t: "sep" },
    { l: "Find", s: "Ctrl+F", a: "find" },
    { l: "Replace", s: "Ctrl+H", a: "replace" },
    { l: "Format Code", s: "Shift+Alt+F", a: "format-code" },
    { t: "sep" },
    { l: "Select All", s: "Ctrl+A", a: "select-all" },
  ],
  Selection: [
    { l: "Select All", s: "Ctrl+A", a: "select-all" },
    { l: "Expand Selection", s: "Shift+Alt+→", a: "expand-sel" },
    { l: "Shrink Selection", s: "Shift+Alt+←", a: "shrink-sel" },
  ],
  View: [
    { l: "Explorer", s: "Ctrl+Shift+E", a: "nav-files" },
    { l: "Search", s: "Ctrl+Shift+F", a: "nav-search" },
    { l: "Source Control", a: "nav-git" },
    { l: "Extensions", a: "nav-ext" },
    { l: "Version History", a: "nav-hist" },
    { l: "Group Chat", a: "nav-chat" },
    { l: "AI Chat", a: "nav-ai" },
    { t: "sep" },
    { l: "Toggle Terminal", s: "Ctrl+`", a: "toggle-term" },
    { l: "New Terminal", s: "Ctrl+Shift+`", a: "new-term" },
    { t: "sep" },
    { l: "Toggle Theme", a: "toggle-theme" },
  ],
  Run: [
    { l: "Run Code", s: "F5", a: "run" },
    { t: "sep" },
    { l: "AI Complete", s: "Ctrl+Space", a: "ai-complete" },
    { l: "Invite", a: "invite" },
  ],
  Terminal: [
    { l: "New Terminal", s: "Ctrl+Shift+`", a: "new-term" },
    { l: "Clear Terminal", a: "clear-term" },
    { t: "sep" },
    { l: "Run Code", s: "F5", a: "run" },
  ],
  Help: [
    { l: "Keyboard Shortcuts", s: "Ctrl+K", a: "shortcuts" },
    { t: "sep" },
    { l: "About VisionAI", a: "about" },
  ],
};

const fCol = n => ({ py: "#3b82f6", js: "#f59e0b", ts: "#3b82f6", jsx: "#38bdf8", css: "#a78bfa", html: "#f97316", json: "#34d399", md: "#94a3b8", cpp: "#ef4444", java: "#f97316", txt: "#808098" })[n?.split(".").pop()?.toLowerCase()] || "#808098";

function loadExts() {
  try {
    const s = localStorage.getItem("visionai_ext"); return s ? JSON.parse(s) : [
      { id: "py", n: "Python", a: "Microsoft", d: "IntelliSense, linting", i: "🐍", ok: true },
      { id: "cpp", n: "C/C++", a: "Microsoft", d: "IntelliSense for C/C++", i: "⚡", ok: true },
      { id: "java", n: "Java", a: "Red Hat", d: "Java language support", i: "☕", ok: true },
      { id: "fmt", n: "Prettier", a: "Prettier", d: "Code formatter", i: "✨", ok: true },
      { id: "gl", n: "GitLens", a: "GitKraken", d: "Supercharge Git", i: "🔀", ok: false },
      { id: "od", n: "One Dark Pro", a: "binaryify", d: "Atom's iconic dark theme", i: "🎨", ok: false },
      { id: "cp", n: "Copilot", a: "GitHub", d: "AI pair programmer", i: "🤖", ok: false },
      { id: "dk", n: "Docker", a: "Microsoft", d: "Dockerfile support", i: "🐳", ok: false },
      { id: "react", n: "React/ES7", a: "dsznajder", d: "React & Redux snippets", i: "⚛️", ok: false },
      { id: "tw", n: "Tailwind CSS", a: "Tailwind", d: "IntelliSense for Tailwind", i: "🌊", ok: false },
      { id: "eslint", n: "ESLint", a: "Microsoft", d: "Integrates ESLint", i: "📏", ok: false },
      { id: "ts", n: "TypeScript", a: "Microsoft", d: "TS Language features", i: "📘", ok: false },
    ];
  } catch { return []; }
}

function buildTree(files) {
  const root = {};
  files.forEach(f => {
    const parts = (f.path || f.name).split(/[\\/]/); let node = root;
    parts.forEach((p, i) => { if (i === parts.length - 1) { node[p] = { __file: f }; } else { if (!node[p]) node[p] = {}; node = node[p]; } });
  });
  return root;
}

function FolderTree({ node, C, depth = 0, onOpen, activeFile }) {
  const [col, setCol] = useState({});
  const entries = Object.entries(node).filter(([k]) => k !== "__file").sort((a, b) => {
    const af = !!a[1]?.__file, bf = !!b[1]?.__file; if (af !== bf) return af ? 1 : -1; return a[0].localeCompare(b[0]);
  });
  return <div>{entries.map(([n, v]) => {
    const isF = !!v?.__file, isAct = isF && activeFile === v.__file?.name, open = !col[n];
    return <div key={n}>
      <div className={isF ? "pi" : "fr"} onClick={() => isF ? onOpen(v.__file) : setCol(p => ({ ...p, [n]: !p[n] }))}
        style={{ display: "flex", alignItems: "center", gap: 5, padding: "3px 8px", paddingLeft: `${8 + depth * 14}px`, cursor: "pointer", fontSize: 12, color: isAct ? C.aLt : isF ? C.t1 : C.t2, background: isAct ? C.bg4 : "transparent", transition: "background .1s", borderRadius: 3 }}>
        {!isF && <span style={{ color: C.t3, display: "flex", flexShrink: 0 }}>{open ? Ic.cD : Ic.cR}</span>}
        <span style={{ color: isF ? fCol(n) : "#f59e0b", display: "flex", flexShrink: 0 }}>{isF ? Ic.file : Ic.fld}</span>
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{n}</span>
      </div>
      {!isF && open && <FolderTree node={v} C={C} depth={depth + 1} onOpen={onOpen} activeFile={activeFile} />}
    </div>;
  })}</div>;
}

const Toast = ({ C, notifs, rm }) => (
  <div style={{ position: "fixed", top: 56, right: 14, zIndex: 3000, display: "flex", flexDirection: "column", gap: 8, pointerEvents: "none" }}>
    {notifs.map(n => (
      <div key={n.id} className="toast" style={{ background: C.bg2, border: `1px solid ${C.bh}`, borderRadius: 10, padding: "10px 14px", minWidth: 240, maxWidth: 320, boxShadow: "0 8px 28px rgba(0,0,0,.45)", pointerEvents: "auto", display: "flex", alignItems: "flex-start", gap: 10 }}>
        <div style={{ width: 7, height: 7, borderRadius: "50%", background: n.c || C.green, marginTop: 4, flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: C.t0, marginBottom: 2 }}>{n.title}</div>
          <div style={{ fontSize: 11.5, color: C.t2 }}>{n.body}</div>
        </div>
        <button onClick={() => rm(n.id)} style={{ background: "none", border: "none", color: C.t4, cursor: "pointer", fontSize: 16, lineHeight: 1, padding: "0 2px" }}>×</button>
      </div>
    ))}
  </div>
);

const Dot = ({ delay }) => <span style={{ width: 5, height: 5, borderRadius: "50%", background: "currentColor", display: "inline-block", animation: `tdot 1.4s ${delay}s infinite ease-in-out` }} />;

function OnlineUsersModal({ C, docId, token, onlineUsers, username, onClose }) {
  const [roleMap, setRoleMap] = useState({});
  const [loading, setLoading] = useState(true);
  const gradients = ["#6366f1,#8b5cf6", "#10b981,#3b82f6", "#f59e0b,#ef4444", "#ec4899,#8b5cf6", "#06b6d4,#10b981"];
  const ini = n => (n || "?").slice(0, 2).toUpperCase();
  const allUsers = onlineUsers.length > 0 ? onlineUsers : [username];

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`http://127.0.0.1:8000/documents/${docId}/collaborators`, { headers: { Authorization: `Bearer ${token}` } });
        if (r.ok) { const data = await r.json(); const map = {}; data.forEach(m => { map[m.username] = m.role; }); setRoleMap(map); }
      } catch (e) { console.error("role fetch error", e); }
      setLoading(false);
    })();
  }, [docId, token]);

  const getRole = (uname) => roleMap[uname] || "member";
  const rc = r => r === "owner" ? C.amber : C.green;
  const rb = r => r === "owner" ? C.amBg : C.gBg;
  const rbdr = r => r === "owner" ? C.amBdr : C.gBdr;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", zIndex: 4000, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="glass-modal" style={{ width: 400, borderRadius: 16, overflow: "hidden", animation: "sup .3s cubic-bezier(0.16, 1, 0.3, 1)" }}>
        <div style={{ padding: "14px 18px", borderBottom: `1px solid ${C.b}`, display: "flex", alignItems: "center", justifyContent: "space-between", background: C.bg3 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 700, color: C.t0 }}>
            {Ic.users}<span>Live Session Members ({allUsers.length})</span>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: C.t3, cursor: "pointer", fontSize: 20, lineHeight: 1, borderRadius: 5, padding: "2px 8px" }}>×</button>
        </div>
        <div style={{ padding: "14px 18px", maxHeight: 400, overflowY: "auto" }}>
          {loading
            ? <div style={{ textAlign: "center", padding: "20px 0", color: C.t3, fontSize: 13 }}>Loading roles…</div>
            : allUsers.map((uname, i) => {
              const role = getRole(uname);
              return (
                <div key={uname + i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", background: C.bg3, borderRadius: 8, border: `1px solid ${C.b}`, marginBottom: 7 }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: `linear-gradient(135deg,${gradients[i % gradients.length]})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff", flexShrink: 0 }}>{ini(uname)}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.t0 }}>{uname}{uname === username && <span style={{ marginLeft: 5, fontSize: 10, color: C.t3 }}>(you)</span>}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <span style={{ width: 7, height: 7, borderRadius: "50%", background: C.green, display: "inline-block" }} />
                    <span style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: rc(role), background: rb(role), border: `1px solid ${rbdr(role)}`, borderRadius: 10, padding: "2px 9px" }}>{role}</span>
                  </div>
                </div>
              );
            })
          }
        </div>
      </div>
    </div>
  );
}

function AboutModal({ C, onClose }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", zIndex: 4000, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="glass-modal" style={{ width: 380, borderRadius: 16, overflow: "hidden", animation: "sup .3s cubic-bezier(0.16, 1, 0.3, 1)" }}>
        <div style={{ padding: "28px 24px", textAlign: "center" }}>
          <div style={{ width: 64, height: 64, borderRadius: 16, background: `linear-gradient(135deg,${C.accent},${C.purple})`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
            <svg width="36" height="36" viewBox="0 0 48 48" fill="none"><rect x="4" y="4" width="17" height="17" rx="4" fill="white" fillOpacity="0.95" /><rect x="27" y="4" width="17" height="17" rx="4" fill="white" fillOpacity="0.95" /><rect x="4" y="27" width="17" height="17" rx="4" fill="white" fillOpacity="0.95" /><rect x="27" y="27" width="17" height="17" rx="4" fill="white" fillOpacity="0.4" /></svg>
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: C.t0, marginBottom: 4 }}>VisionAI Editor</h2>
          <p style={{ fontSize: 11, color: C.t3, marginBottom: 18, fontFamily: C.mono }}>Version 1.0.0 · Built by Yug Jasoliya</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 20, textAlign: "left" }}>
            {[["Frontend", "React + Monaco Editor"], ["Backend", "FastAPI + WebSocket"], ["AI Engine", "Gemini 2.5 Flash"], ["Database", "PostgreSQL"], ["Realtime", "OT Collaboration"], ["Deploy", "Localhost / Docker"]].map(([k, v]) => (
              <div key={k} style={{ padding: "8px 10px", background: C.bg3, borderRadius: 8, border: `1px solid ${C.b}` }}>
                <div style={{ fontSize: 9, color: C.t4, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 2 }}>{k}</div>
                <div style={{ fontSize: 11.5, color: C.t0, fontFamily: C.mono }}>{v}</div>
              </div>
            ))}
          </div>
          <button onClick={onClose} style={{ padding: "8px 28px", background: C.accent, color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Close</button>
        </div>
      </div>
    </div>
  );
}

function ProTerminal({ C, isDark, term, onInputSend, onClear, isRunning, lang, licon }) {
  const [inp, setInp] = useState("");
  const [history, setHist] = useState([]);
  const [hIdx, setHIdx] = useState(-1);
  const bottomRef = useRef(null);
  useEffect(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), [term.lines]);
  const lc = t => { if (t === "error") return "#ef4444"; if (t === "success") return "#10b981"; if (t === "info") return "#818cf8"; if (t === "warn") return "#f59e0b"; if (t === "cmd") return "#10b981"; return isDark ? "#d4d4d4" : "#1e1e2e"; };
  const handleKey = e => {
    if (e.key === "Enter" && inp.trim()) { e.preventDefault(); const cmd = inp.trim(); setHist(p => [cmd, ...p.slice(0, 49)]); setHIdx(-1); onInputSend(cmd); setInp(""); }
    if (e.key === "ArrowUp") { e.preventDefault(); const n = Math.min(hIdx + 1, history.length - 1); setHIdx(n); if (history[n]) setInp(history[n]); }
    if (e.key === "ArrowDown") { e.preventDefault(); const n = Math.max(hIdx - 1, -1); setHIdx(n); setInp(n === -1 ? "" : history[n] || ""); }
    if (e.key === "Tab") { e.preventDefault(); const c = ["python ", "pip install ", "java ", "g++ ", "ls", "cat ", "cd ", "clear", "echo "].find(x => x.startsWith(inp)); if (c) setInp(c); }
    if (e.ctrlKey && e.key === "c") { e.preventDefault(); onInputSend("__SIGINT__"); setInp(""); }
    if (e.ctrlKey && e.key === "l") { e.preventDefault(); onClear(); }
  };
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: isDark ? "rgba(9, 9, 11, 0.95)" : "#fafafa" }}>
      <div style={{ flex: 1, overflow: "auto", padding: "8px 14px", fontFamily: C.mono, fontSize: 12, lineHeight: 1.7 }}>
        {term.lines.map((line, i) => (
          <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 6, marginBottom: 1 }}>
            <span style={{ color: lc(line.type), whiteSpace: "pre-wrap", wordBreak: "break-all" }}>{line.text}</span>
          </div>
        ))}
        {isRunning && <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#f59e0b", fontFamily: C.mono, fontSize: 12 }}><span>⚡ Executing…</span><div style={{ display: "flex", gap: 2, alignItems: "center" }}><Dot delay={0} /><Dot delay={.2} /><Dot delay={.4} /></div></div>}
        <div ref={bottomRef} />
      </div>
      <div style={{ display: "flex", alignItems: "center", padding: "5px 14px", background: isDark ? "rgba(24, 24, 27, 0.8)" : "#f0f0f8", borderTop: `1px solid ${C.b}`, flexShrink: 0, backdropFilter: "blur(8px)" }}>
        <span style={{ fontSize: 12, fontFamily: C.mono, color: "#10b981", flexShrink: 0, marginRight: 8, whiteSpace: "nowrap" }}>{licon} visionai@doc &gt;</span>
        <input value={inp} onChange={e => setInp(e.target.value)} onKeyDown={handleKey} placeholder="Type command… (↑↓ history, Tab complete, Ctrl+C, Ctrl+L)"
          style={{ flex: 1, background: "transparent", border: "none", color: isDark ? "#d4d4d4" : "#1e1e2e", fontFamily: C.mono, fontSize: 12, outline: "none", padding: 0 }} spellCheck={false} autoComplete="off" />
        <span style={{ fontSize: 10, color: C.t4, marginLeft: 8, flexShrink: 0, fontFamily: C.mono, whiteSpace: "nowrap" }}>Ctrl+C · Ctrl+L</span>
      </div>
    </div>
  );
}

/* ══════════════════ MAIN ══════════════════ */
export default function CodeEditor() {
  const { docId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");

  const edRef = useRef(null);
  const codeRef = useRef("");
  const verRef = useRef(0);
  const remRef = useRef(false);
  const chatEnd = useRef(null);
  const fRef = useRef(null);
  const folRef = useRef(null);
  const aiTRef = useRef(null);
  const nidRef = useRef(0);
  const lastSnapRef = useRef(-1);
  const termIdRef = useRef(1);
  // ✅ FIX: ref to track current activeFile in WS handler closure
  const activeFileRef = useRef(null);

  const [code, setCode] = useState("");
  const [lang, setLang] = useState("python");
  const [msgs, setMsgs] = useState([]);
  const [chatIn, setChatIn] = useState("");
  const [hist, setHist] = useState([]);
  const [isRunning, setIsRunning] = useState(false);

  const [aiChats, setAiChats] = useState([{ role: "bot", text: "Hello! I'm your AI assistant. Ask me anything about your code!" }]);
  const [aiInput, setAiInput] = useState("");
  const [aiThinking, setAiThink] = useState(false);
  const [inlineAi, setInlineAi] = useState("");
  const aiChatEnd = useRef(null);

  const [showTerm, setShowTerm] = useState(false);
  const [terms, setTerms] = useState([{
    id: 1, name: "python", lines: [
      { type: "info", text: "VisionAI Terminal — Ready" },
      { type: "info", text: "Run code with F5 · Ctrl+C to interrupt · ↑↓ history" },
      { type: "info", text: "─────────────────────────────────────────────────" },
    ], input: ""
  }]);
  const [activeTerm, setActiveTerm] = useState(1);
  const activeTermRef = useRef(1);
  useEffect(() => { activeTermRef.current = activeTerm; }, [activeTerm]);
  const [termH, setTermH] = useState(250);
  const [dragging, setDragging] = useState(false);

  const [isDark, setIsDark] = useState(true);
  const [activeNav, setActiveNav] = useState("files");
  const [searchQ, setSearchQ] = useState("");
  const [replaceQ, setReplaceQ] = useState("");
  const [showReplace, setShowReplace] = useState(false);
  const [uploads, setUploads] = useState([]);
  const [folFiles, setFolFiles] = useState([]);
  const [folTree, setFolTree] = useState({});
  const [folName, setFolName] = useState("");
  const [activeFile, setActiveFile] = useState(null);
  const [tabs, setTabs] = useState([]);
  const [hasContent, setHasContent] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);
  const [showSett, setShowSett] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showOnline, setShowOnline] = useState(false);
  const [fontSize, setFontSize] = useState(13);
  const [notifs, setNotifs] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [sharedFiles, setSharedFiles] = useState([]);
  const [typingUs, setTypingUs] = useState([]);
  const [gitBranch] = useState("main");
  const [gitCh, setGitCh] = useState(0);
  const [commitMsg, setCommitMsg] = useState("");
  const LS_COMMITS = `visionai_commits_${docId}`;
  const [commits, setCommits] = useState(() => {
    try { const c = localStorage.getItem(LS_COMMITS); return c ? JSON.parse(c) : []; } catch { return []; }
  });
  const [stagedFiles, setStagedFiles] = useState([]);
  const [newFN, setNewFN] = useState("");
  const [showNF, setShowNF] = useState(false);
  const [exts, setExts] = useState(loadExts);
  const [extSearch, setExtSearch] = useState("");
  const [sideW, setSideW] = useState(234);

  const monaco = useMonaco();
  useEffect(() => {
    if (monaco) {
      monaco.editor.defineTheme('one-dark-pro', {
        base: 'vs-dark',
        inherit: true,
        rules: [
          { background: '282c34' },
          { token: 'keyword', foreground: 'c678dd' },
          { token: 'string', foreground: '98c379' },
          { token: 'function', foreground: '61afef' },
          { token: 'number', foreground: 'd19a66' },
          { token: 'comment', foreground: '5c6370', fontStyle: 'italic' }
        ],
        colors: {
          'editor.background': '#282c34',
        }
      });
    }
  }, [monaco]);

  const C = isDark ? DARK : LIGHT;
  const isOneDark = isDark && exts.find(e => e.id === "od")?.ok;
  const editorTheme = isOneDark ? "one-dark-pro" : C.mt;

  const lext = LEXT[lang] || "py";
  const licon = LICON[lang] || "📄";
  const mainTab = `main.${lext}`;
  const fname = activeFile || (hasContent ? mainTab : "");
  const allTabs = tabs.length > 0 ? tabs : (hasContent ? [mainTab] : []);
  const curTerm = terms.find(t => t.id === activeTerm) || terms[0];
  const totalOnline = onlineUsers.length || 1;

  // Track main file content independently so it survives tab switches
  const mainContentRef = useRef("");

  // Keep activeFileRef in sync so WS handler always reads current value
  useEffect(() => { activeFileRef.current = activeFile; }, [activeFile]);

  const push = (title, body, c) => { const id = ++nidRef.current; setNotifs(p => [...p, { id, title, body, c }]); setTimeout(() => setNotifs(p => p.filter(n => n.id !== id)), 5000); };
  const rmN = id => setNotifs(p => p.filter(n => n.id !== id));
  const addTab = n => setTabs(p => p.includes(n) ? p : [...p, n]);
  const addTermLine = (id, text, type = "output") => setTerms(p => p.map(t => t.id === id ? { ...t, lines: [...t.lines, { type, text }] } : t));
  const clearTermLines = id => setTerms(p => p.map(t => t.id === id ? { ...t, lines: [{ type: "info", text: "VisionAI Terminal — cleared" }, { type: "info", text: "─────────────────────────────────────────────────" }] } : t));
  const addNewTerm = () => { const id = ++termIdRef.current; setTerms(p => [...p, { id, name: `python`, lines: [{ type: "info", text: "VisionAI Terminal — Ready" }, { type: "info", text: "Run code with F5 · Ctrl+C to interrupt · ↑↓ history" }, { type: "info", text: "─────────────────────────────────────────────────" }], input: "" }]); setActiveTerm(id); setShowTerm(true); };
  const closeTerm = id => { if (terms.length === 1) { setShowTerm(false); return; } setTerms(p => { const n = p.filter(t => t.id !== id); if (activeTerm === id) setActiveTerm(n[n.length - 1].id); return n; }); };
  const saveExts = updater => setExts(prev => { const n = typeof updater === "function" ? updater(prev) : updater; localStorage.setItem("visionai_ext", JSON.stringify(n)); return n; });

  // ✅ FIX: Persist uploads and sharedFiles to localStorage per docId
  const LS_UPLOADS = `visionai_uploads_${docId}`;
  const LS_SHARED = `visionai_shared_${docId}`;

  // Save uploads to localStorage whenever they change
  useEffect(() => {
    if (!docId) return;
    try { localStorage.setItem(LS_UPLOADS, JSON.stringify(uploads)); } catch { }
  }, [uploads, docId]);

  // Save sharedFiles to localStorage whenever they change
  useEffect(() => {
    if (!docId) return;
    try { localStorage.setItem(LS_SHARED, JSON.stringify(sharedFiles)); } catch { }
  }, [sharedFiles, docId]);

  // Save commits to localStorage whenever they change
  useEffect(() => {
    if (!docId) return;
    try { localStorage.setItem(LS_COMMITS, JSON.stringify(commits)); } catch { }
  }, [commits, docId]);

  // ✅ FIX: Restore uploads and sharedFiles from localStorage on mount
  useEffect(() => {
    if (!docId) return;
    try {
      const savedUploads = localStorage.getItem(LS_UPLOADS);
      if (savedUploads) {
        const parsed = JSON.parse(savedUploads);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setUploads(parsed);
          setHasContent(true);
          // Restore tabs for all saved uploads
          parsed.forEach(f => { setTabs(p => p.includes(f.name) ? p : [...p, f.name]); });
        }
      }
      const savedShared = localStorage.getItem(LS_SHARED);
      if (savedShared) {
        const parsed = JSON.parse(savedShared);
        if (Array.isArray(parsed) && parsed.length > 0) setSharedFiles(parsed);
      }
    } catch (e) { console.error("localStorage restore error:", e); }
  }, [docId]);

  const closeFolder = () => {
    const fnames = new Set(folFiles.map(f => f.name));
    setTabs(p => { const next = p.filter(t => !fnames.has(t)); if (activeFile && fnames.has(activeFile)) { setActiveFile(null); } return next; });
    setFolFiles([]); setFolTree({}); setFolName(""); push("📁 Folder closed", "", C.amber);
  };

  const closeTab = (name, e) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    const isNonMain = name !== mainTab;
    if (isNonMain) {
      sendMessage({ type: "file_delete", name, user: username, doc_id: docId });
    } else {
      // If deleting the main file, clear its contents and hide it
      const n = "";
      remRef.current = true; setCode(n); codeRef.current = n;
      sendMessage({ type: "operation", user: username, operation: "replace", value: n, version: verRef.current, active_file: mainTab }); verRef.current++;
      sendMessage({ type: "file_delete", name: mainTab, user: username, doc_id: docId }); // Broadcast main file deletion
      setTimeout(() => { remRef.current = false; }, 50);
      setHasContent(false);
    }
    setTabs(prev => {
      const next = prev.filter(t => t !== name);
      const isAct = activeFile === name || (name === mainTab && !activeFile);
      if (isAct) {
        if (next.length > 0) {
          const fb = next[Math.max(0, prev.indexOf(name) - 1)] || next[0];
          if (fb === mainTab) { setActiveFile(null); }
          else {
            const myFile = [...uploads, ...folFiles].find(f => f.name === fb);
            const shFile = sharedFiles.find(f => f.name === fb);
            if (myFile) setTimeout(() => openIn(myFile.name, myFile.content || ""), 0);
            else if (shFile) setTimeout(() => openIn(shFile.name, shFile.content || ""), 0);
          }
        } else { setActiveFile(null); setHasContent(false); remRef.current = true; setCode(""); codeRef.current = ""; setTimeout(() => { remRef.current = false; }, 50); }
      }
      return next;
    });
    setUploads(p => p.filter(f => f.name !== name));
    setSharedFiles(p => p.filter(f => f.name !== name));
  };

  useEffect(() => { chatEnd.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);
  useEffect(() => { aiChatEnd.current?.scrollIntoView({ behavior: "smooth" }); }, [aiChats]);
  useEffect(() => { if (!token) navigate("/login"); }, [token, navigate]);
  useEffect(() => { const h = () => setActiveMenu(null); if (activeMenu) document.addEventListener("click", h); return () => document.removeEventListener("click", h); }, [activeMenu]);

  useEffect(() => {
    const h = e => {
      if (e.ctrlKey && e.key === "`") { e.preventDefault(); setShowTerm(p => !p); }
      if (e.ctrlKey && e.shiftKey && e.key === "`") { e.preventDefault(); addNewTerm(); }
      if (e.ctrlKey && e.key === "s" && !e.shiftKey) { e.preventDefault(); doSave(); }
      if (e.ctrlKey && e.shiftKey && e.key === "S") { e.preventDefault(); doSaveAs(); }
      if (e.ctrlKey && e.key === "n") { e.preventDefault(); setShowNF(true); setActiveNav("files"); }
      if (e.key === "Escape") { setActiveMenu(null); setShowNF(false); setShowSett(false); setShowAbout(false); setShowOnline(false); }
      if (e.key === "F5") { e.preventDefault(); runCode(); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  useEffect(() => {
    if (!token || !docId) return;
    (async () => {
      try {
        const r = await fetch(`http://127.0.0.1:8000/documents/${docId}`, { headers: { Authorization: `Bearer ${token}` } });
        if (r.ok) {
          const d = await r.json(); const f = d.content || ""; const savedLang = d.language || "python";
          remRef.current = true; setCode(f); codeRef.current = f; mainContentRef.current = f;
          setLang(savedLang); localStorage.setItem(`visionai_lang_${docId}`, savedLang);
          if (f.trim()) { setHasContent(true); addTab(`main.${LEXT[savedLang] || "py"}`); }
          setTimeout(() => { remRef.current = false; }, 50);
        }
        const cr = await fetch(`http://127.0.0.1:8000/chat/${docId}`, { headers: { Authorization: `Bearer ${token}` } });
        if (cr.ok) setMsgs(await cr.json());
        const hr = await fetch(`http://127.0.0.1:8000/versions/${docId}`, { headers: { Authorization: `Bearer ${token}` } });
        if (hr.ok) setHist(await hr.json());
      } catch (e) { console.error(e); }
    })();
  }, [docId, token]);

  useEffect(() => {
    if (!token || !docId) return;
    connectSocket(docId, username, token, data => {
      if (data.type === "snapshot") {
        const incoming = data.version ?? 0; if (incoming <= lastSnapRef.current) return; lastSnapRef.current = incoming;
        const t = data.content ?? ""; remRef.current = true; codeRef.current = t; setCode(t); mainContentRef.current = t; verRef.current = incoming;
        if (data.language) {
          setLang(data.language); localStorage.setItem(`visionai_lang_${docId}`, data.language);
          if (hasContent || t.trim()) { const nt = `main.${LEXT[data.language] || "py"}`; setTabs(p => { const wo = p.filter(x => !Object.values(LEXT).some(ex => x === `main.${ex}`)); return t.trim() ? [...wo, nt] : wo; }); }
        }
        if (t.trim() && tabs.length === 0) setHasContent(true);
        setTimeout(() => { remRef.current = false; }, 20); return;
      }

      // ✅ FIX 1: Only apply OT operations if the current user is on the SAME file
      // Main file ops → apply to code editor (existing behaviour)
      // Secondary file ops are handled by file_content, so we skip them here
      if (data.type === "operation" && data.user !== username) {
        const opFile = data.active_file || "";
        const curFile = activeFileRef.current;
        const isMainOp = !opFile || opFile.startsWith("main.");
        const isSameFile = opFile && curFile && opFile === curFile;

        if (isMainOp) {
          let t = mainContentRef.current;
          const pos = Math.max(0, Math.min(t.length, data.position || 0));

          if (data.operation === "insert") t = t.slice(0, pos) + data.value + t.slice(pos);
          else if (data.operation === "delete") t = t.slice(0, pos) + t.slice(pos + (data.length || 1));
          else if (data.operation === "replace") t = data.value;
          mainContentRef.current = t;

          // Only apply to editor if user is currently on the main file
          if (!curFile) {
            remRef.current = true; codeRef.current = t; setCode(t); verRef.current = data.version ?? verRef.current;
            setTimeout(() => { remRef.current = false; }, 20);
          }
        } else if (isSameFile) {
          // Secondary file op for the same file both users have open — handled by file_content
          // No action needed here
        }
        // Else: op for a different secondary file, ignore
      }

      if (data.type === "chat") setMsgs(p => [...p, data]);
      if (data.type === "terminal_output") {
        if (data.for_user && data.for_user !== username) return; // Ignore if it's not for us
        setShowTerm(true); setIsRunning(false); const out = data.output || "";
        setTerms(p => p.map(t => t.id === activeTermRef.current ? {
          ...t, lines: [...t.lines,
          ...out.split("\n").filter(Boolean).map(ln => ({ type: ln.startsWith("❌") || ln.toLowerCase().includes("error") ? "error" : ln.startsWith("⏱") ? "warn" : "output", text: ln }))
          ]
        } : t));
      }
      if (data.type === "language_change" && data.user !== username) {
        const nl = data.language; setLang(nl); localStorage.setItem(`visionai_lang_${docId}`, nl);
        const nt = `main.${LEXT[nl] || "py"}`; setTabs(p => { const wo = p.filter(t => !Object.values(LEXT).some(ex => t === `main.${ex}`)); return hasContent ? [...wo, nt] : wo; });
      }
      if (data.type === "user_list_update") { setOnlineUsers(data.users || []); }
      if (data.type === "user_typing" && data.user !== username) {
        setTypingUs(p => p.includes(data.user) ? p : [...p, data.user]);
        setTimeout(() => setTypingUs(p => p.filter(u => u !== data.user)), 3000);
      }
      if (data.type === "git_commit" && data.user !== username) {
        setCommits(p => [data.commit, ...p]);
        push("✅ Commit from " + data.user, `"${data.commit.message}"`, C.green);
      }

      if (data.type === "file_created" && data.user !== username) {
        const fn = data.filename; if (!fn) return;
        const content = data.content || "";
        setSharedFiles(p => p.some(f => f.name === fn) ? p.map(f => f.name === fn ? { ...f, content } : f) : [...p, { name: fn, size: data.size || 0, owner: data.user, content }]);
        addTab(fn);
        push(`📄 ${data.user} created "${fn}"`, "Added to SHARED FILES", C.aLt);
      }

      if (data.type === "shared_files_init") {
        const files = data.files || [];
        setSharedFiles(prev => {
          let updated = [...prev];
          files.forEach(({ filename: fn, content }) => {
            if (!updated.some(f => f.name === fn)) {
              updated = [...updated, { name: fn, size: 0, owner: "(shared)", content }];
              setTabs(p => p.includes(fn) ? p : [...p, fn]);
            }
          });
          return updated;
        });
      }

      // ✅ FIX: file_delete
      if (data.type === "file_delete" && data.user !== username) {
        const { name } = data;
        if (name.startsWith("main.")) {
          remRef.current = true; setCode(""); codeRef.current = ""; mainContentRef.current = "";
          setTimeout(() => { remRef.current = false; }, 50);
          setHasContent(false);
        }
        setSharedFiles(p => p.filter(f => f.name !== name));
        setUploads(p => p.filter(f => f.name !== name));
        setTabs(prev => {
          const next = prev.filter(t => t !== name);
          if (activeFileRef.current === name) { setActiveFile(null); }
          return next;
        });
        push(`🗑 ${data.user} deleted "${name}"`, "Removed from Explorer", C.amber);
      }

      // ✅ FIX 1: file_content — the PRIMARY sync for secondary files
      // When any user edits a shared file, this updates everyone else's copy
      if (data.type === "file_content" && data.user !== username) {
        const { name, content: fc } = data;
        // Update stored content
        setSharedFiles(p => p.map(f => f.name === name ? { ...f, content: fc } : f));
        setUploads(p => p.map(f => f.name === name ? { ...f, content: fc } : f));
        // If this file is currently open in the editor, update it
        if (activeFileRef.current === name) {
          remRef.current = true; setCode(fc); codeRef.current = fc;
          setTimeout(() => { remRef.current = false; }, 50);
        }
      }

      if (data.type === "input_change" && data.user !== username) { setTerms(p => p.map(t => t.id === activeTerm ? { ...t, input: data.value } : t)); }
      if (data.type === "folder_shared" && data.user !== username) { push(`📁 ${data.user} shared a folder`, "", C.accent); }
    });
    return () => disconnectSocket();
  }, [docId, username, token]);

  useEffect(() => {
    const mv = e => { if (!dragging) return; const h = window.innerHeight - e.clientY; if (h > 100 && h < window.innerHeight * .7) setTermH(h); };
    const up = () => setDragging(false);
    if (dragging) { window.addEventListener("mousemove", mv); window.addEventListener("mouseup", up); }
    return () => { window.removeEventListener("mousemove", mv); window.removeEventListener("mouseup", up); };
  }, [dragging]);

  // ✅ FIX 1: handleChange — only send OT operations for the MAIN file
  // Secondary files use file_content broadcast to stay in sync
  const handleChange = (value, event) => {
    if (remRef.current) return;
    codeRef.current = value;

    const currentFile = activeFileRef.current;
    const isMainFile = !currentFile || currentFile === mainTab;

    if (isMainFile) {
      setHasContent(true);
      mainContentRef.current = value;
      // Send OT operations only for the main document
      event?.changes?.forEach(ch => {
        const pos = ch.rangeOffset; const ins = ch.text.replace(/\r\n/g, "\n");
        if (ch.rangeLength > 0) {
          sendMessage({
            type: "operation", doc_id: docId, user: username, operation: "delete",
            position: pos, length: ch.rangeLength, version: verRef.current,
            active_file: currentFile || mainTab  // tag with file name
          });
          verRef.current++;
        }
        if (ins.length > 0) {
          sendMessage({
            type: "operation", doc_id: docId, user: username, operation: "insert",
            position: pos, value: ins, version: verRef.current,
            active_file: currentFile || mainTab
          });
          verRef.current++;
        }
      });
    } else {
      // Secondary file — use file_content for real-time sync (no OT needed)
      sendMessage({ type: "file_content", name: currentFile, content: value, user: username, doc_id: docId });
      // Also update our local uploads/sharedFiles store
      setUploads(p => p.map(f => f.name === currentFile ? { ...f, content: value } : f));
      setSharedFiles(p => p.map(f => f.name === currentFile ? { ...f, content: value } : f));
    }

    setGitCh(p => p + 1);
    sendMessage({ type: "user_typing", user: username, doc_id: docId });
    setInlineAi("");
    if (aiTRef.current) clearTimeout(aiTRef.current);
    aiTRef.current = setTimeout(async () => {
      const copilotOk = exts.find(e => e.id === "cp")?.ok;
      if (!copilotOk) return;
      if (codeRef.current.trim().length < 15) return;
      try {
        const r = await fetch("http://127.0.0.1:8000/ai/suggest", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ code: codeRef.current.slice(-400) }) });
        if (!r.ok) return; const d = await r.json();
        if (d.suggestion?.trim() && !d.suggestion.startsWith("//") && !d.suggestion.startsWith("⚠️")) { setInlineAi(d.suggestion.split("\n")[0]); setTimeout(() => setInlineAi(""), 8000); }
      } catch { }
    }, 2000);
  };

  const handleEdKey = e => {
    if (e.keyCode === 9 && inlineAi) {
      e.preventDefault(); const n = codeRef.current + "\n" + inlineAi;
      remRef.current = true; setCode(n); codeRef.current = n;
      const currentFile = activeFileRef.current;
      if (!currentFile || currentFile === mainTab) {
        sendMessage({ type: "operation", user: username, operation: "replace", value: n, version: verRef.current, active_file: mainTab }); verRef.current++;
      } else {
        sendMessage({ type: "file_content", name: currentFile, content: n, user: username, doc_id: docId });
      }
      setInlineAi(""); setTimeout(() => { remRef.current = false; }, 50);
    }
  };

  const doSave = async () => {
    try {
      const currentFile = activeFileRef.current;
      const isMainFile = !currentFile || currentFile === mainTab;
      if (isMainFile) {
        await fetch(`http://127.0.0.1:8000/versions/${docId}/save`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ content: codeRef.current }) });
        sendMessage({ type: "save_code", content: codeRef.current, language: lang, doc_id: docId, user: username });
      } else {
        // For secondary files, broadcast latest content
        sendMessage({ type: "file_content", name: currentFile, content: codeRef.current, user: username, doc_id: docId });
        setUploads(p => p.map(f => f.name === currentFile ? { ...f, content: codeRef.current } : f));
        setSharedFiles(p => p.map(f => f.name === currentFile ? { ...f, content: codeRef.current } : f));
      }
      setGitCh(0); push("✅ Saved", "Synced to server", C.green);
    } catch { push("❌ Save failed", "Check backend", C.red); }
  };

  const doSaveAs = () => {
    const name = prompt("Save as filename:", fname); if (!name?.trim()) return;
    const blob = new Blob([codeRef.current], { type: "text/plain" });
    const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = name.trim(); a.click(); URL.revokeObjectURL(url);
    push("✅ Saved As", `Downloaded as ${name.trim()}`, C.green);
  };

  const doNewFile = () => {
    if (!newFN.trim()) return;
    const name = newFN.includes(".") ? newFN : `${newFN}.py`;
    if (name === mainTab) {
      push("⚠️ Error", "Cannot create another file with the same name as the main file.", C.amber);
      return;
    }
    setUploads(p => [...p.filter(f => f.name !== name), { name, content: "", size: 0 }]);
    openIn(name, ""); setNewFN(""); setShowNF(false);
    // ✅ FIX: include content in broadcast
    sendMessage({ type: "file_created", filename: name, content: "", size: 0, user: username, doc_id: docId });
  };

  const doGitCommit = async () => {
    if (!commitMsg.trim()) { push("⚠️ Git", "Please enter a commit message", C.amber); return; }
    const newCommit = { hash: Math.random().toString(36).slice(2, 9), message: commitMsg.trim(), author: username, time: new Date().toLocaleTimeString(), files: allTabs.length };
    setCommits(p => [newCommit, ...p]); setCommitMsg(""); setGitCh(0); setStagedFiles([]);
    push("✅ Committed", `"${newCommit.message}" · ${newCommit.hash}`, C.green);
    sendMessage({ type: "git_commit", commit: newCommit, user: username, doc_id: docId });
    await doSave(); // Actually persist the current state as a version in the backend database
  };

  const handleSearch = () => { if (edRef.current && searchQ) edRef.current.getAction("actions.find")?.run(); };
  const handleReplaceAll = () => {
    if (!searchQ) return; const n = codeRef.current.split(searchQ).join(replaceQ);
    remRef.current = true; setCode(n); codeRef.current = n;
    sendMessage({ type: "operation", user: username, operation: "replace", value: n, version: verRef.current, active_file: activeFileRef.current || mainTab }); verRef.current++;
    setTimeout(() => { remRef.current = false; }, 50);
  };

  const inviteFriend = async () => {
    const email = prompt("Enter email to invite:"); if (!email) return;
    try {
      const r = await fetch(`http://127.0.0.1:8000/documents/${docId}/invite`, { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify({ email: email.trim().toLowerCase() }) });
      const d = await r.json();
      if (r.ok) push("✅ Invited!", `Sent to ${email}`, C.green);
      else push("❌ Error", d.detail || "User not found", C.red);
    } catch { push("❌ Error", "Network error", C.red); }
  };

  const runCode = async (overrideInput) => {
    if (isRunning) {
      // Safety release if stuck
      addTermLine(activeTerm, "⚠️ Restarting stuck execution...", "warn");
      setIsRunning(false);
    }
    const isExtOk = exts.find(e => e.id === lext)?.ok;
    if (!isExtOk) {
      push("❌ Extension Required", `Please install the ${lang} extension to run code.`, C.red);
      setActiveNav("ext");
      return;
    }
    setIsRunning(true); setShowTerm(true);
    const tid = activeTerm; addTermLine(tid, `$ run main.${LEXT[lang] || "py"}…`, "cmd");
    try {
      await fetch(`http://127.0.0.1:8000/versions/${docId}/save`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ content: codeRef.current }) });
      await fetch("http://127.0.0.1:8000/code/run", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ code: codeRef.current, language: lang, doc_id: docId, input: typeof overrideInput === "string" ? overrideInput : (curTerm?.input || "") }) });
      const h = await fetch(`http://127.0.0.1:8000/versions/${docId}`, { headers: { Authorization: `Bearer ${token}` } });
      if (h.ok) setHist(await h.json());
    } catch (e) { console.error(e); addTermLine(tid, "❌ Run error. Check backend.", "error"); setIsRunning(false); }
    setTimeout(() => setIsRunning(false), 35000);
  };

  const sendAiChat = async (overrideMsg) => {
    const userMsg = typeof overrideMsg === "string" ? overrideMsg.trim() : aiInput.trim();
    if (!userMsg || aiThinking) return;
    setAiChats(p => [...p, { role: "user", text: userMsg }]);
    if (typeof overrideMsg !== "string") setAiInput("");
    setAiThink(true);
    try {
      const r = await fetch("http://127.0.0.1:8000/ai/chat", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ message: userMsg, code: codeRef.current.slice(-1200), language: lang }) });
      setAiThink(false);
      if (!r.ok) { setAiChats(p => [...p, { role: "bot", text: `❌ AI error (${r.status}). Check backend.` }]); return; }
      const d = await r.json();
      setAiChats(p => [...p, { role: "bot", text: d.reply || d.suggestion || "Sorry, no response." }]);
    } catch (err) { setAiThink(false); setAiChats(p => [...p, { role: "bot", text: `❌ Connection error: ${err.message}` }]); }
  };

  const handleTermInput = cmd => {
    if (cmd === "__SIGINT__") { addTermLine(activeTerm, "^C (interrupted)", "warn"); setIsRunning(false); return; }
    addTermLine(activeTerm, `$ ${cmd}`, "cmd");
    if (cmd === "clear" || cmd === "cls") { clearTermLines(activeTerm); return; }
    if (cmd === "ls" || cmd === "dir") { addTermLine(activeTerm, [...uploads, ...folFiles, ...sharedFiles].map(f => f.name).join("  ") || "(no files)", "output"); return; }
    if (cmd.startsWith("pip ") || cmd.startsWith("npm ") || cmd.startsWith("apt ")) {
      addTermLine(activeTerm, "Running package manager...", "info");
      fetch("http://127.0.0.1:8000/code/run", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ code: cmd, language: "shell", doc_id: docId }) })
        .catch(e => addTermLine(activeTerm, "❌ Connection Error: " + e.message, "error"));
      setTerms(p => p.map(t => t.id === activeTerm ? { ...t, input: "" } : t));
      return;
    }
    if (cmd === "python" || cmd.startsWith("python ") || cmd.startsWith("run") || cmd.startsWith("node") || cmd.startsWith("gcc") || cmd.startsWith("g++") || cmd.startsWith("java ")) {
      setTerms(p => p.map(t => t.id === activeTerm ? { ...t, input: "" } : t)); // clear input
      if (cmd === "python") {
        addTermLine(activeTerm, "Type Python code directly into the terminal below (e.g., print('hello')). Type 'run' to execute the active file.", "info");
      } else {
        runCode(""); // Pass empty override string to avoid sending terminal command as stdin
      }
      return;
    }

    // Evaluate unrecognized input as raw code (REPL-like behavior)
    fetch("http://127.0.0.1:8000/code/run", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ code: cmd, language: lang, doc_id: docId }) })
      .catch(e => addTermLine(activeTermRef.current, "❌ Connection Error: " + e.message, "error"));

    setTerms(p => p.map(t => t.id === activeTerm ? { ...t, input: "" } : t));
    sendMessage({ type: "input_change", value: cmd, user: username, doc_id: docId });
  };

  // ✅ FIX: handleFileUpload — include content in broadcast so other users see the file
  const handleFileUpload = e => {
    Array.from(e.target.files).forEach(file => {
      const reader = new FileReader();
      reader.onload = ev => {
        const fc = ev.target.result;
        setUploads(prev => [...prev.filter(f => f.name !== file.name), { name: file.name, content: fc, size: file.size }]);
        openIn(file.name, fc);
        sendMessage({ type: "file_created", filename: file.name, content: fc, size: file.size, user: username, doc_id: docId });
      };
      reader.readAsText(file);
    });
    e.target.value = "";
  };

  const handleFolderOpen = e => {
    const files = Array.from(e.target.files).map(f => ({ name: f.name, path: f.webkitRelativePath || f.name, file: f, content: null }));
    if (!files.length) return;
    const rname = (files[0].path || files[0].name).split(/[\\/]/)[0] || "Folder";
    setFolFiles(files); setFolTree(buildTree(files)); setFolName(rname); e.target.value = ""; setActiveNav("files");
    push("📁 Folder opened", `${files.length} files from "${rname}"`, C.green);
    sendMessage({ type: "folder_shared", user: username, doc_id: docId, count: files.length });
  };

  const openFolFile = fobj => {
    if (fobj.content !== null) { openIn(fobj.name, fobj.content); return; }
    const reader = new FileReader();
    reader.onload = ev => { fobj.content = ev.target.result; setFolFiles(p => p.map(f => f.path === fobj.path ? { ...f, content: fobj.content } : f)); openIn(fobj.name, fobj.content); };
    reader.readAsText(fobj.file);
  };

  const openIn = (name, content) => {
    setActiveFile(name); activeFileRef.current = name;
    addTab(name);
    const ext = name.split(".").pop()?.toLowerCase();
    if (EXT_L[ext]) setLang(EXT_L[ext]);
    remRef.current = true; setCode(content); codeRef.current = content;
    setTimeout(() => { remRef.current = false; }, 50);
  };

  const doMenu = action => {
    setActiveMenu(null); const ed = edRef.current;
    switch (action) {
      case "exit": navigate("/dashboard"); break;
      case "new-file": setShowNF(true); setActiveNav("files"); break;
      case "save": doSave(); break;
      case "save-as": doSaveAs(); break;
      case "open-upload": fRef.current?.click(); break;
      case "open-folder": folRef.current?.click(); break;
      case "find": ed?.getAction("actions.find")?.run(); break;
      case "replace": ed?.getAction("editor.action.startFindReplaceAction")?.run(); break;
      case "format-code": ed?.getAction("editor.action.formatDocument")?.run(); break;
      case "undo": ed?.trigger("menu", "undo", null); break;
      case "redo": ed?.trigger("menu", "redo", null); break;
      case "cut": ed?.trigger("menu", "editor.action.clipboardCutAction", null); break;
      case "copy": ed?.trigger("menu", "editor.action.clipboardCopyAction", null); break;
      case "paste": ed?.trigger("menu", "editor.action.clipboardPasteAction", null); break;
      case "select-all": ed?.trigger("menu", "editor.action.selectAll", null); break;
      case "expand-sel": ed?.trigger("menu", "editor.action.smartSelect.expand", null); break;
      case "shrink-sel": ed?.trigger("menu", "editor.action.smartSelect.shrink", null); break;
      case "nav-files": setActiveNav("files"); break;
      case "nav-search": setActiveNav("search"); break;
      case "nav-git": setActiveNav("git"); break;
      case "nav-ext": setActiveNav("ext"); break;
      case "nav-hist": setActiveNav("hist"); break;
      case "nav-chat": setActiveNav("chat"); break;
      case "nav-ai": setActiveNav("ai"); break;
      case "toggle-term": setShowTerm(p => !p); break;
      case "new-term": addNewTerm(); break;
      case "toggle-theme": setIsDark(p => !p); break;
      case "run": runCode(); break;
      case "ai-complete": setActiveNav("ai"); break;
      case "invite": inviteFriend(); break;
      case "clear-term": clearTermLines(activeTerm); break;
      case "shortcuts": push("⌨️ Shortcuts", "Ctrl+S · F5 · Ctrl+` · Ctrl+N · Ctrl+Shift+S", C.accent); break;
      case "about": setShowAbout(true); break;
      default: break;
    }
  };

  /* ── SIDE PANEL ── */
  const sideContent = () => {
    const hdr = (t, ex) => (
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.13em", textTransform: "uppercase", color: C.t3, marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span>{t}</span>{ex}
      </div>
    );

    if (activeNav === "files") return (
      <div style={{ padding: "12px 10px" }}>
        {hdr(`Explorer — doc/${docId}`,
          <div style={{ display: "flex", gap: 4 }}>
            <button title="New File" onClick={() => setShowNF(p => !p)} style={{ background: "none", border: "none", color: C.t3, cursor: "pointer", display: "flex", alignItems: "center", padding: "2px 4px", borderRadius: 4 }} onMouseEnter={e => e.currentTarget.style.color = C.t0} onMouseLeave={e => e.currentTarget.style.color = C.t3}>{Ic.nf}</button>
            <button title="Upload" onClick={() => fRef.current?.click()} style={{ background: "none", border: "none", color: C.t3, cursor: "pointer", display: "flex", alignItems: "center", padding: "2px 4px", borderRadius: 4 }} onMouseEnter={e => e.currentTarget.style.color = C.t0} onMouseLeave={e => e.currentTarget.style.color = C.t3}>{Ic.upload}</button>
            <button title="Open Folder" onClick={() => folRef.current?.click()} style={{ background: "none", border: "none", color: C.t3, cursor: "pointer", display: "flex", alignItems: "center", padding: "2px 4px", borderRadius: 4 }} onMouseEnter={e => e.currentTarget.style.color = C.t0} onMouseLeave={e => e.currentTarget.style.color = C.t3}>{Ic.folder}</button>
          </div>
        )}
        {showNF && (
          <div style={{ display: "flex", gap: 5, marginBottom: 8 }}>
            <input autoFocus value={newFN} onChange={e => setNewFN(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") doNewFile(); if (e.key === "Escape") { setShowNF(false); setNewFN(""); } }}
              placeholder="filename.py" style={{ flex: 1, padding: "4px 8px", background: C.bg3, border: `1px solid ${C.aBdr}`, borderRadius: 5, color: C.t0, fontSize: 12, fontFamily: C.mono }} />
            <button onClick={doNewFile} style={{ padding: "4px 8px", background: C.accent, color: "#fff", border: "none", borderRadius: 5, fontSize: 11, cursor: "pointer" }}>✓</button>
          </div>
        )}
        {(() => {
          const allProjectFiles = [];
          if (hasContent) allProjectFiles.push({ name: mainTab, isMain: true });
          uploads.forEach(f => { if (!allProjectFiles.some(x => x.name === f.name)) allProjectFiles.push({ ...f, isUpload: true }); });
          sharedFiles.forEach(f => { if (!allProjectFiles.some(x => x.name === f.name)) allProjectFiles.push({ ...f, isShared: true }); });
          allProjectFiles.sort((a, b) => a.name.localeCompare(b.name));

          if (allProjectFiles.length === 0) return null;

          return (
            <>
              <div style={{ fontSize: 10, color: C.t4, marginBottom: 4, paddingLeft: 2, fontWeight: 600, letterSpacing: "0.08em" }}>PROJECT FILES</div>
              {allProjectFiles.map(f => (
                <div key={f.name} className={`pi${activeFile === f.name || (f.isMain && !activeFile) ? " act" : ""}`}
                  onClick={() => {
                    if (f.isMain) { setActiveFile(null); activeFileRef.current = null; addTab(mainTab); const snap = mainContentRef.current; remRef.current = true; setCode(snap); setTimeout(() => { remRef.current = false; }, 50); }
                    else openIn(f.name, f.content || "");
                  }}
                  style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 8px", borderRadius: 4, cursor: "pointer", fontSize: 12, color: (activeFile === f.name || (f.isMain && !activeFile)) ? C.aLt : C.t1, transition: "all .1s" }}>
                  <span style={{ color: fCol(f.name), display: "flex" }}>{Ic.file}</span>
                  <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</span>
                  {f.isMain && gitCh > 0 && !activeFile && <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.amber, marginLeft: "auto", flexShrink: 0 }} />}
                  <button onClick={(e) => { e.stopPropagation(); closeTab(f.name, e); }} style={{ background: "none", border: "none", color: C.t3, cursor: "pointer", display: "flex", alignItems: "center" }}>{Ic.x}</button>
                </div>
              ))}
            </>
          );
        })()}
        {folFiles.length > 0 && (
          <>
            <div style={{ fontSize: 10, color: C.t4, margin: "10px 0 4px", paddingTop: 8, borderTop: `1px solid ${C.b}`, fontWeight: 600, letterSpacing: "0.08em", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span>📁 {folName} ({folFiles.length})</span>
              <button onClick={closeFolder} style={{ background: "none", border: "none", color: C.red, cursor: "pointer", display: "flex", alignItems: "center", gap: 2, fontSize: 11, fontWeight: 700, padding: "1px 5px", borderRadius: 3 }}>{Ic.x} Close</button>
            </div>
            <FolderTree node={folTree} C={C} onOpen={openFolFile} activeFile={activeFile} />
          </>
        )}
        {!hasContent && uploads.length === 0 && folFiles.length === 0 && sharedFiles.length === 0 && <p style={{ color: C.t4, fontSize: 12, padding: "8px 2px", lineHeight: 1.7 }}>No files open.</p>}
      </div>
    );

    if (activeNav === "search") return (
      <div style={{ padding: "12px 10px", display: "flex", flexDirection: "column", gap: 8 }}>
        {hdr("Search")}
        <input value={searchQ} onChange={e => setSearchQ(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSearch()} placeholder="Search in code…"
          style={{ background: C.bg3, border: `1px solid ${C.b}`, borderRadius: 6, padding: "7px 10px", color: C.t0, fontSize: 12, width: "100%" }} />
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={handleSearch} style={{ flex: 1, padding: "5px 0", background: C.aBg, color: C.aLt, borderRadius: 6, border: `1px solid ${C.aBdr}`, fontSize: 11, fontWeight: 600, cursor: "pointer" }}>Find Next</button>
          <button onClick={() => setShowReplace(p => !p)} style={{ flex: 1, padding: "5px 0", background: C.bg4, color: C.t2, borderRadius: 6, border: `1px solid ${C.b}`, fontSize: 11, fontWeight: 600, cursor: "pointer" }}>Replace</button>
        </div>
        {showReplace && (
          <>
            <input value={replaceQ} onChange={e => setReplaceQ(e.target.value)} placeholder="Replace with…"
              style={{ background: C.bg3, border: `1px solid ${C.b}`, borderRadius: 6, padding: "7px 10px", color: C.t0, fontSize: 12, width: "100%" }} />
            <button onClick={handleReplaceAll} style={{ padding: "5px 0", background: C.pBg, color: C.purple, borderRadius: 6, border: `1px solid ${C.pBdr}`, fontSize: 11, fontWeight: 600, cursor: "pointer", width: "100%" }}>Replace All</button>
          </>
        )}
        {searchQ && <div style={{ padding: "6px 10px", background: C.bg3, borderRadius: 6, fontSize: 11, color: C.t2 }}>{codeRef.current.split(searchQ).length - 1} match(es)</div>}
      </div>
    );

    if (activeNav === "git") return (
      <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
        <div style={{ padding: "10px 14px", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: C.t2, letterSpacing: "0.05em", textTransform: "uppercase" }}>Source Control</span>
          <div style={{ display: "flex", gap: 2 }}>
            <button onClick={doSave} title="Save All" style={{ width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center", background: "none", border: "none", color: C.t3, cursor: "pointer", borderRadius: 4 }} onMouseEnter={e => e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"} onMouseLeave={e => e.currentTarget.style.background = "none"}>{Ic.save}</button>
            <button onClick={doGitCommit} title="Commit" style={{ width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center", background: "none", border: "none", color: C.t3, cursor: "pointer", borderRadius: 4 }} onMouseEnter={e => e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"} onMouseLeave={e => e.currentTarget.style.background = "none"}>{Ic.check}</button>
          </div>
        </div>
        <div style={{ padding: "0 14px 10px", flexShrink: 0 }}>
          <div style={{ border: `1px solid ${isDark ? "#3c3c3c" : C.b}`, borderRadius: 3, background: isDark ? "#3c3c3c" : C.bg3, overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <textarea value={commitMsg} onChange={e => setCommitMsg(e.target.value)} onKeyDown={e => { if (e.ctrlKey && e.key === "Enter") { e.preventDefault(); doGitCommit(); } }}
              placeholder="Message (Ctrl+Enter to commit)" rows={2}
              style={{ width: "100%", padding: "6px 8px", background: "transparent", color: C.t0, border: "none", fontSize: 12, resize: "vertical", minHeight: 40, outline: "none", boxSizing: "border-box", fontFamily: C.sans }} />
          </div>
          <button onClick={doGitCommit} style={{ width: "100%", marginTop: 8, padding: "6px 0", background: C.accent, color: "#fff", border: "none", borderRadius: 3, fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>✓ Commit</button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", paddingBottom: 10 }}>
          {gitCh > 0 ? (
            <>
              <div style={{ padding: "4px 14px", fontSize: 11, color: C.t3, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)", display: "flex", alignItems: "center", gap: 4, cursor: "pointer" }}>
                <span>▾ Changes</span>
                <span style={{ background: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)", color: C.t0, padding: "1px 6px", borderRadius: 10, fontSize: 10, marginLeft: "auto" }}>{gitCh}</span>
              </div>
              <div style={{ padding: "4px 0" }}>
                {allTabs.map((f, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", padding: "4px 14px", cursor: "pointer" }} onMouseEnter={e => e.currentTarget.style.background = isDark ? "#2a2d2e" : C.bg3} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <span style={{ color: fCol(f), display: "flex", marginRight: 6, width: 16, justifyContent: "center" }}>{Ic.file}</span>
                    <span style={{ fontSize: 12, color: C.t0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{f}</span>
                    <span style={{ fontSize: 11, color: C.amber, fontWeight: 600, marginRight: 8 }}>M</span>
                    <button onClick={(e) => { e.stopPropagation(); setStagedFiles(p => p.includes(f) ? p.filter(x => x !== f) : [...p, f]); }} style={{ background: "none", border: "none", color: C.t3, cursor: "pointer", fontSize: 14, padding: 0, display: "flex", alignItems: "center" }} title={stagedFiles.includes(f) ? "Unstage Changes" : "Stage Changes"}>{stagedFiles.includes(f) ? "−" : "+"}</button>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={{ padding: "16px 14px", textAlign: "center", fontSize: 12, color: C.t3 }}>No changes to commit.</div>
          )}
          {commits.length > 0 && (
            <>
              <div style={{ padding: "4px 14px", fontSize: 11, color: C.t3, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)", marginTop: 10, display: "flex", alignItems: "center", gap: 4 }}>
                <span>▾ Commits</span>
              </div>
              <div style={{ padding: "4px 0" }}>
                {commits.map((c, i) => (
                  <div key={i} style={{ padding: "6px 14px", borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                      <span style={{ fontSize: 12, color: C.t0, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.message}</span>
                      <span style={{ fontSize: 10, color: C.t4, marginLeft: "auto", flexShrink: 0 }}>{c.hash}</span>
                    </div>
                    <div style={{ fontSize: 11, color: C.t3 }}>{c.author} · {c.time}</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    );

    if (activeNav === "ext") return (
      <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <div style={{ padding: "10px 14px", flexShrink: 0 }}>
          {hdr("Extensions")}
          <div style={{ position: "relative", marginTop: 8 }}>
            <input value={extSearch} onChange={e => setExtSearch(e.target.value)} placeholder="Search Extensions in Marketplace" style={{ width: "100%", padding: "6px 8px", background: isDark ? "#3c3c3c" : C.bg3, border: `1px solid ${isDark ? "transparent" : C.b}`, borderRadius: 3, color: C.t0, fontSize: 12, outline: "none", boxSizing: "border-box" }} />
          </div>
        </div>
        <div style={{ flex: 1, overflowY: "auto", paddingBottom: 10 }}>
          {["Installed", "Available"].map(sec => {
            const list = exts.filter(e => (sec === "Installed" ? e.ok : !e.ok) && (!extSearch || e.n.toLowerCase().includes(extSearch.toLowerCase()) || e.d.toLowerCase().includes(extSearch.toLowerCase())));
            if (!list.length) return null;
            return <div key={sec}>
              <div style={{ padding: "4px 14px", fontSize: 11, color: C.t3, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)", marginTop: sec === "Available" && exts.filter(e => e.ok).length ? 0 : 0 }}>{sec}</div>
              {list.map(ext => (
                <div key={ext.id} style={{ display: "flex", padding: "10px 14px", cursor: "pointer", transition: "background 0.1s" }} onMouseEnter={e => e.currentTarget.style.background = isDark ? "#2a2d2e" : C.bg3} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <div style={{ width: 42, height: 42, background: isDark ? "#252526" : C.bg4, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 4, fontSize: 22, marginRight: 12, flexShrink: 0 }}>
                    {ext.i}
                  </div>
                  <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 2 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: C.t0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ext.n}</span>
                      {ext.ok
                        ? <button onClick={(e) => { e.stopPropagation(); saveExts(p => p.map(e => e.id === ext.id ? { ...e, ok: false } : e)); push(`🗑 ${ext.n}`, "Uninstalled", C.amber); }} style={{ background: "none", border: "none", color: C.t3, cursor: "pointer", padding: "2px 4px", fontSize: 14 }} title="Uninstall">⚙</button>
                        : <button onClick={(e) => { e.stopPropagation(); saveExts(p => p.map(e => e.id === ext.id ? { ...e, ok: true } : e)); push(`✅ ${ext.n}`, "Installed", C.green); }} style={{ background: C.accent, color: "#fff", border: "none", borderRadius: 3, padding: "3px 10px", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>Install</button>
                      }
                    </div>
                    <div style={{ fontSize: 11, color: C.t3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 2 }}>{ext.d}</div>
                    <div style={{ fontSize: 11, color: C.t4, display: "flex", alignItems: "center", gap: 6 }}>
                      <span>{ext.a}</span>
                      {ext.ok && <span style={{ color: C.green, fontSize: 10 }}>✓ Installed</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>;
          })}
        </div>
      </div>
    );

    if (activeNav === "hist") return (
      <div style={{ padding: "12px 10px" }}>
        {hdr("Version History")}
        {Array.isArray(hist) && hist.length > 0 ? [...hist].reverse().map((v, i) => {
          const ri = hist.length - 1 - i;
          return <div key={i} style={{ padding: "10px 12px", background: C.bg3, borderRadius: 8, border: `1px solid ${C.b}`, marginBottom: 8 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 5 }}>
              <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 4, background: C.aBg, color: C.aLt, border: `1px solid ${C.aBdr}`, fontFamily: C.mono }}>v{hist.length - i}</span>
              <span style={{ fontSize: 10, color: C.t4, fontFamily: C.mono }}>{v.timestamp || "Auto"}</span>
            </div>
            <div style={{ fontSize: 11, color: C.t3, marginBottom: 8, fontFamily: C.mono, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{(v.content || "").slice(0, 50) || "(empty)"}…</div>
            <button onClick={async () => {
              const text = v.content || ""; try { await restoreVersion(docId, ri); } catch { }
              remRef.current = true; setCode(text); codeRef.current = text;
              sendMessage({ type: "operation", user: username, operation: "replace", value: text, version: verRef.current, active_file: activeFileRef.current || mainTab }); verRef.current++;
              setTimeout(() => { remRef.current = false; }, 50); push("↩ Restored", `Version ${hist.length - i}`, C.accent);
            }} style={{ width: "100%", padding: "5px 0", background: C.bg4, color: C.t1, border: `1px solid ${C.b}`, borderRadius: 5, fontSize: 11, fontWeight: 600, cursor: "pointer" }}
              onMouseEnter={e => { e.currentTarget.style.background = C.accent; e.currentTarget.style.color = "#fff"; }}
              onMouseLeave={e => { e.currentTarget.style.background = C.bg4; e.currentTarget.style.color = C.t1; }}>↩ Restore</button>
          </div>;
        }) : <p style={{ color: C.t4, fontSize: 12, textAlign: "center", padding: "20px 0" }}>No versions yet.</p>}
      </div>
    );

    if (activeNav === "chat") return (
      <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <div style={{ padding: "12px 10px 6px", flexShrink: 0 }}>
          {hdr("Group Chat",
            <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: C.green }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.green, display: "inline-block" }} />{totalOnline} online
            </div>
          )}
        </div>
        {typingUs.length > 0 && <div style={{ padding: "4px 12px", display: "flex", alignItems: "center", gap: 7, fontSize: 11.5, color: C.t3, flexShrink: 0 }}>
          <div style={{ display: "flex", gap: 3, alignItems: "center" }}><Dot delay={0} /><Dot delay={.16} /><Dot delay={.32} /></div>{typingUs[0]} typing…
        </div>}
        <div style={{ flex: 1, overflowY: "auto", padding: "0 10px 8px", display: "flex", flexDirection: "column", gap: 8 }}>
          {msgs.length === 0 && <p style={{ color: C.t4, fontSize: 12, textAlign: "center", marginTop: 20 }}>No messages yet.</p>}
          {msgs.map((m, i) => {
            const mine = m.username === username; return (
              <div key={i} style={{ alignSelf: mine ? "flex-end" : "flex-start", maxWidth: "90%", display: "flex", flexDirection: "column", gap: 2 }}>
                <span style={{ fontSize: 10, color: C.t3, textAlign: mine ? "right" : "left", padding: "0 3px" }}>{m.username} · {m.timestamp}</span>
                <div style={{ padding: "8px 11px", borderRadius: mine ? "12px 12px 2px 12px" : "12px 12px 12px 2px", background: mine ? C.accent : C.bg4, color: mine ? "#fff" : C.t0, fontSize: 12.5, lineHeight: 1.5, border: mine ? "none" : `1px solid ${C.b}` }}>{m.message}</div>
              </div>
            );
          })}
          <div ref={chatEnd} />
        </div>
        <div style={{ padding: "8px 10px", borderTop: `1px solid ${C.b}`, background: C.bg2, flexShrink: 0 }}>
          <form onSubmit={e => { e.preventDefault(); if (!chatIn.trim()) return; sendMessage({ type: "chat", message: chatIn, username, timestamp: new Date().toLocaleTimeString() }); setChatIn(""); }} style={{ display: "flex", gap: 7, alignItems: "center" }}>
            <input value={chatIn} onChange={e => setChatIn(e.target.value)} placeholder="Message…"
              style={{ flex: 1, padding: "8px 10px", background: C.bg3, color: C.t0, border: `1px solid ${C.b}`, borderRadius: 6, fontSize: 12, minWidth: 0 }} />
            <button type="submit" style={{ padding: "8px 14px", background: C.accent, color: "#fff", borderRadius: 6, fontSize: 12, fontWeight: 600, border: "none", cursor: "pointer", flexShrink: 0 }}>Send</button>
          </form>
        </div>
      </div>
    );

    if (activeNav === "ai") return (
      <div style={{ display: "flex", flexDirection: "column", height: "100%", background: isDark ? "#0d0d12" : C.bg2 }}>
        <div style={{ padding: "10px 12px", borderBottom: `1px solid ${isDark ? "#222" : C.b}`, display: "flex", alignItems: "center", gap: 8, background: isDark ? "#111" : C.bg3, flexShrink: 0 }}>
          <span style={{ fontSize: 16 }}>⬛</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: isDark ? "#fff" : C.t0, letterSpacing: "0.05em", textTransform: "uppercase", fontFamily: "monospace" }}>AI Chat</span>
          <span style={{ fontSize: 10, color: isDark ? "#666" : C.t3, fontFamily: "monospace", marginLeft: "auto" }}>Gemini 2.5 Flash</span>
          <button onClick={() => setAiChats([{ role: "bot", text: "Hello! Ask me anything about your code." }])} style={{ background: "none", border: "none", color: isDark ? "#666" : C.t3, cursor: "pointer", fontSize: 12, lineHeight: 1, padding: "2px 6px", borderRadius: 4 }}>🗑</button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "12px 10px", display: "flex", flexDirection: "column", gap: 10 }}>
          {aiChats.map((m, i) => (
            <div key={i} className={m.role === "user" ? "ai-user" : "ai-bot"}
              style={{ fontSize: 12, lineHeight: 1.65, color: m.role === "user" ? (isDark ? "#fff" : C.t0) : (isDark ? "#d4d4d4" : C.t1), fontFamily: C.sans, whiteSpace: "pre-wrap" }}>
              {m.role === "bot" && <div style={{ fontSize: 10, color: isDark ? "#818cf8" : "#6366f1", fontWeight: 700, marginBottom: 4, fontFamily: "monospace" }}>⬛ VisionAI</div>}
              {m.text}
            </div>
          ))}
          {aiThinking && <div style={{ display: "flex", alignItems: "cenfter", gap: 8, fontSize: 11, color: "#818cf8", fontFamily: "monospace" }}><div style={{ display: "flex", gap: 3 }}><Dot delay={0} /><Dot delay={.2} /><Dot delay={.4} /></div>Thinking…</div>}
          <div ref={aiChatEnd} />
        </div>
        <div style={{ padding: "8px 10px", borderTop: `1px solid ${isDark ? "#222" : C.b}`, background: isDark ? "#111" : C.bg3, flexShrink: 0 }}>
          <div style={{ display: "flex", gap: 6, alignItems: "flex-end" }}>
            <textarea value={aiInput} onChange={e => setAiInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendAiChat(); } }}
              placeholder="Ask AI about your code… (Enter to send)" rows={2}
              style={{ flex: 1, padding: "8px 10px", background: isDark ? "#1a1a22" : "#fff", color: isDark ? "#d4d4d4" : C.t0, border: `1px solid ${isDark ? "#333" : C.b}`, borderRadius: 7, fontSize: 12, resize: "none", fontFamily: C.sans, outline: "none", minWidth: 0 }} />
            <button onClick={sendAiChat} disabled={aiThinking || !aiInput.trim()}
              style={{ padding: "8px 12px", background: "#000", color: "#fff", borderRadius: 7, fontSize: 11, fontWeight: 700, border: "1px solid #333", cursor: aiThinking ? "not-allowed" : "pointer", flexShrink: 0, fontFamily: "monospace", display: "flex", alignItems: "center", gap: 4 }}>
              {aiThinking ? <span style={{ width: 10, height: 10, border: "2px solid #555", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin .7s linear infinite" }} /> : Ic.spark}
              {aiThinking ? "…" : "Ask"}
            </button>
          </div>
          <div style={{ fontSize: 10, color: isDark ? "#444" : C.t4, marginTop: 5, textAlign: "center" }}>Shift+Enter for new line · Enter to send</div>
        </div>
      </div>
    );
  };

  return (
    <>
      <GS C={C} />
      <input ref={fRef} type="file" multiple style={{ display: "none" }} onChange={handleFileUpload} accept=".py,.cpp,.java,.html,.css,.json,.txt,.md,.js,.ts" />
      <input ref={folRef} type="file" webkitdirectory="" directory="" multiple style={{ display: "none" }} onChange={handleFolderOpen} />

      {showSett && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setShowSett(false)}>
          <div style={{ width: 380, background: C.bg2, border: `1px solid ${C.bh}`, borderRadius: 12, boxShadow: "0 24px 60px rgba(0,0,0,0.5)" }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: "14px 18px", borderBottom: `1px solid ${C.b}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: C.t0 }}>⚙️ Settings</div>
              <button onClick={() => setShowSett(false)} style={{ background: "none", border: "none", color: C.t3, cursor: "pointer", fontSize: 18, padding: "2px 8px", borderRadius: 5 }}>×</button>
            </div>
            <div style={{ padding: "18px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: `1px solid ${C.b}` }}>
                <span style={{ fontSize: 13, color: C.t1 }}>Font Size</span>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <input type="range" min={10} max={22} step={1} value={fontSize} onChange={e => setFontSize(Number(e.target.value))} style={{ width: 100, accentColor: C.accent }} />
                  <span style={{ fontSize: 12, fontFamily: C.mono, color: C.accent, minWidth: 22 }}>{fontSize}px</span>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0" }}>
                <span style={{ fontSize: 13, color: C.t1 }}>Theme</span>
                <div onClick={() => setIsDark(p => !p)} style={{ width: 40, height: 22, borderRadius: 11, background: isDark ? C.accent : C.bg5, cursor: "pointer", position: "relative", transition: "background .2s" }}>
                  <div style={{ position: "absolute", top: 3, left: isDark ? 20 : 3, width: 16, height: 16, borderRadius: 8, background: "#fff", transition: "left .2s" }} />
                </div>
              </div>
              <div style={{ marginTop: 14, display: "flex", justifyContent: "flex-end" }}>
                <button onClick={() => setShowSett(false)} style={{ padding: "8px 22px", background: C.accent, color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Done</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAbout && <AboutModal C={C} onClose={() => setShowAbout(false)} />}
      {showOnline && <OnlineUsersModal C={C} docId={docId} token={token} onlineUsers={onlineUsers} username={username} onClose={() => setShowOnline(false)} />}
      <Toast C={C} notifs={notifs} rm={rmN} />

      <div style={{ position: "fixed", inset: 0, display: "flex", flexDirection: "column", background: C.bg0, fontFamily: C.sans, overflow: "hidden" }}>
        <div style={{ flexShrink: 0, background: C.bg1, borderBottom: `1px solid ${C.b}`, zIndex: 500 }}>
          <div style={{ height: 30, display: "flex", alignItems: "center", padding: "0 14px", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }} onClick={() => navigate("/dashboard")}>
              <div style={{ width: 20, height: 20, borderRadius: 5, background: `linear-gradient(135deg,${C.accent},${C.purple})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="12" height="12" viewBox="0 0 20 20" fill="none"><rect x="2" y="2" width="6" height="6" rx="1.5" fill="white" fillOpacity="0.95" /><rect x="12" y="2" width="6" height="6" rx="1.5" fill="white" fillOpacity="0.95" /><rect x="2" y="12" width="6" height="6" rx="1.5" fill="white" fillOpacity="0.95" /><rect x="12" y="12" width="6" height="6" rx="1.5" fill="white" fillOpacity="0.4" /></svg>
              </div>
              <span style={{ fontSize: 12, fontWeight: 700, color: C.t0 }}>VisionAI</span>
            </div>
            <span style={{ fontSize: 11, color: C.t3, fontFamily: C.mono }}>doc/{docId}{fname ? ` — ${fname}` : ""}</span>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button onClick={() => setShowOnline(true)}
                style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10.5, color: C.green, background: C.gBg, border: `1px solid ${C.gBdr}`, borderRadius: 12, padding: "2px 8px", cursor: "pointer" }}>
                <span style={{ position: "relative", display: "inline-flex", alignItems: "center", width: 8, height: 8, flexShrink: 0 }}>
                  <span style={{ position: "absolute", width: 8, height: 8, borderRadius: "50%", background: C.green, animation: "ping 1.6s ease-out infinite" }} />
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: C.green, position: "relative", zIndex: 1 }} />
                </span>
                {totalOnline} online
              </button>
              <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 4, background: C.aBg, color: C.aLt, border: `1px solid ${C.aBdr}`, fontFamily: C.mono }}>{username}</span>
            </div>
          </div>
          <div style={{ height: 26, display: "flex", alignItems: "center", padding: "0 8px", position: "relative" }}>
            {Object.entries(MENUS).map(([name, items]) => (
              <div key={name} style={{ position: "relative" }}>
                <div className="mi" onClick={e => { e.stopPropagation(); setActiveMenu(activeMenu === name ? null : name); }}
                  style={{ padding: "0 9px", height: 26, display: "flex", alignItems: "center", fontSize: 12, color: activeMenu === name ? C.t0 : C.t2, cursor: "pointer", borderRadius: 4, background: activeMenu === name ? C.bg4 : "transparent", userSelect: "none", transition: "all .1s" }}>
                  {name}
                </div>
                {activeMenu === name && (
                  <div className="md" style={{ position: "absolute", top: "100%", left: 0, minWidth: 220, background: C.bg2, border: `1px solid ${C.bh}`, borderRadius: 8, boxShadow: `0 12px 32px rgba(0,0,0,.5)`, zIndex: 1000, overflow: "hidden", padding: "4px 0" }}>
                    {items.map((item, i) => item.t === "sep"
                      ? <div key={i} style={{ height: 1, background: C.b, margin: "3px 0" }} />
                      : <div key={i} className={`mdi${item.d ? " dis" : ""}`} onClick={() => item.a ? doMenu(item.a) : setActiveMenu(null)}
                        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 14px", fontSize: 12.5, color: C.t1, cursor: "pointer" }}>
                        <span>{item.l}</span>{item.s && <span style={{ fontSize: 10.5, color: C.t4, marginLeft: 24, fontFamily: C.mono }}>{item.s}</span>}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
          <div style={{ width: 46, flexShrink: 0, background: C.bg1, borderRight: `1px solid ${C.b}`, display: "flex", flexDirection: "column", alignItems: "center", padding: "8px 0 10px", gap: 2, zIndex: 100 }}>
            {NAV.map(({ id, icon, tip }) => (
              <button key={id} title={tip} className={`sbi${activeNav === id ? " act" : ""}`} onClick={() => setActiveNav(id)}
                style={{ width: 38, height: 38, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", color: C.t3, position: "relative" }}>
                {icon}
                {id === "git" && gitCh > 0 && <span style={{ position: "absolute", top: 6, right: 6, width: 7, height: 7, borderRadius: "50%", background: C.amber, border: `1px solid ${C.bg1}` }} />}
                {id === "chat" && msgs.length > 0 && <span style={{ position: "absolute", top: 6, right: 6, width: 7, height: 7, borderRadius: "50%", background: C.accent, border: `1px solid ${C.bg1}` }} />}
                {id === "chat" && typingUs.length > 0 && <span style={{ position: "absolute", top: 4, right: 4, width: 9, height: 9, borderRadius: "50%", background: C.green, border: `1px solid ${C.bg1}`, animation: "ping 1s infinite" }} />}
                {id === "ai" && <span style={{ position: "absolute", bottom: 6, right: 6, width: 7, height: 7, borderRadius: "50%", background: C.purple, border: `1px solid ${C.bg1}` }} />}
              </button>
            ))}
            <div style={{ flex: 1 }} />
            <button className="sbi" onClick={() => setIsDark(p => !p)} style={{ width: 38, height: 38, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", color: C.t3, cursor: "pointer", marginBottom: 2 }}>{isDark ? Ic.sun : Ic.moon}</button>
            <button className="sbi" onClick={() => setShowSett(true)} style={{ width: 38, height: 38, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", color: C.t3, cursor: "pointer", marginBottom: 2 }}>{Ic.sett}</button>
            <button className="sbi dng" onClick={() => { localStorage.clear(); navigate("/login"); }} style={{ width: 38, height: 38, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", color: C.t3, cursor: "pointer" }}>{Ic.logout}</button>
          </div>

          <div style={{ width: sideW, flexShrink: 0, background: activeNav === "ai" ? (isDark ? "#0d0d12" : C.bg2) : C.bg2, borderRight: `1px solid ${C.b}`, display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>
            <div style={{ flex: 1, overflowY: "auto" }}>{sideContent()}</div>
            <div onMouseDown={(e) => {
              e.preventDefault();
              const startX = e.clientX;
              const startW = sideW;
              const onMove = e2 => setSideW(Math.max(150, Math.min(600, startW + (e2.clientX - startX))));
              const onUp = () => { document.removeEventListener("mousemove", onMove); document.removeEventListener("mouseup", onUp); };
              document.addEventListener("mousemove", onMove); document.addEventListener("mouseup", onUp);
            }} style={{ position: "absolute", top: 0, right: 0, width: 4, height: "100%", cursor: "col-resize", zIndex: 10, background: "transparent" }} />
          </div>

          <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
            <div style={{ height: 44, background: C.bg1, borderBottom: `1px solid ${C.b}`, display: "flex", alignItems: "center", padding: "0 12px", gap: 8, flexShrink: 0, zIndex: 50 }}>
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <span style={{ position: "absolute", left: 8, fontSize: 13, pointerEvents: "none" }}>{licon}</span>
                <select value={lang} onChange={e => {
                  const nl = e.target.value; setLang(nl); localStorage.setItem(`visionai_lang_${docId}`, nl);
                  sendMessage({ type: "language_change", language: nl, user: username, doc_id: docId });
                  if (hasContent && !activeFile) { const nt = `main.${LEXT[nl] || "py"}`; setTabs(p => { const wo = p.filter(t => !Object.values(LEXT).some(ex => t === `main.${ex}`)); return [...wo, nt]; }); }
                }} style={{ background: C.bg3, color: C.t0, border: `1px solid ${C.b}`, borderRadius: 7, padding: "5px 22px 5px 28px", fontSize: 12, fontWeight: 500, cursor: "pointer", appearance: "none", fontFamily: C.sans }}>
                  <option value="python">Python</option><option value="cpp">C++</option><option value="java">Java</option>
                </select>
                <span style={{ position: "absolute", right: 7, fontSize: 9, color: C.t3, pointerEvents: "none" }}>▾</span>
              </div>
              <button onClick={() => { setActiveNav("ai"); sendAiChat("Explain the code in this file."); }} style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 12px", background: "#000", color: "#fff", borderRadius: 7, fontSize: 12, fontWeight: 700, border: "1px solid #333", cursor: "pointer", fontFamily: C.sans }}>{Ic.bb} AI Complete</button>
              <button className="rb" onClick={runCode} disabled={isRunning}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 13px", background: isRunning ? C.bg4 : `linear-gradient(135deg,#15803d,${C.green})`, color: isRunning ? C.t3 : "#fff", borderRadius: 7, fontSize: 12, fontWeight: 600, border: "none", cursor: isRunning ? "not-allowed" : "pointer", minWidth: 76, justifyContent: "center", fontFamily: C.sans, transition: "all .14s" }}>
                {isRunning ? <><span style={{ width: 10, height: 10, border: `2px solid ${C.t3}`, borderTopColor: C.t1, borderRadius: "50%", display: "inline-block", animation: "spin .7s linear infinite" }} /> Running</> : <>{Ic.play} Run</>}
              </button>
              <button onClick={inviteFriend} style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 11px", background: `linear-gradient(135deg,#92400e,${C.amber})`, color: "#fff", borderRadius: 7, fontSize: 12, fontWeight: 600, border: "none", cursor: "pointer", fontFamily: C.sans }}>{Ic.invite} Invite</button>
              <div style={{ flex: 1 }} />
              {typingUs.length > 0 && <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "3px 10px", background: C.gBg, border: `1px solid ${C.gBdr}`, borderRadius: 6, fontSize: 11, color: C.green, flexShrink: 0 }}><div style={{ display: "flex", gap: 2 }}><Dot delay={0} /><Dot delay={.16} /><Dot delay={.32} /></div>{typingUs[0]} typing…</div>}
              {inlineAi && <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "3px 10px", background: C.pBg, border: `1px solid ${C.pBdr}`, borderRadius: 6, fontSize: 11, color: C.purple, fontFamily: C.mono, maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flexShrink: 0 }}>⬛ <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{inlineAi}</span><kbd style={{ fontSize: 9, color: C.t4, background: C.bg4, border: `1px solid ${C.b}`, borderRadius: 3, padding: "1px 4px", flexShrink: 0 }}>Tab</kbd></div>}
              <button onClick={() => setShowTerm(p => !p)} style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 10px", background: showTerm ? C.bg4 : C.bg3, color: showTerm ? C.t0 : C.t2, borderRadius: 7, border: `1px solid ${showTerm ? C.bh : C.b}`, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: C.sans }}>{Ic.term} Terminal</button>
              <button onClick={() => navigate("/dashboard")} style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 10px", background: C.bg3, color: C.red, borderRadius: 7, fontSize: 12, fontWeight: 600, border: `1px solid ${C.b}`, cursor: "pointer", fontFamily: C.sans }}>{Ic.x} Exit</button>
            </div>

            <div style={{ height: 34, background: C.bg2, borderBottom: `1px solid ${C.b}`, display: "flex", alignItems: "flex-end", overflowX: "auto", flexShrink: 0 }}>
              {allTabs.map(name => {
                const isAct = activeFile === name || (name === mainTab && !activeFile);
                return (
                  <div key={name} className="ti" onClick={() => {
                    if (name === mainTab) {
                      setActiveFile(null); activeFileRef.current = null;
                      remRef.current = true; setCode(codeRef.current); setTimeout(() => { remRef.current = false; }, 50);
                    } else {
                      const myFile = [...uploads, ...folFiles].find(f => f.name === name);
                      const shFile = sharedFiles.find(f => f.name === name);
                      if (myFile) openIn(myFile.name, myFile.content || "");
                      else if (shFile) openIn(shFile.name, shFile.content || "");
                    }
                  }}
                    style={{ display: "flex", alignItems: "center", gap: 6, padding: "0 10px 0 12px", height: 33, borderRight: `1px solid ${C.b}`, cursor: "pointer", fontSize: 12, color: isAct ? C.t0 : C.t3, background: isAct ? C.bg1 : "transparent", borderTop: isAct ? `2px solid ${C.accent}` : "2px solid transparent", whiteSpace: "nowrap", flexShrink: 0, transition: "all .1s", userSelect: "none" }}>
                    <span style={{ color: fCol(name), display: "flex", flexShrink: 0 }}>{Ic.file}</span>
                    <span style={{ maxWidth: 110, overflow: "hidden", textOverflow: "ellipsis" }}>{name}</span>
                    <span className="tx" onClick={e => closeTab(name, e)}
                      style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 16, height: 16, borderRadius: 3, color: C.t3, cursor: "pointer", padding: 0, flexShrink: 0, marginLeft: 2, position: "relative", zIndex: 10 }}>{Ic.x}</span>
                  </div>
                );
              })}
            </div>

            <div style={{ height: 24, background: C.bg2, borderBottom: `1px solid ${C.b}`, display: "flex", alignItems: "center", padding: "0 14px", gap: 6, fontSize: 11, color: C.t3, flexShrink: 0 }}>
              <span>{licon}</span><span>workspace</span>
              <span style={{ color: C.b, display: "flex" }}>{Ic.cR}</span>
              <span style={{ color: C.t2 }}>document_{docId}</span>
              <span style={{ color: C.b, display: "flex" }}>{Ic.cR}</span>
              <span style={{ color: C.aLt }}>{fname}</span>
              <div style={{ flex: 1 }} />
              {gitCh > 0 && <span style={{ fontSize: 10, color: C.amber, fontFamily: C.mono }}>● {gitCh} unsaved</span>}
              {inlineAi && <span style={{ fontSize: 10, color: C.purple, fontFamily: C.mono }}>⬛ Tab</span>}
              <span style={{ fontFamily: C.mono, fontSize: 10, color: C.t4 }}>UTF-8 · LF · {lang}</span>
            </div>

            {allTabs.length > 0
              ? <div style={{ flex: 1, overflow: "hidden" }}>
                <Editor height="100%" language={lang} theme={editorTheme} value={code} onChange={handleChange}
                  onMount={(ed) => { edRef.current = ed; ed.onKeyDown(handleEdKey); }}
                  options={{ fontSize, fontFamily: C.mono, fontLigatures: true, lineHeight: 22, minimap: { enabled: true }, scrollBeyondLastLine: false, renderLineHighlight: "gutter", cursorBlinking: "smooth", cursorSmoothCaretAnimation: "on", smoothScrolling: true, padding: { top: 10 }, bracketPairColorization: { enabled: true }, guides: { bracketPairs: true }, suggestOnTriggerCharacters: true, quickSuggestions: true, parameterHints: { enabled: true }, formatOnType: exts.find(e => e.id === "fmt")?.ok, formatOnPaste: exts.find(e => e.id === "fmt")?.ok }} />
              </div>
              : <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: C.bg0 }}>
                <div style={{ textAlign: "center", maxWidth: 400 }}>
                  <div style={{ width: 80, height: 80, borderRadius: 20, background: `linear-gradient(135deg,${C.accent},${C.purple})`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", opacity: .9 }}>
                    <svg width="44" height="44" viewBox="0 0 48 48" fill="none"><rect x="4" y="4" width="17" height="17" rx="4" fill="white" fillOpacity="0.95" /><rect x="27" y="4" width="17" height="17" rx="4" fill="white" fillOpacity="0.95" /><rect x="4" y="27" width="17" height="17" rx="4" fill="white" fillOpacity="0.95" /><rect x="27" y="27" width="17" height="17" rx="4" fill="white" fillOpacity="0.4" /></svg>
                  </div>
                  <h2 style={{ fontSize: 24, fontWeight: 700, color: C.t0, marginBottom: 6 }}>VisionAI Editor</h2>
                  <p style={{ fontSize: 13, color: C.t3, marginBottom: 24, lineHeight: 1.6 }}>Open a file or start coding to begin.</p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9, maxWidth: 340, margin: "0 auto" }}>
                    {[{ l: "Open Explorer", d: "Browse files", ic: Ic.files, fn: () => setActiveNav("files") }, { l: "Upload File", d: "Upload from device", ic: Ic.upload, fn: () => fRef.current?.click() }, { l: "Group Chat", d: "Collaborate", ic: Ic.chat, fn: () => setActiveNav("chat") }, { l: "AI Chat", d: "Code with AI", ic: Ic.spark, fn: () => setActiveNav("ai") }].map(({ l, d, ic, fn }) => (
                      <div key={l} onClick={fn} style={{ padding: "12px", background: C.bg2, border: `1px solid ${C.b}`, borderRadius: 9, cursor: "pointer", textAlign: "left", transition: "all .15s" }} onMouseEnter={e => { e.currentTarget.style.borderColor = C.aBdr; e.currentTarget.style.background = C.bg3; }} onMouseLeave={e => { e.currentTarget.style.borderColor = C.b; e.currentTarget.style.background = C.bg2; }}>
                        <div style={{ color: C.aLt, marginBottom: 5, display: "flex" }}>{ic}</div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: C.t0, marginBottom: 2 }}>{l}</div>
                        <div style={{ fontSize: 11, color: C.t3 }}>{d}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            }

            {showTerm && (
              <div style={{ height: termH, flexShrink: 0, background: isDark ? "#0c0c0f" : "#fafafa", borderTop: `2px solid ${C.accent}`, display: "flex", flexDirection: "column", position: "relative" }}>
                <div onMouseDown={e => { e.preventDefault(); setDragging(true); }} style={{ position: "absolute", top: -4, left: 0, right: 0, height: 8, cursor: "ns-resize", zIndex: 20, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ width: 36, height: 3, borderRadius: 2, background: C.b }} />
                </div>
                <div style={{ display: "flex", alignItems: "stretch", background: C.bg2, borderBottom: `1px solid ${C.b}`, flexShrink: 0, height: 34, paddingLeft: 4 }}>
                  <div style={{ display: "flex", alignItems: "flex-end", flex: 1, overflowX: "auto", height: "100%" }}>
                    {terms.map(t => (
                      <div key={t.id} className={`tt${activeTerm === t.id ? " act" : ""}`} onClick={() => setActiveTerm(t.id)}
                        style={{ display: "flex", alignItems: "center", gap: 6, padding: "0 12px", height: 33, borderRight: `1px solid ${C.b}`, cursor: "pointer", fontSize: 11.5, color: activeTerm === t.id ? C.t0 : C.t3, background: activeTerm === t.id ? C.bg3 : "transparent", borderTop: activeTerm === t.id ? `2px solid ${C.accent}` : "2px solid transparent", whiteSpace: "nowrap", flexShrink: 0, userSelect: "none" }}>
                        <span style={{ display: "flex" }}>{Ic.term}</span><span>{t.name}</span>
                        {isRunning && activeTerm === t.id && <span style={{ width: 7, height: 7, borderRadius: "50%", background: C.green, animation: "ping 1s infinite", flexShrink: 0, marginLeft: 2 }} />}
                        {terms.length > 1 && <span onClick={e => { e.stopPropagation(); closeTerm(t.id); }} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 15, height: 15, borderRadius: 3, color: C.t4, cursor: "pointer", marginLeft: 2 }}>{Ic.x}</span>}
                      </div>
                    ))}
                  </div>
                  <button onClick={addNewTerm} style={{ display: "flex", alignItems: "center", gap: 4, padding: "0 10px", height: "100%", background: "none", border: "none", color: C.t3, cursor: "pointer", fontSize: 11, fontWeight: 600, borderLeft: `1px solid ${C.b}`, flexShrink: 0 }} onMouseEnter={e => e.currentTarget.style.color = C.t0} onMouseLeave={e => e.currentTarget.style.color = C.t3}>{Ic.plus} New</button>
                  <button onClick={() => clearTermLines(activeTerm)} style={{ display: "flex", alignItems: "center", padding: "0 8px", height: "100%", background: "none", border: "none", color: C.t3, cursor: "pointer", fontSize: 11, borderLeft: `1px solid ${C.b}`, flexShrink: 0 }} onMouseEnter={e => e.currentTarget.style.color = C.t0} onMouseLeave={e => e.currentTarget.style.color = C.t3}>Clear</button>
                  <button onClick={() => setShowTerm(false)} style={{ display: "flex", alignItems: "center", padding: "0 8px", height: "100%", background: "none", border: "none", color: C.t3, cursor: "pointer", fontSize: 18, lineHeight: 1, borderLeft: `1px solid ${C.b}`, flexShrink: 0 }}>×</button>
                </div>
                {curTerm && <ProTerminal C={C} isDark={isDark} term={curTerm} onInputSend={handleTermInput} onClear={() => clearTermLines(activeTerm)} isRunning={isRunning} lang={lang} licon={licon} />}
              </div>
            )}
          </div>
        </div>

        <div style={{ height: 22, flexShrink: 0, background: C.accent, display: "flex", alignItems: "center", padding: "0", zIndex: 200, overflow: "hidden" }}>
          <div className="sbs" onClick={() => setActiveNav("git")} style={{ padding: "0 12px", height: "100%", display: "flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,.9)", borderRight: "1px solid rgba(255,255,255,.15)" }}>
            <span>⎇</span> {gitBranch}{gitCh > 0 && <span style={{ fontSize: 9, background: "rgba(255,255,255,.2)", borderRadius: 8, padding: "1px 5px" }}>●{gitCh}</span>}
          </div>
          {[{ l: `${licon} ${lang}` }, { l: `◉ doc/${docId}` }, { l: username }, { l: isRunning ? "⚡ Running…" : "✓ Ready" }].map((item, i) => (
            <div key={i} className="sbs" style={{ padding: "0 12px", height: "100%", display: "flex", alignItems: "center", fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,.88)", borderRight: "1px solid rgba(255,255,255,.15)" }}>{item.l}</div>
          ))}
          <div style={{ flex: 1 }} />
          {typingUs.length > 0 && <span style={{ fontSize: 10, color: "rgba(255,255,255,.8)", padding: "0 10px", display: "flex", alignItems: "center", gap: 5 }}><span style={{ display: "flex", gap: 2 }}><Dot delay={0} /><Dot delay={.16} /><Dot delay={.32} /></span>{typingUs[0]} typing</span>}
          <button onClick={() => setShowOnline(true)} style={{ fontSize: 10, color: "rgba(255,255,255,.88)", padding: "0 10px", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }} onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,.1)"} onMouseLeave={e => e.currentTarget.style.background = "none"}>
            {Ic.users} {totalOnline} online
          </button>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,.6)", padding: "0 10px" }}>VisionAI · IDE</span>
          <div className="sbs" onClick={addNewTerm} style={{ padding: "0 10px", height: "100%", display: "flex", alignItems: "center", gap: 3, fontSize: 10, color: "rgba(255,255,255,.88)", borderLeft: "1px solid rgba(255,255,255,.15)" }}>{Ic.term}{Ic.plus}</div>
          <div className="sbs" onClick={() => setShowTerm(p => !p)} style={{ padding: "0 10px", height: "100%", display: "flex", alignItems: "center", fontSize: 11, color: "rgba(255,255,255,.88)", borderLeft: "1px solid rgba(255,255,255,.15)" }}>
            {Ic.bell}{notifs.length > 0 && <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#fff", marginLeft: 3 }} />}
          </div>
        </div>
      </div>
    </>
  );
}