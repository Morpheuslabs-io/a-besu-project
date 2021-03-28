const HDWalletProvider = require("@truffle/hdwallet-provider");
const fs = require("fs");

let privateKey;
try {
  privateKey = fs.readFileSync(".secret").toString().trim();
} catch (err) {}

module.exports = {
  contracts_directory: "../contracts",
  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545, // Ganache default port
      network_id: "*", // Any network (default: none)
      provider: () => new HDWalletProvider(privateKey, "http://127.0.0.1:8545"),
    },
    besu: {
      host: "127.0.0.1",
      port: 4545,
      network_id: 2018,
      provider: () =>
        new HDWalletProvider(
          privateKey,
          `https://ropsten.infura.io/v3/2a1a54c3aa374385ae4531da66fdf150`
        ),
    },
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
