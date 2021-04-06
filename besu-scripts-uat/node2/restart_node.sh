###

if [ "$1" = "prod" ]; then
  echo "prod enviroment"
  nodeConfigFile="node.config.prod"
  tomlConfigFile="config.prod.toml"
  keypairDataFolder="data.prod"
else
  if [ "$1" = "uat" ]; then
    echo "uat enviroment"
    nodeConfigFile="node.config.uat"
    tomlConfigFile="config.uat.toml"
    keypairDataFolder="data.uat"
  else
    echo "dev enviroment"
    nodeConfigFile="node.config.dev"
    tomlConfigFile="config.dev.toml"
    keypairDataFolder="data.dev"
  fi
fi

export $(egrep -v '^#' $nodeConfigFile | xargs)

###

export $(egrep -v '^#' $nodeConfigFile | xargs)

echo "Restarting $NODE_FOLDER as boot node"
/opt/besu-21.1.2/bin/besu --data-path $NODE_FOLDER/data --genesis-file=$NODE_FOLDER/genesis.json --config-file=$NODE_FOLDER/config.toml --host-allowlist="*" --rpc-http-cors-origins="all" --p2p-host=$P2P_HOST --p2p-port=$P2P_PORT --rpc-http-port=$RPC_PORT --bootnodes=$BOOT_NODE_1_ENODE &
