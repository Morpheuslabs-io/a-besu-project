# Node-specific config
export $(egrep -v '^#' .env.node_config | xargs)

echo "Restarting $NODE_FOLDER as boot node"
/opt/besu-21.1.2/bin/besu --data-path $NODE_FOLDER/data --genesis-file=$NODE_FOLDER/genesis.json --config-file=$NODE_FOLDER/config.toml --host-allowlist="*" --rpc-http-cors-origins="all" --p2p-host=$P2P_HOST --p2p-port=$P2P_PORT --rpc-http-port=$RPC_PORT &
