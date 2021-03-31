echo "Kill running node"

if [ ! -z "$(lsof -t -i:4545)" ]
then
  kill -9 $(lsof -t -i:4545)
fi

echo "Delete existing node folder"

# Without sudo, get "Permission denied"
rm -rf /node1

echo "Delete old keypair"
rm -rf ./data/key
rm -rf ./data/key.pub

echo "Creating keypair"

# Do not use sudo here
enode_key=$(/opt/besu-21.1.2/bin/besu --data-path=./data public-key export-address --to=./data/key.pub | grep -oE "0x[A-Fa-f0-9]*" | sed 's/0x//')

echo "enode://$enode_key@127.0.0.1:30303" >> ./enode_id

echo "Copy node folder to the target location"

# Without sudo, get "Permission denied"
cp -rf ../node1 /node1

echo "Starting node1 as boot node"

# Without sudo, get "Permission denied"
/opt/besu-21.1.2/bin/besu --data-path /node1/data --genesis-file=/node1/genesis.json --config-file="/node1/config.toml" --host-allowlist="*" --rpc-http-cors-origins="all"
