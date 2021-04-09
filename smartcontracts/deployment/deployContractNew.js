const axios = require("axios");
const axiosRetry = require("axios-retry");

axiosRetry(axios, { retries: 3 });

const API_URL = "http://127.0.0.1:8545";
const SERVICE_NAME = "orchard";
const API_DEPLOY_CONTRACT = "deployContract";
const API_INVOKE_CONTRACT_METHOD = "invokeContractMethod";

async function deployContractWrapper(senderLabel, binary, encodedConstructor) {
  const api = `API_URL/${SERVICE_NAME}/${API_DEPLOY_CONTRACT}`;
  const result = await axios.post(api, {
    senderLabel,
    binary,
    encodedConstructor,
  });
  console.log("deployContract - result:", result);
}

async function invokeContractMethodWrapper(
  senderLabel,
  contractMethodPayload,
  contractAddress
) {
  const api = `API_URL/${SERVICE_NAME}/${API_INVOKE_CONTRACT_METHOD}`;
  const result = await axios.post(api, {
    senderLabel,
    contractMethodPayload,
    contractAddress,
  });
  console.log("invokeContractMethodWrapper - result:", result);
}

async function main() {
  // Test data
  const senderLabel = "0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1";

  const jsonFileRewardToken = require("../build/contracts/RewardToken.json");
  const contractBytecodeRewardToken = jsonFileRewardToken.bytecode;

  const symbolName = "RewardToken";
  const decimal = 0;
  const symbol = "RDT";
  const totalSupply = new BigNumber(2 * 10 ** 9 * 10 ** decimal); // 2 billions token, decimal 0;

  const constructorArgumentsRewardToken = [
    totalSupply,
    symbolName,
    symbol,
    decimal,
  ];
  ////////////

  const deployContractRewardToken = await deployContractWrapper(
    senderLabel,
    contractBytecodeRewardToken,
    constructorArgumentsRewardToken
  );

  // const invokeContractMethodResult = await invokeContractMethodWrapper(
  //   senderLabel,
  //   contractMethodPayload,
  //   contractAddress
  // );
}

main();
