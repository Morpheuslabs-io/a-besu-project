const RewardToken = artifacts.require("RewardToken");
const MicroPayment = artifacts.require("MicroPayment");

module.exports = function (deployer, network, accounts) {
  deployer.then(async () => {
    async function getNetID() {
      return new Promise(function (resolve, reject) {
        web3.providers.HttpProvider.prototype.sendAsync =
          web3.providers.HttpProvider.prototype.send;

        web3.currentProvider.sendAsync(
          {
            jsonrpc: "2.0",
            method: "net_version",
            params: [],
            id: 0,
          },
          function (err, result) {
            if (err) {
              console.error(err.message);
              reject(err);
            } else {
              resolve(result.result);
            }
          }
        );
      });
    }
    setter = accounts[0];

    //deploy RewardToken
    const symbolName = "RewardToken";
    const decimal = 0;
    const symbol = "RDT";
    const totalSupply = web3.utils.toBN(2 * 10 ** 9 * 10 ** decimal); // 2 billions token, decimal 0;

    let RewardTokenContract = await deployer.deploy(
      RewardToken,
      totalSupply,
      symbolName,
      symbol,
      decimal
    );

    //deploy MicroPayment
    let MicroPaymentContract = await deployer.deploy(
      MicroPayment,
      RewardTokenContract.address
    );
  });
};
