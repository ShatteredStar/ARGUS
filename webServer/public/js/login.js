const passwordToggleEl = document.getElementById("loginPasswordToggle");
const passwordInputEl = document.getElementById("loginPasswordInput");
const passwordTextEl = document.getElementById("loginPasswordText");
const passwordSubmitEl = document.getElementById("loginPasswordSubmit");

passwordToggleEl.addEventListener("change", function () {
	if (passwordToggleEl.checked) {
		passwordInputEl.type = "text";
		passwordTextEl.innerText = "Hide Password";
	} else {
		passwordInputEl.type = "password";
		passwordTextEl.innerText = "Show Password";
	}
});

passwordSubmitEl.addEventListener("click", function (e) {
	e.preventDefault();
	let password = passwordInputEl.value;

	fetch("/login", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ password: password }),
	}).then(function (res) {
		if (res.redirected) {
			window.location.href = res.url;
			return;
		}
		if (res.status === 401) {
			passwordSubmitEl.classList.add("error")
			setTimeout(
				() => passwordSubmitEl.classList.remove("error"),
				300,
			);
		}
	});
});
