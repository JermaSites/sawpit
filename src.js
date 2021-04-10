// Find the latest version by visiting https://unpkg.com/three.

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { DragControls } from 'three/examples/jsm/controls/DragControls.js';
import ThreeDragger from 'three-dragger';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Interaction } from 'three.interaction';
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib.js';
import { RectAreaLightHelper } from 'three/examples/jsm/helpers/RectAreaLightHelper.js';
RectAreaLightUniformsLib.init();
import CameraControls from './camera-controls';
CameraControls.install( { THREE: THREE } );
const TWEEN = require('@tweenjs/tween.js')

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
const renderer = new THREE.WebGLRenderer();
const interaction = new Interaction(renderer, scene, camera);
// const controls = new OrbitControls(camera, renderer.domElement);
const clock = new THREE.Clock();
const EPS = 1e-5;
// in order to archive FPS look, set EPSILON for the distance to the center
camera.position.set( 0, 0, EPS );
// renderer.setSize( width, height );
// document.body.appendChild( renderer.domElement );

const cameraControls = new CameraControls( camera, renderer.domElement );
// cameraControls.maxDistance = EPS;
cameraControls.azimuthRotateSpeed = - 0.3; // negative value to invert rotation direction
cameraControls.polarRotateSpeed   = - 0.3; // negative value to invert rotation direction
cameraControls.mouseButtons.right = CameraControls.ACTION.NONE;
cameraControls.touches.two = CameraControls.ACTION.TOUCH_ZOOM_TRUCK;
cameraControls.saveState();


renderer.outputEncoding = THREE.sRGBEncoding;
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const loader = new GLTFLoader();
var bopitButtonLeftPressed = false;
var bopitButtonRightPressed = false;

const bopItGroup = new THREE.Group();

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
	bopitButtonLeft.on('mouseDown', function(ev) {
		cameraControls.enabled = false;
	});	
	bopitButtonLeft.on('mouseUp', function(ev) {
		cameraControls.enabled = true;
	});
	bopItGroup.add(bopitButtonLeft);

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
		cameraControls.enabled = false;
	});	
	bopitButtonRight.on('mouseUp', function(ev) {
		cameraControls.enabled = true;
	});
	bopItGroup.add(bopitButtonRight);

}, undefined, function ( error ) {
	console.error( error );
} );

loader.load( 'assets/models/main.glb', function ( gltf ) {
	scene.add( gltf.scene );
	var main = gltf.scene.children[0];
	bopItGroup.add(main);
}, undefined, function ( error ) {
	console.error( error );
} );

const objects = [];
// const dragControls = new DragControls( objects, camera, document.getElementById("testingbullshit") );
//replaced dragcontrols with an alternative libary due to incompatibility with first person camera stuff
const mouseDragger = new ThreeDragger(objects, camera, renderer.domElement);

loader.load( 'assets/models/pullIt.glb', function ( gltf ) {
	var pullIt = gltf.scene.children[0];
	scene.add( gltf.scene );
	pullIt.cursor = 'pointer';

	pullIt.on('mouseover', function(){ //for some reason putting a cursor on this object requires an event to be put on it even tho it doesen't do anything
	});	//im guessing its because three.js.interact needs some sort of "hook" to be added? idfk

	pullIt.userData.limit = {
		min: new THREE.Vector3(-0.08, -0.16302920877933502, 0.08229061961174011),
	  	max: new THREE.Vector3(0, -0.16302920877933502, 0.08229061961174011)
	};
	pullIt.userData.update = function(){
		pullIt.position.clamp(pullIt.userData.limit.min, pullIt.userData.limit.max);
	}
	objects.push(pullIt);
	mouseDragger.on( 'dragstart', function ( event ) {
		cameraControls.enabled = false;
	});
	mouseDragger.on( 'dragend', function ( event ) {
		cameraControls.enabled = true;
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

	mouseDragger.on('drag', function (data) {
		const { target, position } = data;
		target.position.set(position.x, position.y, position.z);
	});
	bopItGroup.add(pullIt);

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
		cameraControls.enabled = false;
	});	
	twistIt.on('mouseout', function(ev) {
		cameraControls.enabled = true;
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
	bopItGroup.add(twistIt);
	
}, undefined, function ( error ) {
	console.error( error );
} );

bopItGroup.scale.x = 0.3;
bopItGroup.scale.y = 0.3;
bopItGroup.scale.z = 0.3;

bopItGroup.position.y = -0.7;
bopItGroup.position.z = 7.4;

bopItGroup.rotation.x = 1.58;
bopItGroup.rotation.y = 0.017;
bopItGroup.rotation.z = 0.4;

scene.add(bopItGroup);
console.log(bopItGroup);

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

cameraControls.moveTo(0, -0.5, 8);

const canvas = document.getElementById('texture');
const odometerCanvas = document.getElementById('odometer');
const ctx = canvas.getContext('2d');
const odometerCtx = odometerCanvas.getContext('2d');
var myOdometer = new odometer(odometerCtx, {
	height: 42, 
	value: 500000
});
const canvasTexture = new THREE.CanvasTexture(ctx.canvas);
canvasTexture.encoding = THREE.sRGBEncoding;

loader.load( 'assets/models/tv/scene.gltf', function ( gltf ) {
	scene.add( gltf.scene );
	var tv = gltf.scene.children[0].children[0].children[0].children[0]; //this is awful but i literally cba to open up the model and reexporting it lol
	tv.material.map = canvasTexture;

	var tvGroup = new THREE.Group();
	tvGroup.add(gltf.scene);

	console.log(tv);
	console.log(tv.material);

	const rectLight = new THREE.RectAreaLight( 0xffffff, 1.0, 2.3, 1.9 );
	const rectLightHelper = new RectAreaLightHelper( rectLight );
	rectLight.add( rectLightHelper );
	

	// rectLight.position.set( tv.position.x, tv.position.y, tv.position.z );
	
	// rectLight.lookAt( tv.position );
	console.log(rectLight);
	rectLight.position.y = 1.05;
	rectLight.position.z = 0.6;
	tvGroup.add(rectLight);

	tvGroup.position.x = -5.4;
	tvGroup.position.y = 0.7;
	tvGroup.position.z = -2;

	tvGroup.rotation.y = 0.75;
	scene.add(tvGroup);
	console.log(tvGroup);

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

const pointLight = new THREE.PointLight(0xffffff, 0.05, 0, 20); // soft white light
pointLight.position.y = 2;
pointLight.position.z = 7;
scene.add( pointLight );
console.log(pointLight);

const pointLightHelper = new THREE.PointLightHelper( pointLight, 1 );
scene.add( pointLightHelper );


loader.load( 'assets/models/table/scene.gltf', function ( gltf ) {
	scene.add( gltf.scene );
	var table = gltf.scene.children[0].children[0].children[0].children[0]; //same as above lol
	table.position.y = -6;
	table.position.x = -1;
	table.position.z = -2.25;
}, undefined, function ( error ) {
	console.error( error );
} );

const geometry = new THREE.BoxGeometry( 25, 10, 15 );
const concreteTexture = new THREE.TextureLoader().load( 'assets/concrete.jpg' );
const cubeMaterial = new THREE.MeshLambertMaterial( {color: 0xFFFFFF, map: concreteTexture, side: THREE.BackSide } );
const cube = new THREE.Mesh( geometry, cubeMaterial );
console.log(cube);
cube.position.z = 1.875;
scene.add( cube );
  
const animate = function () {
	objects.forEach(o => {
		o.userData.update();
	})
	requestAnimationFrame( animate );
	myOdometer.setValue(myOdometer.getValue() - 0.1);
	ctx.drawImage(odometerCtx.canvas, 510, 595);
	TWEEN.update();
	canvasTexture.needsUpdate = true;
	const delta = clock.getDelta();
	cameraControls.update( delta );
	renderer.render( scene, camera );
};
animate();