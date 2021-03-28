const Program = artifacts.require("Program");
const Merchant = artifacts.require("Merchant");
const Transaction = artifacts.require("Transaction");
const NameRegistryService = artifacts.require("NameRegistryService");

const PROGRAM_LABEL = "Program_V1";

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
    function getRandomInt(max) {
      return Math.floor(Math.random() * Math.floor(max));
    }
    async function addItems(merchantAddress, userAddress) {
      let skus = [];
      let prices = [];
      let qtys = [];
      let descs = [];
      let orderId = web3.utils.asciiToHex(`OrderId 1`);

      let posId = web3.utils.asciiToHex(`PosId 1`);
      let totalAmount = 10;
      let timestamp = new Date().getTime();

      for (let i = 0; i < 10; i++) {
        skus.push(web3.utils.asciiToHex(`SKU${i}`));
        prices.push(i);
        qtys.push(i);
        descs.push(web3.utils.asciiToHex(`Desc for SKU${i}`));
      }

      // Deploy Merchant
      // let contract = await deployer.deploy(Merchant, setter, merchantName);
      let contract = await Merchant.at(merchantAddress);

      let tx = await contract.purchase(
        skus,
        prices,
        qtys,
        descs,
        orderId,
        userAddress,
        posId,
        totalAmount,
        timestamp
      );

      console.log(`New order added -> txHash ${tx.tx}`);
    }
    async function getUserTransactions(merchantAddress, userAddress) {
      const contract = await Merchant.at(merchantAddress); //new web3.eth.Contract(merchantABI, merchantAddress);
      let result = await contract.getUserTransactions(userAddress);
      return result;
    }
    async function getTransactionDetail(transactionAddress) {
      console.log("Get detail information of transaction", transactionAddress);
      const contract = await Transaction.at(transactionAddress);
      // let itemsNo = await contract.methods.numberOfItems().call();

      let { skus, prices, qtys, descs } = await contract.getItems();

      let {
        _posId,
        _orderId,
        _merchant,
        _customer,
        _total,
        _timestamp,
      } = await contract.getTransactionInfo();

      _orderId = web3.utils.hexToAscii(_orderId).replace(/\x00/g, "");
      _posId = web3.utils.hexToAscii(_posId).replace(/\x00/g, "");

      let items = skus.map((sku, idx) => {
        return {
          sku: web3.utils.hexToAscii(sku).replace(/\x00/g, ""),
          price: web3.utils.fromWei(prices[idx]),
          qty: web3.utils.fromWei(qtys[idx]),
          description: web3.utils.hexToAscii(descs[idx]).replace(/\x00/g, ""),
        };
      });

      return {
        orderId: _orderId,
        total: _total,
        merchant: _merchant,
        customer: _customer,
        posId: _posId,
        timestamp: _timestamp,
        items,
      };
    }

    setter = accounts[0];

    // Deploy Program
    let ProgramContract = await deployer.deploy(Program);

    // Deploy NameRegistryService
    let NameRegistryServiceContract = await deployer.deploy(
      NameRegistryService
    );

    // Register Program
    let tx = await NameRegistryServiceContract.register(
      PROGRAM_LABEL,
      ProgramContract.address
    );

    console.log("Register Program Tx:", tx.tx);

    // Add Merchant
    let merchantName = `Merchant${getRandomInt(1000)}`;
    console.log("Adding merchant: ", merchantName);

    tx = await ProgramContract.addMerchant(setter, merchantName);
    console.log(`New merchant added -> ${tx.tx}`);

    // Get Merchant address
    let merchantAddress = await ProgramContract.getMerchantByName(merchantName);
    console.log("Merchant Address", merchantAddress);

    // Get user transactions
    let { address } = await web3.eth.accounts.create();
    await addItems(merchantAddress, address);
    let results = await getUserTransactions(merchantAddress, address);
    console.log("User transactions", results);

    let order = await getTransactionDetail(results[0]);
    console.log("Added Order", order);
  });
};
