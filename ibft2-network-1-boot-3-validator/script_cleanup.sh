echo "Kill running node"

sudo fuser -n tcp -k 4545
sudo fuser -n tcp -k 5545
sudo fuser -n tcp -k 6545
sudo fuser -n tcp -k 7545

sleep 5s

echo "Delete existing node folder"
sudo rm -rf /node1
sudo rm -rf /node2
sudo rm -rf /node3
sudo rm -rf /node4
