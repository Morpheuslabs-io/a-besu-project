# Besu Blockchain Network (using IBFT2 consensus)

## Prerequisite

Java 11+

## Network overview

The besu network contains 4 validator nodes, where 2 validator nodes are also configured as boot nodes.

## Data folder and listenning port

Folder `besu-scripts-uat`

### 1 bootnode also running as validator node on 1 VM

- /opt/node1 (8545 and 30303)

### 3 validator nodes on 3 separate VMs

- /opt/node2 (8545 and 30303)
- /opt/node3 (8545 and 30303)
- /opt/node4 (8545 and 30303)

## Node operation procedure

### Generate keypair

This step is done **only once** to generate 4 pairs of keypair files for the first 4 nodes.

  - cd in the folder `create-network-files`
  - Run the script `create_network_files.sh` to generate the artifacts including:
    - A folder `keys` with 4 sub-folders each of which has the folder name in form of hash
    - Rename these 4 sub-folders to `node1`, `node2`, `node3` and `node4` (correspondent to 4 node data folders) where `nodekey` and `nodekey.pub` files are contained.
  - Run another script `copy_nodekey.sh uat|prod|dev` for copying the newly-generated nodekeys accordingly to `uat|prod|dev` env

    - A `genesis.json` file that needs to be copied to:
        - `node1/`
        - `node2/`
        - `node3/`
        - `node4/`

### Edit bootnode enode

Bootnode enode(s) is specified in the the file `bootnode.enode.uat|prod|dev`.
This is done only once or when new bootnodes are added.

`enode` format is as follows

```
enode://nodekey.pub.without.0x@nodeIP:nodeP2pPort
```

where:
  - `nodekey.pub.without.0x` is taken from the file `nodekey.pub` omitting the `0x` in the bootnode `data` folder
  - `nodeIP`: IP of the machine where bootnode is running
  - `nodeP2pPort`: p2p-port of the bootnode (specified by the config param `P2P_PORT` in file `node.config.uat`)

Example:

```
enode://be767d9fad77d1c6c57f6df233d32fa18890bc358b0b24a73ac3a5923e52b3f89ad11d9de692a7142bd0b2acc33628f5ca9f40916f24d37c4c5e61fe45f54411@172.31.39.78:30303
```

### Configuration files of the node

1. Node-specific configuration

`node.config.uat`
`node.config.prod`
`node.config.dev`

Leave it unchanged

2. Blockchain-specific configuration

`config.dev.toml`
`config.uat.toml`
`config.prod.toml`

Leave it unchanged

3. Bootnode enode configuration

`bootnode.enode.dev`
`bootnode.enode.uat`
`bootnode.enode.prod`

### Operation scripts of the node

  -  `start_node.sh`: used to initially start the node
  -  `restart_node.sh`: used to restart the running node with preserved data
  -  `stop_cleanup_node.sh`: used to stop the running node and also delete its data folder

**Notice**
Please always specify the target environment as the argument passed to the above script as follows:
  - `prod`: production environment
  - `uat`: uat environment
  - anything else or not specified: `dev` environment

Example:

`start_node.sh uat`: start node for UAT env

### Start/restart/stop

Each node can be started/restarted/stopped on VM. Node that the network requires minimum 3 / 4 validator nodes to valiidate the transaction to be included in the newly produced block.

## genesis file info 

  - "chainId" : 2018,
  - "gasLimit" : "0x1fffffffffffff",
  - "contractSizeLimit": 2147483647,

`gasLimit` and `contractSizeLimit` are set like above for gas-free transactions

## CLI to verify the network

### Check the network peers

`curl -X POST --data '{"jsonrpc":"2.0","method":"net_peerCount","params":[],"id":1}' node-IP:8545`

Output

```
{
  "jsonrpc" : "2.0",
  "id" : 1,
  "result" : "0x3"
}
```

### List of validator addresses

`curl -X POST --data '{"jsonrpc":"2.0","method":"ibft_getValidatorsByBlockNumber","params":["latest"], "id":1}' node-IP:8545`

Output

```
{
  "jsonrpc" : "2.0",
  "id" : 1,
  "result" : [ "0x32574b8e5446290f2758ff64f0d2721fb5dea4eb", "0x7517fdc292572f4f5cca795a6c2cc7f00ff42aa1", "0x8290bb1cfd33c7ee74cdd4ae966d36e42ee30a77", "0xa3c0e9991ca197760e1a77a1060df82751647981" ]
}
```

## Testing interaction via smart contract deployment

- cd to folder `smartcontracts/deployment`
- `npm i`
- `npm run deploy-besu`

## Manual way of stopping the node

The node listenning port is `8545`. 
So, possible to find the `PID` associated with this port and then stop it

Run this cmd to find the `PID`: `sudo lsof -i:8545`
Run this cmd to kill the process via the `PID` found above: `sudo kill -9 <PID>`
