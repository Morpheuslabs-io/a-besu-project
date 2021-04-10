const express = require("express");
const {
  deployContractHandle,
  invokeContractMethodHandle,
} = require("./handler");
const router = new express.Router();

router.get("/", function (req, res) {
  res.send({
    message: "Hello",
  });
});

router.post("/deployContract", deployContractHandle);
router.post("/invokeContractMethod", invokeContractMethodHandle);

module.exports = router;
