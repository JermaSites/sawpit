// Find the latest version by visiting https://unpkg.com/three.

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { DragControls } from 'three/examples/jsm/controls/DragControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Interaction } from 'three.interaction';
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

loader.load( 'assets/models/bopitButtonLeft.glb', function ( gltf ) {
	var bopitButtonLeft = gltf.scene.children[0];
	scene.add( gltf.scene );
	bopitButtonLeft.cursor = 'pointer';
	bopitButtonLeft.on('click', function(ev) {
		if(bopitButtonLeftPressed != true) {
			boppedit();
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

loader.load( 'assets/models/bopitButtonRight.glb', function ( gltf ) {
	var bopitButtonRight = gltf.scene.children[0];
	scene.add( gltf.scene );
	bopitButtonRight.cursor = 'pointer';
	bopitButtonRight.on('click', function(ev) {
		if(bopitButtonRightPressed != true) {
			boppedit();
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

loader.load( 'assets/models/main.glb', function ( gltf ) {
	scene.add( gltf.scene );
}, undefined, function ( error ) {
	console.error( error );
} );

const objects = [];
const dragControls = new DragControls( objects, camera, renderer.domElement );

loader.load( 'assets/models/pullIt.glb', function ( gltf ) {
	var pullIt = gltf.scene.children[0];
	scene.add( gltf.scene );
	pullIt.userData.limit = {
		min: new THREE.Vector3(-0.08, -0.16302920877933502, 0.08229061961174011),
	  	max: new THREE.Vector3(0, -0.16302920877933502, 0.08229061961174011)
	};
	pullIt.userData.update = function(){
		pullIt.position.clamp(pullIt.userData.limit.min, pullIt.userData.limit.max);
	}
	objects.push(pullIt);
	dragControls.addEventListener( 'dragstart', function ( event ) {
		controls.enabled = false;
	});
	dragControls.addEventListener( 'dragend', function ( event ) {
		controls.enabled = true;
		pullIt.position.clamp(pullIt.userData.limit.min, pullIt.userData.limit.max);
		var position = { x : pullIt.position.x };
		if(pullIt.position.x < -0.075) {
			pulledIt();
		}
		var target = { x : 0 };
		var tween = new TWEEN.Tween(position).to(target, 250);
		tween.onUpdate(function(){
			pullIt.position.clamp(pullIt.userData.limit.min, pullIt.userData.limit.max);
			pullIt.position.x = position.x;
		});
		tween.start();
	});

}, undefined, function ( error ) {
	console.error( error );
} );

var dragRotate = false;

loader.load( 'assets/models/twistIt_newOrigin.glb', function ( gltf ) {
	console.log(gltf.scene.children[0]);
	var twistIt = gltf.scene.children[0];
	twistIt.rotation.x = 0;
	twistIt.cursor = 'grab';
	twistIt.on('mouseover', function(ev) {
		controls.enabled = false;
	});	
	twistIt.on('mouseout', function(ev) {
		controls.enabled = true;
	});	
	twistIt.on('mousedown', function(ev) {
		dragRotate = true;
		console.log(`dragrotate = ${dragRotate}`)
	});	
	var previousMousePosition = {
		x: 0,
		y: 0
	};
	console.log(renderer.domElement)
	twistIt.userData.rotationNess = 0;
	renderer.domElement.addEventListener('pointermove', function (e) {
		if(e.buttons == 1 && dragRotate == true) {
			renderer.domElement.style.cursor = "grabbing";
			var deltaMove = {
				y: e.offsetY-previousMousePosition.y
			};
			twistIt.rotation.x += deltaMove.y * 0.05;
			twistIt.userData.rotationNess += deltaMove.y * 0.05;
			console.log(twistIt.userData.rotationNess);
		}
		previousMousePosition = {
			x: e.offsetX,
			y: e.offsetY
		};
	});

	document.addEventListener('click', function() { //I HAVE LITERALLY NO IDEA WHY I CANT JUST ADD THIS EVENT TO RENDER.DOMELEMENT AAAAAAAAAAAAAAAAAAA
		if(dragRotate == true) {
			dragRotate = false;
			console.log(twistIt.userData.rotationNess);
			renderer.domElement.style.cursor = "default";
			var rotation = { x : twistIt.userData.rotationNess};
			var target = { x : 0 };
			var tween = new TWEEN.Tween(rotation).to(target, 250);
			if(twistIt.userData.rotationNess > 5 || twistIt.userData.rotationNess < -5) {
				twistedIt();
			}
			tween.onUpdate(function(){
				twistIt.rotation.x = rotation.x;
			});
			tween.onComplete(function() {
				console.log("hello");
				twistIt.userData.rotationNess = 0;
			});
			tween.start();
		}
	}, false);	

	scene.add( gltf.scene );
	
}, undefined, function ( error ) {
	console.error( error );
} );

function toRadians(angle) {
	return angle * (Math.PI / 180);
}

const listener = new THREE.AudioListener();
camera.add( listener );
const bopItSound = new THREE.PositionalAudio( listener );
bopItSound.setVolume( 0.5 );
const twistItSound = new THREE.PositionalAudio( listener );
twistItSound.setVolume( 0.5 );
const pullItSound = new THREE.PositionalAudio( listener );
pullItSound.setVolume( 0.5 );
const audioLoader = new THREE.AudioLoader();

const sphere = new THREE.SphereGeometry( 0.01, 0.01, 0.01 );
const material = new THREE.MeshPhongMaterial( { color: 0xff2200 } );
const mesh = new THREE.Mesh( sphere, material );
scene.add( mesh );
mesh.add( bopItSound );
mesh.add( twistItSound );
mesh.add( pullItSound );

audioLoader.load( 'assets/audio/Bop_R.wav', function( buffer ) {
	bopItSound.setBuffer( buffer );
});

audioLoader.load( 'assets/audio/Twist_R.wav', function( buffer ) {
	twistItSound.setBuffer( buffer );
});

audioLoader.load( 'assets/audio/Pull_R.wav', function( buffer ) {
	pullItSound.setBuffer( buffer );
});

function boppedit() {
	bopItSound.play();
}

function twistedIt() {
	twistItSound.play();
}

function pulledIt() {
	pullItSound.play();
}

const ambientLight = new THREE.AmbientLight( 0x404040 ); // soft white light
const pointLight = new THREE.SpotLight(0x404040, 5, 0, Math.PI/2); // soft white light
scene.add( pointLight );
scene.add( ambientLight );

const textureLoader = new THREE.CubeTextureLoader();
const texture = textureLoader.load([
	'https://threejsfundamentals.org/threejs/resources/images/cubemaps/computer-history-museum/pos-x.jpg',
	'https://threejsfundamentals.org/threejs/resources/images/cubemaps/computer-history-museum/neg-x.jpg',
	'https://threejsfundamentals.org/threejs/resources/images/cubemaps/computer-history-museum/pos-y.jpg',
	'https://threejsfundamentals.org/threejs/resources/images/cubemaps/computer-history-museum/neg-y.jpg',
	'https://threejsfundamentals.org/threejs/resources/images/cubemaps/computer-history-museum/pos-z.jpg',
	'https://threejsfundamentals.org/threejs/resources/images/cubemaps/computer-history-museum/neg-z.jpg',
]);
scene.background = texture;
controls.enablePan = false;
controls.minDistance = 0.25;
controls.maxDistance = 5;

camera.position.z = 1.5;

const canvas = document.getElementById('texture');
const odometerCanvas = document.getElementById('odometer');
const ctx = canvas.getContext('2d');
const odometerCtx = odometerCanvas.getContext('2d');
var myOdometer = new odometer(odometerCtx, {
	height: 42, 
	value: 500000,
});
const canvasTexture = new THREE.CanvasTexture(ctx.canvas);
canvasTexture.encoding = THREE.sRGBEncoding;

loader.load( 'assets/models/tv/scene.gltf', function ( gltf ) {
	scene.add( gltf.scene );
	var tv = gltf.scene.children[0].children[0].children[0].children[0]; //this is awful but i literally cba to open up the model and reexporting it lol
	tv.material.map = canvasTexture;
	tv.position.y = 2;
	console.log(tv.material);
	console.log(gltf.scene);
}, undefined, function ( error ) {
	console.error( error );
} );

const image = new Image(); // Using optional size for image
image.onload = drawImageActualSize; // Draw when image has loaded
image.src = 'assets/models/tv/textures/Diffusebakee_baseColor.png';
function drawImageActualSize() {
	canvas.width = 800;
	canvas.height = 800;
	ctx.drawImage(this, 0, 0, 800, 800);
  }


  
const animate = function () {
	objects.forEach(o => {
		o.userData.update();
	})
	requestAnimationFrame( animate );
	myOdometer.setValue(myOdometer.getValue() - 0.1);
	ctx.drawImage(odometerCtx.canvas, 510, 595);
	TWEEN.update();
	canvasTexture.needsUpdate = true;
	renderer.render( scene, camera );
};
animate();