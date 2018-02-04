function BoardController(element){

    var gridsize = 20;

    var scene = new THREE.Scene();
    scene.background = new THREE.Color(0xededed);

    var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.2, 1000 );
    camera.position.y = 2;
    camera.position.z = 5;

    var renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    element.appendChild( renderer.domElement );


    var angle = [0.5,0.5];
    var cameratarger = new THREE.Vector3(gridsize/2,0,gridsize/2);
    var raycaster = new THREE.Raycaster();
    var grid = [];

    var texture = new THREE.TextureLoader().load( 'assets/crate2_diffuse.png' );
    var material = new THREE.MeshBasicMaterial( { map: texture }  );
    var material2 = new THREE.MeshBasicMaterial( { color: 0xffaa00, wireframe: true } );



    createTileMap(gridsize);


    var animate = function () {
        requestAnimationFrame( animate );
        renderer.render( scene, camera );
    };




    this.rotateCamera = function(rotation) {
        // rotation[0] = ev.clientX / window.innerWidth;
        // rotation[1] = ev.clientY / window.innerHeight;
        angle = rotation;
        zoom = 5;

        camera.position.x =( Math.sin(2 * Math.PI * (angle[0] - .5)) * zoom) + cameratarger.x;
        camera.position.z =( Math.cos(2 * Math.PI * (angle[0] - .5)) * zoom) + cameratarger.z;

        camera.lookAt(cameratarger);
    }



    function createTile(x,z){

        var geometry = new THREE.BoxGeometry( 1, 0.1, 1 );
        var cube = new THREE.Mesh( geometry, material2 );

        cube.position.x = x;
        cube.position.z = z;

        scene.add( cube );
        return cube;
    }

    function createTileMap(size){

        for(var i=0;i<size;i++){
            for(var j=0;j<size;j++){
                var cube = createTile(i,j);

                grid.push(cube);


            }
        }

    }

    this.clickInteractionWithCoods = function(x,y){
        this.onDocumentMouseDown(x,y);
    }

    this.onDocumentMouseDown = function( x,y ) {

        var mouse =  new THREE.Vector2();
        event.preventDefault();
        mouse.x = ( x / renderer.domElement.clientWidth ) * 2 - 1;
        mouse.y = - ( y / renderer.domElement.clientHeight ) * 2 + 1;
        raycaster.setFromCamera( mouse, camera );
        var intersects = raycaster.intersectObjects( grid );
        if ( intersects.length > 0 ) {

            var obj = intersects[0].object;
            obj.material = material;
            // intersects[ 0 ].object.material.color.setHex( Math.random() * 0xffffff );
            // var particle = new THREE.Sprite( particleMaterial );
            // particle.position.copy( intersects[ 0 ].point );
            // particle.scale.x = particle.scale.y = 16;
            // scene.add( particle );
        }

    }

    animate();

    return this;
}
