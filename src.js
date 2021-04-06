// Find the latest version by visiting https://unpkg.com/three.

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { DragControls } from 'three/examples/jsm/controls/DragControls.js';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Interaction } from 'three.interaction';
import {ObjectControls} from 'threeJS-object-controls';
const TWEEN = require('@tweenjs/tween.js')

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
const renderer = new THREE.WebGLRenderer();
const interaction = new Interaction(renderer, scene, camera);
const controls = new OrbitControls(camera, renderer.domElement);

renderer.outputEncoding = THREE.sRGBEncoding;
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const loader = new GLTFLoader();
var bopitButtonLeftPressed = false;
var bopitButtonRightPressed = false;

loader.load( 'assets/bopitButtonLeft.glb', function ( gltf ) {
	var bopitButtonLeft = gltf.scene.children[0];
	scene.add( gltf.scene );
	bopitButtonLeft.cursor = 'pointer';
	bopitButtonLeft.on('click', function(ev) {
		if(bopitButtonLeftPressed != true) {
			console.log("hello");
			bopitButtonLeft.position.z += 0.01;
			bopitButtonLeftPressed = true;
			setTimeout(() => {
				bopitButtonLeft.position.z -= 0.01;
				bopitButtonLeftPressed = false;
			}, 300);
		}
	});

}, undefined, function ( error ) {
	console.error( error );
} );

loader.load( 'assets/bopitButtonRight.glb', function ( gltf ) {
	var bopitButtonRight = gltf.scene.children[0];
	scene.add( gltf.scene );
	bopitButtonRight.cursor = 'pointer';
	bopitButtonRight.on('click', function(ev) {
		if(bopitButtonRightPressed != true) {
			console.log("hello");
			bopitButtonRight.position.z -= 0.01;
			bopitButtonRightPressed = true;
			setTimeout(() => {
				bopitButtonRight.position.z += 0.01;
				bopitButtonRightPressed = false;
			}, 300);
		}
	});	
	bopitButtonRight.on('mouseDown', function(ev) {
		controls.enabled = false;
	});	
	bopitButtonRight.on('mouseUp', function(ev) {
		controls.enabled = true;
	});
}, undefined, function ( error ) {
	console.error( error );
} );

loader.load( 'assets/main.glb', function ( gltf ) {
	scene.add( gltf.scene );
}, undefined, function ( error ) {
	console.error( error );
} );

const objects = [];
const dragControls = new DragControls( objects, camera, renderer.domElement );

loader.load( 'assets/pullIt.glb', function ( gltf ) {
	var pullIt = gltf.scene.children[0];
	scene.add( gltf.scene );
	pullIt.userData.limit = {
		min: new THREE.Vector3(-0.08, -0.16302920877933502, 0.08229061961174011),
	  	max: new THREE.Vector3(0, -0.16302920877933502, 0.08229061961174011)
	};
	var pulledIt = false;
	pullIt.userData.update = function(){
		pullIt.position.clamp(pullIt.userData.limit.min, pullIt.userData.limit.max);
		if(pullIt.position.x < -0.075 && pulledIt == true) {
			var position = { x : pullIt.position.x };
			var target = { x : 0 };
			var tween = new TWEEN.Tween(position).to(target, 250);
			tween.onUpdate(function(){
				pullIt.position.x = position.x;
			});
			if(pulledIt == true) {
				tween.start();
			}
		}
	}
	objects.push(pullIt);
	dragControls.addEventListener( 'dragstart', function ( event ) {
		controls.enabled = false;
		pulledIt = true;
	});
	dragControls.addEventListener( 'dragend', function ( event ) {
		controls.enabled = true;
		pulledIt = false;
	});

}, undefined, function ( error ) {
	console.error( error );
} );


loader.load( 'assets/twistIt_newOrigin.glb', function ( gltf ) {
	console.log(gltf.scene.children[0]);
	var twistIt = gltf.scene.children[0];
	var previousMousePosition = {
		x: 0,
		y: 0
	};
	twistIt.cursor = 'grab';
	twistIt.on('mouseover', function(ev) {
		controls.enabled = false;
	});	
	twistIt.on('mouseout', function(ev) {
		controls.enabled = true;
	});
	twistIt.on('mousemove', function (env) {
		var e = env.data.originalEvent;
		var deltaMove = {
			x: e.offsetX-previousMousePosition.x,
			y: e.offsetY-previousMousePosition.y
		};
	
		if(e.buttons == 1) {
			twistIt.cursor = 'grabbed';
			var deltaRotationQuaternion = new THREE.Quaternion()
				.setFromEuler(new THREE.Euler(
					toRadians(deltaMove.y * 3),
					0,
					0,
					'XYZ'
				));
	
			twistIt.quaternion.multiplyQuaternions(deltaRotationQuaternion, twistIt.quaternion);
		}
	
		previousMousePosition = {
			x: e.offsetX,
			y: e.offsetY
		};
	});
	scene.add( gltf.scene );

	
}, undefined, function ( error ) {
	console.error( error );
} );

function toRadians(angle) {
	return angle * (Math.PI / 180);
}


const ambientLight = new THREE.AmbientLight( 0x404040 ); // soft white light
const pointLight = new THREE.SpotLight(0x404040, 5, 0, Math.PI/2); // soft white light
scene.add( pointLight );
scene.add( ambientLight );

scene.addEventListener('mouseup', function () {
	console.log("hi");
});

camera.position.z = 1.5;

const animate = function () {
	objects.forEach(o => {
		o.userData.update();
	})
	requestAnimationFrame( animate );
	TWEEN.update();
	renderer.render( scene, camera );
};
animate();