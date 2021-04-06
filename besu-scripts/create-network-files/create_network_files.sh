export NETWORK_FILES_LOCATION="./networkFiles"

rm -rf $NETWORK_FILES_LOCATION

/opt/besu-21.1.2/bin/besu operator generate-blockchain-config --config-file=./ibftConfigFile.json --to=$NETWORK_FILES_LOCATION --private-key-file-name=nodekey
