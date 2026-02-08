const express = require('express');
const sqlite = require('sqlite3');

const argus = express();
const port = 3000;

argus.use(express.static('public'));
argus.set('view engine', 'ejs');

/*database stuff*/

let argusDB = new sqlite.Database('./argus.db', (err) => {
	if (err) {
		console.error(err.message);
	}
	console.log('loaded sqlite db');
});

const watchdogSQL = `
	INSERT INTO devices (deviceID, battery, bootTime, wifi, lastPing)
	values (?, ?, ?, ?, ?)
	ON CONFLICT(deviceID) DO UPDATE SET
		battery = excluded.battery,
		bootTime = excluded.bootTime,
		wifi = excluded.wifi,
		lastPing = excluded.lastPing
`;

const lockSQL = `
	INSERT INTO users (firstName, lastName, grade, strand, section, deviceID, loginTime)
	values (?, ?, ?, ?, ?, ?, ?)
`;

const dashboardSQL = `
SELECT 
    d.deviceID, 
    d.battery, 
    d.lastPing,
	d.wifi,
    u.firstName,
    u.lastName,
    u.loginTime
FROM devices d
LEFT JOIN users u ON u.rowid = (
    SELECT rowid FROM users 
    WHERE deviceID = d.deviceID 
    ORDER BY loginTime DESC
)
ORDER BY u.loginTime DESC;
`;

const userHistorySQL= `
SELECT
	u.firstName,
	u.lastName,
	u.grade,
	u.strand,
	u.section,
	u.deviceID,
	u.loginTime
FROM users u
ORDER BY u.loginTime DESC;
`

function watchdogStore(data){
	argusDB.run(watchdogSQL, [data.deviceName, data.batteryPercentage, data.bootTime, data.wifi, data.lastPing], function(err) {
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

function getUserHistory(){
	return new Promise((resolve, reject) => {
		argusDB.all(userHistorySQL, [], (err, rows) => {
			if (err) return reject (err);
			
			userHistoryData = {};
			
			rows.forEach(row =>{
				if (!userHistoryData[row.deviceID]){
					userHistoryData[row.deviceID] = [];
				};
				
				userHistoryData[row.deviceID].push({
					firstName: row.firstName,
					lastName: row.lastName,
					grade: row.grade,
					strand: row.strand,
					section: row.section,
					loginTime: row.loginTime
				})
			})
			
			resolve(userHistoryData);
		})
	});
};

function getDashboard(){
	return new Promise((resolve, reject) => {
		argusDB.all(dashboardSQL, [], (err, rows) => {
			const dashboardData = [];
			const dashboardUsers = [];
		
			rows.forEach(row => {
				const lastPingDate = new Date(row.lastPing.replace(' ', 'T'));
				const now = new Date();
				const isActive = (now -lastPingDate) < (1*(60*1000));
				
				dashboardData.push({
					deviceID: row.deviceID,
					battery: row.battery,
					wifi: row.wifi,
					active: isActive,
					lastPing: row.lastPing,
					user: {
						firstName: row.firstName,
						lastName: row.lastName,
						loginTime: row.loginTime
					}
				});
			});
			resolve(dashboardData);
		});
	});
};

/*express stuff*/

argus.use(express.json())

argus.post('/api/device', (req, res) => {
	console.log('DEVICE DATA RECEIVED');
	console.log(req.body);
	res.sendStatus(200);
	
	watchdogStore(req.body);
});

argus.post('/api/user', (req, res) => {
	console.log('USER DATA RECEIVED');
	console.log(req.body);
	res.sendStatus(200);
	
	lockStore(req.body);
});

argus.get('/api/dashboard-update', async (req, res) => {
	console.log('DASHBOARD UPDATE REQUESTED');
	const data = {
		dashboardData: await getDashboard(),
		userHistoryData: await getUserHistory()
	};
	res.json(data);
});

argus.get('/dashboard', async (req, res) => {
	console.log('dashboard ping');
	res.render('dashboard', {
		dashboardData: JSON.stringify(await getDashboard()),
		userHistoryData: JSON.stringify(await getUserHistory())
	});
});

argus.listen(port, () => {
	console.log(`ARGUS listening on port ${port}`)
});
