const express = require("express");

const {
  deployContractHandle,
  invokeContractMethodHandle,
  getKeyHandle,
  generateKeyHandle,
} = require("./handler");

const router = new express.Router();

router.get("/", function (req, res) {
  res.send({
    message: "Hello",
  });
});

router.post("/deployContract", deployContractHandle);
router.post("/invokeContractMethod", invokeContractMethodHandle);
router.post("/eth/key", getKeyHandle);
router.post("/generate/eth/key", generateKeyHandle);

module.exports = router;
