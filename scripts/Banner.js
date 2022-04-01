import * as THREE         from './three.js/build/three.module.js';

import { FontLoader }     from './three.js/examples/jsm/loaders/FontLoader.js';
import { TextGeometry }   from './three.js/examples/jsm/geometries/TextGeometry.js';

THREE.Cache.enabled = true;

var     container, 
        hex;

var     camera, 
        cameraTarget, 
        scene, 
        renderer;

var     materials;

var     font            = undefined;

const   hover           = 30,

        
        bevelThickness  = 2,
        bevelSize       = 1.5;

const   mirror          = true;

function main() {

  const canvas = document.querySelector('#foto3D');
  canvas.width = window.innerWidth * 0.2;
  renderer = new THREE.WebGLRenderer( {   canvas      : canvas,
                                          antialias   : true } );
  // CAMERA

  var camera = new THREE.OrthographicCamera( -1.0, 1.0, 1.0, -1.0, -1.0, 1.0 );

  // SCENE

  scene = new THREE.Scene();
  scene.background = new THREE.Color( 0xFFFFFF );

  const foto = new THREE.Mesh  (   new THREE.PlaneGeometry( 1.0, 1.0 ),
                                    new THREE.MeshBasicMaterial()
                                );
  scene.add( plane );

  renderer.clear();
  renderer.render( scene, camera );
}

function animate(time) {

  time *= 0.001;  // convert time to seconds
 
  var grpLogo = scene.getObjectByName("Logo");
  grpLogo.rotation.y = time;

  camera.lookAt( new THREE.Vector3( 0, 150, 0 ));

  renderer.clear();
  renderer.render( scene, camera );
 
  requestAnimationFrame( animate );
}

main();
