const HDWalletProvider = require("@truffle/hdwallet-provider");
const fs = require("fs");

let privateKey;
try {
  privateKey = fs.readFileSync(".secret").toString().trim();
} catch (err) {}

module.exports = {
  // contracts_directory: "../contracts",
  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545, // Ganache default port
      network_id: "*", // Any network (default: none)
      // do not specify provider for Ganache
    },
    besu: {
      host: "127.0.0.1",
      port: 4545,
      network_id: 2018,
      gas: 1000000,
      gasPrice: 1000000000000,
      provider: () => new HDWalletProvider(privateKey, `http://127.0.0.1:4545`),
    },
  },

  compilers: {
    solc: {
      version: "^0.8.2",
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
