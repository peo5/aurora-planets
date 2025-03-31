function SettingsView(settings, callback) {
	this.el = document.createElement("div")
	this.el.style.boxSizing = "border-box"
	this.el.style.minWidth = "200px"
	this.el.style.maxWidth = "300px"
	this.el.style.height = "fit-content"
	this.el.style.flexGrow = "0.1"
	this.el.style.background = "#fff2"
	this.el.style.color = "#fff"
	this.el.style.padding = "8px"
	this.el.style.borderRadius = "28px"

	const titleEl = document.createElement("h3")
	titleEl.innerText = "Settings"
	titleEl.style.fontSize = "1.5em"
	titleEl.style.fontWeight = "700"
	titleEl.style.fontFamily = "sans"
	titleEl.style.margin = "18px 8px"
	this.el.appendChild(titleEl)

	const jsonEl = document.createElement("pre")
	jsonEl.innerText = JSON.stringify(settings)
	jsonEl.setAttribute("contenteditable", "")
	jsonEl.style.fontSize = "1.2em"
	jsonEl.style.whiteSpace = "pre-wrap"
	jsonEl.style.padding = "8px"
	this.el.appendChild(jsonEl)

	const applyButton = document.createElement("button")
	applyButton.innerText = "apply"
	applyButton.style.width = "100%"
	applyButton.style.height = "48px"
	applyButton.style.color = "#fff"
	applyButton.style.fontFamily = "sans"
	applyButton.style.fontSize = "1.2em"
	applyButton.style.background = "#bbf5"
	applyButton.style.border = "none"
	applyButton.style.borderRadius = "28px"
	this.el.appendChild(applyButton)

	this.apply = function() {
		const settings = JSON.parse(jsonEl.innerText)
		callback(settings)
	}

	applyButton.addEventListener("click", () => this.apply())
	addEventListener("keydown", e => {
		if(e.key == "Enter" && e.ctrlKey) {
			this.apply()
		}
	})
}

export default SettingsView
