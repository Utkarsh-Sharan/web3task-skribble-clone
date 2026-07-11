# Skribbl.io Clone - Real-Time Multiplayer Drawing Game

A full-stack, real-time multiplayer drawing and guessing game inspired by Skribbl.io. Built with the MERN stack (currently utilizing in-memory state for real-time performance) and WebSockets, this project features isolated game rooms, a turn-based drawing system, and live chat guessing.

## 🚀 Features

* **Real-Time Canvas Syncing:** Smooth, instantaneous stroke sharing across all clients in a room using `Fabric.js` and `Socket.IO`.
* **Room Management:** Isolated multiplayer rooms where a host can dictate the number of rounds.
* **Live Player Presence:** Real-time updates when players join or leave, along with live score tracking.
* **Authoritative Server State:** The backend acts as the absolute source of truth, managing a synchronized 60-second timer and turn rotation.
* **Interactive Game Loop:**
  * The drawer selects from a randomized bank of 3 words.
  * Guessers use the chat box to figure out the word.
  * The game automatically handles correct guesses, point distribution, and turn advancement.
* **Responsive UI:** Clean, modern interface styled with Tailwind CSS.

## 🛠️ Tech Stack

**Frontend:**
* React.js (Vite)
* Tailwind CSS
* Fabric.js (HTML5 Canvas wrapper for drawing tools)
* Socket.IO-Client

**Backend:**
* Node.js
* Express.js
* Socket.IO (Real-time bidirectional event-based communication)

## 📦 Installation and Local Setup

To run this project locally, you will need two terminal windows, one for the backend server and one for the frontend client.

### Prerequisites
* Node.js (v16 or higher)
* npm or yarn

### 1. Backend Setup
Navigate to the `backend` directory, install dependencies, and start the WebSocket server.

```bash
cd backend
npm install
npm run dev
```
The server will start running on http://localhost:3000.

### 2. Frontend Setup
Navigate to the `frontend` directory, install dependencies, and start the Vite development server.

```bash
cd frontend
npm install
npm run dev
```
The React app will be accessible at http://localhost:5173.

## 🎮 How to Play
1. Open http://localhost:5173 in your browser.

2. Enter your Name, a Room Code, and the desired Number of Rounds. Click Join Room.

3. Have a friend (or open a second browser window) join the exact same Room Code.

4. The first person to create the room is the Host. Once everyone is in, the Host clicks Start Game.

5. If you are the Drawer: Pick one of the 3 words and start drawing!

6. If you are a Guesser: Type your guesses into the chat on the right. If you guess correctly, you get 10 points!
