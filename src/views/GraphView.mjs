/******************************************************************************************\
 
 Graph View
 Not currently used
 
\******************************************************************************************/

function GraphView(color = "gray", width = "1") {
	let positions = []
	let edges = []

	this.el = document.createElementNS("http://www.w3.org/2000/svg", "path")
	this.el.setAttribute("stroke", color)
	this.el.setAttribute("fill", "none")
	this.el.setAttribute("stroke-width", width)

	this.draw = () => {
		this.el.setAttribute("d", edges.map(edge => {
			const x1 = positions[edge[0]][0]
			const y1 = positions[edge[0]][1]
			const x2 = positions[edge[1]][0]
			const y2 = positions[edge[1]][1]
			return `M ${x1} ${y1} L ${x2} ${y2}`
		}).join(" "))
	}

	this.setPositions = (newPositions) => {
		positions = newPositions
	}

	this.setEdges = (newEdges) => {
		edges = newEdges
	}
}
