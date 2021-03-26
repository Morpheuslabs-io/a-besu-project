const networks = require('./networks')

module.exports = {
  networks,
  contracts_directory: "../contracts",
  compilers: {
    solc: {
      version: "^0.8.2",
      settings: {
        optimizer: {
          enabled: true,
          runs: 200
        }
      }
    }
  }
}
