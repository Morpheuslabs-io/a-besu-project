if (process.env.NETWORK === "besu") {
  require("dotenv").config({ path: ".env.besu" });
} else {
  require("dotenv").config({ path: ".env.ganache" });
}

const router = require("./controller/routes");

const express = require("express");
const app = express();
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use("/", router);

const port = process.env.PORT || 8545;

app.listen(port, () => {
  console.log(`Server is listening at port ${port}`);
});
