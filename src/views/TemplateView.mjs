import { downloadCollection } from "methods/CollectionMethods.mjs"

function JSONView(defaultValue, buttonText, callback) {
	let value = defaultValue
	let active = true

	this.el = document.createElement("div")
	this.el.style.boxSizing = "border-box"
	this.el.style.display = "flex"
	this.el.style.flexDirection = "column"
	this.el.style.minHeight = "0"

	const jsonNestEl = document.createElement("div")
	jsonNestEl.style.overflowY = "auto"
	jsonNestEl.style.width = "100%"
	this.el.appendChild(jsonNestEl)

	const jsonEl = document.createElement("pre")
	jsonEl.innerText = JSON.stringify(value, undefined, 2)
	jsonEl.setAttribute("contenteditable", "")
	jsonEl.style.fontSize = "1.2em"
	jsonEl.style.whiteSpace = "pre-wrap"
	jsonEl.style.padding = "8px"
	jsonEl.style.margin = "none"
	jsonNestEl.appendChild(jsonEl)

	const errorEl = document.createElement("span")
	errorEl.style.display = "none"
	errorEl.style.fontFamily = "sans"
	errorEl.style.color = "#fa9"
	this.el.appendChild(errorEl)

	const applyButton = document.createElement("button")
	applyButton.innerText = buttonText
	/*
	applyButton.style.width = "100%"
	applyButton.style.height = "48px"
	applyButton.style.color = "#fff"
	applyButton.style.fontFamily = "sans"
	applyButton.style.fontSize = "1.2em"
	applyButton.style.background = "#bbf5"
	applyButton.style.border = "none"
	applyButton.style.borderRadius = "28px"
	applyButton.style.marginTop = "1em"
	*/
	applyButton.style.width = "fit-content"
	this.el.appendChild(applyButton)

	this.handleApply = function() {
		errorEl.style.display = "none"
		try {
			value = JSON.parse(jsonEl.innerText)
			jsonEl.innerText = JSON.stringify(value, undefined, 2)
			callback(value)
		} catch(error) {
			errorEl.innerText = error.message
			errorEl.style.display = "inline"
		}
	}

	this.getValidValue = function() {
		return value
	}

	this.setActive = function(newActive) {
		active = newActive
		this.el.style.display = active ? "flex" : "none"
	}

	applyButton.addEventListener("click", () => this.handleApply())
	addEventListener("keydown", e => {
		if(active) {
			if(e.key == "Enter" && e.ctrlKey) {
				this.handleApply()
			}
		}
	})
}

function TemplateView(planetDefaultValue, collectionDefaultValue, callback) {
	this.el = document.createElement("div")
	this.el.style.boxSizing = "border-box"
	this.el.style.display = "flex"
	this.el.style.flexDirection = "column"
	this.el.style.width = "fit-content"
	this.el.style.height = "fit-content"
	this.el.style.maxHeight = "100%"
	this.el.style.width = "30vw"
	this.el.style.background = "#fff2"
	this.el.style.color = "#fff"
	this.el.style.padding = "8px"
	this.el.style.borderRadius = "28px"

	const titleEl = document.createElement("h3")
	titleEl.innerText = "Template"
	titleEl.style.fontSize = "1.5em"
	titleEl.style.fontWeight = "700"
	titleEl.style.fontFamily = "sans"
	titleEl.style.margin = "1em 0.5em"
	this.el.appendChild(titleEl)

	const selectorNestEl = document.createElement("div")
	this.el.appendChild(selectorNestEl)

	let currentSelection = 0

	const planetJSONView = new JSONView(planetDefaultValue, "apply", callback)
	planetJSONView.setActive(true)
	this.el.appendChild(planetJSONView.el)

	const collectionJSONView = new JSONView(collectionDefaultValue, "download", template => {
		downloadCollection(template, planetJSONView.getValidValue())
	})
	collectionJSONView.setActive(false)
	this.el.appendChild(collectionJSONView.el)
	
	const planetSelectorEl = document.createElement("button")
	planetSelectorEl.innerText = "planet"
	selectorNestEl.appendChild(planetSelectorEl)
	planetSelectorEl.addEventListener("click", () => {
		if(currentSelection == 1) {
			planetJSONView.setActive(true)
			collectionJSONView.setActive(false)
			currentSelection = 0
		}
	})

	const collectionSelectorEL = document.createElement("button")
	collectionSelectorEL.innerText = "collection"
	selectorNestEl.appendChild(collectionSelectorEL)
	collectionSelectorEL.addEventListener("click", () => {
		if(currentSelection == 0) {
			planetJSONView.setActive(false)
			collectionJSONView.setActive(true)
			currentSelection = 1
		}
	})
}

export default TemplateView
