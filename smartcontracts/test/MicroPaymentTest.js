const MicroPayment = artifacts.require("MicroPayment");
const RewardToken = artifacts.require("RewardToken");
const NameRegistryService = artifacts.require("NameRegistryService");

const MICROPAYMENT_LABEL = "MicroPayment_V1";
const REWARDTOKEN_LABEL = "RewardToken_V1";

contract("MicroPayment", (acc) => {
  const sender = acc[0];
  let microPayment;
  let rewardToken;
  let nameRegistryService;

  const symbolName = "RewardToken";
  const decimal = 0;
  const symbol = "RDT";
  const totalSupply = web3.utils.toBN(2 * 10 ** 9 * 10 ** decimal); // 2 billions token, decimal 0;

  beforeEach("setup instances", async () => {
    rewardToken = await RewardToken.new(
      totalSupply,
      symbolName,
      symbol,
      decimal
    );
    console.log(`RewardToken: ${rewardToken.address}`);

    microPayment = await MicroPayment.new(rewardToken.address);
    console.log(`MicroPayment: ${microPayment.address}`);

    nameRegistryService = await NameRegistryService.new();
    console.log(`NameRegistryService: ${nameRegistryService.address}`);

    let tx = await nameRegistryService.register(
      REWARDTOKEN_LABEL,
      rewardToken.address
    );
    console.log("Register RewardToken tx: ", tx.tx);

    tx = await nameRegistryService.register(
      MICROPAYMENT_LABEL,
      microPayment.address
    );
    console.log("Register MicroPayment tx: ", tx.tx);

    tx = await rewardToken.setAuthorized(microPayment.address);
    console.log("RewardToken.setAuthorized tx: ", tx.tx);
  });

  describe("Transfer token", async () => {
    it("Transfer token to multiple addresses", async () => {
      let testSenders = [];
      let testReceivers = [];
      let testAmounts = [];
      let testTxRefs = [];
      let testTxTypes = [];
      const testLength = 50;

      for (let i = 0; i < testLength; i++) {
        let { address } = await web3.eth.accounts.create();
        let amount = getRandomInt(2000);
        let txType = `REF${i}`;
        let txRef = address;
        let tx = await microPayment.transfer(
          address,
          amount,
          web3.utils.toHex(txType),
          txRef,
          {
            from: sender,
          }
        );

        console.log(`MicroPayment.transfer tx: ${tx.tx}`);

        // Check user balance
        let { balance, unsettledBalance } = await microPayment.balanceOf(
          address
        );
        assert.equal(amount, balance);

        testSenders.push(sender);
        testReceivers.push(address);
        testAmounts.push(amount);
        testTxRefs.push(txRef);
        testTxTypes.push(txType);
      }

      assert.equal(testReceivers.length, testLength);

      // Check transaction record
      const pageSize = await microPayment.pageSize();
      console.log(`pageSize: ${pageSize}`);
      const pageNum = 0;

      let {
        senders,
        receivers,
        amounts,
        txRefs,
        txTypes,
      } = await microPayment.getTransactionRecords(sender, pageNum);

      for (let i = 0; i < pageSize; i++) {
        assert.equal(senders[i], testSenders[i]);
        assert.equal(receivers[i], testReceivers[i]);
        assert.equal(amounts[i], testAmounts[i]);
        assert.equal(txRefs[i], testTxRefs[i]);
        assert.equal(web3.utils.hexToUtf8(txTypes[i]), testTxTypes[i]);

        // console.log(senders[i]);
        // console.log(receivers[i]);
        // console.log(web3.utils.fromWei(amounts[i]));
        // console.log(txRefs[i]);
        // console.log(web3.utils.hexToUtf8(txTypes[i]));
      }
    });
  });

  getRandomInt = (max) => {
    return Math.floor(Math.random() * Math.floor(max));
  };
});
