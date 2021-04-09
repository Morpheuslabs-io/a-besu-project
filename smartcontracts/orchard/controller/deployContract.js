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

// This is the genesis account private key
// const privateKey = '8f2a55949038a9610f50fb23b5883af3b4ecb3c3bb792cbcefbd1542c692be63'

// This is the private key decoded from the keyfile
// const privateKey = '7bc861ae7cec9c7c30d7cc6b3c3b1abbef9893215853193e782760e33cd7cbd2'

// If PRIVATE_KEY is specified, it will be taken. Otherwise, read from KEY_FILE_PATH
const privateKey =
  PRIVATE_KEY || getPrivKey(OWNER_ADDRESS, KEY_FILE_PATH, OWNER_PASSPHRASE);

// console.log("privateKey:", privateKey);

let web3 = new Web3(new Web3.providers.HttpProvider(BLOCKCHAIN_ENDPOINT));
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
  // don't wait for confirmation
  //signedTxs.push(signedTx.rawTransaction);

  //console.log(signedTx);

  let txHash = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

  return txHash;
}

async function deployContract(senderLabel, contractName, ctorArgs, abi) {
  try {
    const contract = new web3.eth.Contract(abi);
    const deploy = contract.deploy({ data: bytecode, arguments: ctorArgs });

    console.log(`Deploying contract ${contractName}`);
    const tx = await sendTx(senderLabel, deploy);

    // contract.options.address = tx.contractAddress;
    console.log(
      "Deployed contract: ",
      contractName,
      ", address: ",
      tx.contractAddress
    );
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

const BigNumber = web3.utils.BN;
const symbolName = "RewardToken";
const decimal = 0;
const symbol = "RDT";
const totalSupply = new BigNumber(2 * 10 ** 9 * 10 ** decimal); // 2 billions token, decimal 0;

// Example: contractMethodPayload = RewardToken.methods.setAuthorized(MicroPayment._address).encodeABI();
// contractAddress = RewardToken._address
async function invokeContractMethod(contractMethodPayload, contractAddress) {
  // let contractMethodPayload = RewardToken.methods
  //   .setAuthorized(MicroPayment._address)
  //   .encodeABI();
  let nonce = await web3.eth.getTransactionCount(sender);

  let tx = {
    from: sender,
    to: contractAddress,
    nonce: nonce,
    data: contractMethodPayload,
    gas: 500000,
    gasPrice: 1,
    chainId,
  };

  let signedTx = await web3.eth.accounts.signTransaction(tx, privateKey);
  let txHash = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
  return txHash;
}

async function deployContract_micropayment() {
  try {
    const RewardToken = await deployContract(
      "../contracts/micropayment",
      "RewardToken",
      [totalSupply, symbolName, symbol, decimal]
    );
    const MicroPayment = await deployContract(
      "../contracts/micropayment",
      "MicroPayment",
      [RewardToken._address]
    );

    if (onlyCompile) {
      return;
    }

    // set admin
    let payload = RewardToken.methods
      .setAuthorized(MicroPayment._address)
      .encodeABI();

    let txHash = await invokeContractMethod(payload, RewardToken._address);
    console.log(`Set admin txHash: ${txHash.transactionHash}`);

    return {
      RewardToken,
      MicroPayment,
    };
  } catch (ex) {
    console.log(ex);
    return null;
  }
}


async function deployContract_utility() {
  try {
    // Deploy Program
    const ProgramContract = await deployContract(
      "../contracts/utility",
      "Program"
    );
    return ProgramContract;
  } catch (ex) {
    console.log(ex);
    return null;
  }
}

async function deployContract_nameRegistryService() {
  try {
    // Deploy NameRegistryService
    const NameRegistryServiceContract = await deployContract(
      "../contracts/utility",
      "NameRegistryService"
    );
    return NameRegistryServiceContract;
  } catch (ex) {
    console.log(ex);
    return null;
  }
}

const MICROPAYMENT_LABEL = "MicroPayment_V1";
const REWARDTOKEN_LABEL = "RewardToken_V1";
const PROGRAM_LABEL = "Program_V1";


async function deployContractWrapper(
  senderLabel,
  contractBytecode,
  constructorArguments,
  contractName
) {
  if (senderLabel !== sender) {
    return { error: "Unknown senderLabel" };
  }
  const result = await deployContract(
    senderLabel,
    contractName,
    constructorArguments,
    contractBytecode
  );

  return result;
}

module.exports = {
  deployContractWrapper,
};
