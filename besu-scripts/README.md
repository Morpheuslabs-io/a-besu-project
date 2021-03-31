# IBFT2 Blockchain Network

## Prerequisite

Java 11+

## Folder structure and listenning port

- /node1 (4545)
- /node2 (5545)
- /node3 (6545)
- /node4 (7545)

## Start

The IBFT2 blockchain network can be started with this cmd

`besu-scripts/start_all.sh`

**Notice**

- RPC URL: `http://localhost:4545`
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

To stop the running network, run this cmd

`besu-scripts/stop_cleanup.sh`

## Testing interaction via smart contract deployment

- cd to folder `smartcontracts/deployment`
- Have a look at `README.md`
