function BoardController(element){

    var gridsize = 20;
    var domparent = element;

    var scene = new THREE.Scene();
    scene.background = new THREE.Color(0x222222);

    var camera = new THREE.PerspectiveCamera( 50, window.innerWidth/window.innerHeight, 0.2, 1000 );
    camera.position.y = 5;
    camera.position.z = 5;

    var renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    element.appendChild( renderer.domElement );

    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize( window.innerWidth, window.innerHeight );
    }

    window.addEventListener( 'resize', onWindowResize, false );



    var cameraangle = [0.5,0.5];
    var camerazoom = 5;

    var cameratarget = new THREE.Vector3(gridsize/2,0,gridsize/2);
    var raycaster = new THREE.Raycaster();
    var grid = [];
    var wallGrid = [];
    var usertiles = [];
    var userWallTiles = [];
    var userModels = [];

    var texture = new THREE.TextureLoader().load( 'assets/crate2_diffuse.png' );
    var cratematerial = new THREE.MeshBasicMaterial( { map: texture }  );
    var showFloodGrid = true;

    var manager = new THREE.LoadingManager();


    createTileMap(gridsize);

    var animate = function () {
        requestAnimationFrame( animate );
        renderer.render( scene, camera );
    };

    //view control
    this.rotateLeft = function(){
        cameraangle[0]+=0.01;
        this.rotateCamera(cameraangle);
    }
    this.rotateRight = function(speed){
        cameraangle[0]-=speed;
        this.rotateCamera(cameraangle);
    }
    this.moveForward = function(speed){

        var displacement = camera.position.clone().sub(cameratarget);
        displacement.y=0;
        displacement.multiply(new THREE.Vector3(-0.1,0,-0.1));
        cameratarget.add(displacement);
        camera.position.add(displacement);

    }
    this.moveBackward = function(speed){
        var displacement = camera.position.clone().sub(cameratarget);
        displacement.y=0;
        displacement.multiply(new THREE.Vector3(0.1,0,0.1));
        cameratarget.add(displacement);
        camera.position.add(displacement);
    }
    this.trackLeft = function(speed){
        cameratarget.x+=speed;
        this.rotateCamera(cameraangle);
    }
    this.trackRight = function(speed){
        cameratarget.x-=speed;
        this.rotateCamera(cameraangle);
    }

    this.toggleFlootGrid = function(){
        for(var i in grid){
            var obj = grid[i];
            obj.visible = !obj.visible;

        }
    }
    this.hideFloorGrid = function(){
        for(var i in grid){
            var obj = grid[i];
            obj.visible = false;

        }
    }
    this.showFloorGrid = function(){
        for(var i in grid){
            var obj = grid[i];
            obj.visible = true;

        }
    }

    this.toggleWallGrid = function(){
        for(var i in wallGrid){
            var obj = wallGrid[i];
            obj.visible = !obj.visible;

        }
    }
    this.hideWallGrid = function(){
        for(var i in wallGrid){
            var obj = wallGrid[i];
            obj.visible = false;

        }
    }
    this.showWallGrid = function(){
        for(var i in wallGrid){
            var obj = wallGrid[i];
            obj.visible = true;

        }
    }

    this.rotateCamera = function(rotation) {
        cameraangle = rotation;
        camera.position.x =( Math.sin(2 * Math.PI * (cameraangle[0] - .5)) * camerazoom) + cameratarget.x;
        camera.position.z =( Math.cos(2 * Math.PI * (cameraangle[0] - .5)) * camerazoom) + cameratarget.z;
        camera.lookAt(cameratarget);
    }


    //object creation
    function createTileMap(size){

        for(var i=0;i<size;i++){
            for(var j=0;j<size;j++){
                var gridTileMaterial = new THREE.MeshBasicMaterial( { color: Math.random() * 0xffffddddff,  transparent: true , opacity:0.2, blending: THREE.AdditiveBlending } );
                var gridWallTileMaterial = new THREE.MeshBasicMaterial( { color:Math.random() * 0xffffff,  transparent: true , opacity:0.2 , blending: THREE.AdditiveBlending} );

                var cube = createTile(i,j,gridTileMaterial);
                cube.position.y = -0.1;
                grid.push(cube);

                if(i==0){
                    var leftWall = createWallTile(i,j,3,0.4,gridWallTileMaterial);
                    wallGrid.push(leftWall);
                }
                if(j==0){

                    var bottomWall = createWallTile(i,j,2,0.4,gridWallTileMaterial);
                    wallGrid.push(bottomWall);

                }

                var rightWall = createWallTile(i,j,1,0.4,gridWallTileMaterial);
                wallGrid.push(rightWall);

                var topWall = createWallTile(i,j,0,0.4,gridWallTileMaterial);
                wallGrid.push(topWall);


            }
        }

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
        cube.wallPosition = pos;
        cube.tilePosition = {"x":x,"z":z};


        scene.add(cube);

        return cube;
    }

    this.createTileWithTexture = function(x,z,textureIMG){
        var texture = new THREE.TextureLoader().load( textureIMG );
        var customMaterial = new THREE.MeshBasicMaterial( { map: texture }  );
        var usertile = createTile(x,z,customMaterial);
        usertiles.push(usertile);
    }
    this.createWallTileWithTexture = function(x,z,pos,height,textureIMG){
        var texture = new THREE.TextureLoader().load( textureIMG );
        var customMaterial = new THREE.MeshBasicMaterial( { map: texture }  );
        var usertile = createWallTile(x,z,pos,height,customMaterial);
        userWallTiles.push(usertile);
    }

    this.addModel = function(objURL,textureURL,x,y){
        var textureLoader = new THREE.TextureLoader( manager );
        var loader = new THREE.OBJLoader( manager );

    	loader.load( objURL, function ( object ) {

    		object.traverse( function ( child ) {
    			if ( child instanceof THREE.Mesh ) {

                    var modeltexture = new THREE.TextureLoader().load( textureURL );
                    var  modelmaterial = new THREE.MeshBasicMaterial( { map: modeltexture }  );

                    child.material = modelmaterial;
                    scene.add(child);

                    child.position.x = x;
                    child.position.z = y;

                    userModels.push(child);
    			}
    		} );
    	}, null, null );

    }
    this.deleteObject = function(obj){
        var pos = scene.children.indexOf(obj);
        if(pos != -1){
            scene.remove(obj);

            if(usertiles.indexOf(obj) != -1){
                usertiles.splice(usertiles.indexOf(obj),1);
            }
            if(userWallTiles.indexOf(obj) != -1){
                userWallTiles.splice(userWallTiles.indexOf(obj),1);
            }
            if(userModels.indexOf(obj) != -1){
                userModels.splice(userModels.indexOf(obj),1);
            }


        }
    }
    //interaction
    this.moveObjectToPosition = function(obj,x,y){
        obj.position.x = x;
        obj.position.z = y;
    }
    this.rotateObjectByStep = function(obj,direction){
        if(obj != null){
            var rot = (2 * Math.PI) * 0.125;//step size

            var angle = direction == "rr" ? angle = rot : -rot;
            obj.rotation.y+=angle;
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
        var intersects = raycaster.intersectObjects( scene.children );


        var eventType = "onChildGenericClick";

        if ( intersects.length > 0 ) {
            var obj = intersects[0].object;

            if(grid.indexOf(obj) != -1){
                eventType = 'onTileClick';
            }else if(usertiles.indexOf(obj) != -1){
                eventType = 'onUserFloorTileClick';
            }else if(wallGrid.indexOf(obj) != -1){
                eventType = 'onWallTileClick';
            }else if(userWallTiles.indexOf(obj) != -1){
                eventType = 'onUserWallTileClick';
            }else if(userModels.indexOf(obj) != -1){
                eventType = 'onUserModelClick';
            }

            var tileEvent = new CustomEvent(eventType, {"detail":obj});
            domparent.dispatchEvent(tileEvent);

        }

    }


    animate();

    return this;
}
