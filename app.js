import express from "express";
import { db } from "./config/db.js";
import "dotenv/config";
import cors from "cors";

import productsRouter from "./routers/router.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/", productsRouter);

app.get("/", (req, res) => {
  console.log("Welcome!");
});

app.listen(3000, () => {
  console.log("Server listening to http://localhost:3000");
});
