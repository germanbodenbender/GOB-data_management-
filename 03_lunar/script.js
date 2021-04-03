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

function onClick( event ) {

    console.log( `click! (${event.clientX}, ${event.clientY})`)

	// calculate mouse position in normalized device coordinates
    // (-1 to +1) for both components

	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    
    raycaster.setFromCamera( mouse, camera )

	// calculate objects intersecting the picking ray
    const intersects = raycaster.intersectObjects( scene.children, true )

    let container = document.getElementById( 'container' )
    if (container) container.remove()

    // reset object colours
    scene.traverse((child, i) => {
       if (child.isMesh) {
            child.material.color.set( 'white' )
        }
    });

    if (intersects.length > 0) {

        // get closest object
        const object = intersects[0].object
        console.log(object) // debug

        object.material.color.set( 'yellow' )

        // get user strings
        let data, count
        if (object.userData.attributes !== undefined) {
            data = object.userData.attributes.userStrings
        } else {
            // breps store user strings differently...
            data = object.parent.userData.attributes.userStrings
        }

        // do nothing if no user strings
        if ( data === undefined ) return

        console.log( data )
        
        // create container div with table inside
        container = document.createElement( 'div' )
        container.id = 'container'
        
        const table = document.createElement( 'table' )
        container.appendChild( table )

        for ( let i = 0; i < data.length; i ++ ) {

            const row = document.createElement( 'tr' )
            row.innerHTML = `<td>${data[ i ][ 0 ]}</td><td>${data[ i ][ 1 ]}</td>`
            table.appendChild( row )
        }

        document.body.appendChild( container )
    }

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
