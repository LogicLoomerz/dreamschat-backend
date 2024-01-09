const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { connectDatabase } = require("./lib/config/database");
dotenv.config();

const app = express();

try {
    connectDatabase();
} catch (error) {
    console.error(error)
}

app.use(cors());

const port = process.env.PORT;

app.get("/", async (_, res) => {
    res.status(200).send("Welcome to DreamsChat :)");
});

app.listen(port, () => {
    console.log(
      `Listening on port:${port} \nVisit http://localhost:${port}/`
    );
  });