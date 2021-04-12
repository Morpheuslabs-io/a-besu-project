const axios = require("axios");
const axiosRetry = require("axios-retry");
const web3Utils = require("web3-utils");
const web3EthContract = require("web3-eth-contract");
const fs = require("fs");
const solc = require("solc");

axiosRetry(axios, { retries: 3 });

if (process.env.NETWORK === "besu") {
  require("dotenv").config({ path: ".env.new.besu" });
} else if (process.env.NETWORK === "ganache") {
  require("dotenv").config({ path: ".env.new.ganache" });
} else if (process.env.NETWORK === "uat-besu") {
  require("dotenv").config({ path: ".env.new.uat.besu" });
} else if (process.env.NETWORK === "prod-besu") {
  require("dotenv").config({ path: ".env.new.prod.besu" });
}

const {
  API_DEPLOY_CONTRACT,
  API_INVOKE_CONTRACT_METHOD,
  API_ETH_KEY,
  API_GENERATE_ETH_KEY,
  senderLabel,
} = process.env;

if (
  !API_DEPLOY_CONTRACT ||
  !API_INVOKE_CONTRACT_METHOD ||
  !API_ETH_KEY ||
  !API_GENERATE_ETH_KEY ||
  !senderLabel
) {
  console.error("Missing ENV variable");
  process.exit(1);
}

const MICROPAYMENT_LABEL = "MicroPayment_V1";
const REWARDTOKEN_LABEL = "RewardToken_V1";
const PROGRAM_LABEL = "Program_V1";

// For RewardToken deployment
const symbolName = "RewardToken";
const decimal = 0;
const symbol = "RDT";
const totalSupply = web3Utils.toBN(2 * 10 ** 9 * 10 ** decimal); // 2 billions token, decimal 0;

async function request_deployContract(senderLabel, encodedConstructor) {
  try {
    const result = await axios.post(API_DEPLOY_CONTRACT, {
      senderLabel,
      binary: null, // not used param
      encodedConstructor,
    });

    // {transactionHash, contractAddress, senderLabel}
    return result.data;
  } catch (err) {
    console.error(err.response.data);
    process.exit(1);
  }
}

async function request_invokeContractMethod(
  senderLabel,
  contractMethodPayload,
  contractAddress
) {
  try {
    const result = await axios.post(API_INVOKE_CONTRACT_METHOD, {
      senderLabel,
      contractMethodPayload,
      contractAddress,
    });

    // {transactionHash, senderLabel}
    return result.data;
  } catch (err) {
    console.error(err.response.data);
    process.exit(1);
  }
}

async function request_ethKey(labelName) {
  try {
    const result = await axios.post(API_ETH_KEY, {
      labelName,
    });

    console.log("Deployment account info: ", result.data);

    // {publicKey, address}
    return result.data;
  } catch (err) {
    console.error(err.response.data);
    return null;
  }
}

async function request_generateEthKey(labelName) {
  try {
    const result = await axios.post(API_GENERATE_ETH_KEY, {
      labelName,
    });

    console.log("request_generateEthKey: ", result.data);

    // {publicKey, address}
    return result.data;
  } catch (err) {
    console.error(err.response.data);
    return null;
  }
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
    const compiledRewardToken = await compileContract(
      "../contracts/micropayment",
      "RewardToken"
    );

    const ctorArgsRewardToken = [totalSupply, symbolName, symbol, decimal];

    const contract = new web3EthContract(compiledRewardToken.abi);
    const encodedConstructor = contract
      .deploy({
        data: compiledRewardToken.bytecode,
        arguments: ctorArgsRewardToken,
      })
      .encodeABI();

    const deployedRewardToken = await request_deployContract(
      senderLabel,
      encodedConstructor
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

    const contract = new web3EthContract(compiledMicroPayment.abi);
    const encodedConstructor = contract
      .deploy({
        data: compiledMicroPayment.bytecode,
        arguments: ctorArgsMicroPayment,
      })
      .encodeABI();

    const deployedMicroPayment = await request_deployContract(
      senderLabel,
      encodedConstructor
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

    const contract = new web3EthContract(compiledNameRegistryService.abi);
    const encodedConstructor = contract
      .deploy({
        data: compiledNameRegistryService.bytecode,
        arguments: ctorArgsNameRegistryService,
      })
      .encodeABI();

    const deployedNameRegistryService = await request_deployContract(
      senderLabel,
      encodedConstructor
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

    const contract = new web3EthContract(compiledProgram.abi);
    const encodedConstructor = contract
      .deploy({
        data: compiledProgram.bytecode,
        arguments: ctorArgsProgram,
      })
      .encodeABI();

    const deployedProgram = await request_deployContract(
      senderLabel,
      encodedConstructor
    );

    console.log("deployContract_Program: ", deployedProgram);

    return deployedProgram;
  } catch (e) {
    console.error("deployContract_Program - Error:", e);
    return null;
  }
}

// RewardToken setAuthorized for a given "authAddress"
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
      senderLabel,
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

// NameRegistryService register label for a given address
async function invokeContractMethod_register(
  nameRegistryServiceAbi,
  nameRegistryServiceAddress,
  registeredLabel,
  registeredAddress
) {
  try {
    const nameRegistryServiceContract = new web3EthContract(
      nameRegistryServiceAbi,
      nameRegistryServiceAddress
    );

    const contractMethodPayload = nameRegistryServiceContract.methods
      .register(registeredLabel, registeredAddress)
      .encodeABI();

    const result = await request_invokeContractMethod(
      senderLabel,
      contractMethodPayload,
      nameRegistryServiceAddress
    );

    console.log("invokeContractMethod_register:", result);

    return result;
  } catch (e) {
    console.error("invokeContractMethod_register - Error:", e);
    return null;
  }
}

async function main() {
  // Get/generate key
  await request_ethKey(senderLabel);

  ////////////////////////////////////////////////////

  // Deploy NameRegistryService contract
  const deployedNameRegistryService = await deployContract_NameRegistryService();

  // Deploy RewardToken contract
  const deployedRewardToken = await deployContract_RewardToken();

  // Deploy MicroPayment contract
  const deployedMicroPayment = await deployContract_MicroPayment(
    deployedRewardToken.contractAddress
  );

  // Deploy Program contract
  const deployedProgram = await deployContract_Program();

  ////////////////////////////////////////////////////

  // Invoke contract method
  // RewardToken setAuthorized for MicroPayment
  console.log(
    `RewardToken setAuthorized for MicroPayment at address: ${deployedMicroPayment.contractAddress}`
  );
  const resultSetAuthorized = await invokeContractMethod_setAuthorized(
    deployedRewardToken.abi,
    deployedRewardToken.contractAddress,
    deployedMicroPayment.contractAddress
  );

  // NameRegistryService register for RewardToken
  console.log(
    `NameRegistryService register for RewardToken at address: ${deployedRewardToken.contractAddress}`
  );
  const resultRegisterRewardToken = await invokeContractMethod_register(
    deployedNameRegistryService.abi,
    deployedNameRegistryService.contractAddress,
    REWARDTOKEN_LABEL,
    deployedRewardToken.contractAddress
  );

  // NameRegistryService register for MicroPayment
  console.log(
    `NameRegistryService register for MicroPayment at address: ${deployedMicroPayment.contractAddress}`
  );
  const resultRegisterMicroPayment = await invokeContractMethod_register(
    deployedNameRegistryService.abi,
    deployedNameRegistryService.contractAddress,
    MICROPAYMENT_LABEL,
    deployedMicroPayment.contractAddress
  );

  // NameRegistryService register for Program
  console.log(
    `NameRegistryService register for Program at address: ${deployedProgram.contractAddress}`
  );
  const resultRegisterProgram = await invokeContractMethod_register(
    deployedNameRegistryService.abi,
    deployedNameRegistryService.contractAddress,
    PROGRAM_LABEL,
    deployedProgram.contractAddress
  );

  ////////////////////////////////////////////////////

  process.exit(0);
}

main();
