import { RotationMatrix } from "methods/LinearMethods.mjs"
import { createIcosahedralSphere, getEdges } from "methods/SphericalGraphMethods.mjs"
import { getNoise, getIslandCountours } from "methods/ContourMethods.mjs"

import IslandView from "views/IslandView.mjs"

function PlanetView(templates) {
	if(templates == undefined || templates.length == 0)
		templates = [{color: "rgb(80,80,80)"}]

	this.el = document.createElementNS("http://www.w3.org/2000/svg", "svg")
	this.el.setAttribute("viewBox", "-100 -100 200 200")
	this.el.setAttribute("preserveAspectRatio", "")

	const circleEl = document.createElementNS("http://www.w3.org/2000/svg", "circle")
	circleEl.setAttribute("cx", 0)
	circleEl.setAttribute("cy", 0)
	circleEl.setAttribute("r", 95)
	circleEl.setAttribute("fill", templates[0].color)
	circleEl.setAttribute("stroke", "none")

	const layers = []
	if(templates.length > 1) {
		const [positions, faces, adjacency] = createIcosahedralSphere(3)
		const edges = getEdges(faces, adjacency)
		let noise = getNoise(positions, edges)
		for(let i=1; i<templates.length; ++i) {
			const divergence = templates[i].divergence
			if(divergence)
				noise = noise.map(value => (1-divergence)*value + divergence*Math.random())
			const view = new IslandView(templates[i].color)
			const contour = getIslandCountours(positions, faces, adjacency, noise, templates[i].span)
			layers.push([view, contour])
		}
	}

	this.el.appendChild(circleEl)
	for(const [view, contour] of layers) {
		this.el.appendChild(view.el)
		view.draw(contour, 100)
	}

	this.setRotation = function(rotation = new RotationMatrix(0,0,0)) {
		for(const [view, contour] of layers.slice(0,layers.length-1))
			view.draw(contour.map(island => island.map(position => rotation.multiply(position))), 95)
		layers[layers.length-1][0].draw(layers[layers.length-1][1].map(island => island.map(position => rotation.multiply(position))), 100)
	}
}

export default PlanetView
