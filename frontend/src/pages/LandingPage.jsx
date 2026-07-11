function LandingPage({joinRoom, setRoomId, setPlayerName, totalRounds, setTotalRounds}) {
  return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="p-8 bg-white shadow-lg rounded-xl flex flex-col gap-4 w-96">
          <h1 className="text-2xl font-bold text-center text-gray-800">Join a Game</h1>
          <input 
            type="text" 
            placeholder="Your Name..." 
            className="border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setPlayerName(e.target.value)}
          />
          <input 
            type="text" 
            placeholder="Enter Room Code..." 
            className="border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setRoomId(e.target.value)}
          />
          <div className="flex items-center justify-between">
            <label className="text-gray-600 font-medium">Total Rounds:</label>
            <input 
              type="number" 
              min="1" max="10"
              value={totalRounds}
              onChange={(e) => setTotalRounds(e.target.value)}
              className="border p-2 w-20 rounded-md outline-none text-center"
            />
          </div>
          <button 
            onClick={joinRoom}
            className="bg-blue-600 text-white p-3 rounded-md font-semibold hover:bg-blue-700 transition"
          >
            Join Room
          </button>
        </div>
      </div>
    );
}

export default LandingPage