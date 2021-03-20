# Start first node as bootnode
ansible-playbook -i inventory --private-key=~/.ssh/ml-test-org-keypair-ec2-user1.pem -u ec2-user1 site-besu-bootnode.yml -e 'ansible_python_interpreter=/usr/bin/python3'