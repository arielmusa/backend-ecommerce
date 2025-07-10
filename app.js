import express from "express";
import "dotenv/config";
import cors from "cors";
import router from "./routers/router.js";
import stripeRouter from "./routers/stripeRouter.js";
import dialogflowRouter from "./routers/dialogflowRouter.js";
import addImageUrl from "./middlewares/AddImageUrl.js";
import productImagesRouter from "./routers/productImages.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

app.use(addImageUrl);

app.use("/", router);
app.use("/stripe", stripeRouter);
app.use("/api/dialogflow", dialogflowRouter);
app.use("/product-images", productImagesRouter);

app.get("/", (req, res) => {
  res.send("Welcome!");
});

app.listen(3000, () => {
  console.log("Server listening at http://localhost:3000");
});
