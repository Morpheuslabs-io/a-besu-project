const Web3 = require('web3');
const fs = require('fs');
const solc = require('solc');

/*
* connect to ethereum node
*/ 
const ethereumUri = 'http://localhost:8545';

//config private key for deployment account
const privateKey = "0xdbd983e30dae90d012d27c0202b1e2f6cd83425aaf4adba829d7991fe5c1cd75";

let web3 = new Web3(new Web3.providers.HttpProvider(ethereumUri));
const account = web3.eth.accounts.privateKeyToAccount(privateKey);
const sender = account.address;
let chainId = 5777;

const organisationABI = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[],"name":"admin","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"merchants","outputs":[{"internalType":"contractMerchant","name":"","type":"address"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[],"name":"namingService","outputs":[{"internalType":"contractNameRegistryService","name":"","type":"address"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[{"internalType":"address","name":"_merchantOwner","type":"address"},{"internalType":"string","name":"_merchantName","type":"string"}],"name":"addMerchant","outputs":[{"internalType":"address","name":"merchantAddress","type":"address"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"getMerchantSize","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[{"internalType":"address","name":"_merchantOwner","type":"address"}],"name":"getMerchantByOwner","outputs":[{"internalType":"address","name":"merchantContractAddress","type":"address"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[{"internalType":"string","name":"_name","type":"string"}],"name":"getMerchantContractByName","outputs":[{"internalType":"address","name":"merchantContractAddress","type":"address"}],"stateMutability":"view","type":"function","constant":true}];

const merchantABI = [{"inputs":[{"internalType":"address","name":"_owner","type":"address"},{"internalType":"string","name":"_merchantName","type":"string"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"debtor","type":"address"},{"indexed":false,"internalType":"uint256","name":"index","type":"uint256"}],"name":"Transact","type":"event"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"debt","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"merchantName","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"merchantTransactions","outputs":[{"internalType":"contractTransaction","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32[]","name":"_skus","type":"bytes32[]"},{"internalType":"uint256[]","name":"_prices","type":"uint256[]"},{"internalType":"uint256[]","name":"_quantites","type":"uint256[]"},{"internalType":"bytes32[]","name":"_descriptions","type":"bytes32[]"},{"internalType":"bytes32","name":"_orderId","type":"bytes32"},{"internalType":"address","name":"_debtor","type":"address"},{"internalType":"bytes32","name":"_posId","type":"bytes32"},{"internalType":"uint256","name":"_totalAmount","type":"uint256"},{"internalType":"uint256","name":"_timestamp","type":"uint256"}],"name":"add","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_to","type":"address"},{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"burn","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_userAddress","type":"address"}],"name":"getUserTransactions","outputs":[{"internalType":"contractTransaction[]","name":"txs","type":"address[]"}],"stateMutability":"view","type":"function"}];
const transactionABI = [{"inputs":[{"internalType":"bytes32","name":"_posId","type":"bytes32"},{"internalType":"bytes32","name":"_orderId","type":"bytes32"},{"internalType":"address","name":"_merchant","type":"address"},{"internalType":"address","name":"_customer","type":"address"},{"internalType":"uint256","name":"_total","type":"uint256"},{"internalType":"uint256","name":"_timestamp","type":"uint256"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[],"name":"paymentReference","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"settlementApproved","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"settlementRequested","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"_sku","type":"bytes32"},{"internalType":"uint256","name":"_price","type":"uint256"},{"internalType":"uint256","name":"_quantity","type":"uint256"},{"internalType":"bytes32","name":"_description","type":"bytes32"}],"name":"add","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"numberOfItems","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getTransactionInfo","outputs":[{"internalType":"bytes32","name":"_posId","type":"bytes32"},{"internalType":"bytes32","name":"_orderId","type":"bytes32"},{"internalType":"address","name":"_merchant","type":"address"},{"internalType":"address","name":"_customer","type":"address"},{"internalType":"uint256","name":"_total","type":"uint256"},{"internalType":"uint256","name":"_timestamp","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getItems","outputs":[{"internalType":"bytes32[]","name":"skus","type":"bytes32[]"},{"internalType":"uint256[]","name":"prices","type":"uint256[]"},{"internalType":"uint256[]","name":"qtys","type":"uint256[]"},{"internalType":"bytes32[]","name":"descs","type":"bytes32[]"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"approveSettlement","outputs":[],"stateMutability":"nonpayable","type":"function"}];


const organisationContractAddress = "0xDc89E3b9E1Fa6803C18054d629fDe8e142078771";

async function getMerchantAddress(merchantName) {
	const contract = new web3.eth.Contract(organisationABI, organisationContractAddress);
	let address = await contract.methods.getMerchantContractByName(merchantName).call();

	return address;
}

async function getUserTransactions(merchantAddress, userAddress) {
	const contract = new web3.eth.Contract(merchantABI, merchantAddress);
	let result = await contract.methods.getUserTransactions(userAddress).call();

	return result;
}

async function getTransactionDetail(transactionAddress) {
	console.log('Get detail information of transaction', transactionAddress);
	const contract = new web3.eth.Contract(transactionABI, transactionAddress);
	// let itemsNo = await contract.methods.numberOfItems().call();

	let { skus, prices, qtys, descs } = await contract.methods.getItems().call();

	let { _posId, _orderId, _merchant, _customer, _total, _timestamp }  = await contract.methods.getTransactionInfo().call();

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

async function addMerchant(address, name) {
	const contract = new web3.eth.Contract(organisationABI, organisationContractAddress);
	let nonce = await web3.eth.getTransactionCount(sender);

	let payload = contract.methods.addMerchant(address, name).encodeABI();

	let tx = {
		from : sender,
		to: contract._address,
		nonce : nonce,
		data : payload,
		gas : 2000000,
		gasPrice: 10,
		chainId
	};

	let signedTx = await web3.eth.accounts.signTransaction(tx, privateKey);
	let txHash = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
	console.log(`New merchant added -> ${txHash.transactionHash}`);
}

async function addItems (merchantAddress, userAddress) {
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

	const contract = new web3.eth.Contract(merchantABI, merchantAddress);
	let nonce = await web3.eth.getTransactionCount(sender);

	// (bytes32[] memory _skus, uint256[] memory _prices, uint256[] memory _quantites, bytes32[] memory _descriptions, bytes32 _orderId,
	// 	address _debtor, bytes32 _posId, uint256 _totalAmount, uint256 _timestamp)

	let payload = contract.methods.add(skus, prices, qtys, descs, orderId, userAddress, posId, totalAmount, timestamp).encodeABI();

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
}

function getRandomInt(max) {
	return Math.floor(Math.random() * Math.floor(max));
  }

async function main() {
	try {
		// add merchant
		let merchantName = `Merchant${getRandomInt(1000)}`;
		console.log('Adding merchant', merchantName);
		await addMerchant(sender, merchantName);
		let merchantAddress = await getMerchantAddress(merchantName);
		console.log("Merchant Address", merchantAddress);

		let { address } = await web3.eth.accounts.create();
		await addItems(merchantAddress, address);
		let results = await getUserTransactions(merchantAddress, address);
		console.log("User transacitons", results);

		let order = await getTransactionDetail(results[0]);

		console.log("Added Order", order);	
	} catch (ex) {
		console.log(ex);
	}
}

main()
