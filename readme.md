#Solar miner

Scripts for controlling mining rig(s) to run purely on solar. 
Why? Because I do not want to hurt the planet. But I still want to mine some coins :)

##How it works
The application runs on controller machine and turns on miners when there is surplus of solar energy and turns them off when the solar energy (or sufficient power in battery) is not available.  


##Usage
- Place a copy of the application to every mining machine and to controller
- triggerMining.sh
	- Main script - executes both scripts below
	- Configure it to run every X minutes on controller machine (this "machine" can easily be raspberry).
- startMiningRemote.js 
	- Starts the miner machine when the sun is shining or the battery is full. 
	- Shall be run on controller. 
- triggerMiningLocal.js
	- Starts the miner process on the miner machine. 
	- Must run on miner machine every X minutes and control whether mining process is up and running based on solar and battery 

##Configuration
Configuration is stored in "config.js":

	config = {
	   vrm: {
	       username: 'vrm username',
	       password: 'vrr password',
	       baseUrl: 'https://vrmapi.victronenergy.com/v2',
	       installId: 'id of the VRM installation',
	       batteryId: 'id of the battery'
	   },
	   miner: {
	       processName: 't-rex',
	       startBatchName: 'startMiner.bat',
	       macAddress: 'mac address of miner '
	    },
	    threshold: {
	       minBatteryPowerOn: 75,
	       minBatteryStartMine: 85,
	       sunshineYieldKw: 0.2
	    }
	};


See documentation of [VRM API](https://docs.victronenergy.com/vrmapi/overview.html) for details about installID and batteryID. 

##Limitations
- So far supports only single mining rig
- Requires Victron VRM for obtaining information about solar yield and battery status


##TODO
- Configurable ability to turn off the computer



