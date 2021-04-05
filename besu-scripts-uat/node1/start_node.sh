# Node-specific config
export $(egrep -v '^#' .env.node_config | xargs)

echo "Starting $NODE_FOLDER as boot node"

echo "Copy node folder artifacts to the target location"
cp -rf ..$NODE_FOLDER $NODE_FOLDER

/opt/besu-21.1.2/bin/besu --data-path $NODE_FOLDER/data --genesis-file=$NODE_FOLDER/genesis.json --config-file=$NODE_FOLDER/config.toml --host-allowlist="*" --rpc-http-cors-origins="all" --p2p-port=$P2P_PORT --p2p-host=$P2P_HOST --rpc-http-port=$RPC_PORT &