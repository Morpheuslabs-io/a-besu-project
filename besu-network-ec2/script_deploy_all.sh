# Start first node as bootnode
ansible-playbook -i ./inventory site-besu-bootnode.yml -K

# Wait for 5s
sleep 5s

# Start second node as validator
ansible-playbook -i ./inventory site-besu-validator.yml

# Wait for 5s
sleep 5s

# Start third node as validator
ansible-playbook -i ./inventory site-besu-validator2.yml

# Wait for 5s
sleep 5s

# Start forth node as validator
ansible-playbook -i ./inventory site-besu-validator3.yml