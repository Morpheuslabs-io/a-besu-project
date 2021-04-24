###

if [ "$1" = "prod" ]; then
  echo "prod enviroment"
  nodeConfigFile="node.config.prod"
  tomlConfigFile="config.prod.toml"
  keypairDataFolder="nodekey.prod"
  genesisFile="genesis.prod.json"
else
  if [ "$1" = "uat" ]; then
    echo "uat enviroment"
    nodeConfigFile="node.config.uat"
    tomlConfigFile="config.uat.toml"
    keypairDataFolder="nodekey.uat"
    genesisFile="genesis.uat.json"
  else
    echo "dev enviroment"
    nodeConfigFile="node.config.dev"
    tomlConfigFile="config.dev.toml"
    keypairDataFolder="nodekey.dev"
    genesisFile="genesis.json"
  fi
fi

export $(egrep -v '^#' $nodeConfigFile | xargs)

###

echo "Starting $NODE_FOLDER as boot node and validator node"

echo "Copy node folder artifacts to the target location"

cp -rf ./$nodeConfigFile $NODE_FOLDER
cp -rf ./$tomlConfigFile $NODE_FOLDER
cp -rf ./$genesisFile $NODE_FOLDER/genesis.json
cp -rf ./$keypairDataFolder/* $NODE_FOLDER
cp -rf ./besu-log.xml $NODE_FOLDER
cp -rf ./*.sh $NODE_FOLDER

LOG4J_CONFIGURATION_FILE=./besu-log.xml /opt/besu-21.1.2/bin/besu --data-path $NODE_FOLDER/data --genesis-file=$NODE_FOLDER/genesis.json --config-file=$NODE_FOLDER/$tomlConfigFile &
