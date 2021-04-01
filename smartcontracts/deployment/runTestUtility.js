const Web3 = require('web3');
const fs = require('fs');
const solc = require('solc');

const { compileContract } = require("./compiler");

/*
* connect to ethereum node
*/ 
const ethereumUri = 'http://localhost:8545';
const sourceFolder = "../contracts/utility";

//config private key for deployment account
const privateKey = "0xdba3922888a550d7ef150e682196f061046c0fdf0813235bb2a874f0226b09fb";

let web3 = new Web3(new Web3.providers.HttpProvider(ethereumUri));
const account = web3.eth.accounts.privateKeyToAccount(privateKey);
const sender = account.address;
let chainId = 5777;

const programContractAddress = "0xFcBF4a95B7dDba61A1c7e026D863576f71b9c6E3";

async function getMerchantAddress(programContract, merchantName) {
	let address = await programContract.methods.getMerchantByName(merchantName).call();

	return address;
}

async function getUserTransactions(merchantContract, userAddress) {
	let result = await merchantContract.methods.getUserTransactions(userAddress).call();

	return result;
}

async function getPurchasedUsers(merchantContract) {
	// const contract = new web3.eth.Contract(merchantABI, merchantAddress);
	let result = await merchantContract.methods.getPurchasedUsers().call();

	return result;
}

async function getUserTotalSpent(merchantContract, userAddress) {
	// const contract = new web3.eth.Contract(merchantABI, merchantAddress);
	let result = await merchantContract.methods.userTotal(userAddress).call();

	return result;
}

async function getTransactionDetail(transactionContract) {
	console.log('Get detail information of transaction', transactionContract._address);

	let { skus, prices, qtys, descs } = await transactionContract.methods.getItems().call();

	let { _posId, _orderId, _merchant, _customer, _total, _timestamp }  = await transactionContract.methods.getTransactionInfo().call();

	_orderId = web3.utils.hexToAscii(_orderId).replace(/\x00/g,'');
	_posId = web3.utils.hexToAscii(_posId).replace(/\x00/g,'');

	let items = skus.map((sku,idx) => {
		return {
			sku: web3.utils.hexToAscii(sku).replace(/\x00/g,''),
			price: prices[idx],
			qty: qtys[idx],
			description: web3.utils.hexToAscii(descs[idx]).replace(/\x00/g,'')
		}});

	return { orderId: _orderId, total: _total, merchant: _merchant, customer: _customer, posId: _posId, timestamp: _timestamp, items };
}

async function addMerchant(contract, address, name) {
	// const contract = new web3.eth.Contract(programABI, programContractAddress);

	let nonce = await web3.eth.getTransactionCount(sender);

	let payload = contract.methods.addMerchant(address, name).encodeABI();

	let tx = {
		from : sender,
		to: contract._address,
		nonce : nonce,
		data : payload,
		gas : 5000000,
		gasPrice: 10,
		chainId
	};

	console.log(payload);

	let signedTx = await web3.eth.accounts.signTransaction(tx, privateKey);
	let txHash = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
	console.log(`New merchant added -> ${txHash.transactionHash}`);
}

/**
 * 
 * @param {*} contract merchant contract 
 * @param {*} userAddress 
 */
async function addItems (contract, userAddress) {
	let skus = [];
	let prices = [];
	let qtys = [];
	let descs = [];
	let orderId = web3.utils.asciiToHex(`OrderId 1`);
	
    let posId = web3.utils.asciiToHex(`PosId 1`);
	let totalAmount = 10;
	let timestamp = new Date().getTime();

	for(let i = 0; i < 10; i++) {
		skus.push(web3.utils.asciiToHex(`SKU${i}`));
		prices.push(i);
		qtys.push(i);
		descs.push(web3.utils.asciiToHex(`Desc for SKU${i}`));
	}

	// const contract = new web3.eth.Contract(merchantABI, merchantAddress);
	let nonce = await web3.eth.getTransactionCount(sender);

	// (bytes32[] memory _skus, uint256[] memory _prices, uint256[] memory _quantites, bytes32[] memory _descriptions, bytes32 _orderId,
	// 	address _debtor, bytes32 _posId, uint256 _totalAmount, uint256 _timestamp)

	let payload = contract.methods.purchase(skus, prices, qtys, descs, orderId, userAddress, posId, totalAmount, timestamp).encodeABI();

	let tx = {
		from : sender,
		to: contract._address,
		nonce : nonce,
		data : payload,
		gas : 5000000,
		gasPrice: 10,
		chainId
	};

	let signedTx = await web3.eth.accounts.signTransaction(tx, privateKey);
	let txHash = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
	console.log(`New order added -> txHash ${txHash.transactionHash}`);

	let event = await contract.getPastEvents('Transact',{ filter:{}, fromBlock: 0, toBlock: 'latest'});
	console.log("add order event", event);
}

function getRandomInt(max) {
	return Math.floor(Math.random() * Math.floor(max));
  }

async function main() {
	try {
		let programCompiled = await compileContract(`${sourceFolder}/Program.sol`,"Program", []);
		let merchantCompiled = await compileContract(`${sourceFolder}/Program.sol`,"Merchant", []);
		let transactionCompiled = await compileContract(`${sourceFolder}/Program.sol`,"Transaction", []);

		let programContract = new web3.eth.Contract(programCompiled.abi, programContractAddress);

		// add merchant
		let merchantName = `Merchant${getRandomInt(1000)}`;
		console.log('Adding merchant', merchantName);
		await addMerchant(programContract, sender, merchantName);
		let merchantAddress = await getMerchantAddress(programContract, merchantName);
		console.log("Merchant Address", merchantAddress);

		// add items
		let merchantContract = new web3.eth.Contract(merchantCompiled.abi, merchantAddress);
		let { address } = await web3.eth.accounts.create();
		await addItems(merchantContract, address);
		let results = await getUserTransactions(merchantContract, address);
		console.log("User transacitons", results);

		let transactionContract = new web3.eth.Contract(transactionCompiled.abi, results[0]);

		let order = await getTransactionDetail(transactionContract);
		console.log("Added Order", order);	

		let users = await getPurchasedUsers(merchantContract, address);
		console.log(`List purchased user for ${merchantAddress}`, users);
		users.forEach(async user => {
			let totalSpent = await getUserTotalSpent(merchantContract, user);
			console.log(`User ${user} spent ${totalSpent} for merchant ${merchantName}`);
		});

	} catch (ex) {
		console.log(ex);
	}
}

main()
