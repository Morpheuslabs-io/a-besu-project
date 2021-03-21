echo "IBFT2.0 Network"

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

sleep 5s

echo "Copy node folder to the target location"
sudo cp -rf node1 /node1
sudo cp -rf node2 /node2
sudo cp -rf node3 /node3
sudo cp -rf node4 /node4

sleep 5s

echo "Starting node 1 as boot node ..."

sudo ./script_start_node_1.sh &

sleep 5s

echo "Starting node 2 as validator node ..."

sudo ./script_start_node_2.sh &

sleep 5s

echo "Starting node 3 as validator node ..."

sudo ./script_start_node_3.sh &

sleep 5s

echo "Starting node 4 as validator node ..."

sudo ./script_start_node_4.sh &