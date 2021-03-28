# Smart Contracts

Do not use folder `deployment` any more

## Compile/deploy

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

Do not use folder `deployment` any more

### With local Ganache

At first, start local Ganache with this cmd

`npm run ganache`

Then, open another terminal/console to run the test with this cmd

`npm run test-ganache`

### With local Besu

At first, start local Besu network. Please refer to the file `besu-scripts/README.md`

Then, open another terminal/console to run the test with this cmd

`npm run test-besu`
