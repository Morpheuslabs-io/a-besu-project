const Web3 = require("web3");
const keythereum = require("keythereum");

const onlyCompile = process.env.ONLY_COMPILE === "true";

if (process.env.NETWORK === "besu") {
  require("dotenv").config({ path: ".env.besu" });
} else if (process.env.NETWORK === "ganache") {
  require("dotenv").config({ path: ".env.ganache" });
} else if (process.env.NETWORK === "uat-besu") {
  require("dotenv").config({ path: ".env.uat.besu" });
} else if (process.env.NETWORK === "prod-besu") {
  require("dotenv").config({ path: ".env.prod.besu" });
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

// Used only for deploying contract
async function sendTx(senderAddress, senderPrivateKey, encodedConstructor) {
  const txData = encodedConstructor;
  const txFrom = senderAddress;
  const txKey = senderPrivateKey;

  let nonce = await web3.eth.getTransactionCount(txFrom);

  console.log('nonce, deploy: ', nonce);

  const tx = {
    from: txFrom,
    nonce: nonce,
    data: txData,
    gas: 8000000,
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
  encodedConstructor
) {
  try {
    console.log(`Deploying contract`);
    const tx = await sendTx(
      senderAddress,
      senderPrivateKey,
      encodedConstructor
    );

    console.log("Deployed contract address: ", tx.contractAddress);
    console.log(`TxHash -> ${tx.transactionHash}`);

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

  console.log('nonce, invoke: ', nonce);

  const tx = {
    from: senderAddress,
    to: contractAddress,
    // nonce: nonce,
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
  encodedConstructor
) {
  const result = await deployContract(
    senderAddress,
    senderPrivateKey,
    encodedConstructor
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
