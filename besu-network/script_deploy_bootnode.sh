sudo rm -rf /opt/besu-bootnode

# Start first node as bootnode
ansible-playbook -i ./inventory site-besu-bootnode.yml -K