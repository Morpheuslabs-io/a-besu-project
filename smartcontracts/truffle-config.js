const HDWalletProvider = require("@truffle/hdwallet-provider");

const fs = require("fs");
const path = require("path");

module.exports = {
  contracts_directory: "contracts",
  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*",
    },
    besu: {
      provider: () => {
        const privatekey = fs
          .readFileSync(`${path.dirname(__filename)}/.secret.besu`)
          .toString();
        return new HDWalletProvider(privatekey, `http://127.0.0.1:4545`);
      },
      network_id: 2018,
      gas: 5500000,
      confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: true,
    },
  },

  mocha: {
    // timeout: 100000
  },

  compilers: {
    solc: {
      version: "./soljson.js",
      parser: "solcjs",
      settings: {
        optimizer: {
          enabled: true,
          runs: 200,
        },
      },
    },
  },
};
