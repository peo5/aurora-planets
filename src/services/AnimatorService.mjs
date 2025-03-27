function AnimatorService(callback) { 
	let lastTime = undefined
	let currentRequest = undefined
	const update = function() { 
		const currentTime = Date.now()
		const deltaTime = Math.max(1, currentTime - lastTime)/1000
		lastTime = currentTime 
		callback(deltaTime)
		currentRequest = requestAnimationFrame(update)
	}
	this.play = function() {
		if(!currentRequest && callback) {
			lastTime = Date.now()
			currentRequest = requestAnimationFrame(update)
		}
	}
	this.pause = function() {
		if(currentRequest) {
			cancelAnimationFrame(currentRequest)	
			currentRequest = undefined 
		}
	}
	this.setCallback = function(newCallback) {
		callback = newCallback
		if(callback) {
			play()
		}
		else {
			pause()
		}
	}
}

export default AnimatorService
