# Smart Contracts

Recommented tool for compile and deployment is to use Truffle, but if truffle is not available in the target env, then use deployContract.js directly to compile and deploy the smart contracts.

## Option 1 - Compile/deploy using deployContracts.js in the "deployment" folder

1. Installation

`npm i`

2. Deploy to local ganache

- Start local ganache: `npm run ganache`
- Open another Terminal or Console and run this cmd: `npm run deploy-ganache`

3. Deploy to local besu

- Start local besu: please refer to the file `besu-scripts/README.md`
- Ensure the private key specified in the file `.secret.besu` is valid and has enough funds for tx fee
- Open another Terminal or Console and run this cmd: `npm run deploy`

## Option 2 - Compile/deploy using truffle

Execute the following commands in the "smartcontract" folder,

1. Installation

`npm i`

2. Compile

`npm run build`

2. Deploy to local ganache

- Start local ganache: `npm run ganache`
- Open another Terminal or Console and run this cmd: `npm run deploy-ganache`

3. Deploy to besu

Run this cmd: `npm run deploy-besu`

## Unit-Test

### With local Ganache

At first, start local Ganache with this cmd

`npm run ganache`

Then, open another terminal/console to run the test with this cmd

`npm run test-ganache`

### With local Besu

At first, start local Besu network. Please refer to the file `besu-scripts/README.md`

Then, open another terminal/console to run the test with this cmd

`npm run test-besu`

---

# Deployment via `orchard` web service

## On web-server

On the `web-server`, `orchard` has been deployed and running in background.
It is ready for interaction with `besu`deployed on 4 EC2 nodes.

Connect to `web-server` and run the below cmd for `deploymentNew`:

`npm run deploy-besu-new`

## Install and run on localhost for interacting with local Ganache

### `orchard`

- Installation: `npm i`
- Start: `npm run orchard-ganache`

We should see the below log after start

```
NETWORK: ganache
Deployment to: http://localhost:8545
Server is listening at port 30303

```

### `deployment`

cd into the folder `deployment`

- Installation: `npm i`
- Start local Ganache: `npm run ganache`
- Open another Terminal tab to run the deployment: `npm run deploy-ganache-new`

## Deployment output log

### On `web-server`

```
> deployment@1.0.0 deploy-besu-new /home/ubuntu/a-besu-project/smartcontracts/deployment
> NETWORK=besu node deployContractNew.js

Start compiling contract RewardToken, source file --> ../contracts/micropayment/RewardToken.sol
deployContract_RewardToken:  {
  transactionHash: '0xdd1f375515dc2784beb5d1bfa2319259a6dc51aadaaf5fe186c1e417b0d5395b',
  contractAddress: '0x5017A545b09ab9a30499DE7F431DF0855bCb7275',
  sender: '0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1'
}
Start compiling contract MicroPayment, source file --> ../contracts/micropayment/MicroPayment.sol
deployContract_MicroPayment:  {
  transactionHash: '0x096554ff09ad89abe6c3f45c2c460cf03f7156c825a2b786cdb73b86d781f981',
  contractAddress: '0x86072CbFF48dA3C1F01824a6761A03F105BCC697',
  sender: '0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1'
}
Start compiling contract NameRegistryService, source file --> ../contracts/utility/NameRegistryService.sol
deployContract_NameRegistryService:  {
  transactionHash: '0x7fb7d12f8d79de367bba688920906a933b3e7e37f399705af251c573901dc603',
  contractAddress: '0xFF6049B87215476aBf744eaA3a476cBAd46fB1cA',
  sender: '0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1'
}
Start compiling contract Program, source file --> ../contracts/utility/Program.sol
deployContract_Program:  {
  transactionHash: '0xd61647f6596dd0dd7219c08a4a6b0b2a6205fa82e4927273336c94eaaa9157d0',
  contractAddress: '0xA586074FA4Fe3E546A132a16238abe37951D41fE',
  sender: '0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1'
}
invokeContractMethod_setAuthorized: {
  transactionHash: '0x6e707e222200d8060104b15b44f13c2073e7af3787ffdfc253dbc2d96a680240',
  sender: '0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1'
}
invokeContractMethod_register: {
  transactionHash: '0x95de7ba09e8160ab2cb353eb2b04811b5323c38bb0bfc8637bf847299b9892d5',
  sender: '0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1'
}
invokeContractMethod_register: {
  transactionHash: '0x6b4d846761141c785a44be2cfec2339c4dda30b37de7439d62e77b41a970f856',
  sender: '0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1'
}
invokeContractMethod_register: {
  transactionHash: '0xab33dba535a3f1de466953e08404d87ae628c5da2738ce0d0db7f759baed818f',
  sender: '0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1'
}
request_ethKey:  {
  publicKey: '0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1',
  address: '0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1',
  labelName: 'Label-1'
}
request_ethKey:  {
  publicKey: '0xEB7187D97e01c0dFE44EAB462694f3E2731bC921',
  address: '0xEB7187D97e01c0dFE44EAB462694f3E2731bC921',
  labelName: 'Label-new'
}

```
