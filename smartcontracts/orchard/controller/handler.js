const {
  deployContractWrapper,
  invokeContractMethodWrapper,
} = require("./deployContract");

async function deployContractHandle(req, res) {
  try {
    const { senderLabel, binary, encodedConstructor, contractAbi } = req.body;

    if (!senderLabel || !binary || !contractAbi) {
      return res.status(400).send({
        status: "error",
        message: "One of the input params is missing",
      });
    }

    const deployResult = await deployContractWrapper(
      senderLabel,
      binary,
      encodedConstructor || null,
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

async function invokeContractMethodHandle(req, res) {
  try {
    const { senderLabel, contractMethodPayload, contractAddress } = req.body;

    if (!senderLabel || !contractMethodPayload || !contractAddress) {
      return res.status(400).send({
        status: "error",
        message: "One of the input params is missing",
      });
    }

    const deployResult = await invokeContractMethodWrapper(
      senderLabel,
      contractMethodPayload,
      contractAddress
    );

    if (!deployResult) {
      return res.status(500).send({ message: "Failed to deploy contract" });
    }

    const { transactionHash, sender } = deployResult;

    return res.status(200).send({
      transactionHash,
      sender,
    });
  } catch (error) {
    console.error("invokeContractMethodHandle - Error:", error);
    return res.status(500).send({ message: "Failed to deploy contract" });
  }
}

module.exports = {
  deployContractHandle,
  invokeContractMethodHandle,
};
