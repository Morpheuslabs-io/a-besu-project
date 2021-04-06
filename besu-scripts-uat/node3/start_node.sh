###

if [ "$1" = "prod" ]; then
  echo "prod enviroment"
  nodeConfigFile="node.config.prod"
  tomlConfigFile="config.prod.toml"
  keypairDataFolder="data.prod"
  bootnodeConfigFile="../bootnode.enode.prod"
else
  if [ "$1" = "uat" ]; then
    echo "uat enviroment"
    nodeConfigFile="node.config.uat"
    tomlConfigFile="config.uat.toml"
    keypairDataFolder="data.uat"
    bootnodeConfigFile="../bootnode.enode.uat"
  else
    echo "dev enviroment"
    nodeConfigFile="node.config.dev"
    tomlConfigFile="config.dev.toml"
    keypairDataFolder="data.dev"
    bootnodeConfigFile="../bootnode.enode.dev"
  fi
fi

export $(egrep -v '^#' $nodeConfigFile | xargs)
export $(egrep -v '^#' $bootnodeConfigFile | xargs)

###

echo "Starting $NODE_FOLDER as boot node"

echo "Copy node folder artifacts to the target location"
rm -rf $NODE_FOLDER
mkdir $NODE_FOLDER
cp -rf ..$NODE_FOLDER/$nodeConfigFile $NODE_FOLDER
cp -rf ..$NODE_FOLDER/$tomlConfigFile $NODE_FOLDER
cp -rf ..$NODE_FOLDER/$keypairDataFolder $NODE_FOLDER
cp -rf ..$NODE_FOLDER/genesis.json $NODE_FOLDER
cp -rf ..$NODE_FOLDER/*.sh $NODE_FOLDER

/opt/besu-21.1.2/bin/besu --data-path $NODE_FOLDER/$keypairDataFolder --genesis-file=$NODE_FOLDER/genesis.json --config-file=$NODE_FOLDER/$tomlConfigFile --p2p-port=$P2P_PORT --p2p-host=$P2P_HOST --rpc-http-port=$RPC_PORT --bootnodes=$BOOT_NODE_ENODE_LIST &