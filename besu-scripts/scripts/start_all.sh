echo "Start IBFT2.0 Network"

../node1/start_node1.sh &

sleep 5s

../node2/start_node2.sh &

sleep 5s

../node3/start_node3.sh &

sleep 5s

../node4/start_node4.sh &