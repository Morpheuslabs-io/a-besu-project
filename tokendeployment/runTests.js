const Web3 = require('web3');
const fs = require('fs');
const solc = require('solc');

/*
* connect to ethereum node
*/ 
const ethereumUri = 'http://localhost:8545';

//config private key for deployment account
const privateKey = "0x5ec0d742c8aa2d85749289b8f535cec7a7e23955af66a03f06419d065d4afb3d";

let web3 = new Web3(new Web3.providers.HttpProvider(ethereumUri));
const account = web3.eth.accounts.privateKeyToAccount(privateKey);
const sender = account.address;
let chainId = 5777;

async function sendTx(txObject) {
    const txTo = txObject._parent.options.address;
	let gasPrice = 100000000;
	
    let gasLimit;
    try {
        gasLimit = await txObject.estimateGas();
        console.log("Estimated gas", gasLimit);
    }
    catch (e) {
        gasLimit = 5000 * 1000;
    }

    if(txTo !== null) {
        gasLimit = 5000 * 1000;
    }

    const txData = txObject.encodeABI();
    const txFrom = account.address;
    const txKey = account.privateKey;
	
	let nonce = await web3.eth.getTransactionCount(txFrom);

    gasLimit += 50000;
    const tx = {
        from : txFrom,
        nonce : nonce,
        data : txData,
        gas : gasLimit,
        chainId,
        gasPrice
    };
	
    const signedTx = await web3.eth.accounts.signTransaction(tx, txKey);
    // don't wait for confirmation
    //signedTxs.push(signedTx.rawTransaction);
	
	//console.log(signedTx);
	
    let txHash = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

	return txHash;
}

async function deployContract(contractName, ctorArgs) {
    let sourceFile = `../smartcontracts/${contractName}.sol`;
    console.log(`Start compiling contract ${contractName}, source file -->`, sourceFile);
    let source;
	
	let compilerOption = {
	  language: 'Solidity',
	  settings: {
		outputSelection: {
		  '*': {
			'*': ['*']
		  }
		}
	  }
	};
	
    try {
        source = fs.readFileSync(sourceFile, 'utf8');
    } catch (err) {
        console.log("File not found", sourceFile);
        return;
    }
	
	try {
		compilerOption = {...compilerOption, sources: {[contractName]:{content: source}}};
		//console.log(compilerOption);
	   
		let compiledContract = JSON.parse(solc.compile(JSON.stringify(compilerOption)));
		let contractAddress;

		compiledContract = compiledContract.contracts[contractName][contractName];
		//console.log(contract);
		
		   
		let bytecode = compiledContract.evm.bytecode.object
		let abi = compiledContract.abi;
		
		console.log('Compiled done.')		
		
		let contract = new web3.eth.Contract(abi);
		const deploy = contract.deploy({data: bytecode, arguments: ctorArgs});

		console.log(`Deploying contract ${contractName}`);
		let tx = await sendTx(deploy);

		contract = new web3.eth.Contract(abi,tx.contractAddress);
		// contract.options.address = tx.contractAddress;
		console.log("Deployed contract", contractName, " contract address -->", tx.contractAddress);
		console.log(`TxHash -> ${tx.transactionHash}`);
		// console.log("ABI ", JSON.stringify(abi).replace(/\s+/g, ''));

		return contract;
	} catch(e) {
		console.log("ERROR", e);
	}
}

async function transferToken(contract, to, amount, ref) {
	let nonce = await web3.eth.getTransactionCount(sender);

	let payload = contract.methods.transfer(to, amount, web3.utils.asciiToHex(ref?ref:""), to).encodeABI();

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


const BigNumber = web3.utils.BN;
const symbolName = "RewardToken";
const decimal = 0;
const symbol = "RDT";
const totalSupply = new BigNumber(2*10**9*10**decimal); // 2 billions token, decimal 0;

function getRandomInt(max) {
	return Math.floor(Math.random() * Math.floor(max));
  }

async function main() {
	try {
		const RewardToken = await deployContract('RewardToken', [totalSupply,symbolName, symbol, decimal]);
		const MicroPayment = await deployContract('MicroPayment', [RewardToken._address]);

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

		for(let i = 0; i < 50; i++) {
			let { address } = await web3.eth.accounts.create();
			await transferToken(MicroPayment, address, getRandomInt(2000), `REF${i}`);

			// checking balance of user
			let userBalance = await MicroPayment.methods.balanceOf(address).call();
			console.log(`New Wallet Balance ${userBalance.balance}, UnsettleBalance ${userBalance.unsettledBalance}`);
		}

		// checking transaction record
		let {senders,receivers,amounts, txRefs,txTypes} = await MicroPayment.methods.getTransactionRecords(sender, 0).call();

		let results = senders.map((sender,idx) => {
			return {
				sender, 
				receiver: receivers[idx],
				amount: amounts[idx],
				txRef: txRefs[idx],
				txType: web3.utils.hexToAscii(txTypes[idx]).replace(/\x00/g,'')
			}});

		console.log("History",results);
		
	} catch (ex) {
		console.log(ex);
	}
}

main()
