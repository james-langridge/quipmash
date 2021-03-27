const path = require('path');
const express = require("express");
const app = express();
const cors = require("cors");
const server = require("http").createServer(app);
const PORT = process.env.PORT || 5000;
const options = {
  cors: {
    origin: 'https://floating-reaches-30894.herokuapp.com',
    methods: ["GET", "POST"]
  }
};
// const options = {
//   cors: {
//     origin: 'http://localhost:3000',
//     methods: ["GET", "POST"]
//   }
// };

app.use(cors());

if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/build'))

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'))
  })
}

server.listen(PORT, () => console.log(`Mixing it up on port ${PORT}`));

const io = require("socket.io")(server, options);
require("./socket")(io);
