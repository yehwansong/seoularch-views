$(document).ready(function(){
					
	var w = window.innerWidth;
	var h = window.innerHeight;
	var renderer, scene, camera;

	var svg_array_bottom = Array(4)
	var mat_array_bottom = Array(4)
	var shape_array_bottom = Array(4)
	var geom_array_bottom = Array(4)
	var pivot_array_bottom = Array(4)

	var svg_array_top = Array(4)
	var mat_array_top = Array(4)
	var shape_array_top = Array(4)
	var geom_array_top = Array(4)
	var pivot_array_top = Array(4)



	var pivot_array_top_wrap = [new THREE.Group(),new THREE.Group(),new THREE.Group(),new THREE.Group()]
	var pivot_array_side_wrap = [new THREE.Group(),new THREE.Group(),new THREE.Group(),new THREE.Group()]
	var pivot_array_bottom_wrap = [new THREE.Group(),new THREE.Group(),new THREE.Group(),new THREE.Group()]
	var svg_array_side = Array(25)
	var mat_array_side = Array(25)
	var shape_array_side = Array(25)
	var geom_array_side = Array(25)
	var pivot_array_side = Array(25)

	var color_array = ['red','yellow','skyblue','green','white']

	var main_pivot = new THREE.Group();
	const startButton = document.getElementById( 'startButton' );
	render_setting()
	// create_column()
	startButton.addEventListener( 'click', function () {
		init();
	} );
	function init(){

		var video = document.getElementById( 'video' );
		video.play();
		video.addEventListener( 'play', function () {this.currentTime = 3;} );
		texture = new THREE.VideoTexture( video );

		shape_array_top[0].material = new THREE.MeshBasicMaterial( { color: 0xffffff, map: texture, side: THREE.DoubleSide } );
		// var geometry = new THREE.PlaneGeometry(100, 100, 2, 2 );
		// var plane = new THREE.Mesh( geometry, material );
		// plane.rotation.y = degrees_to_radians(60);
		// scene.add( plane );
		// render();

	}


// Define triangle


	svg_array_top[0] = '-1000.06,0.05 -800.05,0.04 -750.05,-86.57 -650.04,-86.57 -750.03,-259.81 -850.04,-259.79'
	svg_array_top[1] = '-650.04,-86.57 -600.03,-173.19 -500.03,-173.19 -475.03,-129.9 -375.02,-129.9 -425.02,-216.51 -525.02,-216.51 -550.02,-259.81 -650.03,-259.8 -700.04,-173.19'
	svg_array_top[2] = '-325.02,-43.29 -225.02,-43.3 -200.01,-86.61 -150,-86.61 -100,0 0,0 -100.1,-173.22 -300.01,-173.2 -325.01,-129.9 -375.02,-129.9'
	svg_array_top[3] = '300.1,-0.03 250.01,-86.6 350.01,-86.6 375.02,-129.9 475.02,-129.9 450.28,-173.21 600.03,-173.2 625.02,-216.51 600.03,-259.8 750.03,-259.81 800.04,-173.19 850.04,-259.8 999.99,-0.08 800.05,0.04 850.05,-86.56 800.06,-86.57 750,-0.04 650,-0.04 675.04,-43.29 375.02,-43.29 400.02,0.02'

	svg_array_bottom[0] = '-1000.06,0.05 -800.05,0.04 -750.05,-86.57 -650.04,-86.57 -750.03,-259.81 -850.04,-259.79'
	svg_array_bottom[1] = '-650.04,-86.57 -600.03,-173.19 -500.03,-173.19 -475.03,-129.9 -375.02,-129.9 -425.02,-216.51 -525.02,-216.51 -550.02,-259.81 -650.03,-259.8 -700.04,-173.19'
	svg_array_bottom[2] = '-325.02,-43.29 -225.02,-43.3 -200.01,-86.61 -150,-86.61 -100,0 0,0 -100.1,-173.22 -300.01,-173.2 -325.01,-129.9 -375.02,-129.9'
	svg_array_bottom[3] = '300.1,-0.03 250.01,-86.6 350.01,-86.6 375.02,-129.9 475.02,-129.9 450.28,-173.21 600.03,-173.2 625.02,-216.51 600.03,-259.8 750.03,-259.81 800.04,-173.19 850.04,-259.8 999.99,-0.08 800.05,0.04 850.05,-86.56 800.06,-86.57 750,-0.04 650,-0.04 675.04,-43.29 375.02,-43.29 400.02,0.02'

	svg_array_side[0]  = '0.02,0 200.02,0 200.02,299.98 0.02,299.98 0.02,0'
	svg_array_side[1]  = '200.02,0 300.11,0 300.11,299.98 200.02,299.98 200.02,0'
	svg_array_side[2]  = '250.01,-86.64 350.1,-86.64 350.1,213.34 250.01,213.34 250.01,-86.64'
	svg_array_side[3]  = '300.05,0 400.03,0 400.03,300.01 300.05,300.01 300.05,0'
	svg_array_side[4]  = '400.03,0 450.03,0 450.03,300.06 400.03,300.06 400.03,0'
	svg_array_side[5]  = '375.04,-43.3 675.05,-43.3 675.05,256.68 375.04,256.68 375.04,-43.3'
	svg_array_side[6]  = '675.01,-43.35 725,-43.35 725,256.71 675.01,256.71 675.01,-43.35'
	svg_array_side[7]  = '650.01,-0.05 750.01,-0.05 750.01,299.93 650.01,299.93 650.01,-0.05'
	svg_array_side[8]  = '749.97,-0.04 849.88,-0.04 849.88,299.97 749.98,299.97 749.97,-0.04'
	svg_array_side[9]  = '800.07,-86.57 850.07,-86.57 850.07,213.46 800.07,213.46 800.07,-86.57'
	svg_array_side[10] = '850.07,-86.57 949.97,-86.57 949.97,213.44 850.07,213.44 850.07,-86.57'
	svg_array_side[11] = '800.07,0.03 1000,0.03 1000,300.8 800.07,300.8 800.07,0.03'
	svg_array_side[12] = '-100,0 0,0 0,299.98 -100,299.98 -100,0'
	svg_array_side[13] = '-150,-86.61 -50,-86.61 -50,213.38 -150,213.38 -150,-86.61'
	svg_array_side[14] = '-200.01,-86.61 -150,-86.61 -150,213.38 -200.01,213.38 -200.01,-86.61'
	svg_array_side[15] = '-225.02,-43.29 -175.01,-43.29 -175.01,256.69 -225.02,256.69 -225.02,-43.29'
	svg_array_side[16] = '-325.02,-43.29 -225.01,-43.29 -225.01,256.7 -325.02,256.7 -325.02,-43.29'
	svg_array_side[17] = '-375.02,-129.9 -274.97,-129.9 -274.97,171.48 -375.02,171.48 -375.02,-129.9'
	svg_array_side[18] = '-475.03,-129.9 -375.02,-129.9 -375.02,170.09 -475.03,170.09 -475.03,-129.9'
	svg_array_side[19] = '-500.03,-173.2 -450.03,-173.2 -450.03,128.21 -500.03,128.21 -500.03,-173.2'
	svg_array_side[20] = '-600.02,-173.2 -500.02,-173.2 -500.02,126.8 -600.02,126.8 -600.02,-173.2'
	svg_array_side[21] = '-650.03,-86.58 -550.03,-86.58 -550.03,213.42 -650.03,213.42 -650.03,-86.58'
	svg_array_side[22] = '-750.04,-86.57 -650.04,-86.57 -650.04,213.43 -750.04,213.43 -750.04,-86.57'
	svg_array_side[23] = '-800.05,0.03 -700.05,0.03 -700.05,300.03 -800.05,300.03 -800.05,0.03'
	svg_array_side[24] = '-1000.06,0.05 -800.05,0.05 -800.05,300.05 -1000.06,300.05 -1000.06,0.05'

	for (var i = svg_array_top.length - 1; i >= 0; i--) {
		create_top(svg_array_top[i], i)
	}
	for (var i = svg_array_bottom.length - 1; i >= 0; i--) {
		create_bottom(svg_array_bottom[i], i)
	}
	for (var i = svg_array_side.length - 1; i >= 0; i--) {
		create_side(svg_array_side[i], i)
	}
	set_mainpivot()
	function svg_to_dot(svg,i){
		var array_1 = svg.split(' ')
		var coordinatesList =[]
		for (var i = 0; i < array_1.length; i++) {
			var a = parseInt(array_1[i].split(',')[0])/10
			var b = parseInt(array_1[i].split(',')[1])/10
			
			coordinatesList.push(new THREE.Vector3(a, b, 0))

			if(i== array_1.length-1){
				return coordinatesList
			}
		}
	}

	function create_top(svg,i){
		coordinatesList = svg_to_dot(svg)
		geom_array_top[i] = new THREE.ShapeBufferGeometry(new THREE.Shape(coordinatesList));
		mat_array_top[i] = new THREE.MeshBasicMaterial({color:"blue"});
		shape_array_top[i] = new THREE.Mesh(geom_array_top[i], mat_array_top[i]);
		pivot_array_top[i] = new THREE.Group();
		shape_array_top[i].position.set(-1*coordinatesList[0].x,-1*coordinatesList[0].y,-1*coordinatesList[0].z);
		pivot_array_top[i].position.set(coordinatesList[0].x,coordinatesList[0].y,coordinatesList[0].z);
		// pivot_array_top[i].position.set(coordinatesList[0].x,coordinatesList[0].y,coordinatesList[0].z);
		pivot_array_top[i].add(shape_array_top[i]);
		pivot_array_top[i].rotation.x = degrees_to_radians(-90);
		if(i == 0){
			pivot_array_top_wrap[0].add(pivot_array_top[0]);
			pivot_array_top_wrap[1].add(pivot_array_top[1]);
			pivot_array_top_wrap[2].add(pivot_array_top[2]);
			pivot_array_top_wrap[3].add(pivot_array_top[3]);
		}
	}
	function create_bottom(svg,i){
		coordinatesList = svg_to_dot(svg)
		geom_array_bottom[i] = new THREE.ShapeBufferGeometry(new THREE.Shape(coordinatesList));
		mat_array_bottom[i] = new THREE.MeshBasicMaterial({color:"blue", side: THREE.DoubleSide});
		shape_array_bottom[i] = new THREE.Mesh(geom_array_bottom[i], mat_array_bottom[i]);
		pivot_array_bottom[i] = new THREE.Group();
		shape_array_bottom[i].position.set(-1*coordinatesList[0].x,-1*(coordinatesList[0].y),-1*coordinatesList[0].z);
		pivot_array_bottom[i].position.set(coordinatesList[0].x,coordinatesList[0].y,coordinatesList[0].z);
		// pivot_array_bottom[i].position.set(coordinatesList[0].x,coordinatesList[0].y,coordinatesList[0].z);
		pivot_array_bottom[i].add(shape_array_bottom[i]);
		pivot_array_bottom[i].rotation.x = degrees_to_radians(90);
		// pivot_array_bottom[i].position.z =pivot_array_bottom[i].position.z - 30;
		if(i == 0){
			pivot_array_bottom_wrap[0].position.z = -30;
			pivot_array_bottom_wrap[1].position.z = -30;
			pivot_array_bottom_wrap[2].position.z = -30;
			pivot_array_bottom_wrap[3].position.z = -30;
			pivot_array_bottom_wrap[0].add(pivot_array_bottom[0]);
			pivot_array_bottom_wrap[1].add(pivot_array_bottom[1]);
			pivot_array_bottom_wrap[2].add(pivot_array_bottom[2]);
			pivot_array_bottom_wrap[3].add(pivot_array_bottom[3]);
		}
	}
	function create_side(svg,i){
		coordinatesList = svg_to_dot(svg)
		geom_array_side[i] = new THREE.ShapeBufferGeometry(new THREE.Shape(coordinatesList));
		mat_array_side[i] = new THREE.MeshBasicMaterial({color:color_array[i%5]});
		shape_array_side[i] = new THREE.Mesh(geom_array_side[i], mat_array_side[i]);
		pivot_array_side[i] = new THREE.Group();
		shape_array_side[i].position.set(-1*coordinatesList[0].x,-1*coordinatesList[0].y,-1*coordinatesList[0].z);
		pivot_array_side[i].position.set(coordinatesList[0].x,coordinatesList[0].y,coordinatesList[0].z);
		pivot_array_side[i].add(shape_array_side[i]);
		pivot_array_side[i].rotation.x = degrees_to_radians(-90);
		if(i == 0){
			pivot_array_side[23].rotation.y = degrees_to_radians(60)
			pivot_array_side[21].rotation.y = degrees_to_radians(60)
			pivot_array_side[19].rotation.y = degrees_to_radians(-60)
			pivot_array_side[17].rotation.y = degrees_to_radians(-60)
			pivot_array_side[15].rotation.y = degrees_to_radians(60)
			pivot_array_side[13].rotation.y = degrees_to_radians(-60)
			pivot_array_side[1].rotation.y = degrees_to_radians(60)
			pivot_array_side[2].rotation.y = degrees_to_radians(-60)
			pivot_array_side[4].rotation.y = degrees_to_radians(120)
			pivot_array_side[6].rotation.y = degrees_to_radians(-120)
			pivot_array_side[8].rotation.y = degrees_to_radians(60)
			pivot_array_side[10].rotation.y = degrees_to_radians(-120)

			pivot_array_side_wrap[3].add(pivot_array_side[0]);
			pivot_array_side_wrap[3].add(pivot_array_side[1]);
			pivot_array_side_wrap[3].add(pivot_array_side[2]);
			pivot_array_side_wrap[3].add(pivot_array_side[3]);
			pivot_array_side_wrap[3].add(pivot_array_side[4]);
			pivot_array_side_wrap[3].add(pivot_array_side[5]);
			pivot_array_side_wrap[3].add(pivot_array_side[6]);
			pivot_array_side_wrap[3].add(pivot_array_side[7]);
			pivot_array_side_wrap[3].add(pivot_array_side[8]);
			pivot_array_side_wrap[3].add(pivot_array_side[9]);
			pivot_array_side_wrap[3].add(pivot_array_side[10]);
			pivot_array_side_wrap[3].add(pivot_array_side[11]);

			pivot_array_side_wrap[0].add(pivot_array_side[22]);
			pivot_array_side_wrap[0].add(pivot_array_side[23]);
			pivot_array_side_wrap[0].add(pivot_array_side[24]);
			pivot_array_side_wrap[1].add(pivot_array_side[18]);
			pivot_array_side_wrap[1].add(pivot_array_side[19]);
			pivot_array_side_wrap[1].add(pivot_array_side[20]);
			pivot_array_side_wrap[1].add(pivot_array_side[21]);

			pivot_array_side_wrap[2].add(pivot_array_side[12]);
			pivot_array_side_wrap[2].add(pivot_array_side[13]);
			pivot_array_side_wrap[2].add(pivot_array_side[14]);
			pivot_array_side_wrap[2].add(pivot_array_side[15]);
			pivot_array_side_wrap[2].add(pivot_array_side[16]);
			pivot_array_side_wrap[2].add(pivot_array_side[17]);

			// pivot_array_side[23].rotation.y = degrees_to_radians(60)
		}
	}
	function set_mainpivot(){
		main_pivot.add(pivot_array_top_wrap[0]);
		main_pivot.add(pivot_array_top_wrap[1]);
		main_pivot.add(pivot_array_top_wrap[2]);
		main_pivot.add(pivot_array_top_wrap[3]);
		main_pivot.add(pivot_array_bottom_wrap[0]);
		main_pivot.add(pivot_array_bottom_wrap[1]);
		main_pivot.add(pivot_array_bottom_wrap[2]);
		main_pivot.add(pivot_array_bottom_wrap[3]);
		main_pivot.add(pivot_array_side_wrap[0]);
		main_pivot.add(pivot_array_side_wrap[1]);
		main_pivot.add(pivot_array_side_wrap[2]);
		main_pivot.add(pivot_array_side_wrap[3]);
		// pivot_array_top_wrap[0].rotation.y = degrees_to_radians(20);
		// pivot_array_top_wrap[1].rotation.y = degrees_to_radians(20);
		// pivot_array_top_wrap[2].rotation.y = degrees_to_radians(20);
		// pivot_array_top_wrap[3].rotation.y = degrees_to_radians(-20);
		// pivot_array_bottom_wrap[0].rotation.y = degrees_to_radians(-20);
		// pivot_array_bottom_wrap[1].rotation.y = degrees_to_radians(-20);
		// pivot_array_bottom_wrap[2].rotation.y = degrees_to_radians(-20);
		// pivot_array_bottom_wrap[3].rotation.y = degrees_to_radians(20);
		// pivot_array_top[1].rotation.z = degrees_to_radians(10);
		// pivot_array_top[0].rotation.z = degrees_to_radians(20);
		// pivot_array_bottom[1].rotation.y = degrees_to_radians(-10);
		// pivot_array_bottom[0].rotation.y = degrees_to_radians(-20);

		pivot_array_top_wrap[0].position.x = pivot_array_top_wrap[0].position.x-20;
		pivot_array_top_wrap[1].position.x = pivot_array_top_wrap[1].position.x-10;
		pivot_array_top_wrap[2].position.x = pivot_array_top_wrap[2].position.x+0;
		pivot_array_top_wrap[3].position.x = pivot_array_top_wrap[3].position.x+10;

		pivot_array_bottom_wrap[0].position.x = pivot_array_bottom_wrap[0].position.x-20;
		pivot_array_bottom_wrap[1].position.x = pivot_array_bottom_wrap[1].position.x-10;
		pivot_array_bottom_wrap[2].position.x = pivot_array_bottom_wrap[2].position.x+0;
		pivot_array_bottom_wrap[3].position.x = pivot_array_bottom_wrap[3].position.x+10;

		pivot_array_side_wrap[0].position.x = pivot_array_side_wrap[0].position.x-20;
		pivot_array_side_wrap[1].position.x = pivot_array_side_wrap[1].position.x-10;
		pivot_array_side_wrap[2].position.x = pivot_array_side_wrap[2].position.x+0;
		pivot_array_side_wrap[3].position.x = pivot_array_side_wrap[3].position.x+10;

		main_pivot.scale.y = -1
		// main_pivot.scale.z = 1.5
		main_pivot.rotation.x = degrees_to_radians(-90)

	}


	function render_setting(){
		scene = new THREE.Scene();
		scene.add(main_pivot);
		main_pivot.position.y = 15
		camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
		camera.position.set(0, 0, 100);
		camera.lookAt(0, 0, 0);
		renderer = new THREE.WebGLRenderer();
		renderer.setSize(window.innerWidth, window.innerHeight);
		document.body.appendChild(renderer.domElement);
		renderer.setAnimationLoop(() => {
		  renderer.render(scene, camera);
		});

	}
	function degrees_to_radians(degrees){
	  var pi = Math.PI;
	  return degrees * (pi/180);
	}

})