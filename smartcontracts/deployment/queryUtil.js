const Web3 = require('web3');

if (process.env.NETWORK === "besu") {
  require("dotenv").config({ path: ".env.besu" });
} else if (process.env.NETWORK === "ganache") {
  require("dotenv").config({ path: ".env.ganache" });
} else if (process.env.NETWORK === "uat-besu") {
  require("dotenv").config({ path: ".env.uat.besu" });
} else if (process.env.NETWORK === "prod-besu") {
  require("dotenv").config({ path: ".env.prod.besu" });
}

const web3 = new Web3(process.env.BLOCKCHAIN_ENDPOINT);

const getNonce = async (address) => {
  const nonce = await web3.eth.getTransactionCount(address);
  console.log(`getNonce: ${nonce} (address: ${address})`);
}

module.exports = {
  getNonce
}