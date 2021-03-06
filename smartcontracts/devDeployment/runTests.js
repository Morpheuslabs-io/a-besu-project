const Web3 = require('web3');
const fs = require('fs');
const solc = require('solc');
const { compileContract } = require("./compiler");

/*
* connect to ethereum node
*/ 
const ethereumUri = 'http://localhost:8545';
const sourceFolder = "../contracts/micropayment";

//config private key for deployment account
const privateKey = "0x254a0d2cc96c29690b1a0cbf1ea08f089dbd301b6f11c1274a46eedcdb5680b3";

let web3 = new Web3(new Web3.providers.HttpProvider(ethereumUri));
const account = web3.eth.accounts.privateKeyToAccount(privateKey);
const sender = account.address;
let chainId = 2018;

const tokenContractAddress = "0xE113518Dd8be62C0c622f34B5e8381ab120b09E4";
const micropaymentContractAddress = "0x6fdaDf5C28d31D4969B6887153C14d5360d22708";

async function transferToken(contract, to, amount, type, ref) {
	let nonce = await web3.eth.getTransactionCount(sender);

	let payload = contract.methods.transfer(to, amount, web3.utils.asciiToHex(type?type:""), web3.utils.asciiToHex(ref?ref:"")).encodeABI();

	let tx = {
		from : sender,
		to: contract._address,
		nonce : nonce,
		data : payload,
		gas : 2000000,
		// gasPrice: 10000000,		
		gasPrice: 0,
		chainId
	};

	let signedTx = await web3.eth.accounts.signTransaction(tx, privateKey);
	let txHash = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
	console.log(`New payment is done -> txHash ${txHash.transactionHash}`);
}

async function sendToken(numberTx, contract) {
	let nonce = await web3.eth.getTransactionCount(sender);

	for(let i = 0; i < numberTx; i++) {
		let { address } = await web3.eth.accounts.create();

		let payload = contract.methods.transfer(address, getRandomInt(1, 2000), web3.utils.asciiToHex("TRANSFER"), web3.utils.asciiToHex(`REF${i}`)).encodeABI();

		let tx = {
			from : sender,
			to: contract._address,
			nonce,
			data : payload,
			gas : 2000000,
			// gasPrice: 10000000,
			gasPrice: 0,
			chainId
		};

		let signedTx = await web3.eth.accounts.signTransaction(tx, privateKey);
		web3.eth.sendSignedTransaction(signedTx.rawTransaction);
		console.log(`Sent new tx ${signedTx.transactionHash}`);
		
		nonce++;
	}
}

async function mint(contract, receiver, amount) {
	let nonce = await web3.eth.getTransactionCount(sender);

	let payload = contract.methods.mint(receiver, amount).encodeABI();

	let tx = {
		from : sender,
		to: contract._address,
		nonce : nonce,
		data : payload,
		gas : 2000000,
		gasPrice: 10000000,
		chainId
	};

	let signedTx = await web3.eth.accounts.signTransaction(tx, privateKey);
	let txHash = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
	console.log(`Mint new token is done -> txHash ${txHash.transactionHash}`);
}

async function burn(contract, target, amount) {
	let nonce = await web3.eth.getTransactionCount(sender);

	let payload = contract.methods.mint(target, amount).encodeABI();

	let tx = {
		from : sender,
		to: contract._address,
		nonce : nonce,
		data : payload,
		gas : 2000000,
		gasPrice: 10000000,
		chainId
	};

	let signedTx = await web3.eth.accounts.signTransaction(tx, privateKey);
	let txHash = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
	console.log(`Burn token is done -> txHash ${txHash.transactionHash}`);
}

function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1) + min);
  }

async function main() {
	try {
		
		let rewardToken = await compileContract(`${sourceFolder}/RewardToken.sol`,"RewardToken", []);
		let microPayment = await compileContract(`${sourceFolder}/MicroPayment.sol`,"MicroPayment", []);

		const RewardToken = new web3.eth.Contract(rewardToken.abi, tokenContractAddress);
		const MicroPayment = new web3.eth.Contract(microPayment.abi, micropaymentContractAddress);

		// set admin
		let payload = RewardToken.methods.setAuthorized(MicroPayment._address).encodeABI();
		let nonce = await web3.eth.getTransactionCount(sender);

		let tx = {
			from : sender,
			to: RewardToken._address,
			nonce : nonce,
			data : payload,
			gas : 2000000,
			gasPrice: 0,
			chainId
		};
	
		let signedTx = await web3.eth.accounts.signTransaction(tx, privateKey);
		let txHash = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
		console.log(`Set admin txHash ${txHash.transactionHash}`);

		let { address } = await web3.eth.accounts.create();
		let amount = getRandomInt(0,2000);
		await mint(MicroPayment, address, amount);
		await burn(MicroPayment, address, amount);

		// checking balance of user
		let { balance, unsettledBalance } = await MicroPayment.methods.balanceOf(sender).call();
		console.log(`Balance of owner ${balance}, UnsettleBalance ${unsettledBalance}`);

		// sending token
		// transfer(address receiver, uint256 amount, address transactionReference)
		let txNumber = 2;

		for(let i = 0; i < txNumber; i++) {
			let { address } = await web3.eth.accounts.create();
			await transferToken(MicroPayment, address, getRandomInt(1, 2000), "TRANSFER", `REF${i}`);

			// checking balance of user
			let userBalance = await MicroPayment.methods.balanceOf(address).call();
			console.log(`New Wallet Balance ${userBalance.balance}, UnsettleBalance ${userBalance.unsettledBalance}`);
		}

		// checking transaction record
		let { senders, receivers, amounts, txRefs, txTypes , txTimes } = await MicroPayment.methods.getTransactionRecords(sender, 1).call();

		let results = senders.map((sender,idx) => {
			return {
				sender, 
				receiver: receivers[idx],
				amount: amounts[idx],
				txRef: web3.utils.hexToAscii(txRefs[idx]).replace(/\x00/g,''),
				txType: web3.utils.hexToAscii(txTypes[idx]).replace(/\x00/g,''),
				time: txTimes[idx],
			}});

		console.log("History",results);

		// get event logs

		let blockNumber = await web3.eth.getBlockNumber();

		let fromBlock = blockNumber - 3;
		console.log(blockNumber, fromBlock);

		console.log('Display all transfer event info');
		let result = await RewardToken.getPastEvents('Transfer',{ filter:{}, fromBlock: fromBlock, toBlock: 'latest'});

		//filter by sender
		result = await RewardToken.getPastEvents('Transfer',{filter: {'sender': sender}, fromBlock: fromBlock, toBlock: 'latest'});
		console.log("filter by sender", result);


		// just send without wait for confirmation
		sendToken(89, MicroPayment);

	} catch (ex) {
		console.log(ex);
	}
}

main()
