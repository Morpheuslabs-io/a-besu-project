echo "Kill running node"

if [ ! -z "$(sudo lsof -t -i:7545)" ]
then
  sudo kill -9 $(sudo lsof -t -i:7545)
fi

echo "Delete existing node folder"

sudo rm -rf /node4

echo "Copy node folder to the target location"

sudo cp -rf ../../node4 /node4
sudo cp -rf ../../genesis.json /node4/genesis.json

echo "Starting node4 as validator node"

sudo /opt/besu-21.1.2/bin/besu --data-path /node4/data --genesis-file=/node4/genesis.json --config-file="/node4/config.toml" --host-allowlist="*" --rpc-http-cors-origins="all"