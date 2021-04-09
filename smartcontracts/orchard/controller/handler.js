const { deployContractWrapper } = require("./deployContract");

async function deployContractHandle(req, res) {
  try {
    const { senderLabel, binary, encodedConstructor, contractAbi } = req.body;

    if (!senderLabel || !binary || !encodedConstructor || !contractAbi) {
      return res.status(400).send({
        status: "error",
        message: "One of the input params is missing",
      });
    }

    const deployResult = await deployContractWrapper(
      senderLabel,
      binary,
      encodedConstructor,
      contractAbi
    );

    if (!deployResult) {
      return res.status(500).send({ message: "Failed to deploy contract" });
    }

    const { transactionHash, contractAddress, sender } = deployResult;

    return res.status(200).send({
      transactionHash,
      contractAddress,
      sender,
    });
  } catch (error) {
    console.error("deployContractHandle - Error:", error);
    return res.status(500).send({ message: "Failed to deploy contract" });
  }
}

module.exports = {
  deployContractHandle,
};
