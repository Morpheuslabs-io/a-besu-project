echo "Kill running node"

if [ ! -z "$(sudo lsof -t -i:5545)" ]
then
  sudo kill -9 $(sudo lsof -t -i:5545)
fi

echo "Delete existing node folder"

sudo rm -rf /node2

echo "Copy node folder to the target location"

sudo cp -rf ../../node2 /node2
sudo cp -rf ../../genesis.json /node2/genesis.json

echo "Starting node2 as validator node"

sudo /opt/besu-21.1.2/bin/besu --data-path /node2/data --genesis-file=/node2/genesis.json --config-file="/node2/config.toml" --host-allowlist="*" --rpc-http-cors-origins="all"