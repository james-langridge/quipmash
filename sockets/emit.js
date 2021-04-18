// https://socket.io/docs/v4/emit-cheatsheet/index.html

module.exports = (io, socket) => {
    const module = {};

    module.playerDisconnected = (roomKey, roomInfo) => {
      io.to(roomInfo.admin).emit("playerDisconnected", roomInfo);
      io.in(roomKey).emit("playerDisconnected", roomInfo);
    };

    module.waitForNextGame = () => {
      socket.emit("pleaseWaitForNextGame", "Game already started. Please wait for the next game");
    };

    module.keyIsValid = (roomKey) => {
      socket.emit("keyIsValid", roomKey);
    };

    module.keyNotValid = () => {
      socket.emit("keyNotValid", "Game code does not exist. Please try again.");
    };

    module.playerJoinedRoom = (roomKey, roomInfo) => {
      io.to(roomInfo.admin).emit("playerJoinedRoom", roomInfo);
      io.in(roomKey).emit("playerJoinedRoom", roomInfo);
    };

    module.roomKey = (newKey, roomInfo) => {
      socket.emit("roomKey", newKey, roomInfo);
    };

    module.roomCreated = (oldKey, newKey, roomInfo) => {
      socket.to(oldKey).emit("roomCreated", newKey, roomInfo);
    };

    module.leaveOldRoom = (oldKey) => {
      io.socketsLeave(oldKey);
    };

    module.startGameCountDown = (roomKey, roomInfo) => {
      io.to(roomInfo.admin).emit("answersSubmitted", roomInfo);
      io.in(roomKey).emit("startGameCountDown", roomInfo);
    };

    module.startGame = (roomKey, roomInfo) => {
      io.in(roomKey).emit("startGame", roomInfo);
    };

    module.answersSubmitted = (roomKey, roomInfo) => {
      io.to(roomInfo.admin).emit("answersSubmitted", roomInfo);
      io.in(roomKey).emit("answersSubmitted", roomInfo);
    };

    module.startVotingRound = (roomKey, roomInfo) => {
      io.to(roomInfo.admin).emit("startVotingRound", roomInfo);
      io.in(roomKey).emit("startVotingRound", roomInfo);
    };

    module.voteSubmitted = (roomInfo) => {
      socket.emit("voteSubmitted", roomInfo);
    };

    module.displayResults = (roomKey, totalVotes, roomInfo) => {
      io.to(roomInfo.admin).emit("displayResults", totalVotes, roomInfo);
      io.in(roomKey).emit("displayResults", totalVotes, roomInfo);
    };

    module.nextVotingRound = (roomKey, roomInfo) => {
      io.in(roomKey).emit("nextVotingRound", roomInfo);
    };

    module.endGame = (roomKey, roomInfo) => {
      io.to(roomInfo.admin).emit("endgame", roomInfo);
      io.in(roomKey).emit("endgame", roomInfo);
    };

    return module;
};
