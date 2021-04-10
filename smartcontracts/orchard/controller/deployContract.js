const Web3 = require("web3");
const keythereum = require("keythereum");

const onlyCompile = process.env.ONLY_COMPILE === "true";

if (process.env.NETWORK === "besu") {
  require("dotenv").config({ path: ".env.besu" });
} else {
  require("dotenv").config({ path: ".env.ganache" });
}

const {
  OWNER_ADDRESS,
  KEY_FILE_PATH,
  PRIVATE_KEY,
  OWNER_PASSPHRASE,
  CHAIN_ID,
  BLOCKCHAIN_ENDPOINT,
} = process.env;

if (
  (PRIVATE_KEY || (KEY_FILE_PATH && OWNER_ADDRESS && OWNER_PASSPHRASE)) &&
  CHAIN_ID &&
  BLOCKCHAIN_ENDPOINT
) {
  if (onlyCompile) {
    console.log(`Compiling smart contract`);
  } else {
    console.log(`NETWORK: ${process.env.NETWORK}`);
    console.log(`Deployment to: ${BLOCKCHAIN_ENDPOINT}`);
  }
} else {
  console.error("Missing ENV variable");
  process.exit(1);
}

function getPrivKey(addr, keyFilePath, passphrase) {
  let keyObject = keythereum.importFromFile(addr, keyFilePath);
  let privateKey = keythereum.recover(passphrase, keyObject);
  return privateKey.toString("hex");
}

// If PRIVATE_KEY is specified, it will be taken. Otherwise, read from KEY_FILE_PATH
const privateKey =
  PRIVATE_KEY || getPrivKey(OWNER_ADDRESS, KEY_FILE_PATH, OWNER_PASSPHRASE);

const web3 = new Web3(new Web3.providers.HttpProvider(BLOCKCHAIN_ENDPOINT));
const account = web3.eth.accounts.privateKeyToAccount(privateKey);
const sender = account.address;
console.log("sender:", sender);
let chainId = CHAIN_ID;

async function sendTx(senderLabel, txObject) {
  const txTo = txObject._parent.options.address;
  let gasPrice = 100000000;

  let gasLimit;
  try {
    gasLimit = await txObject.estimateGas();
    console.log("Estimated gas", gasLimit);
  } catch (e) {
    gasLimit = 5000 * 1000;
  }

  if (txTo !== null) {
    gasLimit = 5000 * 1000;
  }

  const txData = txObject.encodeABI();
  const txFrom = senderLabel;
  const txKey = account.privateKey;

  let nonce = await web3.eth.getTransactionCount(txFrom);

  gasLimit += 100000;
  const tx = {
    from: txFrom,
    nonce: nonce,
    data: txData,
    gas: gasLimit,
    chainId,
    gasPrice,
  };

  const signedTx = await web3.eth.accounts.signTransaction(tx, txKey);
  const txHash = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

  return txHash;
}

async function deployContract(senderLabel, bytecode, ctorArgs, abi) {
  try {
    const contract = new web3.eth.Contract(abi);
    const deploy = contract.deploy({ data: bytecode, arguments: ctorArgs });

    console.log(`Deploying contract`);
    const tx = await sendTx(senderLabel, deploy);

    // contract.options.address = tx.contractAddress;
    console.log("Deployed contract address: ", tx.contractAddress);
    console.log(`TxHash -> ${tx.transactionHash}`);

    // console.log(contractName, JSON.stringify(abi));

    return {
      transactionHash: tx.transactionHash,
      contractAddress: tx.contractAddress,
      sender: senderLabel,
    };
  } catch (e) {
    console.error("deployContract - Error", e);
    return null;
  }
}

async function invokeContractMethod(
  senderLabel,
  contractMethodPayload,
  contractAddress
) {
  const nonce = await web3.eth.getTransactionCount(senderLabel);

  const tx = {
    from: senderLabel,
    to: contractAddress,
    nonce: nonce,
    data: contractMethodPayload,
    gas: 500000,
    gasPrice: 1,
    chainId,
  };

  const signedTx = await web3.eth.accounts.signTransaction(
    tx,
    account.privateKey
  );
  const txData = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
  return { transactionHash: txData.transactionHash, sender: senderLabel };
}

async function deployContractWrapper(
  senderLabel,
  contractBytecode,
  constructorArguments,
  contractABI
) {
  if (senderLabel !== sender) {
    return { error: "Unknown senderLabel" };
  }
  const result = await deployContract(
    senderLabel,
    contractBytecode,
    constructorArguments,
    contractABI
  );

  return result;
}

async function invokeContractMethodWrapper(
  senderLabel,
  contractMethodPayload,
  contractAddress
) {
  if (senderLabel !== sender) {
    return { error: "Unknown senderLabel" };
  }
  const result = await invokeContractMethod(
    senderLabel,
    contractMethodPayload,
    contractAddress
  );

  return result;
}

module.exports = {
  deployContractWrapper,
  invokeContractMethodWrapper,
};
