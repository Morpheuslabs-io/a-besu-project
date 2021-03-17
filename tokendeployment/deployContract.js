const Web3 = require('web3');
const fs = require('fs');
const solc = require('solc');

/*
* connect to ethereum node
*/ 
const ethereumUri = 'http://localhost:8545';

//config private key for deployment account
const privateKey = "0xd2a67f9aa8c9ef2a9a0a20b2a4a4a081a236f90366519ec6d860062b7e7ccb2a";

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

    gasLimit += 100000;
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

const BigNumber = web3.utils.BN;
const symbolName = "RewardToken";
const decimal = 0;
const symbol = "RDT";
const totalSupply = new BigNumber(2*10**9*10**decimal); // 2 billions token, decimal 0;

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
	} catch (ex) {
		console.log(ex);
	}
}

main()
