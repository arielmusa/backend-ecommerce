import express from "express";
import "dotenv/config";
import cors from "cors";
import router from "./routers/router.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/", router);

app.get("/", (req, res) => {
  res.send("Welcome!");
});

app.listen(3000, () => {
  console.log("Server listening at http://localhost:3000");
});
