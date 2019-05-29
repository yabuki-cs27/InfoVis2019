var isovalue = 128;
var volume = new KVS.LobsterData();
var screen = new KVS.THREEScreen();
var style =1;

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
    if(style == 1){
      setIsovalue();
      var surfaces = Isosurfaces( volume, isovalue );
    }else {
      var a = parseInt(document.getElementById("value1").value);
      var b = parseInt(document.getElementById("value2").value);
      var c = parseInt(document.getElementById("value3").value);
      var d = parseInt(document.getElementById("value4").value);
      var surfaces = Plane(volume ,128, a,b,c,d);
    }
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

function setStyle(){
  style = document.getElementById("selectStyle").value;
  if(style == 1){
    document.getElementById("select").innerHTML =
    '<label id="label" style="font-family:Arial;">isovalue</label>'+
    '<span id = "value"></span><br />'+
    '<input type="range" min="0" max="255" step="1" value="128"'+
    'id="isovalue" onchange="setIsovalue()"/>'
  }else{
    document.getElementById("select").innerHTML =
    /*'<label>a</label><input type="number" id = "value1" value = 1></input><br />'+
    '<label>b</label><input type="number" id = "value2" value = -1></input><br />'+
    '<label>c</label><input type="number" id = "value3" value = 2></input><br />'+
    '<label>d</label><input type="number" id = "value4" value = -1></input><br />';*/
    '<label>a</label>'+
    '<input type="range" min="-3" max="3" step="0.1" value="1"'+
    'id="value1" onchange="setvalue(1)"/>'+
    '<span id = "a1">1</span><br />'+
    '<label>b</label>'+
    '<input type="range" min="-3" max="3" step="0.1" value="-1"'+
    'id="value2" onchange="setvalue(2)"/>'+
    '<span id = "a2">-1</span><br />'+
    '<label>c</label>'+
    '<input type="range" min="-3" max="3" step="0.1" value="2"'+
    'id="value3" onchange="setvalue(3)"/>'+
    '<span id = "a3">2</span><br />'+
    '<label>d</label>'+
    '<input type="range" min="-3" max="3" step="0.1" value="-1"'+
    'id="value4" onchange="setvalue(4)"/>'+
    '<span id = "a4">-1</span><br />';
  }
}

function setvalue(i){
  document.getElementById("a"+i).innerHTML = document.getElementById("value"+i).value;
}
