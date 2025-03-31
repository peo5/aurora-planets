import { RotationMatrix } from "methods/LinearMethods.mjs"

import AnimatorService from "services/AnimatorService.mjs"
import PlanetView from "views/PlanetView.mjs"
import SettingsView from "views/SettingsView.mjs"

function init() {
	const nestEl = document.createElement("div")
	nestEl.style.display = "flex"
	nestEl.style.alignItems = "stretch"
	nestEl.style.justifyContent = "space-between"
	nestEl.style.boxSizing = "border-box"
	nestEl.style.width = "100%"
	nestEl.style.height = "100%"
	nestEl.style.padding = "28px"
	document.body.appendChild(nestEl)

	const planetNestEl = document.createElement("div")
	planetNestEl.style.display = "flex"
	planetNestEl.style.alignItems = "stretch"
	planetNestEl.style.justifyContent = "center"
	planetNestEl.style.boxSizing = "border-box"
	planetNestEl.style.flexGrow = "1"
	planetNestEl.style.padding = "0 28px"
	nestEl.appendChild(planetNestEl)

	const planetJSON = `{
		"color": "rgb(80,120,180)",
		"layers": [
			{"color": "rgb(110,50,90)", "span": 0.5},
			{"color": "rgb(160,80,100)", "span": 0.7, "divergence": 0.3}
		],
		"atmosphere": {
			"color": "rgb(200,250,180)",
			"span": 0.7,
			"divergence": 0.9,
			"height": 5
		}
	}`

	const planetSettings = JSON.parse(planetJSON)
	const planet = new PlanetView(planetSettings)
	planet.el.style.width = "100%"
	planetNestEl.appendChild(planet.el)

	const settingsView = new SettingsView(planetSettings, settings => {
		planet.setTemplate(settings)
	})
	nestEl.appendChild(settingsView.el)

	let angle = 0
	const animator = new AnimatorService(deltaTime => {
		const rotation = new RotationMatrix(0,angle,angle)
		planet.setRotation(rotation)
		angle += 0.07*Math.PI*deltaTime
	})
	animator.play() 
}

export { init }
