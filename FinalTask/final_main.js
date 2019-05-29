var isovalue = 128;
var volume = new KVS.LobsterData();
var screen = new KVS.THREEScreen();

function main()
{
    screen.init(volume, {
      width: window.innerWidth * 0.8,
      height: window.innerHeight,
      targetDom: document.getElementById('display'),
      enableAutoResize: false
    });

    var bounds = Bounds( volume );
    screen.scene.add( bounds );
    setIsovalue();
    var surfaces = Isosurfaces( volume, isovalue );
    screen.scene.add( surfaces );

    document.addEventListener( 'mousemove', function() {
        screen.light.position.copy( screen.camera.position );
    });

    window.addEventListener('resize', function() {
      screen.resize([ window.innerWidth * 0.8, window.innerHeight ]);
    });

    screen.loop();
}

function setIsovalue(){
  isovalue = document.getElementById("isovalue").value;
  document.getElementById("value").innerHTML = isovalue;
}

function review(){
  document.getElementById("display").innerHTML = "";
  main();
}
