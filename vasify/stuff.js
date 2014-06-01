// library of functions and such

//this.WIDTH = window.innerWidth;
//this.HEIGHT= window.innerHeight;

// globabls
var geometry;
var cube;
var currentObj;
var scene;
var renderer;
var render;
var controls;
var reader;
var directionalLight;

// global file holder
var fileFile

function init(){
	// main parts
	container = document.getElementById( 'container' );
	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
	renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
	
	// add renderer
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.setClearColor( 0x000000, 0);
	container.appendChild(renderer.domElement);

	// add directional light
	directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
	directionalLight.position.set( 0, 0, 1 );
	scene.add( directionalLight );

	// set controls to container
	controls = new THREE.OrbitControls(camera, document.getElementById("container").getElementsByTagName("canvas")[0]);

	// automatically resize on window resize.
	THREEx.WindowResize(renderer, camera);

	render = function() {
		requestAnimationFrame(render);
		// model always lit from front
		directionalLight.position.set( camera.position.x,camera.position.y,camera.position.z );
		renderer.render(scene, camera);
		controls.update();
	};

	reader = new FileReader();
}

function readText(that){
	fileFile = that;
	removeAll(scene);

	var reader = new FileReader();
	reader.onload = function (e) {
		var output=e.target.result;
		addModel(output);
	};//end onload()
	reader.readAsBinaryString(that[0]);
}

// loads from global fileFile
function reloadFile(){
	removeAll(scene);

	var reader = new FileReader();
	reader.onload = function (e) {
		var output=e.target.result;
		addModel(output);
	};//end onload()
	reader.readAsBinaryString(fileFile[0]);
}

/*function addGrid() {
	var mygeom = new THREE.Geometry();
	//Who knows if this'll work
	var ne = new THREE.Vector3(this.WIDTH/2, 0, 0);
	var nw = new THREE.Vector3(this.WIDTH/2*-1, 0, 0);

	mygeom.vertices.push(ne);
	mygeom.vertices.push(nw);

	var material = new THREE.LineBasicMaterial({
		color: 0x000000,
		opacity: 0.2
	});

	for (var i = 0; i < 20; i++) {
		var line = new THREE.Line(mygeom, material);
		line.position.z = this.HEIGHT/2 - (i*(this.HEIGHT/20));
		line.position.y = minY;
		scene.add(line);
	}
}*/

function addModel(data){
	geometry = new THREE.CubeGeometry(3,3,3);
	geometry.dynamic = true;
	var customMaterial = new THREE.MeshBasicMaterial( 
	{
		side: THREE.BackSide,
		//side: THREE.DoubleSide,
		blending: THREE.AdditiveBlending,
		//transparent: true
	}   );
	
	var material = new THREE.MeshLambertMaterial({color: 0xAAAAB9, opacity : 1, transparent: true, side: THREE.DoubleSide});
	var loader = new THREE.STLLoader();
	
	geometry = loader.parse(data);

	
	cube=new THREE.Mesh( geometry,material )
	cube.geometry.computeBoundingBox ();
	var b = cube.geometry.boundingBox;
	for (var i = 0; i < geometry.vertices.length; i++)
	{
		geometry.vertices[i].x-=(b.min.x+b.max.x)/2;
		geometry.vertices[i].y-=(b.min.y+b.max.y)/2;
	}

	cube.geometry.computeFaceNormals();
	for (var i = 0; i < geometry.faces.length; i++)
	{
		cube.geometry.faces[i].normal=cube.geometry.faces[i].normal.multiplyScalar(1);
	}
	
	cube.geometry.applyMatrix(new THREE.Matrix4().makeTranslation( -(b.max.x+b.min.x)/2, -(b.max.y+b.min.y)/2, -(b.max.z+b.min.z)/2 ) );
	cube.rotation.x = -Math.PI/2;
	var l=(b.max.x-b.min.x)*(b.max.x-b.min.x)+(b.max.y-b.min.y)*(b.max.y-b.min.y)+(b.max.z-b.min.z)*(b.max.z-b.min.z);
	l=Math.sqrt(l);
	camera.position.z = l*.75;
	scene.add( cube );
	
	render();
}

function removeAll(sce) {
	var obj;
	for (var i = sce.children.length-1; i >= 0; i--) {
		obj = sce.children[i];
		if (obj != camera && obj != directionalLight) sce.remove(obj);
	}	
}

//Hopefully generate and print STL
function stringifyVector(vec) { return ""+vec.x+" "+vec.y+" "+vec.z; }
function stringifyVertex(vec) { return "vertex "+stringifyVector(vec)+" \n"; }
function generateSTL () {
	var vertices = geometry.vertices;
	var faces = geometry.faces;

	var stl = "solid pixel";
	for (var i = 0; i < faces.length; i++) {
		stl += ("facet normal "+stringifyVector( faces[i].normal )+" \n");
		stl += ("outer loop \n");
		stl += stringifyVertex( vertices[ faces[i].a ]);
		stl += stringifyVertex( vertices[ faces[i].b ]);
		stl += stringifyVertex( vertices[ faces[i].c ]);
		stl += ("endloop \n");
		stl += ("endfacet \n");
	}

	stl += ("endsolid");

	return stl;
}

function saveSTL () {
	var stlString = generateSTL();
	var blob = new Blob([stlString], {type: 'text/plain'});

	saveAs(blob, 'pixel_printer.stl');
}

var buffer = new ArrayBuffer(8) // allocates 8 bytes
	, data = new DataView(buffer)
;

// You can write uint8/16/32s and float32/64s to dataviews
data.setUint8 (0, 0x01);
data.setUint16(1, 0x2345);
data.setUint32(3, 0x6789ABCD);
data.setUint8 (7, 0xEF);

//saveAs(new Blob([buffer], {type: "example/binary"}), "data.dat");