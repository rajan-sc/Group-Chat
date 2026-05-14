document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  const userEmail = localStorage.getItem('email');
  const userName = localStorage.getItem('name');

  if (!token) {
    window.location.href = '/';
    return;
  }

  document.getElementById('user-welcome').innerText = userName || userEmail.split('@')[0];

  const socket = io({
    auth: { token }
  });

  const chatContainer = document.getElementById('chat-container');
  const globalChatBtn = document.getElementById('global-chat-btn');
  const joinRoomBtn = document.getElementById('join-room-btn');
  const joinDmBtn = document.getElementById('join-dm-btn');
  const targetEmailInput = document.getElementById('target-email');
  const customRoomInput = document.getElementById('custom-room');
  const currentRoomDisplay = document.getElementById('current-room-display');
  const messagesDiv = document.getElementById('messages');
  const chatForm = document.getElementById('chat-form');
  const messageInput = document.getElementById('message-input');
  const fileInput = document.getElementById('file-input');
  const typingIndicator = document.getElementById('typing-indicator');
  const aiSuggestions = document.getElementById('ai-suggestions');
  const smartReplyBtn = document.getElementById('smart-reply-btn');
  const logoutBtn = document.getElementById('logout-btn');

  let currentRoomId = null;
  let currentRoomName = null;
  let typingTimeout;
  let recentMessagesForAi = [];

  // Join Global Chat by default
  joinRoom('global_chat', null, 'Global Chat', globalChatBtn);

  // --- Socket Events ---
  socket.on('connect_error', (err) => {
    alert(err.message);
    if (err.message.includes('Authentication error')) {
      localStorage.clear();
      window.location.href = '/';
    }
  });

  socket.on('previous_messages', (messages) => {
    messagesDiv.innerHTML = '';
    recentMessagesForAi = [];
    messages.forEach(addMessageToUI);
    scrollToBottom();
  });

  socket.on('receive_message', (msg) => {
    addMessageToUI(msg);
    scrollToBottom();
  });

  socket.on('typing', ({ senderEmail }) => {
    typingIndicator.innerText = `${senderEmail} is typing...`;
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
      typingIndicator.innerText = '';
    }, 2000);
  });

  // --- Actions ---
  logoutBtn.addEventListener('click', () => {
    localStorage.clear();
    window.location.href = '/';
  });

  globalChatBtn.addEventListener('click', () => {
    joinRoom('global_chat', null, 'Global Chat', globalChatBtn);
  });

  joinRoomBtn.addEventListener('click', () => {
    const roomName = customRoomInput.value.trim();
    if (!roomName) return alert('Enter room name');
    joinRoom(roomName, null, roomName, null);
    customRoomInput.value = '';
  });

  joinDmBtn.addEventListener('click', () => {
    const targetEmail = targetEmailInput.value.trim();
    if (!targetEmail) return alert('Enter email');
    joinRoom(null, targetEmail, targetEmail, null);
    targetEmailInput.value = '';
  });

  function joinRoom(roomName, targetEmail, displayName, activeBtn) {
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    if (activeBtn) activeBtn.classList.add('active');

    currentRoomName = roomName || null;
    currentRoomId = targetEmail ? [userEmail, targetEmail].sort().join(',') : roomName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    
    currentRoomDisplay.innerText = `Room: ${displayName}`;
    messagesDiv.innerHTML = ''; // Clear while loading
    
    socket.emit('join_room', { roomName, targetEmail });
  }

  messageInput.addEventListener('input', async (e) => {
    socket.emit('typing', { roomId: currentRoomId });
    
    const val = e.target.value;
    if (val.length > 3 && val.endsWith(' ')) {
      try {
        const res = await fetch('/api/ai/autocomplete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ partialText: val })
        });
        const data = await res.json();
        if (data.suggestion) {
          aiSuggestions.innerHTML = `<div class="suggestion-chip" onclick="document.getElementById('message-input').value += '${data.suggestion.replace(/'/g, "\\'")}'; document.getElementById('ai-suggestions').innerHTML='';">${data.suggestion}</div>`;
        }
      } catch (err) { console.error('Autocomplete error', err); }
    } else if (val.length === 0) {
      aiSuggestions.innerHTML = '';
    }
  });

  smartReplyBtn.addEventListener('click', async () => {
    if (recentMessagesForAi.length === 0) return alert('Not enough context for smart reply');
    smartReplyBtn.disabled = true;
    const originalPlaceholder = messageInput.placeholder;
    messageInput.placeholder = 'Thinking...';
    try {
      const res = await fetch('/api/ai/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ recentMessages: recentMessagesForAi.slice(-10) })
      });
      const data = await res.json();
      if (data.suggestion) {
        messageInput.value = data.suggestion;
      }
    } catch (err) {
      console.error('Smart reply error', err);
    }
    smartReplyBtn.disabled = false;
    messageInput.placeholder = 'Type your message...';
  });

  chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!currentRoomId) return;

    let fileUrl = null;
    if (fileInput.files.length > 0) {
      const formData = new FormData();
      formData.append('file', fileInput.files[0]);
      try {
        const uploadRes = await fetch('/api/chat/upload', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData
        });
        const uploadData = await uploadRes.json();
        if (uploadRes.ok) fileUrl = uploadData.fileUrl;
        else alert('Upload failed');
      } catch (err) { alert('Upload failed'); return; }
    }

    const msgText = messageInput.value.trim();
    if (msgText || fileUrl) {
      socket.emit('send_message', {
        roomId: currentRoomId,
        roomName: currentRoomName,
        message: msgText,
        fileUrl
      });
      messageInput.value = '';
      fileInput.value = '';
      aiSuggestions.innerHTML = '';
    }
  });

  function addMessageToUI(msg) {
    if (msg.system) {
      const div = document.createElement('div');
      div.style.textAlign = 'center';
      div.style.color = 'var(--text-muted)';
      div.style.fontSize = '0.85rem';
      div.style.fontStyle = 'italic';
      div.style.margin = '10px 0';
      div.innerText = msg.message;
      messagesDiv.appendChild(div);
      return;
    }

    const isSelf = msg.senderEmail === userEmail;
    const sender = isSelf ? 'You' : (msg.senderName || msg.senderEmail || 'Unknown User');
    
    const div = document.createElement('div');
    div.className = `message ${isSelf ? 'self' : 'other'}`;
    
    let html = `<small>${sender} - ${new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</small>`;
    if (msg.message) html += `<div>${msg.message}</div>`;
    if (msg.fileUrl) html += `<div style="margin-top: 5px;"><a href="${msg.fileUrl}" target="_blank" style="color: var(--primary);">📎 Attachment</a></div>`;
    
    div.innerHTML = html;
    messagesDiv.appendChild(div);

    recentMessagesForAi.push({ senderEmail: sender, message: msg.message || '[File]' });
    if (recentMessagesForAi.length > 20) recentMessagesForAi.shift();
  }

  function scrollToBottom() {
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }
});
