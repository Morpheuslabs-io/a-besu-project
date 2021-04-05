# Besu Blockchain Network (using IBFT2 consensus)

## Prerequisite

Java 11+

## Network overview

The besu network contains 4 validator nodes, where 2 validator nodes are also configured as boot nodes.

## Data folder and listenning port

Folder `besu-scripts-uat`

### 1 bootnode also running as validator node on 1 VM

- /node1 (8545 and 30303)

### 3 validator nodes on 3 separate VMs

- /node2 (8545 and 30303)
- /node3 (8545 and 30303)
- /node4 (8545 and 30303)

## Node operation procedure

### Generate keypair

This step is done **only once** to generate 4 pairs of keypair files for the first 4 nodes.

  - cd in the folder `create-network-files`
  - In the script `create_network_files.sh`, edit the `NETWORK_FILES_LOCATION` specifying the folder path holding the generated artifacts.
  - Run this script to generate the artifacts including:
    - A folder `keys` with 4 sub-folders (correspondent to 4 node data folders) where `key` and `key.pub` files are contained.
      - Copy the files `key` and `key.pub` to the node data folder:
        - `node1/data`
        - `node2/data`
        - `node3/data`
        - `node4/data`

    - A `genesis.json` file that needs to be copied to:
        - `node1/`
        - `node2/`
        - `node3/`
        - `node4/`

### Edit bootnode enode

Bootnode enode(s) is specified in the the file `.env.bootnode_config`.
This is done only once or when new bootnodes are added.

`enode` format is as follows

```
enode://key.pub.without.0x@nodeIP:nodeP2pPort
```

where:
  - `key.pub.without.0x` is taken from the file `key.pub` omitting the `0x` in the bootnode `data` folder
  - `nodeIP`: IP of the machine where bootnode is running
  - `nodeP2pPort`: p2p-port of the bootnode (specified by the config param `P2P_PORT` in file `.env.node_config`)

Example:

```
enode://be767d9fad77d1c6c57f6df233d32fa18890bc358b0b24a73ac3a5923e52b3f89ad11d9de692a7142bd0b2acc33628f5ca9f40916f24d37c4c5e61fe45f54411@172.31.39.78:30303
```

### Configuration files of the node

1. `.env.node_config`

Leave it unchanged

2. `config.toml`

Leave it unchanged

### Operation scripts of the node

  -  `start_node.sh`: used to initially start the node
  -  `restart_node.sh`: used to restart the running node with preserved data
  -  `stop_cleanup_node.sh`: used to stop the running node and also delete its data folder

### Start/restart/stop

Each node can be started/restarted/stopped on VM.

## genesis file info 

  - "chainId" : 2018,
  - "gasLimit" : "0x1fffffffffffff",
  - "contractSizeLimit": 2147483647,

`gasLimit` and `contractSizeLimit` are set like above for gas-free transactions

## CLI

To check the network peers, run this cmd

`curl -X POST --data '{"jsonrpc":"2.0","method":"net_peerCount","params":[],"id":1}' node-IP:8545`

It should returns the current number of peers as below

```
{
  "jsonrpc" : "2.0",
  "id" : 1,
  "result" : "0x3"
}
```

## Testing interaction via smart contract deployment

- cd to folder `smartcontracts/deployment`
- `npm i`
- `npm run deploy-besu`
