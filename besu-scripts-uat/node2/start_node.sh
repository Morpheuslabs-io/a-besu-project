export P2P_HOST="127.0.0.1"
export P2P_PORT="30304"
export NODE_FOLDER="/node2"

echo "Starting $NODE_FOLDER as validator node"

# echo "Delete old keypair"
# rm -rf ./data/key
# rm -rf ./data/key.pub

# echo "Creating keypair"
# enode_key=$(/opt/besu-21.1.2/bin/besu --genesis-file=./genesis.json --data-path=./data public-key export --to=./data | grep -oE "0x[A-Fa-f0-9]*" | sed 's/0x//')

# echo "enode://$enode_key@$P2P_HOST:$P2P_PORT" > ./enode_id

echo "Copy node folder artifacts to the target location"
cp -rf ..$NODE_FOLDER $NODE_FOLDER

/opt/besu-21.1.2/bin/besu --data-path $NODE_FOLDER/data --genesis-file=$NODE_FOLDER/genesis.json --config-file=$NODE_FOLDER/config.toml --host-allowlist="*" --rpc-http-cors-origins="all" --p2p-port=$P2P_PORT &
