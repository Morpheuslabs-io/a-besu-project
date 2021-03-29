# Smart Contracts

Recommented tool for compile and deployment is to use Truffle, but if truffle is not available in the target env, then use deployContract.js directly to compile and deploy the smart contracts.

## Option 1 - Compile/deploy using deployContracts.js in the "deployment" folder





## Option 2 - Compile/deploy using truffle

Execute the following commands in the "smartcontract" folder, 

1. Installation

`npm i`

2. Compile

`npm run build`

2. Deploy to local ganache

- Start local ganache: `npm run ganache`
- Open another Terminal or Console and run this cmd: `npm run deploy-ganache`

3. Deploy to local besu

- Start local besu: please refer to the file `besu-scripts/README.md`
- Ensure the private key specified in the file `.secret.besu` is valid and has enough funds for tx fee
- Open another Terminal or Console and run this cmd: `npm run deploy`

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
