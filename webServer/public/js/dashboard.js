let dashboardDataBattery = [];
let dashboardDataLaptop = [];

function sortDashboardData () {
	dashboardDataBattery = [...window.dashboardDataRecent].sort(function(a, b){
		if (a.battery < b.battery){
			return -1;
		} else {
			return 1
		};
	});
	
	dashboardDataLaptop = [...window.dashboardDataRecent].sort(function(a, b) {
		const result = a.deviceID.localeCompare(b.deviceID);
	
		if (result < 0) {
			return -1;
		} else if (result > 0) {
			return 1;
		} else {
			return 0;
		}
	});
};
//auto sorts before requests to /api/dashboard-update
sortDashboardData();


async function dashboardDataUpdate(){
	try {
		const response = await fetch('/api/dashboard-update');
		const responseJson = await response.json();
		window.dashboardDataRecent = responseJson.dashboardData;
		sortDashboardData();
		console.log('request sent')
		
		if (document.getElementById("cardsSearch").value === ''){
			if (selectedSort === 'Most Recent'){
				renderCards(dashboardDataRecent);
			} else if (selectedSort === "Lowest Battery%"){
				renderCards(dashboardDataBattery);
			} else if (selectedSort === "Laptop Number"){
				renderCards(dashboardDataLaptop);
			}
		} else {
			console.log('canceled dashboard update, searchbar has content');
		};
	} catch (error) {
		console.error(`Dashboard Fetch Error: ${error}`)
	};
};
setInterval(dashboardDataUpdate, 3000);

function batteryIcon(percent){
	let icon = '';
	if (percent < 10){
		icon = '0';
		} else if (percent < 28){
		icon = '1';
		} else if (percent < 46){
		icon = '2';
		} else if (percent < 64){
		icon = '3';
		} else if (percent < 82){
		icon = '4';
		} else if (percent < 99){
		icon = '5';
		} else {
		icon = 'full';
	}
	return icon;
};

function cardElement(laptopID, userName, batteryPercentage, time, active, arrayPos){
	let elementClass = '';
	let timeIcon = '';
	let timeData = '';
	let batteryWarningIcon = '';
	let batteryWarningTooltip = '';
	
	if (batteryPercentage < 41){
		batteryWarningIcon = '<img src="/assets/icons/batteryLow.svg" height=40 class="batteryWarningIcon">';
		batteryWarningTooltip = 'data-tooltip="Low Battery"'
	};
	
	if (active == true){
		elementClass = ' active';
		timeIcon = 'usageTime';
		timeData = time.user.loginTime;
		} else {
		elementClass =' inactive';
		timeIcon = 'lastUsed'
		timeData = time.lastPing;
	};
	return `
	<button class="laptopCard contrast${elementClass}" data-position="${arrayPos}" ${batteryWarningTooltip}><div>
	<span class="laptopCardTitle">${batteryWarningIcon}LP - ${laptopID}</span>
	<div class="truncate"> <img src="/assets/icons/user.svg" height=20> ${userName} </div>
	<div> <img src="/assets/icons/battery${batteryIcon(batteryPercentage)}.svg" height=20> ${batteryPercentage}% </div>
	<div> <img src="/assets/icons/${timeIcon}.svg" height=20> <span id=usageTime data-datetime="${timeData}"></span> </div>
	</div></button>
	`
};

function cardRow (cards){
	return `
	<div class="grid">
	${cards.join('')}
	</div>
	`
};

sessionTimerInterv = '';
function renderCards(list){
	let laptopCardsHTML = ``
	let generatedCards = [];
	document.getElementById("laptopCards").innerHTML = ``;
	
	for (let i = 0; i < list.length; i++){
		generatedCards.push(cardElement(
			list[i].deviceID,
			`${list[i].user.firstName} ${list[i].user.lastName}`,
			list[i].battery,
			list[i],
			list[i].active,
			i
		));
		
		if (generatedCards.length === 4 || i === list.length - 1){
			laptopCardsHTML += cardRow(generatedCards);
			generatedCards = [];
		};
	};
	document.getElementById("laptopCards").innerHTML = laptopCardsHTML;
	
	//logout time for inactive cards
	for (let i = 0; i < document.querySelectorAll('button.laptopCard.inactive').length; i++){	
		const usageTimeElement = document.querySelectorAll('button.laptopCard.inactive')[i].querySelector('span#usageTime');
		formatLastUsed(usageTimeElement);
	};
	//session timer for active cards
	if (sessionTimerInterv){
		clearInterval(sessionTimerInterv);
	};
	for (let i = 0; i < document.querySelectorAll('button.laptopCard.active').length; i++){
		const usageTimeElement = document.querySelectorAll('button.laptopCard.active')[i].querySelector('span#usageTime');
		updateUsageTime(usageTimeElement);
		sessionTimerInterv = setInterval(updateUsageTime, 1000, usageTimeElement)
	};
};
//initial render
renderCards(dashboardDataRecent);

document.getElementById("cardsSearch").addEventListener('input', function(){
	const tRows = document.querySelectorAll('button.laptopCard');
	
	tRows.forEach(row =>{
		const rowText = row.textContent.toLowerCase();
		
		if (rowText.includes(this.value.toLowerCase())) {
			row.classList.remove('hide');
			}else {
			row.classList.add('hide');
		}
	});
});

let selectedSort = 'Most Recent';
document.getElementById("sortDropdown").addEventListener("click", function(event) {
	if (event.target.tagName === "A") {
		event.preventDefault();
		
		selectedSort = event.target.innerText;
		
		if (selectedSort === "Laptop Number"){
			renderCards(dashboardDataLaptop);
			this.querySelector("summary").innerHTML = 'Sort By: <i>Laptop Number</i>'
			this.querySelectorAll("li a")[0].innerHTML = 'Most Recent';
			this.querySelectorAll("li a")[1].innerHTML = 'Lowest Battery%';
			this.removeAttribute('open');
			} else if (selectedSort === "Lowest Battery%"){
			renderCards(dashboardDataBattery);
			this.querySelector("summary").innerHTML = 'Sort By: <i>Lowest Battery%</i>'
			this.querySelectorAll("li a")[0].innerHTML = 'Most Recent';
			this.querySelectorAll("li a")[1].innerHTML = 'Laptop Number';
			this.removeAttribute('open');
			} else if (selectedSort === "Most Recent"){
			renderCards(dashboardDataRecent);
			this.querySelector("summary").innerHTML = 'Sort By: <i>Most Recent</i>'
			this.querySelectorAll("li a")[0].innerHTML = 'Laptop Number';
			this.querySelectorAll("li a")[1].innerHTML = 'Lowest Battery%';
			this.removeAttribute('open');
		};
	};
});

function updateUsageTime (tElement){
	const loginTime = new Date(tElement.getAttribute('data-datetime').replace(' ', 'T'));
	let now = new Date();
	
	let totalUsageSeconds = Math.floor((now - loginTime) / 1000);
	if (totalUsageSeconds < 0) usageSeconds = 0;
	
	const usageHours = Math.floor(totalUsageSeconds / 3600);
	const usageMinutes = Math.floor((totalUsageSeconds % 3600) / 60);
	const usageSeconds = totalUsageSeconds % 60;
	const pad = (num) => String(num).padStart(2, '0');
	tElement.innerHTML = `${pad(usageHours)}:${pad(usageMinutes)}:${pad(usageSeconds)}`;
};

// format data-datetime attribute of an element to: 10:45AM or Sunday, 10:45AM or Jan/20/26 10:45AM
function formatLastUsed (tElement) {
	const now = new Date();
	const logoutTime = new Date(tElement.getAttribute('data-datetime').replace(' ', 'T'));
	
	const logoutTimeStr = logoutTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
	const timeDiff = (now - logoutTime) / (1000 * 60 * 60 * 24);
	
	if (logoutTime.toDateString() === now.toDateString()){
		tElement.innerText = logoutTimeStr;
		}else if (timeDiff < 7){
		tElement.innerText = `${logoutTime.toLocaleDateString('en-US',{ weekday: 'long' })}, ${logoutTimeStr}`;
		}else {
		const month = logoutTime.toLocaleDateString('en-US', { month: 'short' });
		const day = String(logoutTime.getDate()).padStart(2, '0');
		const year = String(logoutTime.getFullYear()).slice(-2);
		
		tElement.innerText = `${month}/${day}/${year} ${logoutTimeStr}`
	};
};

//modals

const modalElement = document.getElementById('deviceInfoModal');

function userHistoryTable(deviceId){
	document.getElementById("userHistoryInfo").innerHTML = '';
	window.userHistoryData[deviceId].forEach(data => {
		const sortableDate = new Date(data.loginTime.replace(' ', 'T')).getTime();
		document.getElementById("userHistoryInfo").innerHTML += `
		<tr>
		<td><span class="hide">${sortableDate}</span><span data-datetime="${data.loginTime}" class="tableFormatDate"></span></td>
		<td>${data.firstName}</td>
		<td>${data.lastName}</td>
		<td>${data.strand} ${data.grade}-${data.section}</td>
		</tr>
		`;
	});
	document.querySelectorAll('.tableFormatDate').forEach(date => {
		formatLastUsed(date);
	});
	
	const reloadTableSort = document.createElement('script');
	reloadTableSort.src = '/js/table-sort.js';
	document.head.appendChild(reloadTableSort);
};

document.getElementById("tableSearch").addEventListener('input', function(){
	const tRows = document.querySelectorAll('#userHistoryInfo tr');
	
	tRows.forEach(row =>{
		const rowText = row.textContent.toLowerCase();
		
		if (rowText.includes(this.value.toLowerCase())) {
			row.classList.remove('hide');
			}else {
			row.classList.add('hide');
		}
	});
});

document.getElementById("laptopCards").addEventListener('click', (event) => {
	if (event.target.closest(".laptopCard")) {
		const pos = Number(event.target.closest(".laptopCard").getAttribute('data-position'))
		
		if (!modalElement.open){
			const dbData = window.dashboardDataRecent[pos];
			
			document.getElementById("modalHeader").innerText = `LAPTOP ${dbData.deviceID}`;
			
			if (dbData.active){
				document.getElementById("modalUserName").innerText = `Current User:`;
				} else {
				document.getElementById("modalUserName").innerText = `Last User:`;
			};
			document.getElementById("modalUser").innerText = `${dbData.user.firstName} ${dbData.user.lastName}`;
			
			document.getElementById("modalBatteryIcon").src = `/assets/icons/battery${batteryIcon(dbData.battery)}.svg`;
			document.getElementById("modalBattery").innerText = `${dbData.battery}%`;
			document.getElementById("modalWifi").innerText = `${dbData.wifi}`;
			
			if (dbData.active){
				document.getElementById("modalTimeName").innerText = 'Usage Time:'
				document.getElementById("modalTimeIcon").src = `/assets/icons/usageTime.svg`;
				document.getElementById("modalTime").setAttribute('data-datetime', dbData.user.loginTime);
				updateUsageTime(document.getElementById("modalTime"));
				} else {
				document.getElementById("modalTimeName").innerText = 'Logout Time:';
				document.getElementById("modalTimeIcon").src = `/assets/icons/lastUsed.svg`;
				document.getElementById("modalTime").setAttribute('data-datetime', dbData.lastPing);
				formatLastUsed(document.getElementById("modalTime"));
			};
			
			userHistoryTable(dbData.deviceID);
			
			document.documentElement.classList.add('modal-is-opening');
			document.documentElement.classList.add('modal-is-open');
			modalElement.showModal();
			setTimeout(() => {document.documentElement.classList.remove('modal-is-opening');}, 400);
		};
	};
});

function closeModal(){
	document.documentElement.classList.add('modal-is-closing');
	const tableSortScript = document.querySelector('script[src="tablesort.js"]');
	document.getElementById("tableSearch").value = '';
	if (tableSortScript) tableSortScript.remove();
	setTimeout(() => {
		modalElement.close();
		document.documentElement.classList.remove('modal-is-open');
		document.documentElement.classList.remove('modal-is-closing');
		document.getElementById("modalUserHistory").open = false;
	}, 400);
};

modalElement.addEventListener('click', (event) => {
	if (event.target === modalElement || event.target.closest('button[aria-label="Close"]')){
		closeModal();
	}
});

// escape key detection, default esc exit doesnt remove modal-is-open class
modalElement.addEventListener('cancel', (event) => {
	event.preventDefault();
	closeModal();
});

