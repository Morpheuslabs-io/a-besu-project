const RewardToken = artifacts.require("RewardToken");
const MicroPayment = artifacts.require("MicroPayment");
const NameRegistryService = artifacts.require("NameRegistryService");

const MICROPAYMENT_LABEL = "MicroPayment_V1";
const REWARDTOKEN_LABEL = "RewardToken_V1";

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

    //deploy NameRegistryService
    let NameRegistryServiceContract = await deployer.deploy(
      NameRegistryService
    );

    // Register MicroPayment
    let tx = await NameRegistryServiceContract.register(
      MICROPAYMENT_LABEL,
      MicroPaymentContract.address
    );

    // console.log("Register MicroPayment Tx:", tx.tx);

    // Register RewardToken
    tx = await NameRegistryServiceContract.register(
      REWARDTOKEN_LABEL,
      RewardTokenContract.address
    );

    // console.log("Register RewardToken Tx:", tx.tx);
  });
};
