const Web3 = require('web3');
const fs = require('fs');
const solc = require('solc');

/*
* connect to ethereum node
*/ 
const ethereumUri = 'http://localhost:8545';

//config private key for deployment account
const privateKey = "0xf89711ca006d35e645098c734a954ed827620bb0fa830736bd8b6014d80af25c";

let web3 = new Web3(new Web3.providers.HttpProvider(ethereumUri));
const account = web3.eth.accounts.privateKeyToAccount(privateKey);
const sender = account.address;
let chainId = 5777;
const abi = [{"inputs":[{"internalType":"address","name":"_rewardToken","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"sender","type":"address"},{"indexed":false,"internalType":"address","name":"receiver","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"},{"indexed":false,"internalType":"bytes32","name":"transactionReference","type":"bytes32"}],"name":"Transfer","type":"event"},{"inputs":[{"internalType":"address","name":"who","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"balance","type":"uint256"},{"internalType":"uint256","name":"unsettledBalance","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"who","type":"address"},{"internalType":"uint256","name":"_page","type":"uint256"}],"name":"getTransactionRecords","outputs":[{"internalType":"address[]","name":"senders","type":"address[]"},{"internalType":"address[]","name":"receivers","type":"address[]"},{"internalType":"uint256[]","name":"amounts","type":"uint256[]"},{"internalType":"bytes32[]","name":"txRefs","type":"bytes32[]"},{"internalType":"bytes32[]","name":"txTypes","type":"bytes32[]"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"pageSize","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"uint256","name":"","type":"uint256"}],"name":"transactionRecords","outputs":[{"internalType":"address","name":"sender","type":"address"},{"internalType":"address","name":"receiver","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"bytes32","name":"transactionReference","type":"bytes32"},{"internalType":"bytes32","name":"transactionType","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"receiver","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"bytes32","name":"transactionType","type":"bytes32"},{"internalType":"bytes32","name":"transactionReference","type":"bytes32"}],"name":"transfer","outputs":[],"stateMutability":"nonpayable","type":"function"}];
const tokenABI = [{"inputs":[{"internalType":"uint256","name":"_initialSupply","type":"uint256"},{"internalType":"string","name":"_name","type":"string"},{"internalType":"string","name":"_symbol","type":"string"},{"internalType":"uint256","name":"_decimals","type":"uint256"}],"stateMutability":"nonpayable","type":"constructor","signature":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"_user","type":"address"}],"name":"AddedBlackList","type":"event","signature":"0x42e160154868087d6bfdc0ca23d96a1c1cfa32f1b72ba9ba27b69b98a0d819dc"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Approval","type":"event","signature":"0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"sender","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Burn","type":"event","signature":"0xcc16f5dbb4873280815c1ee09dbd06736cffcc184412cf7a71a0fdb75d397ca5"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"_blackListedUser","type":"address"},{"indexed":false,"internalType":"uint256","name":"_balance","type":"uint256"}],"name":"DestroyedBlackFunds","type":"event","signature":"0x61e6e66b0d6339b2980aecc6ccc0039736791f0ccde9ed512e789a7fbdd698c6"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Issue","type":"event","signature":"0xcb8241adb0c3fdb35b70c24ce35c5eb0c17af7431c99f827d44a445ca624176a"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"receiver","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Mint","type":"event","signature":"0x0f6798a560793a54c3bcfe86a93cde1e73087d944c0ea20544137d4121396885"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"feeBasisPoints","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"maxFee","type":"uint256"}],"name":"Params","type":"event","signature":"0xb044a1e409eac5c48e5af22d4af52670dd1a99059537a78b31b48c6500a6354e"},{"anonymous":false,"inputs":[],"name":"Pause","type":"event","signature":"0x6985a02210a168e66602d3235cb6db0e70f92b3ba4d376a33c0f3d9434bff625"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Redeem","type":"event","signature":"0x702d5967f45f6513a38ffc42d6ba9bf230bd40e8f53b16363c7eb4fd2deb9a44"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"_user","type":"address"}],"name":"RemovedBlackList","type":"event","signature":"0xd7e9ec6e6ecd65492dce6bf513cd6867560d49544421d0783ddf06e76c24470c"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event","signature":"0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"},{"anonymous":false,"inputs":[],"name":"Unpause","type":"event","signature":"0x7805862f689e2f13df9f062ff482ad3ad112aca9e0847911ed832e158c525b33"},{"inputs":[],"name":"MAX_UINT","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true,"signature":"0xe5b5019a"},{"inputs":[],"name":"_totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true,"signature":"0x3eaaf86b"},{"inputs":[{"internalType":"address","name":"_evilUser","type":"address"}],"name":"addBlackList","outputs":[],"stateMutability":"nonpayable","type":"function","signature":"0x0ecb93c0"},{"inputs":[],"name":"admin","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function","constant":true,"signature":"0xf851a440"},{"inputs":[{"internalType":"address","name":"_owner","type":"address"},{"internalType":"address","name":"_spender","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"remaining","type":"uint256"}],"stateMutability":"view","type":"function","constant":true,"signature":"0xdd62ed3e"},{"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"address","name":"","type":"address"}],"name":"allowed","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true,"signature":"0x5c658165"},{"inputs":[{"internalType":"address","name":"_spender","type":"address"},{"internalType":"uint256","name":"_value","type":"uint256"}],"name":"approve","outputs":[],"stateMutability":"nonpayable","type":"function","signature":"0x095ea7b3"},{"inputs":[],"name":"authorized","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function","constant":true,"signature":"0x456cb7c6"},{"inputs":[{"internalType":"address","name":"who","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true,"signature":"0x70a08231"},{"inputs":[{"internalType":"address","name":"_owner","type":"address"}],"name":"balanceUnsettledOf","outputs":[{"internalType":"uint256","name":"balance","type":"uint256"},{"internalType":"uint256","name":"unsettledBalance","type":"uint256"}],"stateMutability":"view","type":"function","constant":true,"signature":"0x30143732"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"balances","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true,"signature":"0x27e235e3"},{"inputs":[],"name":"basisPointsRate","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true,"signature":"0xdd644f72"},{"inputs":[{"internalType":"address","name":"sender","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"burn","outputs":[],"stateMutability":"nonpayable","type":"function","signature":"0x9dc29fac"},{"inputs":[{"internalType":"address","name":"newAdmin","type":"address"}],"name":"changeAdmin","outputs":[],"stateMutability":"nonpayable","type":"function","signature":"0x8f283970"},{"inputs":[],"name":"decimals","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true,"signature":"0x313ce567"},{"inputs":[{"internalType":"address","name":"_maker","type":"address"}],"name":"getBlackListStatus","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function","constant":true,"signature":"0x59bf1abe"},{"inputs":[],"name":"getOwner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function","constant":true,"signature":"0x893d20e8"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"isBlackListed","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function","constant":true,"signature":"0xe47d6060"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"issue","outputs":[],"stateMutability":"nonpayable","type":"function","signature":"0xcc872b66"},{"inputs":[],"name":"maximumFee","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true,"signature":"0x35390714"},{"inputs":[{"internalType":"address","name":"receiver","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"mint","outputs":[],"stateMutability":"nonpayable","type":"function","signature":"0x40c10f19"},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function","constant":true,"signature":"0x06fdde03"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function","constant":true,"signature":"0x8da5cb5b"},{"inputs":[],"name":"pause","outputs":[],"stateMutability":"nonpayable","type":"function","signature":"0x8456cb59"},{"inputs":[],"name":"paused","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function","constant":true,"signature":"0x5c975abb"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"redeem","outputs":[],"stateMutability":"nonpayable","type":"function","signature":"0xdb006a75"},{"inputs":[{"internalType":"address","name":"_clearedUser","type":"address"}],"name":"removeBlackList","outputs":[],"stateMutability":"nonpayable","type":"function","signature":"0xe4997dc5"},{"inputs":[{"internalType":"address","name":"_authorized","type":"address"}],"name":"setAuthorized","outputs":[],"stateMutability":"nonpayable","type":"function","signature":"0x14fc2812"},{"inputs":[{"internalType":"uint256","name":"newBasisPoints","type":"uint256"},{"internalType":"uint256","name":"newMaxFee","type":"uint256"}],"name":"setParams","outputs":[],"stateMutability":"nonpayable","type":"function","signature":"0xc0324c77"},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function","constant":true,"signature":"0x95d89b41"},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true,"signature":"0x18160ddd"},{"inputs":[{"internalType":"address","name":"_to","type":"address"},{"internalType":"uint256","name":"_value","type":"uint256"}],"name":"transfer","outputs":[],"stateMutability":"nonpayable","type":"function","signature":"0xa9059cbb"},{"inputs":[{"internalType":"address","name":"_from","type":"address"},{"internalType":"address","name":"_to","type":"address"},{"internalType":"uint256","name":"_value","type":"uint256"}],"name":"transferFrom","outputs":[],"stateMutability":"nonpayable","type":"function","signature":"0x23b872dd"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function","signature":"0xf2fde38b"},{"inputs":[{"internalType":"address","name":"_from","type":"address"},{"internalType":"address","name":"_to","type":"address"},{"internalType":"uint256","name":"_value","type":"uint256"}],"name":"transferTo","outputs":[],"stateMutability":"nonpayable","type":"function","signature":"0xa5f2a152"},{"inputs":[],"name":"unpause","outputs":[],"stateMutability":"nonpayable","type":"function","signature":"0x3f4ba83a"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"unsettledBalances","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true,"signature":"0x14ba374f"}];

const tokenContractAddress = "0x8b20f670eE312c0834821bB5b4Ab4a42DE0A60D7";
const micropaymentContractAddress = "0x198982C856D7fFD428E2cF8f1770a5Ac9b21B215";

async function transferToken(contract, to, amount, type, ref) {
	let nonce = await web3.eth.getTransactionCount(sender);

	let payload = contract.methods.transfer(to, amount, web3.utils.asciiToHex(type?type:""), web3.utils.asciiToHex(ref?ref:"")).encodeABI();

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
	console.log(`New payment is done -> txHash ${txHash.transactionHash}`);
}

function getRandomInt(max) {
	return Math.floor(Math.random() * Math.floor(max));
  }

async function main() {
	try {

		const RewardToken = new web3.eth.Contract(tokenABI, tokenContractAddress);
		const MicroPayment = new web3.eth.Contract(abi, micropaymentContractAddress);

		// set admin
		let payload = RewardToken.methods.setAuthorized(MicroPayment._address).encodeABI();
		let nonce = await web3.eth.getTransactionCount(sender);

		let tx = {
			from : sender,
			to: RewardToken._address,
			nonce : nonce,
			data : payload,
			gas : 2000000,
			gasPrice: 100,
			chainId
		};
	
		let signedTx = await web3.eth.accounts.signTransaction(tx, privateKey);
		let txHash = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
		console.log(`Set admin txHash ${txHash.transactionHash}`);

		// checking balance of user
		let { balance, unsettledBalance } = await MicroPayment.methods.balanceOf(sender).call();
		console.log(`Balance of owner ${balance}, UnsettleBalance ${unsettledBalance}`);

		// sending token
		// transfer(address receiver, uint256 amount, address transactionReference)
		let txNumber = 50;

		for(let i = 0; i < txNumber; i++) {
			let { address } = await web3.eth.accounts.create();
			await transferToken(MicroPayment, address, getRandomInt(2000), "TRANSFER", `REF${i}`);

			// checking balance of user
			let userBalance = await MicroPayment.methods.balanceOf(address).call();
			console.log(`New Wallet Balance ${userBalance.balance}, UnsettleBalance ${userBalance.unsettledBalance}`);
		}

		// checking transaction record
		let {senders,receivers,amounts, txRefs,txTypes} = await MicroPayment.methods.getTransactionRecords(sender, 2).call();

		let results = senders.map((sender,idx) => {
			return {
				sender, 
				receiver: receivers[idx],
				amount: amounts[idx],
				txRef: web3.utils.hexToAscii(txRefs[idx]).replace(/\x00/g,''),
				txType: web3.utils.hexToAscii(txTypes[idx]).replace(/\x00/g,'')
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
		console.log(result);

	} catch (ex) {
		console.log(ex);
	}
}

main()
