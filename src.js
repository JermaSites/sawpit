// Find the latest version by visiting https://unpkg.com/three.

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { DragControls } from 'three/examples/jsm/controls/DragControls.js';
// import { FlyControls } from 'three/examples/jsm/controls/FlyControls.js ';
import ThreeDragger from 'three-dragger';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
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
// const flyControls = new FlyControls( camera, renderer.domElement );

// cameraControls.maxDistance = EPS;
cameraControls.azimuthRotateSpeed = - 0.3; // negative value to invert rotation direction
cameraControls.polarRotateSpeed   = - 0.3; // negative value to invert rotation direction
cameraControls.mouseButtons.right = CameraControls.ACTION.NONE;
cameraControls.touches.two = CameraControls.ACTION.TOUCH_ZOOM_TRUCK;
cameraControls.saveState();


renderer.outputEncoding = THREE.sRGBEncoding;
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const loadingManager = new THREE.LoadingManager( () => {	
	const loadingScreen = document.getElementById( 'loading-screen' );
	loadingScreen.classList.add( 'fade-out' );

	// optional: remove loader from DOM via event listener
	loadingScreen.addEventListener( 'transitionend', onTransitionEnd );
	
} );

function onTransitionEnd( event ) {

	event.target.remove();
	
}

const loader = new GLTFLoader(loadingManager);
var bopitButtonLeftPressed = false;
var bopitButtonRightPressed = false;

const bopItGroup = new THREE.Group();

loader.load( 'assets/models/bopitButtonLeft.glb', function ( gltf ) {
	var bopitButtonLeft = gltf.scene.children[0];
	bopitButtonLeft.castShadow = true; 
	bopitButtonLeft.receiveShadow = true; 
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
	bopitButtonRight.castShadow = true; 
	bopitButtonRight.receiveShadow = true; 
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
	main.castShadow = true; 
	main.receiveShadow = true; 
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
	pullIt.castShadow = true; 
	pullIt.receiveShadow = true; 
	var isTweened = false;
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
		if(pullIt.position.x < -0.075 && isTweened == false) {
			isTweened = true;
			pulledIt();
		}
	}
	objects.push(pullIt);
	mouseDragger.on( 'dragstart', function ( event ) {
		cameraControls.enabled = false;
	});
	mouseDragger.on( 'dragend', function ( event ) {
		cameraControls.enabled = true;
		pullIt.position.clamp(pullIt.userData.limit.min, pullIt.userData.limit.max);
		var position = { x : pullIt.position.x };
		var target = { x : 0 };
		var tween = new TWEEN.Tween(position).to(target, 250);
		tween.onUpdate(function(){
			pullIt.position.clamp(pullIt.userData.limit.min, pullIt.userData.limit.max);
			pullIt.position.x = position.x;
		});
		tween.onStart(function () {
			isTweened = true;
			console.log(isTweened)
		})
		tween.onComplete(function () {
			isTweened = false;
			console.log(isTweened)
		})
		tween.start();
	});

	mouseDragger.on('drag', function (data) {
		const { target, position } = data;
		
		target.position.set(-Math.abs(position.x), position.y, position.z);
	});
	bopItGroup.add(pullIt);

}, undefined, function ( error ) {
	console.error( error );
} );

var dragRotate = false;

loader.load( 'assets/models/twistIt_newOrigin.glb', function ( gltf ) {
	console.log(gltf.scene.children[0]);
	var twistIt = gltf.scene.children[0];
	twistIt.castShadow = true; 
	twistIt.receiveShadow = true; 
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
			if(twistIt.userData.rotationNess > 15 || twistIt.userData.rotationNess < -15) {
				twistIt.userData.rotationNess = 0;
				dragRotate = false;
				renderer.domElement.style.cursor = "default";
				twistedIt();
			}
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

// bopItGroup.scale.x = 0.3;
// bopItGroup.scale.y = 0.3;
// bopItGroup.scale.z = 0.3;

// bopItGroup.position.x = 7.5;
// bopItGroup.position.y = 3.4;
// bopItGroup.position.z = -0.5;
// bopItGroup.position.x = 7.1;
// bopItGroup.position.y = 3.01;
// bopItGroup.position.z = -0.5;
bopItGroup.position.x = 6.370;
bopItGroup.position.y = 3.070;
bopItGroup.position.z = -0.5;

bopItGroup.rotation.x = 1.44;
bopItGroup.rotation.y = 5.5;
bopItGroup.rotation.z = 1.5;

bopItGroup.castShadow = true;
bopItGroup.receiveShadow = true;

scene.add(bopItGroup);
console.log(bopItGroup);

const listener = new THREE.AudioListener();
camera.add( listener );
const bopItSound = new THREE.PositionalAudio( listener );
bopItSound.setVolume( 10 );
const twistItSound = new THREE.PositionalAudio( listener );
twistItSound.setVolume( 10 );
const pullItSound = new THREE.PositionalAudio( listener );
pullItSound.setVolume( 10 );
const drumLoop = new THREE.PositionalAudio( listener );
drumLoop.setVolume( 2 );
const bopIt_announce = new THREE.PositionalAudio( listener );
bopIt_announce.setVolume( 15 );
const twistIt_announce = new THREE.PositionalAudio( listener );
twistIt_announce.setVolume( 15 );
const pullIt_announce = new THREE.PositionalAudio( listener );
pullIt_announce.setVolume( 15 );
const failSound = new THREE.PositionalAudio( listener );
failSound.setVolume( 15 );
const audioLoader = new THREE.AudioLoader();

const sphere = new THREE.SphereGeometry( 0.01, 0.01, 0.01 );
const material = new THREE.MeshPhongMaterial( { color: 0xff2200 } );
const mesh = new THREE.Mesh( sphere, material );
scene.add( mesh );
mesh.add( bopIt_announce );
mesh.add( twistIt_announce );
mesh.add( pullIt_announce );
mesh.add( failSound );

// const mesh2 = new THREE.Mesh( sphere, material );
// scene.add( mesh2 );
mesh.add( drumLoop );
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

audioLoader.load( 'assets/audio/drum_loop.mp3', function( buffer ) {
	drumLoop.setBuffer( buffer );
	drumLoop.setLoop( true );
	// drumLoop.play();
	// console.log(drumLoop);
});

audioLoader.load( 'assets/audio/jigsaw/bop_it.mp3', function( buffer ) {
	bopIt_announce.setBuffer( buffer );
});

audioLoader.load( 'assets/audio/jigsaw/twist_it.mp3', function( buffer ) {
	twistIt_announce.setBuffer( buffer );
});

audioLoader.load( 'assets/audio/jigsaw/pull_it.mp3', function( buffer ) {
	pullIt_announce.setBuffer( buffer );
});

audioLoader.load( 'assets/audio/jigsaw/fail.mp3', function( buffer ) {
	failSound.setBuffer( buffer );
});

var inGame = false;

function boppedit() {
	if(introFinished === true && failSound.isPlaying === false) {
		if(inGame == false) {
			startGame();
		} else {
			playAction("bopit");
		}
	}
}

function twistedIt() {
	if(inGame == true) {
		playAction("twistit");
	}
	// console.log("TWIST5ED ASDJHKGADKJAWDLAWKJ")
}

function pulledIt() {
	if(inGame == true) {
		playAction("pullit");
	}
	console.log("TWIST5ED ASDJHKGADKJAWDLAWKJ");
}

function randomIntFromInterval(min, max) { // min and max included 
	return Math.floor(Math.random() * (max - min + 1) + min);
}
var speed = 0;
var expectedAction;
var playedAction;
var playcooldown = false; //this prevents people from getting confused if they start another game immeditly after failing
var score = 0;
var win = false;

function startGame() {
	playedAction = false;
	if(playcooldown == false) {
		score = 0;
		speed = 5;
		inGame = true;
		continueGame();
	}
}

function continueGame() {
	console.log("Speed is ", speed);
	expectedAction = null;
	drumLoop.setPlaybackRate((speed - 3)/3);
	drumLoop.play();
	setTimeout(() => {
		if(inGame == true) {
			drumLoop.pause();
			switch (randomIntFromInterval(0, 2)) {
				case 0:
					bopIt_announce.play();
					expectedAction = "bopit";
					break;				
				case 1:
					twistIt_announce.play();
					expectedAction = "twistit";
					break;				
				case 2:
					pullIt_announce.play();
					expectedAction = "pullit";
					break;
			
				default:
					throw new Error("Invalid action generated!!");
			}
			setTimeout(() => {
				if(playedAction != true) {
					playedAction = false;
					failSound.play();
					drumLoop.stop();
					inGame = false;
					playcooldown = true;
					setTimeout(() => {
						playcooldown = false;
					}, 100);
				} else {
					playedAction = false;
					playcooldown = true;
					setTimeout(() => {
						playcooldown = false;
					}, 100);
				}
			}, (1000 - ((speed - 5) * 10)));
		}
	}, randomIntFromInterval(1200 - ((speed - 5) * 100), 2000 - ((speed - 5) * 100)));
}

function playAction(action) {
	if(playcooldown == false) {
		playedAction = true;
		if(expectedAction == action) {
			switch (action) {
				case "bopit":
					bopItSound.play();
					break;			
				case "twistit":
					twistItSound.play();
					break;			
				case "pullit":
					pullItSound.play();
					break;
				default:
					throw new Error("Invalid action played!!");
			}
			speed += 0.1;
			score += 1;
			if(score > 24) {
				drumLoop.stop();
				music.stop();
				inGame = false;
				win = true;
				document.getElementById("winscreen").style.display = "block";
				document.getElementById("winscreen").style.opacity = 1; 
				setTimeout(() => {
					partyHorn.play();
				}, 4000);
			} else {
				continueGame();
			}
			
		} else {
			failSound.play();
			drumLoop.stop();
			inGame = false;
		}
	}
}

cameraControls.moveTo(8, 3.5, -0.5);
cameraControls.rotate(1.65, 0);
console.log(cameraControls);

// const canvas = document.getElementById('texture');
// const odometerCanvas = document.getElementById('odometer');
// const ctx = canvas.getContext('2d');
// const odometerCtx = odometerCanvas.getContext('2d');
// var myOdometer = new odometer(odometerCtx, {
// 	height: 42, 
// 	value: 500000
// });

// const canvasTexture = new THREE.CanvasTexture(ctx.canvas);
// canvasTexture.encoding = THREE.sRGBEncoding;

// loader.load( 'assets/models/tv/scene.gltf', function ( gltf ) {
// 	scene.add( gltf.scene );
// 	var tv = gltf.scene.children[0].children[0].children[0].children[0]; //this is awful but i literally cba to open up the model and reexporting it lol
// 	tv.material.map = canvasTexture;

// 	var tvGroup = new THREE.Group();
// 	tvGroup.add(gltf.scene);

// 	console.log(tv);
// 	console.log(tv.material);

const ipadLight = new THREE.RectAreaLight( 0xffffff );
ipadLight.width = 1.01;
ipadLight.height = 1.01;
ipadLight.intensity = 0.24;

ipadLight.position.x = 3.09;
ipadLight.position.y = 3.85;
ipadLight.position.z = 3.160;

ipadLight.rotation.x = -0.28;
ipadLight.rotation.y = 0.89;
ipadLight.rotation.z = 3.3;
// const rectLightHelper = new RectAreaLightHelper( ipadLight );
// ipadLight.add( rectLightHelper );
scene.add(ipadLight);

const tvLight01 = new THREE.RectAreaLight( 0xffffff );
tvLight01.width = 1.6;
tvLight01.height = 1.61;
tvLight01.position.x = 2.86;
tvLight01.position.y = 4.52;
tvLight01.position.z = 1.84;

tvLight01.rotation.x = 3.141;
tvLight01.rotation.y = 1.357;
tvLight01.rotation.z = 3.141;
// const rectLightHelper = new RectAreaLightHelper( tvLight01 );
// tvLight01.add( rectLightHelper );
scene.add(tvLight01);

const tvLight02 = new THREE.RectAreaLight( 0xffffff );
tvLight02.width = 1.89;
tvLight02.height = 1.35;
tvLight02.position.x = 3.1;
tvLight02.position.y = 4.16;
tvLight02.position.z = -2.09;

tvLight02.rotation.x = 0;
tvLight02.rotation.y = 1.297;
tvLight02.rotation.z = 0;
tvLight02.visible = false;
// const rectLightHelper = new RectAreaLightHelper( rectLight );
// rectLight.add( rectLightHelper );
scene.add(tvLight02);
	

// 	// rectLight.position.set( tv.position.x, tv.position.y, tv.position.z );
	
// 	// rectLight.lookAt( tv.position );
// 	console.log(rectLight);
// 	rectLight.position.y = 1.05;
// 	rectLight.position.z = 0.6;
// 	tvGroup.add(rectLight);

// 	tvGroup.position.x = -5.4;
// 	tvGroup.position.y = 0.7;
// 	tvGroup.position.z = -2;

// 	tvGroup.rotation.y = 0.75;
// 	scene.add(tvGroup);
// 	console.log(tvGroup);

// }, undefined, function ( error ) {
// 	console.error( error );
// } );

// const canvas_jigsaw = document.getElementById('texture_jigsaw');
// const ctx_jigsaw = canvas_jigsaw.getContext('2d');

// const canvasTextureJigsaw = new THREE.CanvasTexture(ctx_jigsaw.canvas);
// canvasTextureJigsaw.encoding = THREE.sRGBEncoding;

// loader.load( 'assets/models/tv/scene.gltf', function ( gltf ) {
// 	scene.add( gltf.scene );
// 	var tv = gltf.scene.children[0].children[0].children[0].children[0]; //this is awful but i literally cba to open up the model and reexporting it lol
// 	tv.material.map = canvasTextureJigsaw;

// 	var tvGroup = new THREE.Group();
// 	tvGroup.add(gltf.scene);

// 	console.log(tv);
// 	console.log(tv.material);

// 	const rectLight = new THREE.RectAreaLight( 0xffffff, 1.0, 2.3, 1.9 );
// 	const rectLightHelper = new RectAreaLightHelper( rectLight );
// 	rectLight.add( rectLightHelper );
	

// 	// rectLight.position.set( tv.position.x, tv.position.y, tv.position.z );
	
// 	// rectLight.lookAt( tv.position );
// 	console.log(rectLight);
// 	rectLight.position.y = 1.05;
// 	rectLight.position.z = 0.6;
// 	tvGroup.add(rectLight);

// 	// tvGroup.position.x = -5.4;
// 	// tvGroup.position.y = 0.7;
// 	// tvGroup.position.z = -2;

// 	// tvGroup.rotation.y = 0.75;
// 	scene.add(tvGroup);
// 	console.log(tvGroup);

// }, undefined, function ( error ) {
// 	console.error( error );
// } );

// const image = new Image(); // Using optional size for image
// image.onload = drawImageActualSize; // Draw when image has loaded
// image.src = 'assets/models/tv/textures/Diffusebakee_baseColor.png';
// function drawImageActualSize() {
// 	canvas_jigsaw.width = 800;
// 	canvas_jigsaw.height = 800;	
// 	canvas.width = 800;
// 	canvas.height = 800;
// 	ctx.drawImage(this, 0, 0, 800, 800);
// 	ctx_jigsaw.drawImage(this, 0, 0, 800, 800);
// 	const jigsaw = new Image(); // Using optional size for image
// 	jigsaw.onload = drawImageJigsaw; // Draw when image has loaded
// 	jigsaw.src = 'assets/icon.jpg';
// 	function drawImageJigsaw() {
// 		ctx_jigsaw.drawImage(this, 500, 500, 250, 225);
// 	}
// }


// const pointLight = new THREE.PointLight(0xffffff, 0.05, 0, 20); // soft white light
// pointLight.position.y = 2;
// pointLight.position.z = 7;
// scene.add( pointLight );
// console.log(pointLight);

// const pointLightHelper = new THREE.PointLightHelper( pointLight, 1 );
// scene.add( pointLightHelper );


// loader.load( 'assets/models/table/scene.gltf', function ( gltf ) {
// 	scene.add( gltf.scene );
// 	var table = gltf.scene.children[0].children[0].children[0].children[0]; //same as above lol
// 	table.position.y = -6;
// 	table.position.x = -1;
// 	table.position.z = -2.25;

	// const spotLight = new THREE.SpotLight( 0xffffff );
	// spotLight.target.position.y = -6;
	// spotLight.target.position.x = -1;
	// spotLight.target.position.z = -2.25;
	// spotLight.position.z = 9.75;
	// spotLight.position.y = 2;
	// spotLight.angle = 0.7471975511965978;
	// spotLight.penumbra = 1;
	// spotLight.intensity = 0.25;
	// scene.add( spotLight );
	// console.log(spotLight);

	// const spotLightHelper = new THREE.SpotLightHelper( spotLight );
	// scene.add( spotLightHelper );

// }, undefined, function ( error ) {
// 	console.error( error );
// } );

// const geometry = new THREE.BoxGeometry( 25, 10, 15 );
// const concreteTexture = new THREE.TextureLoader().load( 'assets/concrete.jpg' );
// const cubeMaterial = new THREE.MeshLambertMaterial( {color: 0xFFFFFF, map: concreteTexture, side: THREE.BackSide } );
// const cube = new THREE.Mesh( geometry, cubeMaterial );
// console.log(cube);
// cube.position.z = 1.875;
// scene.add( cube );

var fbxLoader = new FBXLoader();
fbxLoader.load( 'assets/models/RoomTest/room.fbx', function ( fbx ) {
	fbx.traverse( function( node ) { 
		if ( node instanceof THREE.PointLight ) { 
			node.castShadow = true;
			node.shadow.mapSize.width = 2048;
			node.shadow.mapSize.height = 2048;
			node.shadow.bias = -0.0001;
			if(node.name == "pointLight1") {
				node.intensity = 0.482;
				node.position.x = 8;
				node.power = 1;
			}

			// node.shadow.radius = 3;
			// var helper = new THREE.CameraHelper( node.shadow.camera );
			// scenes.add( helper );
			// node.shadowCameraVisible = true;
			// var cameraHelper = new THREE.CameraHelper(node.shadow.camera);
			// node.shadow.camera.near = 0.1;
			// node.shadow.camera.far = 50;
			// node.shadow.camera.width = 100;
			// node.shadow.camera.height = 100;
			// node.shadow.camera.zoom = 1;
			// console.log(node.shadow.camera);
			// scene.add(cameraHelper);
			scene.add(node); 
		} 
		// if ( node.isMesh ) { 
		// 	console.log(node);
		// 	node.castShadow = true; 
		// 	node.receiveShadow = true; 
		// 	// var prevMaterial = node.material;
		// 	// node.material = new THREE.MeshPhongMaterial();
			  
		// 	// THREE.MeshBasicMaterial.prototype.copy.call( node.material, prevMaterial );
		// 	// // node.material = material;
		// }
	} );
	// fbx.castShadow = true;
	// fbx.receiveShadow = true;
	// scene.add(fbx);
	// console.log(fbx);
	// var main = fbx.scene.children[0];
	// bopItGroup.add(main);
}, undefined, function ( error ) {
	console.error( error );
} );

// var lightbulbLight = new THREE.SpotLight(0xffffff, 4, 13, 0.7, 1, 1)
// lightbulbLight.power = 4;
// lightbulbLight.castShadow = true;
// lightbulbLight.target.copy(bopItGroup);
// lightbulbLight.position.copy(bopItGroup);
// lightbulbLight.position.z += 10;
// lightbulbLight.shadow.mapSize.width = 2048;
// lightbulbLight.shadow.mapSize.height = 2048;
// lightbulbLight.shadow.bias = -0.0001;
// // lightbulbLight.position.x = 6.375;
// // lightbulbLight.position.y = 12.733;
// // lightbulbLight.position.z = 0;

// scene.add(lightbulbLight);


var n = 250000000;
var odo;
var ctx = document.getElementById('odometer').getContext('2d');

var height = 50;
var digitHeight = Math.floor(height * 0.85);
var stdFont = '600 ' + digitHeight + 'px ' + "Wallpoet";

var texture = document.getElementById('texture');
var ctxText = document.getElementById('texture').getContext('2d');
const image = new Image(); // Using optional size for image
image.src = 'assets/models/RoomTest/Textures/analog.png';
var uvMapImage;
image.onload = function () {
	texture.width = 513.75;
	texture.height = 369.25;
	uvMapImage = this;
}

var logoImage;
const logo = new Image(); // Using optional size for image
logo.src = 'assets/sawpit3.png';
logo.onload = function() {
	logoImage = this;
}

var f = new FontFace('Wallpoet', 'url(./assets/fonts/wallpoet-v12-latin-regular.woff2)');
f.load().then(function(fontasd) {
	document.fonts.add(fontasd);
});

function update() {
	n -= 2083.333;
	if(n > 0) {
		odo.setValue(n);
	} else {
		odo.setValue(Math.abs(n));
		ctxText.font = "33.75px Wallpoet";
		ctxText.fillStyle = 'black';
		ctxText.fillRect(50, 180, 300, 50); 
		ctxText.fillStyle = "red";
		ctxText.fillText("Debt Added", 100, 217.5);
		ctxText.fillText("Upon Completion", 46.25, 242.5);
	}
	if(win === false) {
		setTimeout(() => {
			update();
		}, 1.66);
	}
}	

const canvasTexture = new THREE.CanvasTexture(ctxText.canvas);
canvasTexture.flipY = false;
canvasTexture.encoding = THREE.sRGBEncoding;

const video = document.getElementById( 'video' );
const videoTexture = new THREE.VideoTexture( video );
videoTexture.flipY = false;

loader.load( 'assets/models/RoomTest/untitled.gltf', function ( gltf ) {
	gltf.castShadow = true;
	gltf.scene.traverse( function( node ) {
        if ( node.isMesh ) { 
			console.log(node);
			node.castShadow = true; 
			node.receiveShadow = true; 
			// var prevMaterial = node.material;
			// node.material = new THREE.MeshPhongMaterial();
			  
			// THREE.MeshBasicMaterial.prototype.copy.call( node.material, prevMaterial );
			// // node.material = material;
		}
    } );
	gltf.scene.getObjectByName( "Mesh044" ).castShadow = false;
	gltf.scene.getObjectByName( "Mesh044_1" ).castShadow = false;
	gltf.scene.getObjectByName( "pCylinder24" ).castShadow = false;
	gltf.scene.getObjectByName( "pCube31" ).castShadow = false;
	gltf.scene.getObjectByName( "pCube31" ).renderOrder = 1;
	gltf.scene.getObjectByName( "pCube32" ).castShadow = false;
	gltf.scene.getObjectByName( "pCube32" ).renderOrder = 1;
	gltf.scene.getObjectByName( "pCube33" ).castShadow = false;
	gltf.scene.getObjectByName( "pCube33" ).renderOrder = 1;	
	gltf.scene.getObjectByName( "pCube34" ).castShadow = false;
	gltf.scene.getObjectByName( "pCube34" ).renderOrder = 1;


	gltf.scene.getObjectByName( "pCube25" ).children[0].material.map = canvasTexture;
	gltf.scene.getObjectByName( "pCube28" ).children[1].material.map = videoTexture;

	gltf.scene.scale.x = 100;
	gltf.scene.scale.y = 100;
	gltf.scene.scale.z = 100;
	console.log(gltf.scene);
	scene.add( gltf.scene );
}, undefined, function ( error ) {
	console.error( error );
} );

window.addEventListener( 'resize', onWindowResize, false );
function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );

}

const jigsawSounds = new THREE.Mesh( sphere, material );
scene.add( jigsawSounds );

const monologue = new THREE.PositionalAudio( listener );
monologue.setVolume( 15 );
monologue.onEnded = (function () {
	offer.play();
})

jigsawSounds.add(monologue);

audioLoader.load( 'assets/audio/jigsaw/monologue.mp3', function( buffer ) {
	monologue.setBuffer( buffer );
});	

var introFinished = false;

const offer = new THREE.PositionalAudio( listener );
offer.setVolume( 15 );
jigsawSounds.add(offer);

const music = new THREE.Audio( listener );
scene.add( music );
music.setLoop( true );

audioLoader.load( 'assets/audio/sawmusic.mp3', function( buffer ) {
	music.setBuffer( buffer );
});	

const partyHorn = new THREE.Audio( listener );
partyHorn.onEnded = (function () {
	jigsawWin.play();
})

scene.add( partyHorn );

audioLoader.load( 'assets/audio/party_horn.mp3', function( buffer ) {
	partyHorn.setBuffer( buffer );
});	

const jigsawWin = new THREE.Audio( listener );
jigsawWin.setVolume( 1 );
jigsawWin.onEnded = (function () {
	document.getElementById("money-tally").innerHTML = "$" + Math.round(n);
	document.getElementById("wincontainer").style.display = "flex";
})

scene.add( jigsawWin );

audioLoader.load( 'assets/audio/jigsaw/win.mp3', function( buffer ) {
	jigsawWin.setBuffer( buffer );
});	

offer.onEnded = (function () {
	introFinished = true;
	tvLight02.visible = true;
	odo = new odometer(ctx, {
		height: height,
		digits: 9,
		decimals: 0,
		value: n,
		wobbleFactor: 0,
		font: "Wallpoet",
		valueBackColor: "black",
		valueForeColor: "red"
	});

	ctxText.drawImage(uvMapImage, 0, 0, 513.75, 369.25);
	ctxText.font = stdFont;
	ctxText.fillStyle = "red";
	ctxText.fillText("$", 45, 296.25);

	ctxText.font = "33.75px Wallpoet";
	ctxText.fillStyle = "lightgreen";
	ctxText.fillText("Debt Removed", 63.75, 217.5);
	ctxText.fillText("Upon Completion", 46.25, 242.5);

	ctxText.drawImage(logoImage, 100, 45, 250, 150.25);
	update();
})



audioLoader.load( 'assets/audio/jigsaw/offer.mp3', function( buffer ) {
	offer.setBuffer( buffer );
});	

const fail = new THREE.PositionalAudio( listener );
fail.setVolume( 15 );
jigsawSounds.add(fail);

audioLoader.load( 'assets/audio/jigsaw/fail.mp3', function( buffer ) {
	fail.setBuffer( buffer );
});

document.getElementById("testbutton").addEventListener("click", function() {
	document.getElementById("introscreen").classList.add( 'fade-out' );

	monologue.play();
	setTimeout(() => {
		music.play();
	}, 49000);
	// }, 49);
});

const animate = function () {
	objects.forEach(o => {
		o.userData.update();
	})
	requestAnimationFrame( animate );
	// myOdometer.setValue(myOdometer.getValue() - 0.1);
	// ctx.drawImage(odometerCtx.canvas, 510, 595);
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFSoftShadowMapping; // default THREE.PCFShadowMap
	TWEEN.update();
	ctxText.drawImage(ctx.canvas, 80, 257.5);
	canvasTexture.needsUpdate = true;
	// canvasTextureJigsaw.needsUpdate = true;
	const delta = clock.getDelta();
	cameraControls.update( delta );
	renderer.render( scene, camera );
};
animate();
