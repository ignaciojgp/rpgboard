function BoardController(element){

    var gridsize = 20;
    var domparent = element;

    var scene = new THREE.Scene();
    scene.background = new THREE.Color(0x222222);

    var camera = new THREE.PerspectiveCamera( 50, window.innerWidth/window.innerHeight, 0.2, 1000 );
    camera.position.y = 5;
    camera.position.z = 5;

    var renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    element.appendChild( renderer.domElement );


    var cameraangle = [0.5,0.5];
    var camerazoom = 5;

    var cameratarget = new THREE.Vector3(gridsize/2,0,gridsize/2);
    var raycaster = new THREE.Raycaster();
    var grid = [];
    var wallGrid = [];
    var usertiles = [];

    var texture = new THREE.TextureLoader().load( 'assets/crate2_diffuse.png' );
    var cratematerial = new THREE.MeshBasicMaterial( { map: texture }  );
    var gridTileMaterial = new THREE.MeshBasicMaterial( { color: 0xffaa00, wireframe: true } );
    var gridWallTileMaterial = new THREE.MeshBasicMaterial( { color: 0xffFF66, wireframe: true } );
    var showFloodGrid = true;

    createTileMap(gridsize);

    var animate = function () {
        requestAnimationFrame( animate );
        renderer.render( scene, camera );
    };


    this.rotateLeft = function(){
        cameraangle[0]+=0.01;
        this.rotateCamera(cameraangle);
    }
    this.rotateRight = function(speed){
        cameraangle[0]-=speed;
        this.rotateCamera(cameraangle);
    }
    this.moveForward = function(speed){
        cameratarget.z+=speed;
        this.rotateCamera(cameraangle);
    }
    this.moveBackward = function(speed){
        cameratarget.z-=speed;
        this.rotateCamera(cameraangle);
    }
    this.trackLeft = function(speed){
        cameratarget.x+=speed;
        this.rotateCamera(cameraangle);
    }
    this.trackRight = function(speed){
        cameratarget.x-=speed;
        this.rotateCamera(cameraangle);
    }


    this.rotateCamera = function(rotation) {
        cameraangle = rotation;
        camera.position.x =( Math.sin(2 * Math.PI * (cameraangle[0] - .5)) * camerazoom) + cameratarget.x;
        camera.position.z =( Math.cos(2 * Math.PI * (cameraangle[0] - .5)) * camerazoom) + cameratarget.z;
        camera.lookAt(cameratarget);
    }



    function createTile(x,z,material){

        var geometry = new THREE.BoxGeometry( 1, 0.1, 1 );
        var cube = new THREE.Mesh( geometry, material );

        cube.position.x = x;
        cube.position.z = z;

        scene.add( cube );
        return cube;
    }

    function createWallTile(x,z,pos,height,material){

        var sizex = pos == 0 || pos == 2 ? 1:0.1;
        var sizez = pos == 0 || pos == 2 ? 0.1:1;
        var sizey = height;

        var geometry = new THREE.BoxGeometry( sizex, height, sizez );
        var cube = new THREE.Mesh( geometry, material );

        var modPosX = 0;
        var modPosZ = 0;

        if(pos == 0){
            modPosZ = 0.5;
        }else if(pos == 1){
            modPosX = 0.5;
        }else if(pos == 2){
            modPosZ = -0.5;
        }else if(pos == 3){
            modPosX = -0.5;
        }

        cube.position.x = x+modPosX;
        cube.position.z = z+modPosZ;
        cube.position.y = height/2;

        scene.add(cube);

        return cube;
    }

    function createTileMap(size){

        for(var i=0;i<size;i++){
            for(var j=0;j<size;j++){
                var cube = createTile(i,j,gridTileMaterial);

                if(i==0){
                    var topWall = createWallTile(i,j,0,0.4,gridWallTileMaterial);
                }
                if(j==0){
                    var leftWall = createWallTile(i,j,3,0.4,gridWallTileMaterial);
                }
                var rightWall = createWallTile(i,j,1,0.4,gridWallTileMaterial);
                var bottomWall = createWallTile(i,j,2,0.4,gridWallTileMaterial);

                wallGrid.push(topWall);
                wallGrid.push(bottomWall);
                wallGrid.push(rightWall);
                wallGrid.push(leftWall);
                grid.push(cube);
            }
        }

    }

    this.createTileWithtexture = function(x,y,textureIMG){
        var texture = new THREE.TextureLoader().load( textureIMG );
        var customMaterial = new THREE.MeshBasicMaterial( { map: texture }  );
        var usertile = createTile(x,y,customMaterial);
        usertiles.push(usertile);
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

        var tileIntersects = raycaster.intersectObjects( grid );

        if ( tileIntersects.length > 0 ) {
            var obj = tileIntersects[0].object;
            var tileEvent = new CustomEvent('onTileClick', {"detail":obj});
            domparent.dispatchEvent(tileEvent);

        }

        var userTileIntersects = raycaster.intersectObjects( grid );

        if ( userTileIntersects.length > 0 ) {
            var obj = userTileIntersects[0].object;
            var tileEvent = new CustomEvent('onUserTileClick', {"detail":obj});
            domparent.dispatchEvent(tileEvent);
        }

    }

    this.toggleFlootGrid = function(){
        for(var i in grid){
            var obj = grid[i];
            obj.visible = !obj.visible;

        }
    }
    this.toggleWallGrid = function(){
        for(var i in wallGrid){
            var obj = wallGrid[i];
            obj.visible = !obj.visible;

        }
    }

    animate();

    return this;
}
