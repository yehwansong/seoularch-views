$(document).ready(function(){
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 100);
camera.position.set(0, 0, 10);
camera.lookAt(0, 0, 0);
var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

var coordinatesList = [
  new THREE.Vector3(0, 0, 0),
  new THREE.Vector3(0, 10, 0),
  new THREE.Vector3(5, 10, 0),
  new THREE.Vector3(2, 8, 0),
  new THREE.Vector3(5, 5, 0)
];


// shape
var geomShape = new THREE.ShapeBufferGeometry(new THREE.Shape(coordinatesList));
var matShape = new THREE.MeshBasicMaterial({color:"blue"});
var shape = new THREE.Mesh(geomShape, matShape);
scene.add(shape);

// points
var geom = new THREE.BufferGeometry().setFromPoints(coordinatesList);
var matPoints = new THREE.PointsMaterial({size: 0.55, color: "pink"});
var points = new THREE.Points(geom, matPoints);
scene.add(points);


// lines
var matLines = new THREE.LineBasicMaterial({color: "magenta"});
var lines = new THREE.LineLoop(geom, matLines);
scene.add(lines);


renderer.setAnimationLoop(() => {
  renderer.render(scene, camera);
});
})