import PlanetView from "views/PlanetView.mjs"

function addSuffix(name, extension) {
	return name.endsWith(extension) ? name : name+extension
}

function createCollection(collectionTemplate, planetTemplate) {
	const planetView = new PlanetView()
	const planets = Object.create(null)
	const encoder = new TextEncoder()
	for(const entry of collectionTemplate) {
		let name = undefined
		if(typeof(entry) == "string") {
			planetTemplate.seed = entry
			name = entry
		}
		else if(typeof(entry) == "object") {
			planetTemplate.seed = entry.seed
			name = entry.name
		}
		planetView.setTemplate(planetTemplate)
		planets[`collection/${addSuffix(name,".svg")}`] = encoder.encode(planetView.el.outerHTML)
	}
	console.log("encoding planets", planets)
	return UZIP.encode(planets)
}

function downloadArrayBuffer(arrayBuffer, filename) {
  const blob = new Blob([arrayBuffer], { type: "application/octet-stream" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

function downloadCollection(collectionTemplate, planetTemplate, filename = "collection") {
	const collection = createCollection(collectionTemplate, planetTemplate)
	downloadArrayBuffer(collection, addSuffix(filename,".zip"))
}

export { downloadCollection }
