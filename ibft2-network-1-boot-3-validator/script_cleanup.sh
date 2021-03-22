echo "Kill running node"

if [ ! -z "$(sudo lsof -t -i:4545)" ]
then
  sudo kill -9 $(sudo lsof -t -i:4545)
fi

if [ ! -z "$(sudo lsof -t -i:5545)" ]
then
  sudo kill -9 $(sudo lsof -t -i:5545)
fi

if [ ! -z "$(sudo lsof -t -i:6545)" ]
then
  sudo kill -9 $(sudo lsof -t -i:6545)
fi

if [ ! -z "$(sudo lsof -t -i:7545)" ]
then
  sudo kill -9 $(sudo lsof -t -i:7545)
fi

sleep 5s

echo "Delete existing node folder"
sudo rm -rf /node1
sudo rm -rf /node2
sudo rm -rf /node3
sudo rm -rf /node4
