import { RotationMatrix } from "methods/LinearMethods.mjs"

import AnimatorService from "services/AnimatorService.mjs"
import PlanetView from "views/PlanetView.mjs"
import TemplateView from "views/TemplateView.mjs"

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

	const planetTemplate = {
		"seed": "mac0300",
		"resolution": 4,
		"color": "rgb(80,120,180)",
		"noises": {
			"a": {
				"seed-suffix": "noise A",
				"octave-strengths": [
					2,
					8,
					2,
					8
				]
			},
			"b": {
				"octave-strengths": [
					1,
					8,
					2,
					4
				],
				"seed-suffix": "b"
			},
			"clouds": {
				"octave-strengths": [
					2,
					1,
					4,
					4
				],
				"seed-suffix": "clouds"
			}
		},
		"layers": [
			{
				"noise-strengths": {
					"a": 2,
					"b": 1
				},
				"span": 0.35,
				"color": "rgb(110,50,90)"
			},
			{
				"noise-strengths": {
					"a": 1,
					"b": 2
				},
				"span": 0.25,
				"color": "rgb(160,80,100)"
			}
		],
		"clouds": {
			"noise-strengths": {
				"clouds": 1
			},
			"span": 0.1,
			"color": "rgb(200,250,180)",
			"height": 5
		},
		"atmosphere": {
			"color": "rgb(200,250,180)",
			"height": 18
		}
	}
	const planet = new PlanetView(planetTemplate)
	planet.el.style.width = "100%"
	planetNestEl.appendChild(planet.el)

	const collectionTemplate = [
		"mac0300",
		{
			"name": "mac0327",
			"seed": "coxa"
		},
		"mac0325"
	]

	const templateView = new TemplateView(planetTemplate, collectionTemplate, template => {
		planet.setTemplate(template)
	})
	nestEl.appendChild(templateView.el)

	let angle = 0
	const animator = new AnimatorService(deltaTime => {
		const rotation = new RotationMatrix(0,angle,angle)
		planet.setRotation(rotation)
		angle += 0.07*Math.PI*deltaTime
	})
	// animator.play()
}

export { init }
