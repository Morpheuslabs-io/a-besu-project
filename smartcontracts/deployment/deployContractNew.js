const axios = require("axios");
const axiosRetry = require("axios-retry");
const web3Utils = require("web3-utils");
const web3EthContract = require("web3-eth-contract");
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

async function request_invokeContractMethod(
  senderLabel,
  contractMethodPayload,
  contractAddress
) {
  const result = await axios.post(API_INVOKE_CONTRACT_METHOD, {
    senderLabel,
    contractMethodPayload,
    contractAddress,
  });

  // {transactionHash, sender}
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

    console.log("deployContract_RewardToken: ", deployedRewardToken);

    return { ...deployedRewardToken, abi: compiledRewardToken.abi };
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

    console.log("deployContract_MicroPayment: ", deployedMicroPayment);

    return { ...deployedMicroPayment, abi: compiledMicroPayment.abi };
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

    console.log(
      "deployContract_NameRegistryService: ",
      deployedNameRegistryService
    );

    return {
      ...deployedNameRegistryService,
      abi: compiledNameRegistryService.abi,
    };
  } catch (e) {
    console.error("deployContract_NameRegistryService - Error:", e);
    return null;
  }
}

async function deployContract_Program() {
  try {
    const compiledProgram = await compileContract(
      "../contracts/utility",
      "Program"
    );

    const ctorArgsProgram = null;

    const deployedProgram = await request_deployContract(
      sender,
      compiledProgram.bytecode,
      compiledProgram.abi,
      ctorArgsProgram
    );

    console.log("deployContract_Program: ", deployedProgram);

    return deployedProgram;
  } catch (e) {
    console.error("deployContract_Program - Error:", e);
    return null;
  }
}

async function invokeContractMethod_setAuthorized(
  rewardTokenAbi,
  rewardTokenAddress,
  authAddress
) {
  try {
    const rewardTokenContract = new web3EthContract(
      rewardTokenAbi,
      rewardTokenAddress
    );

    const contractMethodPayload = rewardTokenContract.methods
      .setAuthorized(authAddress)
      .encodeABI();

    const result = await request_invokeContractMethod(
      sender,
      contractMethodPayload,
      rewardTokenAddress
    );

    console.log("invokeContractMethod_setAuthorized:", result);

    return result;
  } catch (e) {
    console.error("invokeContractMethod_setAuthorized - Error:", e);
    return null;
  }
}

async function main() {
  // Deploy contract
  const deployedRewardToken = await deployContract_RewardToken();

  const deployedMicroPayment = await deployContract_MicroPayment(
    deployedRewardToken.contractAddress
  );

  const deployedNameRegistryService = await deployContract_NameRegistryService();

  const deployedProgram = await deployContract_Program();

  ////////////////////////////////////////////////////

  // Invoke contract method
  const resultSetAuthorized = await invokeContractMethod_setAuthorized(
    deployedRewardToken.abi,
    deployedRewardToken.contractAddress,
    deployedMicroPayment.contractAddress
  );

  ////////////////////////////////////////////////////

  process.exit(0);
}

main();
