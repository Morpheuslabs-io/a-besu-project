const axios = require("axios");
const axiosRetry = require("axios-retry");

axiosRetry(axios, { retries: 3 });

const API_ETH_KEY = "http://127.0.0.1:30303/orchard/eth/key";

const API_GENERATE_ETH_KEY = "http://127.0.0.1:30303/orchard/generate/eth/key";

const senderLabel = "Label-new";

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

    console.log("Generated account info: ", result.data);

    // {publicKey, address}
    return result.data;
  } catch (err) {
    console.error(err.response.data);
    return null;
  }
}

async function main() {
  await request_generateEthKey(senderLabel);

  process.exit(0);
}

main();
