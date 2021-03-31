# Listenning port of the node
export NODE_PORT="4545"

# Host of the node
export NODE_HOST="http://127.0.0.1"

curl -X POST --data '{"jsonrpc":"2.0","method":"net_enode","params":[],"id":1}' $NODE_HOST:$NODE_PORT
