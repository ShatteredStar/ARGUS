function cardElement(laptopID, userName, batteryPercentage, usageTime, active){
	let elementClass = '';
	if (active == true){
		elementClass = ' active';
		console.log(elementClass);
	} else {
		elementClass =' inactive';
	};
	return `
		<button class="laptopCard contrast${elementClass}"><span>
			<span class="laptopCardTitle">LP - ${laptopID}</span>
			<br><span class="truncate">${userName}</span>
			<br>${batteryPercentage}
			<br>${usageTime}
		</span></button>
`
};

function cardRow (cards){
	return `
	<div class="grid">
		${cards[0]}
		${cards[1]}
		${cards[2]}
		${cards[3]}
		${cards[4]}
	</div>
`
};

let laptopCardsHTML = `
${cardRow([
	cardElement("67", "User Name", 69, "42:67:69", true),
	cardElement("68", "User Name", 69, "42:67:69", true),
	cardElement("69", "User Name", 69, "42:67:69", true),
	cardElement("70", "User Name", 69, "42:67:69"),
	cardElement("71", "User Name", 69, "42:67:69")
])}
${cardRow([
	cardElement("67", "User Name", 69, "42:67:69"),
	cardElement("68", "User Name", 69, "42:67:69"),
	cardElement("69", "User Name", 69, "42:67:69"),
	cardElement("70", "User Name", 69, "42:67:69"),
	cardElement("71", "User Name", 69, "42:67:69")
])}
${cardRow([
	cardElement("67", "User Name", 69, "42:67:69"),
	cardElement("68", "User Name", 69, "42:67:69"),
	cardElement("69", "User Name", 69, "42:67:69"),
	cardElement("70", "User Name", 69, "42:67:69"),
	cardElement("71", "User Name", 69, "42:67:69")
])}
`

document.getElementById("laptopCards").innerHTML = laptopCardsHTML;

console.log(laptopCardsHTML)