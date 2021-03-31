echo "Kill running node"

if [ ! -z "$(sudo lsof -t -i:4545)" ]
then
  sudo kill -9 $(sudo lsof -t -i:4545)
fi

echo "Delete existing node folder"

sudo rm -rf /node1

echo "Copy node folder to the target location"

sudo cp -rf ../node1 /node1

echo "Starting node1 as boot node"

sudo /opt/besu-21.1.2/bin/besu --data-path /node1/data --genesis-file=/node1/genesis.json --config-file="/node1/config.toml" --host-allowlist="*" --rpc-http-cors-origins="all"
