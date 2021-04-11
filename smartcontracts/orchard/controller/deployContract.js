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
let chainId = CHAIN_ID;

async function sendTx(senderAddress, senderPrivateKey, txObject) {
  const txTo = txObject._parent.options.address;

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
  const txFrom = senderAddress;
  const txKey = senderPrivateKey;

  let nonce = await web3.eth.getTransactionCount(txFrom);

  gasLimit += 100000;
  const tx = {
    from: txFrom,
    nonce: nonce,
    data: txData,
    gas: gasLimit,
    // chainId,
    gasPrice: 0, // must specify 0 for gas-free tx
  };

  const signedTx = await web3.eth.accounts.signTransaction(tx, txKey);
  const txHash = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

  return txHash;
}

async function deployContract(
  senderAddress,
  senderPrivateKey,
  bytecode,
  ctorArgs,
  abi
) {
  try {
    const contract = new web3.eth.Contract(abi);
    const deploy = contract.deploy({ data: bytecode, arguments: ctorArgs });

    console.log(`Deploying contract`);
    const tx = await sendTx(senderAddress, senderPrivateKey, deploy);

    // contract.options.address = tx.contractAddress;
    console.log("Deployed contract address: ", tx.contractAddress);
    console.log(`TxHash -> ${tx.transactionHash}`);

    // console.log(contractName, JSON.stringify(abi));

    return {
      transactionHash: tx.transactionHash,
      contractAddress: tx.contractAddress,
      sender: senderAddress,
    };
  } catch (e) {
    console.error("deployContract - Error", e);
    return null;
  }
}

async function invokeContractMethod(
  senderAddress,
  senderPrivateKey,
  contractMethodPayload,
  contractAddress
) {
  const nonce = await web3.eth.getTransactionCount(senderAddress);

  const tx = {
    from: senderAddress,
    to: contractAddress,
    nonce: nonce,
    data: contractMethodPayload,
    gas: 500000,
    gasPrice: 0, // must specify 0 for gas-free tx
    // chainId,
  };

  const signedTx = await web3.eth.accounts.signTransaction(
    tx,
    senderPrivateKey
  );
  const txData = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
  console.log(
    "invokeContractMethod - transactionHash:",
    txData.transactionHash
  );
  return { transactionHash: txData.transactionHash, sender: senderAddress };
}

async function deployContractWrapper(
  senderAddress,
  senderPrivateKey,
  contractBytecode,
  constructorArguments,
  contractABI
) {
  const result = await deployContract(
    senderAddress,
    senderPrivateKey,
    contractBytecode,
    constructorArguments,
    contractABI
  );

  return result;
}

async function invokeContractMethodWrapper(
  senderAddress,
  senderPrivateKey,
  contractMethodPayload,
  contractAddress
) {
  const result = await invokeContractMethod(
    senderAddress,
    senderPrivateKey,
    contractMethodPayload,
    contractAddress
  );

  return result;
}

async function generateAccount() {
  try {
    const account = await web3.eth.accounts.create();
    console.log(
      `generateAccount - address: ${account.address}, privateKey: ${account.privateKey}`
    );
    return { address: account.address, privateKey: account.privateKey };
  } catch (e) {
    console.log("generateAccount - Error:", e);
    return null;
  }
}

module.exports = {
  deployContractWrapper,
  invokeContractMethodWrapper,
  generateAccount,
};
