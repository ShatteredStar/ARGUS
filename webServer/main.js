const express = require("express");
const session = require("express-session");
const sqlite = require("sqlite3");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

require("dotenv").config();

const argus = express();
const port = 3000;

argus.use(express.static("public"));
argus.set("view engine", "ejs");
argus.use(express.json());
argus.use(
	session({
		secret: process.env.PASSWORD_SECRET,
		resave: false,
		saveUninitialized: false,
	}),
);

function requireAuth(req, res, next) {
	if (req.session && req.session.isAdmin) {
		next();
	} else {
		res.redirect("/login");
	}
}

/*database stuff*/

let argusDB = new sqlite.Database("./argus.db", (err) => {
	if (err) {
		console.error(err.message);
		return;
	}
	console.log("loaded sqlite db");

	argusDB.run(
		`CREATE TABLE IF NOT EXISTS devices (
		deviceID TEXT PRIMARY KEY,
		battery INTEGER,
		bootTime TEXT,
		wifi TEXT,
		lastPing TEXT
	)`,
		(err) => {
			if (err) {
				console.error("Error creating devices table:", err.message);
			} else {
				console.log("devices table ready");
			}
		},
	);

	argusDB.run(
		`CREATE TABLE IF NOT EXISTS users (
		firstName TEXT,
		lastName TEXT,
		grade TEXT,
		strand TEXT,
		section TEXT,
		deviceID TEXT,
		loginTime TEXT
	)`,
		(err) => {
			if (err) {
				console.error("Error creating users table:", err.message);
			} else {
				console.log("users table ready");
			}
		},
	);
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

const userHistorySQL = `
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
`;

function watchdogStore(data) {
	argusDB.run(
		watchdogSQL,
		[
			data.deviceName,
			data.batteryPercentage,
			data.bootTime,
			data.wifi,
			data.lastPing,
		],
		function (err) {
			if (err) {
				return console.error("SQLite Insert Error:", err.message);
			}
			console.log(
				`Success: Device ${data.deviceName} updated. Rows affected: ${this.changes}`,
			);
		},
	);
}

function lockStore(data) {
	argusDB.run(
		lockSQL,
		[
			data.firstName,
			data.lastName,
			data.grade,
			data.strand,
			data.section,
			data.deviceID,
			data.loginTime,
		],
		function (err) {
			if (err) {
				return console.error("SQLite Insert Error:", err.message);
			}
			console.log(
				`Success: User ${data.firstName} ${data.lastName} updated. Rows affected: ${this.changes}`,
			);
		},
	);
}

function getUserHistory() {
	return new Promise((resolve, reject) => {
		argusDB.all(userHistorySQL, [], (err, rows) => {
			if (err) return reject(err);

			userHistoryData = {};

			rows.forEach((row) => {
				if (!userHistoryData[row.deviceID]) {
					userHistoryData[row.deviceID] = [];
				}

				userHistoryData[row.deviceID].push({
					firstName: row.firstName,
					lastName: row.lastName,
					grade: row.grade,
					strand: row.strand,
					section: row.section,
					loginTime: row.loginTime,
				});
			});

			resolve(userHistoryData);
		});
	});
}

function getDashboard() {
	return new Promise((resolve, reject) => {
		argusDB.all(dashboardSQL, [], (err, rows) => {
			const dashboardData = [];
			const dashboardUsers = [];

			rows.forEach((row) => {
				const lastPingDate = new Date(row.lastPing.replace(" ", "T"));
				const now = new Date();
				const isActive = now - lastPingDate < 1 * (10 * 1000); //10 second delay before being marked inactive

				dashboardData.push({
					deviceID: row.deviceID,
					battery: row.battery,
					wifi: row.wifi,
					active: isActive,
					lastPing: row.lastPing,
					user: {
						firstName: row.firstName,
						lastName: row.lastName,
						loginTime: row.loginTime,
					},
				});
			});
			resolve(dashboardData);
		});
	});
}

function getConfig() {
	const configPath = path.join(__dirname, "config.json");
	const configFile = fs.readFileSync(configPath, "utf-8");
	return JSON.parse(configFile);
}

/*express stuff*/

argus.use(express.json());

argus.post("/api/device", (req, res) => {
	console.log("DEVICE DATA RECEIVED");
	console.log(req.body);
	res.sendStatus(200);

	watchdogStore(req.body);
});

argus.post("/api/user", (req, res) => {
	console.log("USER DATA RECEIVED");
	console.log(req.body);
	res.sendStatus(200);

	lockStore(req.body);
});

argus.post("/api/sign-qr", (req, res) => {
	console.log("SIGNING QR");

	const hmac = crypto.createHmac("sha256", process.env.HMACSIG_KEY);

	hmac.update(req.body.qrData);
	const digest = hmac.digest("hex");

	console.log(`Value: ${req.body.qrData}`);
	console.log(`Signed: ${digest}`);

	res.status(200).send(digest);
});

argus.get("/api/dashboard-update", async (req, res) => {
	console.log("DASHBOARD UPDATE REQUESTED");
	const data = {
		dashboardData: await getDashboard(),
		userHistoryData: await getUserHistory(),
	};
	res.json(data);
});

argus.get("/login", async (req, res) => {
	console.log("login ping");
	res.render("login", {});
});

argus.get("/create-qr", requireAuth, async (req, res) => {
	console.log("qr ping");
	res.render("qr", {
		config: JSON.stringify(await getConfig()),
	});
});

argus.get("/", requireAuth, async (req, res) => {
	console.log("dashboard ping");
	res.render("dashboard", {
		dashboardData: JSON.stringify(await getDashboard()),
		userHistoryData: JSON.stringify(await getUserHistory()),
	});
});

argus.post("/login", (req, res) => {
	if (req.body.password === process.env.ADMIN_PASSWORD) {
		req.session.isAdmin = true;
		res.redirect("/");
	} else {
		res.status(401).json({ error: "Incorrect password" });
	}
});

argus.get("/logout", (req, res) => {
	req.session.destroy();
	res.redirect("/login");
});

//argus.listen(port, () => {console.log(`ARGUS listening on port ${port}`)});

argus.listen(port, "0.0.0.0", () => {
	console.log(`Server is live on the local network with port ${port}`);
});
