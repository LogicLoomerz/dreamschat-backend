const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { connectDatabase } = require("./lib/config/database");
const routes = require("./lib/routes/route");
const { NOT_FOUND } = require("./lib/utils/status-codes");
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
    res.status(200).send("Welcome to DreamsChat :)")
});

app.use("/api", routes);
app.all("*", (_, res) => {
    res.status(NOT_FOUND).send({message: "Route not found"});
})

app.listen(port, () => {
    console.log(
      `Listening on port:${port} \nVisit http://localhost:${port}/`
    );
  });