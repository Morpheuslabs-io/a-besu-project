const Web3 = require("web3");
const fs = require("fs");
const solc = require("solc");
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

async function sendTx(txObject) {
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
  const txFrom = account.address;
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

// Example
// "contractFolder" -> ../contracts/micropayment
// "contractName" -> RewardToken
async function deployContract(contractFolder, contractName, ctorArgs) {
  let sourceFile = `${contractFolder}/${contractName}.sol`;
  console.log(
    `Start compiling contract ${contractName}, source file -->`,
    sourceFile
  );
  let source;

  let compilerOption = {
    language: "Solidity",
    settings: {
      outputSelection: {
        "*": {
          "*": ["*"],
        },
      },
    },
  };

  try {
    source = fs.readFileSync(sourceFile, "utf8");
  } catch (err) {
    console.log("File not found", sourceFile);
    return;
  }

  try {
    compilerOption = {
      ...compilerOption,
      sources: { [contractName]: { content: source } },
    };

    let compiledContract = JSON.parse(
      solc.compile(JSON.stringify(compilerOption))
    );

    compiledContract = compiledContract.contracts[contractName][contractName];

    let bytecode = compiledContract.evm.bytecode.object;
    let abi = compiledContract.abi;

    // console.log("bytecode:", bytecode);

    if (onlyCompile) {
      console.log("Success");
      return { _address: "0xdummy" };
    }

    let contract = new web3.eth.Contract(abi);
    const deploy = contract.deploy({ data: bytecode, arguments: ctorArgs });

    console.log(`Deploying contract ${contractName}`);
    let tx = await sendTx(deploy);

    contract = new web3.eth.Contract(abi, tx.contractAddress);
    // contract.options.address = tx.contractAddress;
    console.log(
      "Deployed contract",
      contractName,
      " contract address -->",
      tx.contractAddress
    );
    console.log(`TxHash -> ${tx.transactionHash}`);

    // console.log(contractName, JSON.stringify(abi));

    return contract;
  } catch (e) {
    console.log("ERROR", e);
  }
}

const BigNumber = web3.utils.BN;
const symbolName = "Reward Token";
const decimal = 0;
const symbol = "RWT";
const totalSupply = new BigNumber(1 * 10 ** 7 * 10 ** decimal); // 2 billions token, decimal 0;

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

async function main() {
  const NameRegistryServiceContract = await deployContract_nameRegistryService();
  const MicroPaymentContract = await deployContract_micropayment();
  const Program = await deployContract_utility();

  if (onlyCompile) {
    console.log("Done");
    process.exit(0);
  }

  const { RewardToken, MicroPayment } = MicroPaymentContract;

  let payload;
  let txHash;

  // register Program
  payload = NameRegistryServiceContract.methods
    .register(PROGRAM_LABEL, Program._address)
    .encodeABI();

  txHash = await invokeContractMethod(
    payload,
    NameRegistryServiceContract._address
  );
  console.log(`Register Program txHash: ${txHash.transactionHash}`);

  // register MicroPayment
  payload = NameRegistryServiceContract.methods
    .register(MICROPAYMENT_LABEL, MicroPayment._address)
    .encodeABI();

  txHash = await invokeContractMethod(
    payload,
    NameRegistryServiceContract._address
  );
  console.log(`Register MicroPayment txHash: ${txHash.transactionHash}`);

  // register RewardToken
  payload = NameRegistryServiceContract.methods
    .register(REWARDTOKEN_LABEL, RewardToken._address)
    .encodeABI();

  txHash = await invokeContractMethod(
    payload,
    NameRegistryServiceContract._address
  );
  console.log(`Register RewardToken txHash: ${txHash.transactionHash}`);
}

main();
