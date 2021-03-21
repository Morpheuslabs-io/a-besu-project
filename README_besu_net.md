# Deploy Hyperledger Besu with Ansible on localhost with 1 bootnode using IBFT2

## Installation

1.
Besu requires Java 11+ to compile. Earlier versions are not supported.

https://stackoverflow.com/questions/52504825/how-to-install-jdk-11-under-ubuntu

on Ubuntu

```
sudo apt-get install openjdk-11-jdk
java -version
sudo update-java-alternatives --list
sudo update-alternatives --config java
```

on RedHat

```
sudo yum update
sudo yum install java-11-openjdk-devel 
java -version
sudo update-java-alternatives --list
sudo update-alternatives --config java
```


on Mac

`brew install openjdk@11`

2.
Ansible requires python3.
The best way to install ansible with python3:

  - Install the tool `pip3`
      
      On Ubuntu
      
      `sudo apt-get update`
      `sudo apt install python3-pip`

      On RedHat
      
      `sudo yum update`
      `sudo yum install python3-pip`


  - Install `ansible` with `pip3`: `pip3 install ansible`

## Install and Run OpenSSH on localhost (not needed when running on platform workspace )

The below commands are valid on Ubuntu

```
sudo apt install openssh-server
sudo systemctl status ssh or service ssh start
sudo ufw allow ssh (not needed on platform workspace)

```

## Start the deployment

Execute the script `script_deploy_bootnode.sh`

If the script is executed successfully, we should see the below output

```
TASK [besu-bootnode : Start Pantheon Node] ***************************************************************************************************************
ok: [127.0.0.1] => {
    "msg": "Starting Pantheon Node"
}

TASK [besu-bootnode : Execute Pantheon service] **********************************************************************************************************
changed: [127.0.0.1]

TASK [besu-bootnode : clearing unnecessary folders] ******************************************************************************************************
changed: [127.0.0.1]

PLAY RECAP ***********************************************************************************************************************************************
127.0.0.1                  : ok=52   changed=26   unreachable=0    failed=0    skipped=20   rescued=0    ignored=0   
```

The bootnode is listenning at port `3000`.

The node data is stored in the folder `besu-mitx` under `home` directory

Might need to delete the folder `besu-mitx` if the next run is failed for fresh installation again.

## Start besu node with Pantheon

  - Check status: `service pantheon status`
  - Start: `service pantheon start`
  - Stop: `service pantheon stop`

## Check the blockchain network

To check, run this cmd

```
curl -X POST --data '{"jsonrpc":"2.0","method":"net_peerCount","params":[],"id":1}' localhost:3000
```

```
curl -X POST --data '{"jsonrpc":"2.0","method":"net_peerCount","params":[],"id":1}' 3.140.243.107:3000
```

```
curl -X POST --data '{"jsonrpc":"2.0","method":"eth_accounts","params":[],"id":1}' localhost:3000
```

Should see this output

```
{
  "jsonrpc" : "2.0",
  "id" : 1,
  "result" : "0x0"
}
```

## Current folder config

**Original**

~/lacchain
/root/lacchain

**Notice**

Never use `~/` as it won't create folder successfully

### bootnode

/opt/besu-bootnode

port: `3000`

### validator

/opt/besu-validator

port: `3001`

### validator2

/opt/besu-validator2

port: `3002`

-----------------

# Error Collection and Resolution

1. 
Must use python3, otherwise, get the below error

Way1
-> run this cmd on the Terminal tab: sudo apt-get install python3.8

Way 2
-> Better way:
  https://docs.ansible.com/ansible/latest/reference_appendices/python_3_support.html
    sudo apt install python3-pip
    pip3 install ansible

Way 3
-> vim /etc/ansible/ansible.cfg
      [defaults]
      interpreter_python = /usr/bin/python3


fatal: [127.0.0.1]: FAILED! => {"ansible_facts": {}, "changed": false, "failed_modules": {"setup": {"ansible_facts": {"discovered_interpreter_python": "/usr/bin/python"}, "deprecations": [{"msg": "Distribution Ubuntu 20.10 on host 127.0.0.1 should use /usr/bin/python3, but is using /usr/bin/python for backward compatibility with prior Ansible releases. A future Ansible release will default to using the discovered platform python for this host. See https://docs.ansible.com/ansible/2.9/reference_appendices/interpreter_discovery.html for more information", "version": "2.12"}], "failed": true, "module_stderr": "sudo: a password is required\n", "module_stdout": "", "msg": "MODULE FAILURE\nSee stdout/stderr for the exact error", "rc": 1}}, "msg": "The following modules failed to execute: setup\n"}

3.
Replace "/root/lacchain" with "/home/trung/besu-mitx"

4.
Failed to start Ethereum Pantheon client.

sudo rm -rf /lib/systemd/system/pantheon.service

5.

fatal: [127.0.0.1]: FAILED! => {"ansible_facts": {}, "changed": false, "failed_modules": {"setup": {"failed": true, "module_stderr": "sudo: a password is required\n", "module_stdout": "", "msg": "MODULE FAILURE\nSee stdout/stderr for the exact error", "rc": 1}}, "msg": "The following modules failed to execute: setup\n"}

Way1:
  --> rm -rf ~/besu-mitx
  and run the script "script_deploy_bootnode.sh" again

Way2:
  ensure the script "script_deploy_bootnode.sh" to have the option "-K" at the end.
  This option enables to enter sudo password on cmd prompt

6.

TASK [besu-bootnode : Enable service pantheon] ***********************************************************************************************************
fatal: [127.0.0.1]: FAILED! => {"changed": false, "msg": "Error loading unit file 'pantheon': org.freedesktop.systemd1.BadUnitSetting \"Unit pantheon.service has a bad unit file setting.\""}

Way1:
  // reload the config
  systemctl daemon-reload

  // start again
  service pantheon start

7.
After Ansible deployment, if `pantheon` service is not started, 
then, check the file `roles/besu-bootnode/tasks/install.yaml`

```
- name: start node
  import_tasks: "start-node.yaml"
  when: first_node|bool
```

--> disable the line `when: first_node|bool` as it means to start `pantheon` only for the 1st time