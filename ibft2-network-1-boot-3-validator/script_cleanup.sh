echo "Kill running node"

sudo kill -9 $(sudo lsof -t -i:4545)
sudo kill -9 $(sudo lsof -t -i:5545)
sudo kill -9 $(sudo lsof -t -i:6545)
sudo kill -9 $(sudo lsof -t -i:7545)

sleep 5s

echo "Delete existing node folder"
sudo rm -rf /node1
sudo rm -rf /node2
sudo rm -rf /node3
sudo rm -rf /node4
