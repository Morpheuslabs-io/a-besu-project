export RPC_PORT="6545"
export NODE_FOLDER="/node3"

echo "Kill running node"
if [ ! -z "$(lsof -t -i:$RPC_PORT)" ]
then
  kill -9 $(lsof -t -i:$RPC_PORT)
fi

echo "Delete existing node folder"
rm -rf $NODE_FOLDER