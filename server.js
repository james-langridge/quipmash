const path = require('path');
const express = require("express");
const app = express();
const server = require("http").createServer(app);
const options = {
  cors: {
    origin: 'http://localhost:3000',
    methods: ["GET", "POST"]
  }
};
const io = require("socket.io")(server, options);
const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV === 'production') {
  options.cors.origin = process.env.REACT_APP_CORS_ORIGIN;
  app.use(express.static('client/build'))

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'))
  })
}

server.listen(PORT, () => console.log(`Mixing it up on port ${PORT}`));

require("./socket")(io);
