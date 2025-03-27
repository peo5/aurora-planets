import { Vector } from "methods/LinearMethods.mjs"

function getFaceAdjacency(faces) {
	return faces.map((face, a) => {
		return face.map((vetex, i) => {
			for(let b = 0; b < faces.length; ++b) if(b != a) {
				const other = faces[b]
				for(let j = 0; j < 3; ++j)
					if(other[j] == face[(i+1)%3] && other[(j+1)%3] == face[i])
						return [b,j]
			}
		})
	})
}

function getVertexAdjacency(edges) {
	const adjacency = []
	adjacency.length = edges.reduce((current, [a,b]) => Math.max(current, a+1, b+1), 0)
	for(let i=0; i<adjacency.length; ++i)
		adjacency[i] = []
	for(const [a,b] of edges) {
		adjacency[a].push(b)
		adjacency[b].push(a)
	}
	return adjacency
}

function subdivide(positions, faces, adjacency) {
	const subPositionsIdx = faces.map(() => new Array(3))
	const newFaces = new Array(4*faces.length)
	const newAdjacency = new Array(4*faces.length)
	for(let a = 0; a < faces.length; ++a) {
		// create sub positions
		for(let i = 0; i < 3; ++i) {
			const [b,j] = adjacency[a][i]
			subPositionsIdx[a][i] = subPositionsIdx[b][j]
			if(subPositionsIdx[a][i] == undefined) {
				const posU = positions[faces[a][i]]
				const posV = positions[faces[a][(i+1)%3]]
				subPositionsIdx[a][i] = positions.length
				positions.push(posU.sum(posV.sub(posU).scale(1/2)).normalize())
			}
		}
		// create new faces
		for(let j = 0; j < 3; ++j)
			newFaces[4*a+j] = [faces[a][j],subPositionsIdx[a][j],subPositionsIdx[a][(j+2)%3]]
		newFaces[4*a+3] = [subPositionsIdx[a][0],subPositionsIdx[a][1],subPositionsIdx[a][2]]
		// create new adjacency TODO: correct adjacency chirality
		/*
		for(let j = 0; j < 3; ++j) {
			newAdjacency[4*a+j] = [
				[4*adjacency[a][j][0] + (adjacency[a][j][1] + 1)%3, 2],
				[4*a+3, j],
				[4*adjacency[a][(j+2)%3][0] + adjacency[a][(j+2)%3][1], 0],
			]
		}
		newAdjacency[4*a+3] = [[4*a+0,1],[4*a+1,1],[4*a+2,1]]
		*/
	}
	return [positions, newFaces, getFaceAdjacency(newFaces)]
}

function powerSubdivide(positions, faces, adjacency, power) {
	let state = [positions, faces, adjacency]
	for(let i = 0; i < power; ++i)
		state = subdivide(...state)
	return state
}

function createTetrahedralSphere(power) {
	const sin = Math.sin(1/6*Math.PI)
	const cos = Math.cos(1/6*Math.PI)
	const positions = [
		new Vector(0,cos,-sin),                 // 0 - top
		new Vector(cos,-sin,-sin).normalize(),  // 1 - right
		new Vector(-cos,-sin,-sin).normalize(), // 2 - left
		new Vector(0,0,1),                      // 3 - front
	]
	const faces = [
		[0,1,2], // 0 - back
		[3,1,0], // 1 - right
		[3,2,1], // 2 - bottom
		[3,0,2], // 3 - left
	]
	const adjacency = [
		[[1,1],[2,1],[3,1]],
		[[2,2],[0,0],[3,0]],
		[[3,2],[0,1],[1,0]],
		[[1,2],[0,2],[2,0]],
	]
	return powerSubdivide(positions, faces, adjacency, power)
}

function createIcosahedralSphere(power) {
	const phi = (1 + Math.sqrt(5)) / 2 // golden ratio
	const norm = Math.sqrt((5+Math.sqrt(5))/2) // norm of (1, phi, 0)
	const nPhi = phi/norm
	const nOne = 1/norm
	const positions = [
		new Vector(-nOne, nPhi, 0),
		new Vector(nOne, nPhi, 0),
		new Vector(-nOne, -nPhi, 0),
		new Vector(nOne, -nPhi, 0),
		new Vector(0, -nOne, nPhi),
		new Vector(0, nOne, nPhi),
		new Vector(0, -nOne, -nPhi),
		new Vector(0, nOne, -nPhi),
		new Vector(nPhi, 0, -nOne),
		new Vector(nPhi, 0, nOne),
		new Vector(-nPhi, 0, -nOne),
		new Vector(-nPhi, 0, nOne),
	]
	const faces = [
		[0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11],
		[1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
		[3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9],
		[4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1],
	]
	const adjacency = [
		[[4,2],[6,0],[1,0]], [[0,2],[5,0],[2,0]], [[1,2],[9,0],[3,0]], [[2,2],[8,0],[4,0]],
		[[3,2],[7,0],[0,0]], [[1,1],[15,1],[19,2]], [[0,1],[16,1],[15,2]], [[4,1],[17,1],[16,2]],
		[[3,1],[18,1],[17,2]], [[2,1],[19,1],[18,2]], [[14,2],[15,0],[11,0]], [[10,2],[16,0],[12,0]],
		[[11,2],[17,0],[13,0]], [[12,2],[18,0],[14,0]], [[13,2],[19,0],[10,0]], [[10,1],[5,1],[6,2]],
		[[11,1],[6,1],[7,2]], [[12,1],[7,1],[8,2]], [[13,1],[8,1],[9,2]], [[14,1],[9,1],[5,2]],
	]
	return powerSubdivide(positions, faces, adjacency, power)
}

function getEdges(faces, adjacency) {
	const edges = []
	const faceProcessed = faces.map(() => false)
	for(let a = 0; a < faces.length; ++a) {
		for(let i = 0; i < 3; ++i) {
			const [b,j] = adjacency[a][i]
			if(!faceProcessed[b])
				edges.push([faces[a][i],faces[a][(i+1)%3]])
		}
		faceProcessed[a] = true
	}
	return edges
} 

export { createTetrahedralSphere, createIcosahedralSphere, getEdges }
