// https://socket.io/docs/v4/emit-cheatsheet/index.html

module.exports = (io, socket) => {
    const module = {};

    module.playerDisconnected = (roomKey, roomInfo) => {
      io.to(roomInfo.admin).emit("playerDisconnected", roomInfo);
      // to all clients in room
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
      // to all clients in room
      io.in(roomKey).emit("playerJoinedRoom", roomInfo);
    };

    module.roomKey = (newKey) => {
      // to admin only
      socket.emit("roomKey", newKey);
    };

    module.roomCreated = (oldKey, newKey) => {
      // to all clients in room except admin
      socket.to(oldKey).emit("roomCreated", newKey);
    };

    module.leaveOldRoom = (oldKey) => {
      // to all clients in room
      io.socketsLeave(oldKey);
    };

    module.startGame = (roomKey, roomInfo) => {
      // to all clients in room
      io.in(roomKey).emit("startGame", roomInfo);
    };

    module.answersSubmitted = (roomKey, roomInfo) => {
      io.to(roomInfo.admin).emit("answersSubmitted", roomInfo);
      // to all clients in room
      io.in(roomKey).emit("answersSubmitted", roomInfo);
    };

    module.startVotingRound = (roomKey, roomInfo) => {
      io.to(roomInfo.admin).emit("startVotingRound", roomInfo);
      // to all clients in room
      io.in(roomKey).emit("startVotingRound", roomInfo);
    };

    module.voteSubmitted = (roomInfo) => {
      socket.emit("voteSubmitted", roomInfo);
    };

    module.displayResults = (roomKey, totalVotes, roomInfo) => {
      io.to(roomInfo.admin).emit("displayResults", totalVotes, roomInfo);
      // to all clients in room
      io.in(roomKey).emit("displayResults", totalVotes, roomInfo);
    };

    module.nextVotingRound = (roomKey, roomInfo) => {
      // to all clients in room
      io.in(roomKey).emit("nextVotingRound", roomInfo);
    };

    module.endGame = (roomKey, roomInfo) => {
      io.to(roomInfo.admin).emit("endgame", roomInfo);
      // to all clients in room
      io.in(roomKey).emit("endgame", roomInfo);
    };

    return module;
};
