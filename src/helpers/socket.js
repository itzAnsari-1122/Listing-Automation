import { io } from "socket.io-client";
const SOCKET_URL =
  import.meta.env.VITE_API_BASE_URL || "https://localhost:8080";

const socket = io(SOCKET_URL, {
  transports: ["websocket", "polling"], // Fallback support
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 20000,
  autoConnect: true,
  forceNew: true,
});

// Enhanced connection logging
socket.on("connect", () => {
  console.log("✅ Socket.IO connected with ID:", socket.id);
});

socket.on("disconnect", (reason) => {
  console.log("❌ Socket.IO disconnected:", reason);
});

socket.on("connect_error", (error) => {
  console.error("❌ Socket connection error:", error.message);
});

socket.on("reconnect_attempt", (attempt) => {
  console.log(`🔄 Socket reconnection attempt: ${attempt}`);
});

socket.on("reconnect_failed", () => {
  console.error("❌ Socket reconnection failed after all attempts");
});

export default socket;
