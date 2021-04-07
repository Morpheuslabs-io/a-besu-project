###

if [ "$1" = "prod" ]; then
  echo "prod enviroment"
  nodeConfigFile="node.config.prod"
  tomlConfigFile="config.prod.toml"
  keypairDataFolder="nodekey.prod"
  bootnodeConfigFile="../bootnode.enode.prod"
else
  if [ "$1" = "uat" ]; then
    echo "uat enviroment"
    nodeConfigFile="node.config.uat"
    tomlConfigFile="config.uat.toml"
    keypairDataFolder="nodekey.uat"
    bootnodeConfigFile="../bootnode.enode.uat"
  else
    echo "dev enviroment"
    nodeConfigFile="node.config.dev"
    tomlConfigFile="config.dev.toml"
    keypairDataFolder="nodekey.dev"
    bootnodeConfigFile="../bootnode.enode.dev"
  fi
fi

export $(egrep -v '^#' $nodeConfigFile | xargs)
export $(egrep -v '^#' $bootnodeConfigFile | xargs)

###

echo "Starting $NODE_FOLDER as validator node"

echo "Copy node folder artifacts to the target location"

cp -rf ./$nodeConfigFile $NODE_FOLDER
cp -rf ./$tomlConfigFile $NODE_FOLDER
cp -rf ./$keypairDataFolder/* $NODE_FOLDER
cp -rf ./genesis.json $NODE_FOLDER
cp -rf ./*.sh $NODE_FOLDER

/opt/besu-21.1.2/bin/besu --data-path $NODE_FOLDER/data --genesis-file=$NODE_FOLDER/genesis.json --config-file=$NODE_FOLDER/$tomlConfigFile --bootnodes=$BOOT_NODE_ENODE_LIST &
