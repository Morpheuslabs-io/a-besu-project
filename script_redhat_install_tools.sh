sudo yum update

sudo yum install java-11-openjdk-devel -y

sudo dnf install git -y

sudo yum install wget -y

sudo yum install lsof -y

sudo yum install vim -y

sudo yum install unzip -y

wget https://hyperledger.jfrog.io/artifactory/besu-binaries/besu/21.1.2/besu-21.1.2.zip

unzip besu-21.1.2.zip

sudo cp -rf besu-21.1.2 /opt/

rm -rf besu-21.1.2
rm -rf besu-21.1.2.zip