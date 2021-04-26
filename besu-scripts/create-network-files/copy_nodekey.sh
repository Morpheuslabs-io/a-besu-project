###

if [ "$1" = "prod" ]; then
  echo "prod enviroment"
  nodekeyFolder="nodekey.prod"
  genesisFile="genesis.prod.json"
else
  if [ "$1" = "uat" ]; then
    echo "uat enviroment"
    nodekeyFolder="nodekey.uat"
    genesisFile="genesis.uat.json"
  else
    echo "dev enviroment"
    nodekeyFolder="nodekey.dev"
    genesisFile="genesis.json"
  fi
fi

###

max=4
for i in `seq 1 $max`
do
  echo "Copy for node$i"
  rm -rf ../node$i/$nodekeyFolder
  cp -rf ./networkFiles/keys/node$i ../node$i/$nodekeyFolder
  mv ../node$i/$nodekeyFolder/key.pub ../node$i/$nodekeyFolder/nodekey.pub

  cp ./networkFiles/genesis.json ../node$i/$genesisFile
done



