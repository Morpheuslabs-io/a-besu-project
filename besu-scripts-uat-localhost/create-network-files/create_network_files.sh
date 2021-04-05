export NETWORK_FILES_LOCATION="./networkFiles"

/opt/besu-21.1.2/bin/besu operator generate-blockchain-config --config-file=./ibftConfigFile.json --to=$NETWORK_FILES_LOCATION --private-key-file-name=key
