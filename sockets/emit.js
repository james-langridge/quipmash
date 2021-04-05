module.exports = (io, socket) => {
    const module = {};

    module.isHost = () => {
      socket.emit("isHost");
    };

    module.waitForNextGame = () => {
      socket.emit("pleaseWaitForNextGame", "Game already started. Please wait for the next game");
    };

    module.keyIsValid = (roomKey) => {
      socket.emit("keyIsValid", roomKey);
    };

    module.keyNotValid = () => {
      socket.emit("keyNotValid", "Game code does not exist. Please try again.")
    };

    module.roomKey = (newKey) => {
      socket.emit("roomKey", newKey);
    };

    module.roomCreated = (oldKey, newKey) => {
      socket.to(oldKey).emit("roomCreated", newKey);
    };

    module.leaveOldRoom = (oldKey) => {
      io.socketsLeave(oldKey);
    };

    module.startGame = (roomKey, roomInfo) => {
      io.in(roomKey).emit("startGame", roomInfo);
    };

    module.startVotingRound = (roomKey, roomInfo) => {
      io.in(roomKey).emit("startVotingRound", roomInfo);
    };

    module.displayResults = (roomKey, totalVotes, roomInfo) => {
      io.in(roomKey).emit("displayResults", totalVotes, roomInfo);
    };

    module.voteSubmitted = () => {
      socket.emit("voteSubmitted");
    };

    module.endGame = (roomKey, roomInfo) => {
      io.in(roomKey).emit("endgame", roomInfo);
    };

    module.nextVotingRound = (roomKey, roomInfo) => {
      io.in(roomKey).emit("nextVotingRound", roomInfo);
    };

    return module;
};
