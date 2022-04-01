import * as THREE               from './three.js/build/three.module.js';

import { FontLoader }           from './three.js/examples/jsm/loaders/FontLoader.js';
import { TextGeometry }         from './three.js/examples/jsm/geometries/TextGeometry.js';

import { EffectComposer }       from './three.js/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass }           from './three.js/examples/jsm/postprocessing/RenderPass.js';
import { GlitchPass }           from './three.js/examples/jsm/postprocessing/GlitchPass.js';
import { FilmPass }             from './three.js/examples/jsm/postprocessing/FilmPass.js';
import { ShaderPass }           from './three.js/examples/jsm/postprocessing/ShaderPass.js';
import { DotScreenPass }        from './three.js/examples/jsm/postprocessing/DotScreenPass.js';

import { LuminosityShader }     from './three.js/examples/jsm/shaders/LuminosityShader.js';
import { PixelShader }          from './three.js/examples/jsm/shaders/PixelShader.js';
import { RGBShiftShader }       from './three.js/examples/jsm/shaders/RGBShiftShader.js';
import { SepiaShader }          from './three.js/examples/jsm/shaders/SepiaShader.js';
import { VignetteShader}        from './three.js/examples/jsm/shaders/VignetteShader.js';

THREE.Cache.enabled = true;

var     camera, 
        scene, 
        renderer,
        canvas;

var     composer,
        shaderPass,
        composerID  =   0;

var   dPixel        =   0.5;
var   oldTime       =   0.0,
      deltaT        =   0.0,
      angle         =   0.0,
      pValue,
      dScale;

function main() {

  canvas = document.querySelector('#foto3D');

  canvas.width  = 
  canvas.height = 150;

  renderer = new THREE.WebGLRenderer( {   canvas      : canvas,
                                          antialias   : true } );
  // CAMERA
  camera = new THREE.OrthographicCamera( 0.0, 1.0, 1.0, 0.0, -2.0, 2.0 );

  // SCENE
  scene = new THREE.Scene();
  scene.background = new THREE.Color( 0xFFFFFF );

  var texture   = new THREE.TextureLoader();
  texture.load("./images/Eu.png", loadedTex);

  defComposer();

}

function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function loadedTex(tex) {

  const maxDim = Math.max(tex.image.width, tex.image.height );

  const planeDimX = tex.image.width / maxDim;
  const planeDimY = tex.image.height / maxDim;

  const photo    = new THREE.Mesh  ( new THREE.PlaneGeometry( planeDimX, planeDimY ),
                                    new THREE.MeshBasicMaterial({ map : tex } )
                                  );

  photo.name = "photoPlane";
  photo.position.x = planeDimX / 2.0 + (planeDimY - planeDimX) / 2.0;
  photo.position.y = planeDimY / 2.0;
  scene.add( photo );

  // window.setTimeout(anime, 200);

  requestAnimationFrame(anime);
}

function defComposer() {

  composerID = getRandomIntInclusive(0,6);

  // composerID = 0;

  composer = new EffectComposer( renderer );
  composer.addPass( new RenderPass( scene, camera ) );

  switch (composerID) {

    case 0 :    // postprocessing - Glitch
                composer.addPass( new GlitchPass() );
                break;
    case 1 :    // postprocessing - Film
                shaderPass = new FilmPass( 0.35, 0.5, 2048, false );
                pValue = 2048;
                dScale = 2;
                shaderPass.uniforms[ "sCount" ].value = pValue;
                composer.addPass( shaderPass );
                break;

    case 2 :    // postprocessing - Pixelization
                shaderPass = new ShaderPass( PixelShader );
                shaderPass.uniforms[ "resolution" ].value = new THREE.Vector2( canvas.width, canvas.height );
                shaderPass.uniforms[ "resolution" ].value.multiplyScalar( window.devicePixelRatio );
                shaderPass.uniforms[ "pixelSize" ].value = 2;

                composer.addPass( shaderPass );
                break;

    case 3 :    // postprocessing - SepiaShader
                shaderPass = new ShaderPass( SepiaShader );
                pValue = 0.0;
                dScale = -0.2;
                shaderPass.uniforms[ "amount" ].value = pValue;
                composer.addPass( shaderPass );
                break;

    case 4 :    // postprocessing - DotScreenPass
                shaderPass = new DotScreenPass( new THREE.Vector2( 0, 0 ), 0.5, 0.9 );
                pValue = 0.9;
                dScale = -0.05;
                composer.addPass( shaderPass );
                break;

    case 5 :    // postprocessing - RGBShiftShader
                shaderPass = new ShaderPass( RGBShiftShader );
                pValue = 0.0;
                dScale = -0.2;
                shaderPass.uniforms[ "amount" ].value = pValue;
                shaderPass.uniforms[ "angle" ].value = angle;
                composer.addPass( shaderPass );
                break;

    case 6 :    // postprocessing - VignetteShader
                shaderPass = new ShaderPass( VignetteShader );
                pValue = 0.9;
                dScale = -0.5;
                shaderPass.uniforms[ "darkness" ].value = pValue;
                composer.addPass( shaderPass );
                break;
    }
}

function updateComposer() {

  switch(composerID) {

    case 0 :  // postprocessing - Glitch
              break;
    case 1 :  // postprocessing - Film
              pValue *= dScale;

              console.log(pValue);

              if ( (pValue < 64) || (pValue > 4096) ) 
                dScale = 1.0 / dScale;

              shaderPass.uniforms[ "sCount" ].value = pValue;
              break;     

    case 2 :  // postprocessing - Pixelization
              var pixelCluster = shaderPass.uniforms[ "pixelSize" ].value;
              if (pixelCluster < 2)
                dPixel = 2;
              else
                if (pixelCluster > 8)
                  dPixel = 0.5;
              shaderPass.uniforms[ "pixelSize" ].value = pixelCluster * dPixel;
              break;

    case 3 :  // postprocessing - SepiaShader
              pValue -= dScale;
              if ( (pValue < 0.02) || (pValue > 0.8) ) 
                dScale *= -1.0;
              shaderPass.uniforms[ "amount" ].value = pValue;
              break;

    case 4 :  // postprocessing - DotScreenPass
              pValue -= dScale;
              if ( (pValue < 0.5) || (pValue > 1.0) )
                dScale *= -1.0;
              shaderPass.uniforms[ "scale" ].value = pValue;

              break;

    case 5 :  // postprocessing - RGBShiftShader
              pValue -= dScale;
              if ( (pValue < 0.02) || (pValue > 0.8) ) {
                dScale *= -1.0;
                angle = getRandomIntInclusive(0,360)
                }
              shaderPass.uniforms[ "amount" ].value = pValue;
              shaderPass.uniforms[ "angle" ].value = angle;
              break;  

    case 6 :  // postprocessing - VignetteShader
              pValue -= dScale;
              if ( (pValue < 0.2) || (pValue > 5.0) )
                dScale *= -1.0;
              shaderPass.uniforms[ "darkness" ].value = pValue;
              break;    
    }
}

function anime(time) {

  time *= 0.001;  // convert time to seconds

  deltaT = time - oldTime;

  if (deltaT > 1) {
    updateComposer();
    deltaT = 0;
    oldTime = time;
    }


  composer.render();

  requestAnimationFrame(anime);
}

main();
