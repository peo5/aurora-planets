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
		const cloud = template.cloud
		const atmosphere = template.atmosphere
		const layers = template.layers
		const radius = 100 - (atmosphere && atmosphere.height || 0) - (cloud && cloud.height || 0)
		console.log("radius", radius)

		const layerInstances = []
		if(template.layers) {
			let prevNoise = getNoise(positions, edges)
			for(const layer of layers) {
				layerInstances.push(instantiateLayer(layer, radius, prevNoise))
				prevNoise = layerInstances[layerInstances.length-1][2]
			}
		}

		this.el.innerHTML = `
<defs>
<radialGradient id="planet_shaddow_gradient" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(-20 -20) rotate(60) scale(120)">
<stop stop-color="#0A1627" stop-opacity="0"/>
<stop offset="0.6" stop-color="#0A1627" stop-opacity="0.1"/>
<stop offset="1" stop-color="#0A1627" stop-opacity="0.7"/>
</radialGradient>
<radialGradient id="cloud_shaddow_gradient" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(-30 -30) rotate(60) scale(130)">
<stop stop-color="#0A1627" stop-opacity="0"/>
<stop offset="0.6" stop-color="#0A1627" stop-opacity="0.1"/>
<stop offset="1" stop-color="#0A1627" stop-opacity="0.7"/>
</radialGradient>
<radialGradient id="diffraction_alpha" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(-30 -30) rotate(60) scale(100 160)">
<stop stop-color="#FF0000"/>
<stop offset="0.60" stop-color="#FF0000" stop-opacity="0.65"/>
<stop offset="1" stop-color="#FF0000" stop-opacity="0"/>
</radialGradient>
<radialGradient id="diffraction_gradient" cx="0" cy="0" r="100" gradientUnits="userSpaceOnUse">
<stop stop-color="#F6FFCF" stop-opacity="0.2"/>
<stop offset="0.75" stop-color="#F6FFCF"/>
<stop offset="0.9" stop-color="#F6FFCF" stop-opacity="0"/>
</radialGradient>
</defs>
		`

		const circleEl = document.createElementNS("http://www.w3.org/2000/svg", "circle")
		circleEl.setAttribute("cx", 0)
		circleEl.setAttribute("cy", 0)
		circleEl.setAttribute("r", radius)
		circleEl.setAttribute("fill", template.color || randomColor())
		circleEl.setAttribute("stroke", "none")
		this.el.appendChild(circleEl)

		for(const [view, contour] of layerInstances) {
			this.el.appendChild(view.el)
			view.draw(contour)
		}

		const cloudMaskEl = document.createElementNS("http://www.w3.org/2000/svg", "mask")
		cloudMaskEl.setAttribute("id", "cloud_mask")
		cloudMaskEl.setAttribute("maskUnits", "userSpaceOnUse")
		cloudMaskEl.setAttribute("x", "-100")
		cloudMaskEl.setAttribute("y", "-100")
		cloudMaskEl.setAttribute("width", "200")
		cloudMaskEl.setAttribute("height", "200")
		cloudMaskEl.style.maskType = "alpha"
		this.el.appendChild(cloudMaskEl)
		if(cloud) {
			const prevNoise = layerInstances[layerInstances.length-1][2]
			const cloudRadius = 100 - (atmosphere && atmosphere.height || 0)
			const cloudLayerInstance = instantiateLayer(cloud, cloudRadius)
			const [view, contour] = cloudLayerInstance
			cloudMaskEl.appendChild(view.el)
			view.draw(contour)
			layerInstances.push(cloudLayerInstance)
		}

		const atmosphereEl = document.createElementNS("http://www.w3.org/2000/svg", "g")
		atmosphereEl.innerHTML = `
<circle cx="0" cy="0" r="${radius}" fill="url(#planet_shaddow_gradient)"/>

<g mask="url(#cloud_mask)">
<circle cx="0" cy="0" r="100" fill="${cloud.color || 'white'}"/>
<circle cx="0" cy="0" r="100" fill="url(#cloud_shaddow_gradient)"/>
</g>

<mask id="diffraction_mask" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="-100" y="-100" width="200" height="200">
<circle cx="0" cy="0" r="100" fill="url(#diffraction_alpha)"/>
</mask>

<g mask="url(#diffraction_mask)">
<circle cx="0" cy="0" r="100" opacity="0.41" fill="url(#diffraction_gradient)"/>
</g>
`
		this.el.appendChild(atmosphereEl)


		this.setRotation = function(rotation = new RotationMatrix(0,0,0)) {
			for(const [view, contour] of layerInstances) {
				view.draw(contour.map(island => island.map(position => rotation.multiply(position))))
			}
		}
	}

	this.setTemplate(template)
}

export default PlanetView
