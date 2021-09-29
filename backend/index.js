const express = require("express");
const connectToMongo = require("./db");
const cors = require("cors");

connectToMongo();
const app = express();
const port = 5000;
app.use(express.json());
app.use(cors()); // Use to handle browser call directly

//Available routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/notes", require("./routes/notes"));

app.get("/", (req, res) => {
  res.send("Hello i am jainish!");
});

app.listen(port, () => {
  console.log(`iNotebook backend listening at http://localhost:${port}`);
});
