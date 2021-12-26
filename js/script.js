import * as THREE from '/js/three.module.js';
import {OrbitControls} from "/js/OrbitControls.js";
$(document).ready(function(){
	var w = window.innerWidth;
	var h = window.innerHeight;
	var renderer, scene, camera, camera_pivot, light, controls;
	var textureLoader = new THREE.TextureLoader();
	var mainpivot = new THREE.Group()
	var light_group = new THREE.Group()
	var ground
	var post_array = Array()
	var unit = 5
	var post_height = 20
	var counter = 0
	var tex_array = Array(5)
	var mousedown = false;
	var h = window.innerHeight
	var w = window.innerWidth
	var prev_hovered,whole_mouse_x
	const raycaster = new THREE.Raycaster();
	const mouse = new THREE.Vector2();
	var mousedown_timeout
	var static_side_texture_1 

	var db = [
		[12		,1		, 2,	'e','2','img_l_2','img_r_2','img_f_2','img_b_2','Sep.1.2021'],
		[11		,3		, 2,	'c','2','img_l_2','img_r_2','img_f_2','img_b_2','Sep.2.2021'],
		[13		,3		, 2,	'e','2','img_l_2','img_r_2','img_f_2','img_b_2','Sep.3.2021'],
		[13		,5		,-2,	'e','2','img_l_2','img_r_2','img_f_2','img_b_2','Sep.4.2021'],
		[10.5	,1		, 1,	'c','1','img_l_1','img_r_1','img_f_1','img_b_1','Sep.5.2021'],
		[11.5	,0		, 1,	'e','1','img_l_1','img_r_1','img_f_1','img_b_1','Sep.6.2021'],
		[11		,7		, 4,	'c','4','img_l_4','img_r_4','img_f_4','img_b_4','Sep.7.2021'],
		[12		,7		,-2,	'e','2','img_l_2','img_r_2','img_f_2','img_b_2','Sep.8.2021'],
		[10		,7		,-2,	'c','2','img_l_2','img_r_2','img_f_2','img_b_2','Aug.31.2021'],
		[14		,9		,-4,	'e','4','img_l_4','img_r_4','img_f_4','img_b_4','Aug.30.2021'],
		[11		,9		, 1,	'e','1','img_l_1','img_r_1','img_f_1','img_b_1','Aug.29.2021'],
		[11		,9		,-1,	'e','1','img_l_1','img_r_1','img_f_1','img_b_1','Aug.28.2021'],
		[14		,9		, 4,	'e','4','img_l_4','img_r_4','img_f_4','img_b_4','Aug.27.2021'],
		[10		,12		, 4,	'c','4','img_l_4','img_r_4','img_f_4','img_b_4','Aug.26.2021'],
		[16		,12		,-4,	'e','4','img_l_4','img_r_4','img_f_4','img_b_4','Aug.25.2021'],
		[17		,12		, 1,	'e','1','img_l_1','img_r_1','img_f_1','img_b_1','Aug.20.2021'],
		[8		,14		, 4,	'c','4','img_l_4','img_r_4','img_f_4','img_b_4','Aug.19.2021'],
		[7		,15		,-3,	'c','3','img_l_3','img_r_3','img_f_3','img_b_3','Aug.18.2021'],
		[19		,16		, 2,	'e','2','img_l_2','img_r_2','img_f_2','img_b_2','Aug.17.2021'],
		[19		,16		,-2,	'e','2','img_l_2','img_r_2','img_f_2','img_b_2','Aug.14.2021'],
		[19.5	,18		, 1,	'e','1','img_l_1','img_r_1','img_f_1','img_b_1','Aug.13.2021'],
		[18		,18		, 2,	'e','2','img_l_2','img_r_2','img_f_2','img_b_2','Aug.12.2021'],
		[5		,19		, 4,	'c','4','img_l_4','img_r_4','img_f_4','img_b_4','Aug.11.2021'],
		[3		,19		, 2,	'c','2','img_l_2','img_r_2','img_f_2','img_b_2','Aug.10.2021'],
		[12		,17		, 4,	'e','4','img_l_4','img_r_4','img_f_4','img_b_4','Aug.9.2021'],
		[9		,19		, 3,	'c','3','img_l_3','img_r_3','img_f_3','img_b_3','Aug.6.2021'],
		[15.5	,19		,-1,	'e','1','img_l_1','img_r_1','img_f_1','img_b_1','Aug.5.2021'],
		[14.5	,19		,-1,	'e','1','img_l_1','img_r_1','img_f_1','img_b_1','Aug.4.2021'],
		[13.5	,19		,-1,	'e','1','img_l_1','img_r_1','img_f_1','img_b_1','Aug.3.2021'],
		[3.5	,19		,-1,	'c','1','img_l_1','img_r_1','img_f_1','img_b_1','Aug.2.2021'],
		[4.5	,19		,-1,	'c','1','img_l_1','img_r_1','img_f_1','img_b_1','Jul.31.2021'],
		[5.5	,19		,-1,	'c','1','img_l_1','img_r_1','img_f_1','img_b_1','Jul.30.2021'],
		[19		,20		, 2,	'e','2','img_l_2','img_r_2','img_f_2','img_b_2','Jul.29.2021'],
		[19		,20		,-2,	'e','2','img_l_2','img_r_2','img_f_2','img_b_2','Jul.28.2021'],
		[19.5	,21		, 1,	'e','1','img_l_1','img_r_1','img_f_1','img_b_1','Jul.27.2021'],
		[18		,21		, 2,	'e','2','img_l_2','img_r_2','img_f_2','img_b_2','Jul.26.2021'],
		[5		,21		, 2,	'c','2','img_l_2','img_r_2','img_f_2','img_b_2','Jul.23.2021'],
		[3		,21		, 2,	'c','2','img_l_2','img_r_2','img_f_2','img_b_2','Jul.22.2021'],
		[14		,21		, 2,	'e','2','img_l_2','img_r_2','img_f_2','img_b_2','Jul.21.2021'],
		[10		,23		, 3,	'c','3','img_l_3','img_r_3','img_f_3','img_b_3','Jul.14.2021'],
		[15.5	,23		, 1,	'e','1','img_l_1','img_r_1','img_f_1','img_b_1','Jul.13.2021'],
		[21.5	,23		, 3,	'e','3','img_l_3','img_r_3','img_f_3','img_b_3','Jul.8.2021'],
		[13.5	,23		, 1,	'e','1','img_l_1','img_r_1','img_f_1','img_b_1','Jul.7.2021'],
		[3.5	,23		, 2,	'c','2','img_l_2','img_r_2','img_f_2','img_b_2','Jul.6.2021']
	]
	var video_left_array = Array(db.length)
	var video_right_array = Array(db.length)
	var video_front_array = Array(db.length)
	var video_bottom_array = Array(db.length)
	var video_top_array = Array(db.length)
	create_tex()
	render_setting()
	ground()
	create_list()
	create_tag()

	function map_range(value, low1, high1, low2, high2) {
	    return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
	}
	const geometry = new THREE.BoxGeometry( 1, 1, 10 );
	const material = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
	const cube = new THREE.Mesh( geometry, material );
	cube.castShadow = true
	cube.position.x = -10
	// scene.add( cube );

function easeOutCubic(x){
	return 1 - Math.pow(1 - x, 3);
}
function easeInQuart(x) {
return x * x * x * x;
}

	function for_rec(counter){
		// counter = 0
				// camera.fov = 2
				// camera.updateProjectionMatrix();
		if(counter<700){
			if(counter%4000 <= 1000){
				if (counter%4000 < 50){
					$('.cat').css({'opacity':1})
				}else{
					$('.cat').css({'opacity':0})
				}
				if (counter%4000 < 500){
					camera.position.z = map_range(counter%4000, 0, 500, 120,  400)
					camera.fov = map_range(easeOutCubic(counter%4000/500)*500, 0, 500, 45 , 4)
					camera.updateProjectionMatrix();
				}else if (counter%4000 < 700){
					camera.position.z = map_range(counter-500, 0, 200, 400,  900)
					// camera.fov = map_range(counter-500, 0, 300, 2 , 4)
					camera.updateProjectionMatrix();
					// camera.position.z = map_range(counter%4000, 500, 1000, 400,  990)
				}
			}else if (counter%4000>3000){
				if (counter%4000 < 3050){
					$('.cat').css({'opacity':1})
				}else{
					$('.cat').css({'opacity':0})
				}
				if (counter%4000 < 3500){
					camera.position.z = map_range(counter%4000, 3000, 3500,  990, 400)
				}else{
					camera.position.z = map_range(counter%4000, 3500, 4000,  400, 120)
					camera.fov = map_range(easeInQuart((counter%4000-3500)/500)*500+3500, 3500, 4000, 2 , 45)
					camera.updateProjectionMatrix();
				}
			}else{
				camera.fov = 2
				camera.position.z = 990
			}
		mainpivot.rotation.z = degrees_to_radians(map_range(counter, 0, 500,  0, 360))
		camera_pivot.rotation.x = degrees_to_radians(map_range(Math.abs((counter+500)%1000-500), 0, 500,  0, 90))
		camera_pivot.position.z = map_range(Math.abs((counter+500)%1000-500), 0, 500,  0, post_height/2)

		}
		// camera.position.z = map_range(Math.abs((counter+1000)%2000-1000), 0, 1000,  100, 80)
		var loop = Math.abs((counter+1000)%2000-1000)
		if((loop < 1100) && (loop > 900)){
			for (var i = post_array.length - 1; i >= 0; i--) {
				var x= toScreenPosition(post_array[i].children[3]).x
				var y= toScreenPosition(post_array[i].children[3]).y
				$('.tag_elem_'+i).css({'left':Math.floor(x/100)*100+'px'})
				$('.tag_elem_'+i).css({'top':Math.floor(y/25)*25+'px'})
			}
		}else{
			for (var i = post_array.length - 1; i >= 0; i--) {
				$('.tag_elem_'+i).css({'left':toScreenPosition(post_array[i].children[3]).x+'px'})
				$('.tag_elem_'+i).css({'top':toScreenPosition(post_array[i].children[3]).y+'px'})
			}

		}

		for (var i = post_array.length - 1; i >= 0; i--) {
			post_array[i].position.z = 0
		}
		// if((counter%20) == 0){
		// 	animate_for_rec(Math.floor(counter/20),0)
		// }
	}
	// function animate_for_rec(index,sub_counter){
	// 	sub_counter = 200
	// 	post_array[index].position.z = map_range(sub_counter, 0, 200,  -1*post_height+0.1, 0)

		
	// 	setTimeout(function(){
	// 		if(sub_counter<200){
	// 					animate_for_rec(index,sub_counter+1)
	// 				}
	// 	},1)
	// }
	function toScreenPosition(obj)
	{	
		var vector = new THREE.Vector3();
		var canvas = renderer.domElement
	    vector.setFromMatrixPosition(obj.matrixWorld);

		// map to normalized device coordinate (NDC) space
		vector.project( camera );

		// map to 2D screen space
		vector.x = Math.round( (   vector.x + 1 ) * canvas.width  / 2 );
		vector.y = Math.round( ( - vector.y + 1 ) * canvas.height / 2 );

	    return { 
	        x: vector.x,
	        y: vector.y
	    };

	};
	function render_setting(){
		camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 10, 5000);
		// camera.lookAt(0, 0, 0);
		camera_pivot = new THREE.Group()
		// camera_pivot.position.y = post_height/2
		camera.position.z = 120
		camera_pivot.add(camera)

		scene = new THREE.Scene();
		scene.add(mainpivot)
		scene.add(camera_pivot)




  		const color = 0x000000;  // white
  		const near = 150;
  		const far = 200;


                    light = new THREE.DirectionalLight( 0xffffff );
                    light.lookAt( 0,0,0 );
					light.position.z = 50
					light.position.x = 50
					light.position.y = 20
                    light.castShadow = true;
                    light.shadow.camera.left = -50;
                    light.shadow.camera.right = 50;
                    light.shadow.camera.top = 50;
                    light.shadow.camera.bottom = -50;
                    light.shadow.radius = 0.25
                    camera_pivot.add(light)
                    console.log(camera_pivot)
                    // light.shadow.mapSize.width = 512; // default
                    // light.shadow.mapSize.height = 512; // default
                    light.shadow.camera.near = 0.1; // default
                    light.shadow.camera.far = 5000; // default
                    light.shadow.camera.fov = 45;
                    scene.add( light_group );
  		// scene.fog = new THREE.Fog(color, near, far);
  

		renderer = new THREE.WebGLRenderer();
		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.shadowMap.enabled = true;
		document.body.appendChild(renderer.domElement);

        controls = new OrbitControls(  
            camera_pivot, 
            renderer.domElement
        );
        // controls.target.z = 100;

		render()

	}
		window.addEventListener( 'mousemove', onMouseMove, false );
		function onMouseMove( event ) {
			whole_mouse_x = event.clientX
			mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
			mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
		}
		$('canvas').mousedown(function() {
			mousedown = true
		});
		$('canvas').mouseup(function() {
			mousedown = false
		});

	function render(){
		// counter++
		counter = counter+4
		// camera_pivot.rotation.z = degrees_to_radians(counter/10)
		renderer.render(scene, camera);
		window.requestAnimationFrame(render)
		raycaster.setFromCamera( mouse, camera );
		// if(whole_mouse_x > h*0.5 ){
			for (var j = post_array.length - 1; j >= 0; j--) {
				const intersects = raycaster.intersectObjects(post_array[j].children)
					post_array[ j ].children[0].material.color.set( 0xffffff );
					post_array[ j ].children[1].material.color.set( 0xffffff );
					post_array[ j ].children[2].material.color.set( 0xffffff );
					post_array[ j ].children[3].material.color.set( 0xffffff );
					post_array[ j ].children[4].material.color.set( 0xffffff );
					if(mousedown){
						post_array[j].position.z = -1*post_height+0.1
						mousedown_timeout = setTimeout(function(){
							for (var k = post_array.length - 1; k >= 0; k--) {
								post_array[ k ].position.z =  0
							}
						},1000)
					}
				for ( let i = 0; i < intersects.length; i ++ ) {
					if(prev_hovered !== j){
						$('.list_hovered').removeClass('list_hovered')
					}
					prev_hovered = j
					// console.log(j)
					$('.list_wrapper').find('.list').eq(j).addClass('list_hovered')
					post_array[ j ].children[0].material.color.set( 0xff865c );
					post_array[ j ].children[1].material.color.set( 0xff865c );
					post_array[ j ].children[2].material.color.set( 0xff865c );
					post_array[ j ].children[3].material.color.set( 0xff865c );
					post_array[ j ].children[4].material.color.set( 0xff865c );
					if(mousedown){
						intersects[ i ].object.parent.position.z =  0
					}
				}
			}
		// };
		if(post_array.length == db.length){
				for_rec(counter)
			}
	}
	$('.list').click(function(){
		var selected = parseInt($(this).attr('class').split('list_')[1])
		for (var j = post_array.length - 1; j >= 0; j--) {
			post_array[j].position.z = -1*post_height+0.1
		}
		post_array[selected].position.z =0
	})
	$('.list').hover(function(){
		var selected = parseInt($(this).attr('class').split('list_')[1])
		for (var j = post_array.length - 1; j >= 0; j--) {
			post_array[ j ].children[0].material.color.set( 0xffffff );
			post_array[ j ].children[1].material.color.set( 0xffffff );
			post_array[ j ].children[2].material.color.set( 0xffffff );
			post_array[ j ].children[3].material.color.set( 0xffffff );
			post_array[ j ].children[4].material.color.set( 0xffffff );
		}
		post_array[selected].children[0].material.color.set( 0xff0000 );
		post_array[selected].children[1].material.color.set( 0xff0000 );
		post_array[selected].children[2].material.color.set( 0xff0000 );
		post_array[selected].children[3].material.color.set( 0xff0000 );
		post_array[selected].children[4].material.color.set( 0xff0000 );
	})
	function ground(){
		var ground_geom = new THREE.PlaneGeometry(1050,1041, 1, 1 );
		var ground_texture = textureLoader.load( 'img/grid-01-01.png' );
			ground_texture.wrapS = ground_texture.wrapT = THREE.RepeatWrapping;
			ground_texture.repeat.set(10, 10);
		var ground_mat = new THREE.MeshBasicMaterial({color:0xffffff, map: ground_texture, side: THREE.DoubleSide});
		ground = new THREE.Mesh(ground_geom, ground_mat);
		// e refers emitter
		// c refers collector
		mainpivot.add(ground)
		// top,left,right,front,bottom
                // shadow_ground                
                var planeGeometry = new THREE.PlaneGeometry(1050,1041, 1, 1 );
                var planeMaterial = new THREE.ShadowMaterial({color: 0xaec1e2, transparent:true, opacity: 1, side: THREE.DoubleSide});
                var plane = new THREE.Mesh( planeGeometry, planeMaterial );
                plane.position.z = 1
                plane.receiveShadow = true;
                mainpivot.add( plane );
                // light                


		for (var i = db.length - 1; i >= 0; i--) {
			post(db[i][0] , db[i][1] , db[i][2] , db[i][3] , db[i][4] , db[i][5] , db[i][6] , db[i][7] , db[i][8])
		}




	}
	function post(posx,posz,scale,category,top,left,right,front,bottom){
		var array = Array(5)
		post_array.push(new THREE.Group())

		mainpivot.add(post_array[post_array.length-1])

		post_side(post_array.length-1,category,top,left,right,front,bottom)
		move_post(post_array.length-1,posx,posz)

		mainpivot.add(post_array[post_array.length-1])
		static_side_texture_1 = textureLoader.load( 'img/side-01.png' );
		static_side_texture_1.repeat.set(1, 1);

	}
	function create_list(){
		for (var i = db.length - 1; i >= 0; i--) {
			$('.list_wrapper').append(
				'<div class="list list_'+i+'">\
					<div class="list_elem category">'+db[i][4]+'</div>\
					<div class="list_elem top" style="background-image:url(img/'+db[i][5]+'.png)">&nbsp;</div>\
					<div class="list_elem left" style="background-image:url(img/'+db[i][6]+'.png)">&nbsp;</div>\
					<div class="list_elem right" style="background-image:url(img/'+db[i][7]+'.png)">&nbsp;</div>\
					<div class="list_elem front" style="background-image:url(img/'+db[i][8]+'.png)">&nbsp;</div>\
					<div class="list_elem bottom" style="background-image:url(img/'+db[i][9]+'.png)">&nbsp;</div>\
				<div>'
				
			)
		}
	}
	function create_tag(){
		for (var i = db.length - 1; i >= 0; i--) {
			$('.tag_wrapper').append(
					'<div class="tag_elem tag_elem_'+i+'">'+db[i][9]+'</div>'
			)
		}
	}
	function create_tex(){
		tex_array[0] = Array(5)
		tex_array[0][0] = textureLoader.load( 'vid/img_1.png' );
		tex_array[0][0].needsUpdate = true;

		tex_array[0][1] = textureLoader.load( 'vid/img_2.png' );
		tex_array[0][1].needsUpdate = true;

		tex_array[0][2] = textureLoader.load( 'vid/img_3.png' );
		tex_array[0][2].needsUpdate = true;

		tex_array[0][3] = textureLoader.load( 'vid/img_4.png' );
		tex_array[0][3].needsUpdate = true;

		tex_array[0][4] = textureLoader.load( 'vid/img_5.png' );
		tex_array[0][4].needsUpdate = true;
		// left

		// tex_array[0] =
		for (var i = tex_array.length - 1; i >= 1; i--) {
			tex_array[i] = Array(5)
		// left
			tex_array[i][0] = textureLoader.load( 'img/img_l_'+i+'.png' );
			tex_array[i][0].repeat.set(1, post_height/unit);

		// right
			tex_array[i][1] = textureLoader.load( 'img/img_r_'+i+'.png' );
			tex_array[i][1].repeat.set(1, post_height/unit);

		// front
			tex_array[i][2] = textureLoader.load( 'img/img_f_'+i+'.png' );
			tex_array[i][2].repeat.set(1, post_height/unit);
		// top
			tex_array[i][3] = textureLoader.load( 'img/img_t_'+i+'.png' );
			tex_array[i][3].repeat.set(0.2,0.23);
			tex_array[i][3].offset.x = 0.5;
		// bot
			tex_array[i][4] = textureLoader.load( 'img/img_b_'+i+'.png' );
			tex_array[i][4].repeat.set(0.2,0.2);
		}
	}
	function post_side(array_index,category,top,left,right,front,bottom){

		var vid_array = [37,43,36,43,36,25,39,22,31,22,31,22,31,22,31,22,31,22,31,22,31,22,31,22,31,22,31,22,31,22,31,22,31,22,31,22,31,22,39,24,42,38,40,35,41,26,9]

// mat
	if(vid_array.includes(array_index) ){

		var tex_1 = textureLoader.load( 'vid/img_1.png' );
			tex_1.repeat.set(1/25*Math.abs(db[array_index][2]), 1);
			tex_1.offset.set((1/25*(db[array_index][1]-Math.abs(db[array_index][2]/2)))-3/25, 0);
		var material1 = new THREE.MeshBasicMaterial({color:0xffffff, map: tex_1, side: THREE.DoubleSide});

		var tex_2 = textureLoader.load( 'vid/img_2.png' );
			tex_2.repeat.set(1/25*Math.abs(db[array_index][2]), 1);
			tex_2.offset.set((1/25*(db[array_index][1]-Math.abs(db[array_index][2]/2)))-3/25, 0);
		var material2 = new THREE.MeshBasicMaterial({color:0xffffff, map: tex_2, side: THREE.DoubleSide});

		var tex_3 = textureLoader.load( 'vid/img_3.png' );
			tex_3.repeat.set(1/25*Math.abs(db[array_index][2]), 1);
			tex_3.offset.set((1/25*(db[array_index][0]-Math.abs(db[array_index][2]/2)))-3/25, 0);
			tex_3.needsUpdate = true;
		var material3 = new THREE.MeshBasicMaterial({color:0xffffff, map: tex_3, side: THREE.DoubleSide});
			
			
			

		
		var tex_4 = textureLoader.load( 'vid/img_3.png' );
		var material4 = new THREE.MeshBasicMaterial({color:0xffffff, map: tex_4, side: THREE.DoubleSide});
			material4.map.repeat.set(1/25*Math.abs(db[array_index][2]), 1/25*Math.abs(db[array_index][2]));
			console.log(((1/25*(db[array_index][0]-Math.abs(db[array_index][2]/2)))))
			material4.map.offset.set(1/25*(db[array_index][0]-Math.abs(db[array_index][2]/2)), 1-1/25*(db[array_index][1]));
			material4.map.wrapS = material4.map.wrapT = THREE.RepeatWrapping;
			material4.map.needsUpdate = true;

		var tex_5 = tex_array[0][4].clone()
		var material5 = new THREE.MeshBasicMaterial({color:0xffffff, map: tex_5, side: THREE.DoubleSide});
	}else{
		console.log(parseInt(db[array_index][4]))
		console.log(tex_array)
		// left
		var material1 = new THREE.MeshBasicMaterial({color:0xffffff, map: tex_array[parseInt(db[array_index][4])][0], side: THREE.DoubleSide});

		// right
		var material2 = new THREE.MeshBasicMaterial({color:0xffffff, map: tex_array[parseInt(db[array_index][4])][1], side: THREE.DoubleSide});

		// front
		var material3 = new THREE.MeshBasicMaterial({color:0xffffff, map: tex_array[parseInt(db[array_index][4])][2], side: THREE.DoubleSide});
		
		//top
		var material4 = new THREE.MeshBasicMaterial({color:0xffffff, map: tex_array[parseInt(db[array_index][4])][3], side: THREE.DoubleSide});

		//bottom
		var material5 = new THREE.MeshBasicMaterial({color:0xffffff, map: tex_array[parseInt(db[array_index][4])][4], side: THREE.DoubleSide});


	}



// geom & mesh

		var geometry = new THREE.PlaneGeometry(unit, post_height, 1, 1 )
		
		var final_mesh = new THREE.Mesh(geometry,material1)
			final_mesh.rotation.x = degrees_to_radians(90)
			final_mesh.rotation.y = degrees_to_radians(120)
			final_mesh.position.x =  unit/4
			final_mesh.position.y =  1.73*unit/4
			final_mesh.position.z =  post_height/2
            final_mesh.castShadow = true;
		post_array[array_index].add(final_mesh)

		var final_mesh = new THREE.Mesh(geometry,material2)
			final_mesh.rotation.x = degrees_to_radians(90)
			final_mesh.rotation.y = degrees_to_radians(-120)
			final_mesh.position.x =  -1*unit/4
			final_mesh.position.y =  1.73*unit/4
			final_mesh.position.z =  post_height/2
            final_mesh.castShadow = true;
		post_array[array_index].add(final_mesh)
		
		var geometry = new THREE.PlaneGeometry(unit, post_height, 1, 1 )
		var final_mesh = new THREE.Mesh(geometry,material3)
			final_mesh.rotation.x = degrees_to_radians(90)
			final_mesh.rotation.y = degrees_to_radians(0)
			final_mesh.position.z =  post_height/2
            final_mesh.castShadow = true;
		post_array[array_index].add(final_mesh)

		const shape4 = new THREE.Shape();
		const x4 = 0, y4 = 0;
		shape4.moveTo(x4 - unit/2, y4 + 0);
		shape4.lineTo(x4 + 0, y4 + 1.73*unit/2);
		shape4.lineTo(x4 + unit/2, y4 + 0);
		const TriangleGeometry4 = new THREE.ShapeBufferGeometry(shape4);
		var final_mesh = new THREE.Mesh(TriangleGeometry4, material4);
			final_mesh.position.z =  post_height
            final_mesh.castShadow = true;
		post_array[array_index].add(final_mesh);

		const shape5 = new THREE.Shape();
		const x5 = 0, y5 = 0;
		shape5.moveTo(x5 - unit/2, y5 + 0);
		shape5.lineTo(x5 + 0, y5 + 1.73*unit/2);
		shape5.lineTo(x5 + unit/2, y5 + 0);
		const TriangleGeometry5 = new THREE.ShapeBufferGeometry(shape5);
		var final_mesh = new THREE.Mesh(TriangleGeometry5, material5);
            final_mesh.castShadow = true;
		post_array[array_index].add(final_mesh);
		console.log(post_array)
		post_array[array_index].castShadow = true

		post_array[array_index].scale.set(db[array_index][2],db[array_index][2],1)

		post_array[array_index].position.x = -12*(unit)+((db[array_index][1]%2)*(1.73*1/4*unit))+(db[array_index][0]*unit)
		post_array[array_index].position.y = 14*(1.73*1/2*unit)-(db[array_index][1]*(1.73*1/2*unit))
		post_array[array_index].position.z = -1*post_height+0.1
	}
	function move_post(array_index,x,y){
	}


// category 1,2
// timeline 1-22
// image-file-name




























	function degrees_to_radians(degrees){
	  var pi = Math.PI;
	  return degrees * (pi/180);
	}
})