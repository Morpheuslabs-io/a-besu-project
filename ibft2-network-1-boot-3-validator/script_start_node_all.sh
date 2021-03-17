echo "IBFT2.0 Network"
echo "Cleaning up ..."

./script_cleanup.sh

sleep 5s

echo "Starting node 1 as boot node ..."

pm2 start script_start_node_1.sh

sleep 5s

echo "Starting node 2 as validator node ..."

pm2 start script_start_node_2.sh

sleep 5s

echo "Starting node 3 as validator node ..."

pm2 start script_start_node_3.sh

sleep 5s

echo "Starting node 4 as validator node ..."

pm2 start script_start_node_4.sh