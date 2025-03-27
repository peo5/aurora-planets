import { RotationMatrix } from "methods/LinearMethods.mjs"

import PlanetView from "views/PlanetView.mjs"
import AnimatorService from "services/AnimatorService.mjs"

function init() {
	const nestEl = document.createElement("div")
	nestEl.style.display = "flex"
	nestEl.style.alignItems = "stretch"
	nestEl.style.justifyContent = "center"
	nestEl.style.boxSizing = "border-box"
	nestEl.style.width = "100%"
	nestEl.style.height = "100%"
	nestEl.style.padding = "15vh 15vw"

	const planet = new PlanetView([
		{color: "rgb(80,30,100)"},
		{color: "rgb(50,50,120)", span: 0.3},
		{color: "rgb(50,40,140)", span: 0.5, divergence: 0.3},
		{color: "rgb(150,30,160)", span: 0.7, divergence: 0.9},
	])

	nestEl.appendChild(planet.el)
	document.body.appendChild(nestEl)

	let angle = 0
	const animator = new AnimatorService(deltaTime => { 
		const rotation = new RotationMatrix(0,angle,angle) 
		planet.setRotation(rotation)
		angle += 0.07*Math.PI*deltaTime
	})
	animator.play() 
}

export { init }
