const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, 'public', 'style.css');

const newCSS = `
/* ==================== MESSENGER REDESIGN ==================== */
.messenger-layout {
  display: flex;
  height: 100vh;
  width: 100vw;
  background: var(--bg-primary);
  color: var(--text-primary);
  overflow: hidden;
}

/* LEFT SIDEBAR */
.ms-sidebar {
  width: 360px;
  background: var(--bg-secondary);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  z-index: 10;
}

.ms-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
}

.ms-header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}
.ms-header-left h2 {
  font-size: 24px;
  font-weight: 700;
}

.ms-icon-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--bg-card);
  color: var(--text-primary);
  border: none;
  font-size: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: 0.2s;
}
.ms-icon-btn:hover { background: var(--border); }
.ms-icon-btn.text-primary { color: var(--accent-primary); background: transparent; font-size: 20px; }
.ms-icon-btn.text-primary:hover { background: rgba(0, 132, 255, 0.1); }
.ms-icon-btn.text-danger { color: var(--red); background: transparent; font-size: 20px;}
.ms-icon-btn.text-danger:hover { background: rgba(235, 77, 75, 0.1); }

.ms-search {
  padding: 0 16px 12px;
}
.ms-search-bar {
  display: flex;
  align-items: center;
  background: var(--bg-card);
  border-radius: 20px;
  padding: 8px 12px;
  gap: 8px;
}
.ms-search-bar i { color: var(--text-muted); font-size: 14px; }
.ms-search-bar input {
  background: transparent;
  border: none;
  color: var(--text-primary);
  flex: 1;
  font-size: 15px;
  outline: none;
}
.ms-search-bar input::placeholder { color: var(--text-muted); }

.ms-chat-list {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 20px;
}

.ms-chat-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  cursor: pointer;
  border-radius: 8px;
  margin: 0 8px;
  transition: 0.2s;
}
.ms-chat-item:hover { background: var(--bg-glass-hover); }
.ms-chat-item.active { background: rgba(0, 132, 255, 0.1); }
.ms-chat-item .avatar-sm { position: relative; }
.ms-chat-item .online-badge {
  position: absolute;
  bottom: 0; right: 0;
  width: 12px; height: 12px;
  background: var(--green);
  border: 2px solid var(--bg-secondary);
  border-radius: 50%;
}

.ms-chat-info {
  flex: 1;
  min-width: 0;
}
.ms-chat-info h4 {
  font-size: 15px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--text-primary);
}
.ms-chat-snippet {
  display: flex;
  gap: 4px;
  font-size: 13px;
  color: var(--text-muted);
}
.ms-chat-snippet p {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}
.ms-chat-item.unread h4, .ms-chat-item.unread p {
  color: var(--text-primary); font-weight: 700;
}

/* RIGHT MAIN AREA */
.ms-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  background: var(--bg-primary);
}

.ms-chat-header {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  border-bottom: 1px solid var(--border);
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
}
.ms-chat-header-info { display: flex; align-items: center; gap: 12px; flex: 1; min-width: 0; }
.ms-title-box { display: flex; flex-direction: column; }
.ms-title-box h2 { font-size: 16px; font-weight: 600; line-height: 1.2; }
.ms-subtitle { font-size: 12px; color: var(--text-muted); }
.ms-chat-header-actions { display: flex; gap: 4px; }

.ms-brand { color: var(--accent-primary) !important; font-size: 64px; margin-bottom: 20px;}

/* MESSAGES */
.ms-chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.ms-msg-row {
  display: flex;
  margin-bottom: 6px;
  max-width: 75%;
}
.ms-msg-row.sent {
  align-self: flex-end;
  flex-direction: row-reverse;
}
.ms-msg-row.received { align-self: flex-start; }

.ms-msg-bubble {
  padding: 8px 12px;
  border-radius: 18px;
  font-size: 15px;
  line-height: 1.33;
  word-wrap: break-word;
  position: relative;
}
.ms-msg-row.sent .ms-msg-bubble { background: var(--accent-primary); color: #FFF; }
.ms-msg-row.received .ms-msg-bubble { background: var(--bg-card); color: var(--text-primary); }

.ms-msg-row.sent.grouped .ms-msg-bubble { border-bottom-right-radius: 4px; border-top-right-radius: 4px; }
.ms-msg-row.received.grouped .ms-msg-bubble { border-bottom-left-radius: 4px; border-top-left-radius: 4px; }

.ms-msg-sender { flex-basis: 100%; font-size: 11px; color: var(--text-muted); margin-bottom: 4px; margin-left: 12px;}

/* INPUT AREA */
.ms-chat-input-area {
  padding: 12px 16px;
}
.ms-input-container {
  display: flex;
  align-items: center;
  gap: 8px;
}
.ms-input-action {
  background: transparent;
  border: none;
  color: var(--accent-primary);
  font-size: 24px;
  cursor: pointer;
  padding: 4px;
}
.ms-input-action:hover { opacity: 0.8; }
.ms-input-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  background: var(--bg-card);
  border-radius: 20px;
  padding: 8px 12px;
}
.ms-input-wrapper input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: var(--text-primary);
  font-size: 15px;
  margin: 0 8px;
}
.ms-input-wrapper input::placeholder { color: var(--text-muted); }
.ms-input-emoji { background: transparent; border: none; color: var(--accent-primary); font-size: 24px; cursor: pointer; }
.ms-send-btn { background: transparent; border: none; color: var(--accent-primary); font-size: 24px; cursor: pointer; padding: 4px; }

/* RESPONSIVE */
@media (max-width: 768px) {
  .ms-sidebar { width: 100%; position: absolute; z-index: 10; height: 100%; left: 0; transition: 0.3s; }
  .ms-sidebar.hidden { transform: translateX(-100%); }
  .ms-main { width: 100%; position: absolute; z-index: 5; height: 100%; top: 0; left: 0; }
  .ms-msg-row { max-width: 85%; }
}
`;

fs.appendFileSync(cssPath, newCSS);
console.log('CSS updated successfully');
