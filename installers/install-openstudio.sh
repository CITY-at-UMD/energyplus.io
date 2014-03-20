cd /usr/local/
wget http://developer.eebhub.org/installers/OpenStudio-1.3.0.e09fcf487f-Nodejs-Linux.deb
dpkg -i OpenStudio-1.3.0.e09fcf487f-Nodejs-Linux.deb
sudo apt-get -f install
sudo apt-get install -f
dpkg -i OpenStudio-1.3.0.e09fcf487f-Nodejs-Linux.deb
sudo apt-get install libgl1-mesa-glx -y
sudo apt-get install xvfb

#ADD OPENSTUDIO NODE MODULES TO $PATH
export NODE_PATH=/usr/local/lib/openstudio/node
PATH=$PATH:/usr/local/lib/openstudio/node
sudo echo “export NODE_PATH=/usr/local/lib/openstudio/node” >> /etc/profile
sudo echo “export PATH=$PATH:$NODE_PATH” >> /etc/profile
sudo echo “export NODE_PATH=/usr/local/lib/openstudio/node” >> /etc/environment
sudo echo “export PATH=$PATH:$NODE_PATH” >> /etc/environment
