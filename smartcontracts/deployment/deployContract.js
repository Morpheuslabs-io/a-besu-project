const Web3 = require('web3');
const fs = require('fs');
const solc = require('solc');
const keythereum = require("keythereum");

if (process.env.NETWORK === 'testnet') {
  require('dotenv').config({ path: '.env.testnet' })
} else {
	console.error('NETWORK ENV is not defined');
	process.exit(1)
}

const {
  OWNER_ADDRESS,
  KEY_FILE_PATH,
  OWNER_PASSPHRASE,
  CHAIN_ID,
  BLOCKCHAIN_ENDPOINT
} = process.env

if (
  !OWNER_ADDRESS ||
  !KEY_FILE_PATH ||
  !OWNER_PASSPHRASE ||
  !CHAIN_ID ||
	!BLOCKCHAIN_ENDPOINT
) {
  console.error('Missing ENV variable')
  process.exit(1)
}

function getPrivKey(addr, keyFilePath, passphrase) {
  let keyObject = keythereum.importFromFile(addr, keyFilePath);
  let privateKey = keythereum.recover(passphrase, keyObject);
  let privKeyStrHex = new Buffer(privateKey.toString("hex"), "hex");
  // privateKey.toString("hex")
	return privateKey.toString("hex");
}

// const privateKey = '8f2a55949038a9610f50fb23b5883af3b4ecb3c3bb792cbcefbd1542c692be63' //getPrivKey(OWNER_ADDRESS, KEY_FILE_PATH, OWNER_PASSPHRASE)
const privateKey = getPrivKey(OWNER_ADDRESS, KEY_FILE_PATH, OWNER_PASSPHRASE)
// const privateKey = '7bc861ae7cec9c7c30d7cc6b3c3b1abbef9893215853193e782760e33cd7cbd2'
console.log('privateKey:', privateKey);

let web3 = new Web3(new Web3.providers.HttpProvider(BLOCKCHAIN_ENDPOINT));
const account = web3.eth.accounts.privateKeyToAccount(privateKey);
const sender = account.address;
console.log('sender:', sender);
let chainId = CHAIN_ID;

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
    let sourceFile = `../contracts/micropayment/${contractName}.sol`;
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
		
		console.log(contractName, JSON.stringify(abi));

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
			gas : 500000,
			gasPrice: 1,
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
