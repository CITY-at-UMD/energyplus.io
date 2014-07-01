cd /usr/local/;
sudo wget http://developer.nrel.gov/downloads/buildings/energyplus/builds/EPlusV800008-lin-64.tar.gz;
sudo tar xzf EPlusV800008-lin-64.tar.gz;
find EnergyPlus-8-0-0/EnergyPlus -type f -perm -o+rx;
find EnergyPlus-8-0-0/ExpandObjects -type f -perm -o+rx;
find EnergyPlus-8-0-0/EPMacro -type f -perm -o+rx;
mv EnergyPlus-8-0-0 /usr/local/;
cd /usr/local/bin/;
sudo ln -s /usr/local/EnergyPlus-8-0-0/EnergyPlus;
sudo ln -s /usr/local/EnergyPlus-8-0-0/ExpandObjects;
sudo ln -s /usr/local/EnergyPlus-8-0-0/EPMacro;
#Add energy plus applications to the system PATH
export PATH=$PATH:/usr/local/EnergyPlus-8-0-0/;
