# Smart Contracts

In the folder `smartcontracts`, there are 2 sub-folders:
  - `contracts`: Solidity source code
  - `deployment`: compile/deploy script

## Compile/deploy

`cd deployment`

1. Installation

`npm i`

2. Compile

`npm run build`

2. Deploy to local ganache

  - Start local ganache: `npm run ganache`
  - Open another Terminal or Console and run this cmd: `npm run deploy-ganache`

The configuration file is `.env.ganache` (no need to change anything)

3. Deploy to local besu

  - Start local besu: please refer to the file `besu-scripts/README.md`
  - Open another Terminal or Console and run this cmd: `npm run deploy`

The configuration file is `.env.besu`. If `PRIVATE_KEY` is specified, it will be used for deployment. Otherwise, `KEY_FILE_PATH` must be specified. `PRIVATE_KEY` has higher preference than `KEY_FILE_PATH`



