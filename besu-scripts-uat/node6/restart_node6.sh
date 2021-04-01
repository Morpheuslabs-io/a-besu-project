export P2P_HOST="0.0.0.0"
export P2P_PORT="30308"
export NODE_FOLDER="/node6"

echo "Restarting $NODE_FOLDER as validator node"
/opt/besu-21.1.2/bin/besu --data-path $NODE_FOLDER/data --genesis-file=$NODE_FOLDER/genesis.json --config-file=$NODE_FOLDER/config.toml --host-allowlist="*" --rpc-http-cors-origins="all" --p2p-host=$P2P_HOST --p2p-port=$P2P_PORT &
