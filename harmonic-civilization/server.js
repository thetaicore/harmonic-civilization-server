// ===============================================
// PLAY THE GAME ∞ LEVEL UP
// Harmonic Civilization Relay Server
// ===============================================

// server.js
const WebSocket = require("ws");

const PORT = process.env.PORT || 8081;  // <-- important for Render
const wss = new WebSocket.Server({ port: PORT });

let clients = new Set();
let civilizationScore = 0;

wss.on("connection", (socket) => {
    clients.add(socket);

    socket.on("message", (message) => {
        try {
            const data = JSON.parse(message);

            for (let client of clients) {
                if (client !== socket && client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify(data));
                }
            }

            if (data.civilizationScore) civilizationScore = data.civilizationScore;
        } catch (err) {
            console.log("Invalid message:", message);
        }
    });

    socket.on("close", () => clients.delete(socket));
    socket.on("error", (err) => {
        console.log("Socket error:", err);
        clients.delete(socket);
    });
});

console.log(`Harmonic Civilization Relay Active on port ${PORT}`);


