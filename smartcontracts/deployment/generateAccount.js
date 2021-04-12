const axios = require("axios");
const axiosRetry = require("axios-retry");

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

const { API_ETH_KEY, API_GENERATE_ETH_KEY, senderLabel } = process.env;

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
