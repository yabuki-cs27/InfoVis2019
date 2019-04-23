function main()
{
    var width = 500;
    var height = 500;

    var scene = new THREE.Scene();

    var fov = 45;
    var aspect = width / height;
    var near = 1;
    var far = 1000;
    var camera = new THREE.PerspectiveCamera( fov, aspect, near, far );
    camera.position.set( 0, 0, 5 );
    scene.add( camera );

    var renderer = new THREE.WebGLRenderer();
    renderer.setSize( width, height );
    document.body.appendChild( renderer.domElement );

    //var geometry = new THREE.BoxGeometry( 1, 1, 1 );
    var vertices = [
      [-1,-1,-1],
      [-1,1,-1],
      [1,1,-1],
      [1,-1,-1],
      [-1,-1,1],
      [-1,1,1],
      [1,1,1],
      [1,-1,1]
    ]

    var faces = [
      [0,1,2],
      [0,2,3],
      [0,5,1],
      [0,4,5],
      [0,3,7],
      [0,7,4],
      [1,6,2],
      [1,5,6],
      [2,6,7],
      [2,7,3],
      [4,6,5],
      [4,7,6]
    ]

    var geometry = new THREE.Geometry();
    var v = [];
    for(var i = 0;i<vertices.length;i++){
      v[i] = new THREE.Vector3().fromArray( vertices[i] );
      geometry.vertices.push( v[i] );
    }

    var f = [];
    for(var i = 0; i<faces.length ; i++){
      var id = faces[i];
      f[i] = new THREE.Face3( id[0], id[1], id[2]);
      geometry.faces.push( f[i] );
    }

    var material = new THREE.MeshBasicMaterial( { color: 0xffffff ,vertexColors:THREE.FaceColors} );
    var cube = new THREE.Mesh( geometry, material );
    scene.add( cube );

    document.addEventListener('click',mouse_down_event);
    function mouse_down_event(event){
      var rect = event.target.getBoundingClientRect();
      var x_win = event.clientX;
      var y_win = event.clientY;

      var vx = renderer.domElement.offsetLeft;
      var vy = renderer.domElement.offsetTop;
      var vw = renderer.domElement.width;
      var vh = renderer.domElement.height;
      var x_NDC = 2 * ( x_win - vx ) / vw - 1;
      var y_NDC = -( 2 * ( y_win - vy ) / vh - 1 );

      var pos = new THREE.Vector3(x_NDC,y_NDC,1);

      pos.unproject(camera);

      var raycaster = new THREE.Raycaster( camera.position, pos.sub(camera.position).normalize() );
      var intersects = raycaster.intersectObjects( scene.children);
      if ( intersects.length > 0 )
      {
        intersects[0].face.color.set(0xff0000);
        intersects[0].object.geometry.colorsNeedUpdate = true;
        intersects[0].object.geometry.elementNeedUpdate = true;
        console.log(intersects[0].face);
      }
    }

    loop();

    function loop()
    {
        requestAnimationFrame( loop );
        cube.rotation.x += 0.003;
        cube.rotation.y += 0.003;
        renderer.render( scene, camera );
    }
}
