// config.js
let API_BASE;

if (
  window.location.hostname === "127.0.0.1" ||
  window.location.hostname === "localhost"
) {
  // 💻 LOCAL MODE
  API_BASE = "http://127.0.0.1:8000";
  console.log("🔌 Connected to LOCAL Backend");
} else {
  // 🌍 LIVE MODE
  API_BASE = "https://backend-depolyment-1.onrender.com";
  console.log("☁️ Connected to LIVE Cloud Backend");
}

export default API_BASE;
