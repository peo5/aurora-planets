import { RotationMatrix } from "methods/LinearMethods.mjs"
import { createIcosahedralSphere, getEdges } from "methods/SphericalGraphMethods.mjs"
import { getIslandCountours } from "methods/ContourMethods.mjs"
import { setSeed, randomHexColor, randomInt, randomFloat, randomFractalNoise } from "methods/RandomMethods.mjs"

import IslandView from "views/IslandView.mjs"

function fixLayer(layers, key, noises) {
	if(typeof(layers[key]) != "object")
		layers[key] = {}
	const layer = layers[key]
	if(layer["noise-strengths"] == undefined) {
		layer["noise-strengths"] = {}
		layer["noise-strengths"][key] = 1
	}
	for(const strengthKey in layer["noise-strengths"]) {
		if(typeof(layer["noise-strengths"][strengthKey]) != "number")
			layer["noise-strengths"][strengthKey] = 1
		if(noises[strengthKey] == undefined)
			noises[strengthKey] = {}
	}
	if(typeof(layer.span) == "number")
		layer.span = Math.min(Math.max(layer.span,0),1)
	else
		layer.span = 0.5
	if(typeof(layer.color) != "string")
		layer.color = "#555"
}

function fixNoise(noises, key, resolution) {
	if(typeof(noises[key]) != "object")
		noises[key] = {}
	const noise = noises[key]
	if(typeof(noise["seed-suffix"]) != "string") {
		if(typeof(noise["seed-suffix"]) == "number")
			noise["seed-suffix"] = noise["seed-suffix"].toString()
		else
			noise["seed-suffix"] = key + ""
	}
	if(typeof(noise["octave-strengths"]) != "object")
		noise["octave-strengths"] = Array(resolution).fill(1)
	let totalStrength = 0
	for(let strengthKey = 0; strengthKey < resolution; ++strengthKey) {
		const strength = noise["octave-strengths"][strengthKey]
		if(typeof(strength) != "number" || strength < 0)
			noise["octave-strengths"][strengthKey] = 0
		else
			totalStrength += strength
	}
	if(totalStrength == 0)
		noise["octave-strengths"][resolution-1] = 1
}

function fixTemplate(template) {
	if(typeof(template.seed) != "string") {
		if(typeof(template.seed) == "number")
			template.seed = template.seed.toString()
		else
			template.seed += Date.now().toString()
	}
	if(typeof(template.resolution) != "number")
		template.resolution = 2
	if(typeof(template.color) != "string")
		template.color = "#777"
	if(typeof(template["light-angle"]) != "number")
		template["light-angle"] = 220
	if(typeof(template.noises) != "object")
		template.noises = Object.create(null)
	if(typeof(template.layers) != "object")
		template.layers = []
	for(const key in template.layers)
		fixLayer(template.layers, key, template.noises)
	if(template.clouds != undefined) {
		if(typeof(template.clouds) != "object")
			template.clouds = {}
		fixLayer(template, "clouds", template.noises)
		if(typeof(template.clouds.height) != "number")
			template.clouds.height = 5
	}
	for(const key in template.noises)
		fixNoise(template.noises, key, template.resolution)
	if(template.atmosphere != undefined) {
		if(typeof(template.atmosphere) != "object")
			template.atmosphere = {}
		if(typeof(template.atmosphere.color) != "string")
			template.atmosphere.color = "#EEE"
		if(typeof(template.atmosphere.opacity) != "number")
			template.atmosphere.opacity = 0.5
		if(typeof(template.atmosphere.height) != "number")
			template.atmosphere.height = 5
	}
	if(template.shadow != undefined) {
		if(typeof(template.shadow) != "object")
			template.atmosphere = {}
		if(typeof(template.shadow.color) != "string")
			template.atmosphere.color = "#111"
		if(typeof(template.shadow.opacity) != "number")
			template.atmosphere.opacity = 1
	}
	console.log("fixed template", JSON.stringify(template, undefined, 2))
}

function blendNoises(noises, strengths) {
	let blend = undefined
	let totalStrength = 0
	for(const key in strengths)
		totalStrength += strengths[key]
	for(const key in strengths) {
		if(blend == undefined)
			blend = noises[key].map(a => a/totalStrength*strengths[key])
		else
			blend = blend.map((a,i) => a+noises[key][i]/totalStrength*strengths[key])
	}
	return blend
}

function instantiateLayer(
	layer,
	radius,
	noises,
	[positions, faces, adjacency],
) {
	const divergence = layer.divergence
	const span = 1-layer.span
	const color = layer.color
	const noise = blendNoises(noises, layer["noise-strengths"])
	const contour = getIslandCountours(positions, faces, adjacency, noise, span)
	return new IslandView(contour, color, radius, true, noise, span)
}

function getBorderVertexBrute(positions, faces, adjacency, rotation) {
	const rpos = rotation ? positions.map(position => rotation.multiply(position)) : positions
	for(let i = 0; i < faces.length; ++i) {
		for(let j = 0; j < 3; ++j) {
			const vertices = []
			vertices[0] = faces[i][j]
			vertices[1] = faces[adjacency[i][j][0]][(adjacency[i][j][1]+2)%3]
			vertices[2] = faces[i][(j+1)%3]
			vertices[3] = faces[i][(j+2)%3]
			const norms = vertices.map(k => Math.hypot(rpos[k][0], rpos[k][1]))
			if(Math.max(norms[1],norms[3]) < Math.min(norms[0],norms[2]))
				return vertices[0];
		}
	}
	return 0
}

function getShadowGradient(id, color, radius, rotation, offset = 1/3) {
	const translation = radius*offset
	const scale = radius*(1+offset)
	return `<radialGradient
	id="${id}"
	cx="0" cy="0" r="1"
	gradientUnits="userSpaceOnUse"
	gradientTransform="rotate(${rotation}) translate(${translation} 0) scale(${scale})"
>
	<stop stop-color="${color}" stop-opacity="0"/>
	<stop offset="0.6" stop-color="${color}" stop-opacity="0.1"/>
	<stop offset="1" stop-color="${color}" stop-opacity="1"/>
</radialGradient>`
}

function getAtmosphereAlphaGradient(rotation) {
	return `<radialGradient
	id="scattering_alpha"
	cx="0" cy="0" r="1"
	gradientUnits="userSpaceOnUse"
	gradientTransform="rotate(${rotation}) translate(53 0) scale(100 160)"
>
	<stop/>
	<stop offset="0.60" stop-opacity="0.65"/>
	<stop offset="1" stop-opacity="0"/>
</radialGradient>`
}

function getAtmosphereGradient(color, innerRadius) {
	return `<radialGradient
	id="scattering_gradient"
	cx="0" cy="0" r="100"
	gradientUnits="userSpaceOnUse"
>
	<stop stop-color="${color}" stop-opacity="0.2"/>
	<stop offset="${innerRadius/100}" stop-color="${color}"/>
	<stop offset="1" stop-color="${color}" stop-opacity="0"/>
</radialGradient>`
}

function getShadowOverlay(radius, opacity) {
	return `<circle
	cx="0" cy="0" r="${radius}"
	opacity="${opacity}"
	fill="url(#planet_shadow_gradient)"
/>`
}

function getCloudsOverlay(color) {
	return `<g mask="url(#clouds_mask)">
	<circle cx="0" cy="0" r="100.5" fill="${color}"/>
	<circle cx="0" cy="0" r="100.5" fill="url(#clouds_shadow_gradient)"/>
</g>`
}

function getAtmosphereOverlay(opacity) {
	return ` <mask
	id="scattering_mask"
	style="mask-type:alpha"
	maskUnits="userSpaceOnUse"
	x="-100" y="-100" width="200" height="200"
>
	<circle cx="0" cy="0" r="100" fill="url(#scattering_alpha)"/>
</mask>
<g mask="url(#scattering_mask)">
	<circle
		cx="0" cy="0" r="100"
		opacity="${opacity}"
		fill="url(#scattering_gradient)"
	/>
</g>`
}

function PlanetView(template = {}) {
	this.el = document.createElementNS("http://www.w3.org/2000/svg", "svg")
	this.el.setAttribute("viewBox", "-100 -100 200 200")
	this.el.setAttribute("xmlns", "http://www.w3.org/2000/svg")

	this.setTemplate = function(template = {}) {
		const clouds = template.clouds
		const atmosphere = template.atmosphere
		const layers = template.layers
		const lightAngle = template["light-angle"]
		const shadow = template.shadow
		const fullRadius = 100 + Math.max(atmosphere ? atmosphere.height : 0, clouds ? clouds.height : 0)
		const innerRadius = 100/fullRadius*100
		console.log("radi:", fullRadius, innerRadius)

		const graph = createIcosahedralSphere(template.resolution)
		const [positions, faces, adjacency, octaves, octaveLengths] = graph

		setSeed(template.seed)

		// generate noises from octaves
		const noises = {}
		for(const noiseKey in template.noises) {
			const noiseTemplate = template.noises[noiseKey]
			noises[noiseKey] = randomFractalNoise(
				octaves,
				octaveLengths,
				noiseTemplate["octave-strengths"],
				template.seed + noiseTemplate["seed-suffix"],
			)
		}

		// generate layer instances
		const layerInstances = []
		if(template.layers) {
			for(const layer of layers) {
				layerInstances.push(instantiateLayer(layer, innerRadius, noises, graph))
			}
		}

		// create planet components
		this.el.innerHTML = ""

		// create SVG definitions
		const defsEl = document.createElementNS("http://www.w3.org/2000/svg", "defs")
		const defs = []
		if(shadow) {
			defs.push(getShadowGradient(
				"planet_shadow_gradient",
				shadow.color,
				innerRadius,lightAngle
			))
			if(clouds) {
				defs.push(getShadowGradient(
					"clouds_shadow_gradient",
					shadow.color,
					(100+clouds.height)/fullRadius*100,lightAngle
				))
			}
		}
		if(atmosphere) {
			defs.push(getAtmosphereAlphaGradient(lightAngle))
			defs.push(getAtmosphereGradient(atmosphere.color, innerRadius))
		}
		defsEl.innerHTML = defs.join("\n")
		this.el.appendChild(defsEl)

		// create base circle
		const circleEl = document.createElementNS("http://www.w3.org/2000/svg", "circle")
		circleEl.setAttribute("cx", 0)
		circleEl.setAttribute("cy", 0)
		circleEl.setAttribute("r", innerRadius)
		circleEl.setAttribute("fill", template.color)
		circleEl.setAttribute("stroke", "none")
		this.el.appendChild(circleEl)

		// append layers
		for(const layerInstance of layerInstances) {
			this.el.appendChild(layerInstance.el)
		}

		// create cloud mask and layer
		if(clouds) {
			const cloudsMaskEl = document.createElementNS("http://www.w3.org/2000/svg", "mask")
			cloudsMaskEl.setAttribute("id", "clouds_mask")
			cloudsMaskEl.setAttribute("maskUnits", "userSpaceOnUse")
			cloudsMaskEl.setAttribute("x", "-100")
			cloudsMaskEl.setAttribute("y", "-100")
			cloudsMaskEl.setAttribute("width", "200")
			cloudsMaskEl.setAttribute("height", "200")
			cloudsMaskEl.style.maskType = "alpha"
			this.el.appendChild(cloudsMaskEl)

			const cloudsRadius = (100+clouds.height)/fullRadius*100
			const cloudsLayerInstance = instantiateLayer(clouds, cloudsRadius, noises, graph)
			cloudsMaskEl.appendChild(cloudsLayerInstance.el)
			layerInstances.push(cloudsLayerInstance)
		}

		// draw layers (including cloud layer)
		for(const layerInstance of layerInstances) {
			layerInstance.draw()
		}

		// create overlays
		const overlaysEl = document.createElementNS("http://www.w3.org/2000/svg", "g")
		const overlays = []
		if(shadow)
			overlays.push(getShadowOverlay(innerRadius+0.5,shadow.opacity))
		if(clouds)
			overlays.push(getCloudsOverlay(clouds.color))
		if(atmosphere)
			overlays.push(getAtmosphereOverlay(atmosphere.opacity))
		overlaysEl.innerHTML = overlays.join("\n")
		this.el.appendChild(overlaysEl)

		this.setRotation = function(rotation) {
			const borderVertex = getBorderVertexBrute(positions, faces, adjacency, rotation)
			for(const layerInstance of layerInstances) {
				layerInstance.draw(rotation, borderVertex)
			}
		}
	}

	fixTemplate(template)
	this.setTemplate(template)
}

export default PlanetView
