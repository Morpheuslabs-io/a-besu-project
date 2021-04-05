# Besu Blockchain Network (using IBFT2 consensus)

## Prerequisite

Java 11+

## Network overview

The besu network contains 4 validator nodes, where 2 validator nodes are also configured as boot nodes.

## Data folder and listenning port

Folder `besu-scripts-uat`

**Notice**

On 1 VM, only ports 8545 and 30303 are external

### 2 bootnodes

- /node1 (8545 and 30303)
- /node2 (8545 and 30303)

### 4 validator nodes

- /node3 (9545 and 30304)
- /node4 (9545 and 30304)
- /node5 (8545 and 30303)
- /node6 (8545 and 30303)

## Start Procedure

### Server 1

Contain first bootnode and first validator node

1. Start first bootnode

cd to the folder `node1`

To start, run the script `start_node1.sh`

A file `enode_id`, which contains the `enode ID` is created.
Example:

```
enode://efd148418d8e64a2009e45b1f73a7205c9212d0c2f06e673d0b05c0d30b686f48be6f1b85cb25e7717b6c1c77d152ab06fd96e27cf44785e18dd62afbd9909cd@0.0.0.0:30303

```

2. Start first validator node

cd to the folder `node3` and edit the following section in the file `config.toml` by replacing with
the above `enode` of the first bootnode


```
# Bootnodes
bootnodes=["enode://a0c528675c564479dc5ae493a6c5cf348788e24e5f7b9807a6c0e0c5d734bb19523c86c073d4ab17fcb0a4e6e0d7e236f25f138ce90470e9cfcf1a91af0d0615@127.0.0.1:30303"]

```

To start, run the script `start_node3.sh`

### Server 2

Contain second bootnode and second validator node

Do the same as for the `Server 1` with:
  - `node2` is for the second bootnode
  - `node4` is for the second validator node.

### Server 3

Contain third validator node

cd to the folder `node5` and edit the following section in the file `config.toml` by replacing with
the above `enode` of the first and second bootnodes


```
# Bootnodes
bootnodes=["enode://a0c528675c564479dc5ae493a6c5cf348788e24e5f7b9807a6c0e0c5d734bb19523c86c073d4ab17fcb0a4e6e0d7e236f25f138ce90470e9cfcf1a91af0d0615@127.0.0.1:30303", "enode://a0c528675c564479dc5ae493a6c5cf348788e24e5f7b9807a6c0e0c5d734bb19523c86c073d4ab17fcb0a4e6e0d7e236f25f138ce90470e9cfcf1a91af0d0615@127.0.0.1:30303"]

```

To start, run the script `start_node5.sh`

### Server 4

Contain forth validator node

cd to the folder `node6` and edit the following section in the file `config.toml` by replacing with
the above `enode` of the first and second bootnodes


```
# Bootnodes
bootnodes=["enode://a0c528675c564479dc5ae493a6c5cf348788e24e5f7b9807a6c0e0c5d734bb19523c86c073d4ab17fcb0a4e6e0d7e236f25f138ce90470e9cfcf1a91af0d0615@127.0.0.1:30303", "enode://a0c528675c564479dc5ae493a6c5cf348788e24e5f7b9807a6c0e0c5d734bb19523c86c073d4ab17fcb0a4e6e0d7e236f25f138ce90470e9cfcf1a91af0d0615@127.0.0.1:30303"]

```

To start, run the script `start_node6.sh`


**Notice**

- RPC Port: `4545`
- ChainID: `2018`
- Private key: `8f2a55949038a9610f50fb23b5883af3b4ecb3c3bb792cbcefbd1542c692be63`

To check the network peers, run this cmd

`curl -X POST --data '{"jsonrpc":"2.0","method":"net_peerCount","params":[],"id":1}' localhost:4545`

It should returns the current number of peers as below

```
{
  "jsonrpc" : "2.0",
  "id" : 1,
  "result" : "0x3"
}
```

## Stop and cleanup

In each node folder, there are 2 scripts

  - `restart_node1.sh`: used to restart the running node with preserved data
  - `stop_cleanup_node3.sh`: used to stop the running node and also delete the node data folder
  
## Testing interaction via smart contract deployment

- cd to folder `smartcontracts/deployment`
- Have a look at `README.md`
