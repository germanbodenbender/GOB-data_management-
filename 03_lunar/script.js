// Import libraries
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.124.0/build/three.module.js'
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.124.0/examples/jsm/controls/OrbitControls.js'
import { Rhino3dmLoader } from 'https://cdn.jsdelivr.net/npm/three@0.124.0/examples/jsm/loaders/3DMLoader.js'
import { color, GUI } from './dat.gui.module.js'

let camera, scene, raycaster, renderer, gui
const mouse = new THREE.Vector2()
window.addEventListener( 'click', onClick, false);

init()
animate()

function init() {

    THREE.Object3D.DefaultUp = new THREE.Vector3( 0, 0, 1 )

    // create a scene and a  camera
    scene = new THREE.Scene()
    scene.background = new THREE.Color( 0xe0e0e0 )
    scene.fog = new THREE.Fog( 0xe0e0e0, 100, 900 );

    

    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 )
    camera.position.y = - 300
    camera.position.z = 100

    // create the renderer and add it to the html
    renderer = new THREE.WebGLRenderer( { antialias: true } )
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight )
    document.body.appendChild( renderer.domElement )

    const controls = new OrbitControls( camera, renderer.domElement )

    const directionalLight = new THREE.DirectionalLight( 0xffeedd )
    directionalLight.position.set( 0, 0, 2 )
    directionalLight.castShadow = true
    directionalLight.intensity = 2
    scene.add( directionalLight )

    raycaster = new THREE.Raycaster()

    const loader = new Rhino3dmLoader()
    loader.setLibraryPath( 'https://cdn.jsdelivr.net/npm/rhino3dm@0.13.0/' )

    loader.load( 'model.3dm', function ( object ) {

        document.getElementById('loader').remove()
        scene.add( object )
        console.log( object )
        initGUI( object.userData.layers );

    } )

}




function animate() {

    requestAnimationFrame( animate )
    renderer.render( scene, camera )

}

function initGUI( layers ) {

    gui = new GUI( { width: 300 } );
    const layersControl = gui.addFolder( 'layers' );
    layersControl.open();

    for ( let i = 0; i < layers.length; i ++ ) {

        const layer = layers[ i ];
        layersControl.add( layer, 'visible' ).name( layer.name ).onChange( function ( val ) {

            const name = this.object.name;

            scene.traverse( function ( child ) {

                if ( child.userData.hasOwnProperty( 'attributes' ) ) {

                    if ( 'layerIndex' in child.userData.attributes ) {

                        const layerName = layers[ child.userData.attributes.layerIndex ].name;

                        if ( layerName === name ) {

                            child.visible = val;
                            layer.visible = val;

                        }

                    }

                }

            } );

        } );

    }

}
