# Listenning port of the node
export RPC_PORT="8545"

# Host of the node
export RPC_HOST="http://127.0.0.1"

curl -X POST --data '{"jsonrpc":"2.0","method":"net_enode","params":[],"id":1}' $RPC_HOST:$RPC_PORT
