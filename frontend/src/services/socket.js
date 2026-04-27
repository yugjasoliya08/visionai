  let socket = null;
  let currentDoc = null;
  let currentUser = null;
  let currentToken = null;
  let messageHandler = null;
  let reconnectInterval = null;
  let isConnecting = false;

  export function connectSocket(docId, username, token, onMessage) {
    currentDoc = docId;
    currentUser = username;
    currentToken = token;
    messageHandler = onMessage;

    function connect() {
      if (isConnecting) return;
      isConnecting = true;

      // Close any existing socket cleanly first
      if (socket && socket.readyState !== WebSocket.CLOSED) {
        socket.onclose = null;
        socket.close();
      }

      // 🟢 DYNAMIC WS LOGIC: Replaces 127.0.0.1 with your laptop's IP automatically
      // Use 'ws' for local network. If you ever deploy to HTTPS, this would be 'wss'
      const wsProtocol = window.location.protocol === "https:" ? "wss" : "ws";
      const wsUrl = `${wsProtocol}://${window.location.hostname}:8000/ws/${currentDoc}/${currentUser}?token=${currentToken}`;
      
      console.log("🚀 Connecting to:", wsUrl);

      socket = new WebSocket(wsUrl);

      socket.onopen = () => {
        console.log("🟢 Connected to Collaboration Server!");
        isConnecting = false;
        if (reconnectInterval) {
          clearInterval(reconnectInterval);
          reconnectInterval = null;
        }
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (messageHandler) messageHandler(data);
        } catch (e) {
          console.error("❌ Error parsing message:", e);
        }
      };

      socket.onclose = (event) => {
        isConnecting = false;
        if (event.code === 1008) {
          console.error("❌ Auth Failed: Token invalid or expired.");
          return;
        }
        console.log("🔴 Connection lost. Retrying in 3s…");
        if (!reconnectInterval) {
          reconnectInterval = setInterval(() => {
            connect();
          }, 3000);
        }
      };

      socket.onerror = (error) => {
        isConnecting = false;
        console.error("⚠️ WebSocket Error:", error);
      };
    }

    connect();
  }

  // Inject doc_id into every outgoing message
  export function sendMessage(data) {
    if (socket && socket.readyState === WebSocket.OPEN) {
      const payload = { ...data, doc_id: currentDoc };
      socket.send(JSON.stringify(payload));
    } else {
      console.warn("⏳ Socket not ready — message queued.");
    }
  }

  export function disconnectSocket() {
    if (reconnectInterval) {
      clearInterval(reconnectInterval);
      reconnectInterval = null;
    }
    if (socket) {
      socket.onclose = null;
      socket.close();
      socket = null;
    }
    isConnecting = false;
    console.log("🔌 Disconnected.");
  } 