const express = require("express");
const { deployContractHandle } = require("./handler");
const router = new express.Router();

router.get("/", function (req, res) {
  res.send({
    message: "Hello",
  });
});

// Withdraw from HOLDER address to another address which must be a token-associted address
router.post("/deployContract", deployContractHandle);

module.exports = router;
