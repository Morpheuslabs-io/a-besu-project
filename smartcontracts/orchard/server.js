if (process.env.NETWORK === "besu") {
  require("dotenv").config({ path: ".env.besu" });
} else if (process.env.NETWORK === "uat-besu") {
  require("dotenv").config({ path: ".env.uat.besu" });
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
app.use("/orchard", router);

const port = process.env.SERVER_PORT;

app.listen(port, () => {
  console.log(`Server is listening at port ${port}`);
});
