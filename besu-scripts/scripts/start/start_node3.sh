echo "Kill running node"

if [ ! -z "$(sudo lsof -t -i:6545)" ]
then
  sudo kill -9 $(sudo lsof -t -i:6545)
fi

echo "Delete existing node folder"

sudo rm -rf /node3

echo "Copy node folder to the target location"

sudo cp -rf ../../node3 /node3
sudo cp -rf ../../genesis.json /node3/genesis.json

echo "Starting node3 as validator node"

sudo /opt/besu-21.1.2/bin/besu --data-path /node3/data --genesis-file=/node3/genesis.json --config-file="/node3/config.toml" --host-allowlist="*" --rpc-http-cors-origins="all"