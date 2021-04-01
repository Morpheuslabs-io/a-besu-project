export RPC_PORT="9545"
export NODE_FOLDER="/node4"

echo "Kill running node"
if [ ! -z "$(lsof -t -i:$RPC_PORT)" ]
then
  kill -9 $(lsof -t -i:$RPC_PORT)
fi

echo "Delete existing node folder"
rm -rf $NODE_FOLDER