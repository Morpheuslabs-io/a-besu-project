const {
  deployContractWrapper,
  invokeContractMethodWrapper,
  generateAccount,
} = require("./deployContract");

// Map of labelName and address
let labelAddressMap = require("../labelAddressMap.json");

async function deployContractHandle(req, res) {
  try {
    const { senderLabel, binary, encodedConstructor, contractAbi } = req.body;

    if (!senderLabel || !binary || !contractAbi) {
      const message = "One of the input params is missing";
      console.log(message);
      return res.status(400).send({
        status: "error",
        message,
      });
    }

    // Get senderAddress from senderLabel
    if (!labelAddressMap[senderLabel]) {
      const message = "senderLabel not found";
      console.log(message);
      return res.status(400).send({
        status: "error",
        message,
      });
    }
    const senderAddress = labelAddressMap[senderLabel].address;
    const senderPrivateKey = labelAddressMap[senderLabel].privateKey;
    /////////////////////

    const deployResult = await deployContractWrapper(
      senderAddress,
      senderPrivateKey,
      binary,
      encodedConstructor || null,
      contractAbi
    );

    if (!deployResult) {
      const message = "Failed to deploy contract";
      console.log(message);
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

    // Get senderAddress from senderLabel
    if (!labelAddressMap[senderLabel]) {
      return res.status(400).send({
        status: "error",
        message: "senderLabel not found",
      });
    }
    const senderAddress = labelAddressMap[senderLabel].address;
    const senderPrivateKey = labelAddressMap[senderLabel].privateKey;
    /////////////////////

    const deployResult = await invokeContractMethodWrapper(
      senderAddress,
      senderPrivateKey,
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

async function getKeyHandle(req, res) {
  try {
    const { labelName } = req.body;

    if (!labelName) {
      return res.status(400).send({
        status: "error",
        message: "One of the input params is missing",
      });
    }

    if (!labelAddressMap[labelName]) {
      const message = "labelName not found";
      console.log("getKeyHandle: ", message);
      return res.status(500).send({ message });
    } else {
      const result = {
        publicKey: labelAddressMap[labelName].address,
        address: labelAddressMap[labelName].address,
        labelName,
      };
      console.log("getKeyHandle: ", result);
      return res.status(200).send(result);
    }
  } catch (error) {
    console.error("getKeyHandle - Error:", error);
    return res.status(500).send({ message: "Failed to find labelName" });
  }
}

async function generateKeyHandle(req, res) {
  try {
    const { labelName } = req.body;

    if (!labelName) {
      return res.status(400).send({
        status: "error",
        message: "One of the input params is missing",
      });
    }

    let result;
    // If not exist, then generate new
    if (!labelAddressMap[labelName]) {
      const { address, privateKey } = await generateAccount();
      result = { publicKey: address, address, labelName };
    } else {
      // already exist
      result = {
        publicKey: labelAddressMap[labelName].address,
        address: labelAddressMap[labelName].address,
        labelName,
      };
    }
    console.log("generateKeyHandle: ", result);
    return res.status(200).send(result);
  } catch (error) {
    console.error("generateKeyHandle - Error:", error);
    return res.status(500).send({ message: "Failed to generate key" });
  }
}

module.exports = {
  deployContractHandle,
  invokeContractMethodHandle,
  getKeyHandle,
  generateKeyHandle,
};
