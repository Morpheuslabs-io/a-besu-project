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

echo "Kill running node"
if [ ! -z "$(lsof -t -i:$RPC_PORT)" ]
then
  kill -9 $(lsof -t -i:$RPC_PORT)
fi

echo "Delete existing node folder"
rm -rf $NODE_FOLDER