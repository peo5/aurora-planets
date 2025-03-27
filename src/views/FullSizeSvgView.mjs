/******************************************************************************************\
 
 Full Size SVG View
 SVG that occupies the full size of the window
 Not currently used
 
\******************************************************************************************/

function FullSizeSVGView(centeredRadius = 100) {
	this.el = document.createElementNS("http://www.w3.org/2000/svg", "svg")
	this.centeredEl = document.createElementNS("http://www.w3.org/2000/svg", "g")
	this.el.appendChild(this.centeredEl)
	const updateSize = () => {
		this.el.setAttribute("width", innerWidth)
		this.el.setAttribute("height", innerHeight)
		this.centeredEl.setAttribute("transform", `translate(${innerWidth/2} ${innerHeight/2}) scale(${0.7*Math.min(innerWidth,innerHeight)/(2*centeredRadius)})`)
	}
	updateSize()
	window.addEventListener("resize", updateSize)
}

export default FullSizeSVGView
