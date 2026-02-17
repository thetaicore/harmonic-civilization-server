const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const w = canvas.width;
const h = canvas.height;

// --------------------
// PLAYER IDENTITY
// --------------------
let PLAYER = {
    id: Math.random().toString(36).substr(2,9),
    name: localStorage.getItem("playerName") || null,
    color: localStorage.getItem("playerColor") || null
};

if(!PLAYER.name){
    PLAYER.name = prompt("Enter your harmonic name:");
    localStorage.setItem("playerName", PLAYER.name);
}

if(!PLAYER.color){
    PLAYER.color = "#"+Math.floor(Math.random()*16777215).toString(16);
    localStorage.setItem("playerColor", PLAYER.color);
}

// --------------------
// GAME STATE
// --------------------
let GAME = {
    level: 1,
    coherence: 0,
    civilizationScore: 0
};

let nodes = [];
let crystals = [];
let mouse = { x:0, y:0, speed:0 };

// --------------------
// MULTIPLAYER
// --------------------
let socket;
let otherPlayers = {};

function initMultiplayer(){
    socket = new WebSocket("ws://localhost:8080"); // Replace with your VPS IP later

    socket.onopen = () => console.log("Connected to Civilization Relay");

    socket.onmessage = (msg) => {
        const data = JSON.parse(msg.data);

        if(data.civilizationScore){
            GAME.civilizationScore = data.civilizationScore;
        }

        if(data.type === "crystal" && data.nodes){
            crystals.push({nodes: data.nodes});
        }

        if(data.id && data.id !== PLAYER.id){
            otherPlayers[data.id] = data;
        }
    };
}

initMultiplayer();

// --------------------
// MOUSE HANDLING
// --------------------
canvas.addEventListener("mousemove", e=>{
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});

// --------------------
// ANIMATE LOOP
// --------------------
function animate(){
    ctx.clearRect(0,0,w,h);

    // Draw other players
    Object.values(otherPlayers).forEach(p => {
        if(!p.x) return;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x,p.y,6,0,Math.PI*2);
        ctx.fill();
        ctx.font="10px monospace";
        ctx.fillText(p.name,p.x+10,p.y-10);
    });

    // Draw local player
    ctx.fillStyle = PLAYER.color;
    ctx.beginPath();
    ctx.arc(mouse.x, mouse.y, 6, 0, Math.PI*2);
    ctx.fill();
    ctx.fillText(PLAYER.name, mouse.x+10, mouse.y-10);

    // Broadcast local state
    if(socket && socket.readyState === 1){
        socket.send(JSON.stringify({
            id: PLAYER.id,
            name: PLAYER.name,
            color: PLAYER.color,
            x: mouse.x,
            y: mouse.y,
            level: GAME.level,
            coherence: GAME.coherence
        }));
    }

    requestAnimationFrame(animate);
}

animate();
