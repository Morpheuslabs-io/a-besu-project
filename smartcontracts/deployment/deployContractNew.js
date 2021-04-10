const axios = require("axios");
const axiosRetry = require("axios-retry");
const web3Utils = require("web3-utils");
const fs = require("fs");
const solc = require("solc");

axiosRetry(axios, { retries: 3 });

const API_DEPLOY_CONTRACT = "http://127.0.0.1:30303/orchard/deployContract";

const API_INVOKE_CONTRACT_METHOD =
  "http://127.0.0.1:30303/orchard/invokeContractMethod";

const sender = "0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1";

async function request_deployContract(
  senderLabel,
  binary,
  contractAbi,
  encodedConstructor = null
) {
  const result = await axios.post(API_DEPLOY_CONTRACT, {
    senderLabel,
    binary,
    encodedConstructor,
    contractAbi,
  });

  // {transactionHash, contractAddress, sender}
  return result.data;
}

async function compileContract(contractFolder, contractName) {
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

    return { bytecode, abi };
  } catch (e) {
    console.log("compileContract - Error:", e);
    return null;
  }
}

async function deployContract_RewardToken() {
  try {
    const symbolName = "RewardToken";
    const decimal = 0;
    const symbol = "RDT";
    const totalSupply = web3Utils.toBN(2 * 10 ** 9 * 10 ** decimal); // 2 billions token, decimal 0;

    const compiledRewardToken = await compileContract(
      "../contracts/micropayment",
      "RewardToken"
    );

    const ctorArgsRewardToken = [totalSupply, symbolName, symbol, decimal];

    const deployedRewardToken = await request_deployContract(
      sender,
      compiledRewardToken.bytecode,
      compiledRewardToken.abi,
      ctorArgsRewardToken
    );

    return deployedRewardToken;
  } catch (e) {
    console.error("deployContract_RewardToken - Error:", e);
    return null;
  }
}

async function deployContract_MicroPayment(rewardTokenAddress) {
  try {
    const compiledMicroPayment = await compileContract(
      "../contracts/micropayment",
      "MicroPayment"
    );

    const ctorArgsMicroPayment = [rewardTokenAddress];

    const deployedMicroPayment = await request_deployContract(
      sender,
      compiledMicroPayment.bytecode,
      compiledMicroPayment.abi,
      ctorArgsMicroPayment
    );

    return deployedMicroPayment;
  } catch (e) {
    console.error("deployContract_MicroPayment - Error:", e);
    return null;
  }
}

async function deployContract_NameRegistryService() {
  try {
    const compiledNameRegistryService = await compileContract(
      "../contracts/utility",
      "NameRegistryService"
    );

    const ctorArgsNameRegistryService = null;

    const deployedNameRegistryService = await request_deployContract(
      sender,
      compiledNameRegistryService.bytecode,
      compiledNameRegistryService.abi,
      ctorArgsNameRegistryService
    );

    return deployedNameRegistryService;
  } catch (e) {
    console.error("deployContract_NameRegistryService - Error:", e);
    return null;
  }
}

async function invokeContractMethodWrapper(
  senderLabel,
  contractMethodPayload,
  contractAddress
) {
  const api = `${API_URL}/${SERVICE_NAME}/${API_INVOKE_CONTRACT_METHOD}`;
  const result = await axios.post(api, {
    senderLabel,
    contractMethodPayload,
    contractAddress,
  });
  console.log("invokeContractMethodWrapper - result:", result);
}

async function main() {
  const deployedRewardToken = await deployContract_RewardToken();
  console.log("deployedRewardToken: ", deployedRewardToken);

  const deployedMicroPayment = await deployContract_MicroPayment(
    deployedRewardToken.contractAddress
  );
  console.log("deployedMicroPayment: ", deployedMicroPayment);

  const deployedNameRegistryService = await deployContract_NameRegistryService();
  console.log("deployedNameRegistryService: ", deployedNameRegistryService);

  // const invokeContractMethodResult = await invokeContractMethodWrapper(
  //   senderLabel,
  //   contractMethodPayload,
  //   contractAddress
  // );

  process.exit(0);
}

main();
