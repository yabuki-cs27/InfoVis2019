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

    var material = new THREE.MeshBasicMaterial( { color: 0xffffff } );
    var cube = new THREE.Mesh( geometry, material );
    scene.add( cube );

    loop();

    function loop()
    {
        requestAnimationFrame( loop );
        cube.rotation.x += 0.003;
        cube.rotation.y += 0.003;
        renderer.render( scene, camera );
    }
}
