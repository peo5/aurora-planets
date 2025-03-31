import { RotationMatrix } from "methods/LinearMethods.mjs"
import { createIcosahedralSphere, getEdges } from "methods/SphericalGraphMethods.mjs"
import { getNoise, getIslandCountours } from "methods/ContourMethods.mjs"

import IslandView from "views/IslandView.mjs"

function PlanetView(template = {}) {
	this.el = document.createElementNS("http://www.w3.org/2000/svg", "svg")
	this.el.setAttribute("viewBox", "-100 -100 200 200")
	this.el.setAttribute("preserveAspectRatio", "")

	const [positions, faces, adjacency] = createIcosahedralSphere(3)
	const edges = getEdges(faces, adjacency)

	function randomColor() {
		const hex = ['0','1','2','3','4','5','6','7','8','9','a','b','c','d','e','f']
		const r = Math.round(Math.random()*15)
		const g = Math.round(Math.random()*15)
		const b = Math.round(Math.random()*15)
		return `#${hex(r)}${hex(g)}${hex(b)}`
	}

	function instantiateLayer(layer, radius, prevNoise = getNoise(positions, edges)) {
		const divergence = layer.divergence || 1
		const span = layer.span || 0.5
		const color = layer.color || randomColor()
		const noise = prevNoise.map(value => (1-divergence)*value + divergence*Math.random())
		const view = new IslandView(color, radius)
		const contour = getIslandCountours(positions, faces, adjacency, noise, span)
		return [view, contour, noise]
	}

	this.setTemplate = function(template = {}) {
		const atmosphere = template.atmosphere
		const layers = template.layers
		const radius = 100 - (atmosphere && atmosphere.height ? atmosphere.height : 0)

		const circleEl = document.createElementNS("http://www.w3.org/2000/svg", "circle")
		circleEl.setAttribute("cx", 0)
		circleEl.setAttribute("cy", 0)
		circleEl.setAttribute("r", radius)
		circleEl.setAttribute("fill", template.color || randomColor())
		circleEl.setAttribute("stroke", "none")

		const layerInstances = []
		if(template.layers) {
			let prevNoise = getNoise(positions, edges)
			for(const layer of layers) {
				layerInstances.push(instantiateLayer(layer, radius, prevNoise))
				prevNoise = layerInstances[layerInstances.length-1][2]
			}
		}

		if(atmosphere) {
			const prevNoise = layerInstances[layerInstances.length-1][2]
			layerInstances.push(instantiateLayer(atmosphere, 100))
		}

		this.el.innerHTML = ""
		this.el.appendChild(circleEl)
		for(const [view, contour] of layerInstances) {
			this.el.appendChild(view.el)
			view.draw(contour)
		}

		this.setRotation = function(rotation = new RotationMatrix(0,0,0)) {
			for(const [view, contour] of layerInstances) {
				view.draw(contour.map(island => island.map(position => rotation.multiply(position))))
			}
		}
	}

	this.setTemplate(template)
}

export default PlanetView
