const express = require('express');
const sqlite = require('sqlite3');

const argus = express();
const port = 3000;

/*database stuff*/

let argusDB = new sqlite.Database('./argus.db', (err) => {
	if (err) {
		console.error(err.message);
	}
	console.log('loaded sqlite db');
});

const watchdogSQL = `
	INSERT INTO devices (deviceID, battery, bootTime, wifi)
	values (?, ?, ?, ?)
	ON CONFLICT(deviceID) DO UPDATE SET
		battery = excluded.battery,
		bootTime = excluded.bootTime,
		wifi = excluded.wifi
`;

const lockSQL = `
	INSERT INTO users (firstName, lastName, grade, strand, section, deviceID, loginTime)
	values (?, ?, ?, ?, ?, ?, ?)
`;

function watchdogStore(data){
	argusDB.run(watchdogSQL, [data.deviceName, data.batteryPercentage, data.bootTime, data.wifi], function(err) {
		if (err) {
			return console.error("SQLite Insert Error:", err.message);
		}
		console.log(`Success: Device ${data.deviceName} updated. Rows affected: ${this.changes}`);
	});
};

function lockStore(data){
	argusDB.run(lockSQL, [data.firstName, data.lastName, data.grade, data.strand, data.section, data.deviceID, data.loginTime], function(err){
		if (err) {
			return console.error("SQLite Insert Error:", err.message);
		}
		console.log(`Success: User ${data.firstName} ${data.lastName} updated. Rows affected: ${this.changes}`);
	});
};

/*express stuff*/

argus.use(express.json())

argus.post('/device', (req, res) => {
	console.log('DEVICE DATA RECEIVED');
	console.log(req.body);
	res.sendStatus(200);
	
	watchdogStore(req.body);
});

argus.post('/user', (req, res) => {
	console.log('USER DATA RECEIVED');
	console.log(req.body);
	res.sendStatus(200);
	
	lockStore(req.body);
});

argus.get('/data/device', (req, res) => {
	console.log('DEVICE DATA REQUESTED');
});

argus.listen(port, () => {
	console.log(`ARGUS listening on port ${port}`)
});
