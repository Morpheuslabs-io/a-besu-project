sudo rm -rf /opt/besu-validator

# Start validator
ansible-playbook -i ./inventory site-besu-validator.yml -K