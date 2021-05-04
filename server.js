require("dotenv").config();
const path = require('path');
const express = require("express");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const passport = require("passport");
const users = require("./routes/users");
const questionRoute = require('./routes/questions');
const PORT = process.env.PORT || 5000;
const db = process.env.MONGO_URI;

app.use(
  bodyParser.urlencoded({
    extended: false
  })
);
app.use(bodyParser.json());

mongoose
  .connect(db, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
  })
  .then(() => console.log("MongoDB successfully connected"))
  .catch(err => console.log(err));

app.use(passport.initialize());

require("./passport")(passport);

app.use("/users", users);
app.use("/question", questionRoute);

if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/build'))

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'))
  })
}

server.listen(PORT, () => console.log(`Mixing it up on port ${PORT}`));

require("./sockets")(io);
