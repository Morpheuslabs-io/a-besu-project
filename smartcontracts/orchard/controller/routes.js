const express = require("express");
const { deployContractHandle } = require("./handler");
const router = new express.Router();

router.get("/status", function (req, res) {
  res.send({
    message: "Good",
  });
});

// Withdraw from HOLDER address to another address which must be a token-associted address
router.post("/deployContract", deployContractHandle);

module.exports = router;
