import express from "express";
import "dotenv/config";
import cors from "cors";
import router from "./routers/router.js";
import stripeRouter from "./routers/stripeRouter.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

app.use("/", router);
app.use("/stripe", stripeRouter);

app.get("/", (req, res) => {
  res.send("Welcome!");
});

app.listen(3000, () => {
  console.log("Server listening at http://localhost:3000");
});
