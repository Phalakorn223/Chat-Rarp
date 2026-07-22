const fs = require('fs');

let c = fs.readFileSync('public/app.js', 'utf8');

// 1. Update State
c = c.replace(/let currentRoom = null;\nlet currentDMUser = null;/, "let currentChat = null;\nlet allRooms = [];\nlet onlineUsersList = [];");

// 2. Update DOM Elements
c = c.replace(/const roomList = \$\('room-list'\);[\s\S]*?const musicSendBtn = \$\('music-send-btn'\);/, `
const msSidebar = $('sidebar');
const unifiedChatList = $('unified-chat-list');
const searchInput = $('search-input');
const createRoomBtn = $('create-room-btn');
const createRoomModal = $('create-room-modal');
const roomNameInput = $('room-name-input');
const confirmCreateRoom = $('confirm-create-room');
const cancelCreateRoom = $('cancel-create-room');

const welcomePanel = $('welcome-panel');
const chatPanel = $('chat-panel');
const musicPanel = $('music-panel');
const roomNameEl = $('room-name');
const roomMembersCount = $('room-members-count');
const activeChatAvatar = $('active-chat-avatar');

const chatMessages = $('chat-messages');
const chatInput = $('chat-input');
const sendBtn = $('send-btn');
const backBtn = $('back-btn');
const videoCallBtn = $('video-call-btn');
const leaveRoomBtn = $('leave-room-btn');
const roomMembersBtn = $('room-members-btn');

const membersSidebar = $('members-sidebar');
const closeMembersBtn = $('close-members-btn');
const membersList = $('members-list');

const videoOverlay = $('video-overlay');
const localVideo = $('local-video');
const remoteVideo = $('remote-video');
const remoteLabel = $('remote-label');
const toggleMicBtn = $('toggle-mic-btn');
const toggleCamBtn = $('toggle-cam-btn');
const endCallBtn = $('end-call-btn');
const incomingCallModal = $('incoming-call-modal');
const callerName = $('caller-name');
const acceptCallBtn = $('accept-call-btn');
const rejectCallBtn = $('reject-call-btn');
const logoutBtn = $('logout-btn');

const leaveMusicBtn = $('leave-music-btn');
const musicRoomMembers = $('music-room-members');
const trackTitle = $('track-title');
const trackArtist = $('track-artist');
const albumArt = $('album-art');
const vinylSpin = $('vinyl-spin');
const playBtn = $('play-btn');
const prevBtn = $('prev-btn');
const nextBtn = $('next-btn');
const progressBar = $('progress-bar');
const progressFill = $('progress-fill');
const currentTimeEl = $('current-time');
const totalTimeEl = $('total-time');
const volumeSlider = $('volume-slider');
const playlistItems = $('playlist-items');
const musicChatMessages = $('music-chat-messages');
const musicChatInput = $('music-chat-input');
const musicSendBtn = $('music-send-btn');
`);

// 3. Update Sidebar logic (remove old room-list and online-users logic)
c = c.replace(/\/\/ ==================== ROOM LIST ====================\n[\s\S]*?\/\/ ==================== CREATE ROOM ====================/, `// ==================== UNIFIED SIDEBAR ====================
socket.on('room-list', (rooms) => {
    allRooms = rooms;
    renderUnifiedList();
});

socket.on('online-users', (users) => {
    onlineUsersList = users.filter(u => !currentUser || u.username !== currentUser.username);
    renderUnifiedList();
});

function renderUnifiedList() {
    if(!unifiedChatList) return;
    const query = searchInput.value.toLowerCase();
    unifiedChatList.innerHTML = '';
    
    let items = [];
    
    // Rooms
    allRooms.forEach(r => {
        if (!r.name.toLowerCase().includes(query)) return;
        items.push({
            type: 'room', id: r.id, name: r.name,
            icon: r.type === 'music' ? 'fa-music' : 'fa-users',
            sub: r.type === 'music' ? 'Music Room' : (r.messages && r.messages.length ? r.messages[r.messages.length - 1].text : 'Group Chat'),
            obj: r
        });
    });

    // Users
    onlineUsersList.forEach(u => {
        if (!u.username.toLowerCase().includes(query)) return;
        items.push({
            type: 'dm', id: u.username, name: u.username,
            icon: null, sub: 'Active now',
            obj: u
        });
    });

    items.forEach(item => {
        const isActive = currentChat && currentChat.type === item.type && currentChat.id === item.id;
        const div = document.createElement('div');
        div.className = \`ms-chat-item \${isActive ? 'active' : ''}\`;
        
        let avatarHtml = item.type === 'room' 
            ? \`<div class="avatar-sm avatar-color-5"><i class="fas \${item.icon}"></i></div>\`
            : \`<div class="avatar-sm \${getAvatarColor(item.name)}">\${getInitials(item.name)}<span class="online-badge"></span></div>\`;

        div.innerHTML = \`
            \${avatarHtml}
            <div class="ms-chat-info">
                <h4>\${escapeHtml(item.name)}</h4>
                <div class="ms-chat-snippet"><p>\${escapeHtml(item.sub)}</p></div>
            </div>
        \`;
        div.addEventListener('click', () => {
            if (item.type === 'room') joinRoom(item.id);
            else openDM(item.id);
            if (window.innerWidth <= 768) msSidebar.classList.add('hidden');
        });
        unifiedChatList.appendChild(div);
    });
}
searchInput.addEventListener('input', renderUnifiedList);

// ==================== CREATE ROOM ====================
`);

// 4. Update joinRoom and append openDM to reuse chat panel
c = c.replace(/function joinRoom\(roomId\) {[\s\S]*?\/\/ ==================== CHAT MESSAGES ====================/, `function joinRoom(roomId) {
    socket.emit('join-room', roomId, (res) => {
        if (!res.success) { showToast(res.error, 'error'); return; }
        
        currentChat = { type: 'room', id: roomId, name: res.room.name, data: res.room };
        
        if (res.room.type === 'music') {
            showPanel(musicPanel);
            musicRoomMembers.textContent = \`\${res.room.members.length} listening\`;
            playlist = res.playlist || [];
            renderPlaylist();
            renderMusicChat(res.room.messages);
            if (playlist.length > 0 && currentTrackIndex === -1) loadTrack(0);
        } else {
            showPanel(chatPanel);
            roomNameEl.textContent = res.room.name;
            roomMembersCount.textContent = \`\${res.room.members.length} members\`;
            activeChatAvatar.innerHTML = \`<i class="fas fa-users"></i>\`;
            activeChatAvatar.className = \`avatar-sm avatar-color-5\`;
            renderChatMessages(res.room.messages);
            updateMembersList(res.room.members);
            chatInput.focus();
        }
        renderUnifiedList();
    });
}

function openDM(username) {
    currentChat = { type: 'dm', id: username, name: username };
    showPanel(chatPanel);
    roomNameEl.textContent = username;
    roomMembersCount.textContent = 'Active now';
    activeChatAvatar.innerHTML = getInitials(username);
    activeChatAvatar.className = \`avatar-sm \${getAvatarColor(username)}\`;

    socket.emit('get-private-chat', username, (res) => {
        renderChatMessages(res.messages || []);
        res.messages.filter(m => m.from === username && !m.read).forEach(m => {
            socket.emit('message-read', { messageId: m.id, from: m.from });
        });
    });
    renderUnifiedList();
    chatInput.focus();
}

leaveRoomBtn.addEventListener('click', leaveRoom);
leaveMusicBtn.addEventListener('click', leaveRoom);
document.querySelectorAll('.back-to-lobby-btn').forEach(btn => btn.addEventListener('click', leaveRoom));
if (backBtn) backBtn.addEventListener('click', leaveRoom);

function leaveRoom() {
    if(currentChat && currentChat.type === 'room') {
        socket.emit('leave-room', () => { closeChat(); });
    } else {
        closeChat();
    }
}

function closeChat() {
    currentChat = null;
    showPanel(welcomePanel);
    membersSidebar.classList.remove('active');
    if (musicPlayer) {
        musicPlayer.pause();
        vinylSpin.classList.remove('spinning');
        playBtn.innerHTML = '<i class="fas fa-play"></i>';
    }
    renderUnifiedList();
}

// ==================== CHAT MESSAGES ====================
`);

// 5. Update send logic, remove private chat panel logic
c = c.replace(/function renderChatMessages[\s\S]*?\/\/ ==================== VIDEO CALL \(WebRTC\) ====================/, `function renderChatMessages(messages) {
    chatMessages.innerHTML = '';
    messages.forEach(msg => appendMessageUI(msg));
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function appendMessageUI(msg) {
    if (msg.type === 'system') {
        const div = document.createElement('div');
        div.className = 'system-message';
        div.innerHTML = \`<i class="fas fa-info-circle"></i> \${escapeHtml(msg.text)}\`;
        chatMessages.appendChild(div);
        return;
    }
    
    const isSent = msg.from === currentUser?.username;
    const row = document.createElement('div');
    row.className = \`ms-msg-row \${isSent ? 'sent' : 'received'}\`;
    
    row.innerHTML = \`
        \${!isSent ? \`<div class="avatar-sm \${getAvatarColor(msg.from)}" style="width:28px;height:28px;font-size:12px;margin-right:8px;align-self:flex-end;">\${getInitials(msg.from)}</div>\` : ''}
        <div class="ms-msg-bubble" title="\${formatTime(msg.timestamp)}">\${escapeHtml(msg.text)}</div>
    \`;
    chatMessages.appendChild(row);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

sendBtn.addEventListener('click', sendMessage);
chatInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendMessage(); });

function sendMessage() {
    const text = chatInput.value.trim();
    if (!text || !currentChat) return;

    const msg = {
        id: Date.now().toString(),
        from: currentUser.username,
        text,
        timestamp: new Date().toISOString(),
        type: 'message'
    };

    appendMessageUI(msg);
    if (currentChat.type === 'room') {
        socket.emit('room-message', { text });
    } else {
        socket.emit('private-message', { to: currentChat.id, text });
    }
    chatInput.value = '';
}

socket.on('room-message', (msg) => {
    if (currentChat && currentChat.type === 'room') {
       if (currentChat.data && currentChat.data.type === 'music') appendMusicChatMessage(msg);
       else appendMessageUI(msg);
    }
});

socket.on('private-message', (msg) => {
    if (currentChat && currentChat.type === 'dm' && currentChat.id === msg.from) {
        appendMessageUI(msg);
        socket.emit('message-read', { messageId: msg.id, from: msg.from });
    } else {
        showToast(\`💬 New DM from \${msg.from}\`, 'info');
    }
});

socket.on('user-joined-room', (data) => {
    if (currentChat && currentChat.type === 'room' && currentChat.id === data.roomId) {
        if (!currentChat.data.members.includes(data.username)) currentChat.data.members.push(data.username);
        updateMembersList(currentChat.data.members);
        roomMembersCount.textContent = \`\${currentChat.data.members.length} members\`;
        showToast(\`\${data.username} joined\`, 'info');
    }
});
socket.on('user-left-room', (data) => {
    if (currentChat && currentChat.type === 'room' && currentChat.id === data.roomId) {
        currentChat.data.members = currentChat.data.members.filter(m => m !== data.username);
        updateMembersList(currentChat.data.members);
        roomMembersCount.textContent = \`\${currentChat.data.members.length} members\`;
        showToast(\`\${data.username} left\`, 'warning');
    }
});

roomMembersBtn.addEventListener('click', () => membersSidebar.classList.toggle('active'));
closeMembersBtn.addEventListener('click', () => membersSidebar.classList.remove('active'));

function updateMembersList(members) {
    if(!membersList) return;
    membersList.innerHTML = '';
    members.forEach(m => {
        const div = document.createElement('div');
        div.className = 'member-item';
        div.innerHTML = \`<div class="avatar-sm \${getAvatarColor(m)}">\${getInitials(m)}</div> <span>\${escapeHtml(m)}</span>\`;
        membersList.appendChild(div);
    });
}

// Music room chat logic
musicSendBtn.addEventListener('click', sendMusicChat);
musicChatInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendMusicChat(); });
function sendMusicChat() {
    const text = musicChatInput.value.trim();
    if (!text || !currentChat) return;
    const msg = { id: Date.now().toString(), from: currentUser.username, text, timestamp: new Date().toISOString(), type: 'message' };
    appendMusicChatMessage(msg);
    socket.emit('room-message', { text });
    musicChatInput.value = '';
}
function renderMusicChat(messages) { musicChatMessages.innerHTML = ''; messages.forEach(msg => appendMusicChatMessage(msg)); }
function appendMusicChatMessage(msg) {
    if (msg.type === 'system') {
        const div = document.createElement('div');
        div.className = 'system-message';
        div.innerHTML = \`<i class="fas fa-info-circle"></i> \${escapeHtml(msg.text)}\`;
        musicChatMessages.appendChild(div);
    } else {
        const isSent = msg.from === currentUser?.username;
        const row = document.createElement('div');
        row.className = \`ms-msg-row \${isSent ? 'sent' : 'received'}\`;
        row.innerHTML = \`<div class="ms-msg-bubble">\${escapeHtml(msg.text)}</div>\`;
        musicChatMessages.appendChild(row);
    }
    musicChatMessages.scrollTop = musicChatMessages.scrollHeight;
}

// ==================== VIDEO CALL (WebRTC) ====================
`);

// 6. Fix Video Call references
c = c.replace(/if \(!currentRoom\) return;[\s\S]*?startCall\(otherMembers\[0\]\);/, `if (!currentChat) return;
    let target = currentChat.type === 'dm' ? currentChat.id : currentChat.data.members.filter(m => m !== currentUser.username)[0];
    if (target) startCall(target);
    else showToast('No one to call', 'warning');`);

// 7. Remove old dm-video-call-btn reference
c = c.replace(/dmVideoCallBtn\.addEventListener[\s\S]*?}\);/, '');

// Fix mobile sidebar references
c = c.replace(/const mobileMenuToggle[\s\S]*?originalOpenDM\(username\);[\s\S]*?\};/m, `
// Mobile Sidebar Toggle
if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', () => {
        msSidebar.classList.toggle('hidden');
    });
}
`);

fs.writeFileSync('public/app.js', c);
console.log('App.js patched successfully');
