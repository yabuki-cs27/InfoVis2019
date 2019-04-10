Vec3 = function(x,y,z){
  this.x = x;
  this.y = y;
  this.z = z;
}

function AreaOfTriangle(v0, v1, v2){
  var l0 = distance(v0);
  var l1 = distance(v1);
  var l2 = distance(v2);
  var s = (l0+l1+l2)/2;
  var S = Math.sqrt(s*(s-l0)*(s-l1)*(s-l2));
  return S;
}

function distance(v){
  return Math.sqrt(Math.pow(v.x,2)+Math.pow(v.y,2)+Math.pow(v.z,2));
}

function view(){
  var x0 = parseInt(document.getElementById("v1_x").value);
  var x1 = parseInt(document.getElementById("v2_x").value);
  var x2 = parseInt(document.getElementById("v3_x").value);
  var y0 = parseInt(document.getElementById("v1_y").value);
  var y1 = parseInt(document.getElementById("v2_y").value);
  var y2 = parseInt(document.getElementById("v3_y").value);
  var z0 = parseInt(document.getElementById("v1_z").value);
  var z1 = parseInt(document.getElementById("v2_z").value);
  var z2 = parseInt(document.getElementById("v3_z").value);
  var v0 = new Vec3(x0,y0,z0);
  var v1 = new Vec3(x1,y1,z1);
  var v2 = new Vec3(x2,y2,z2);
  console.log(v0.x);
  console.log(v0.y);
  var S = AreaOfTriangle(v0,v1,v2);
  console.log(S);
  document.getElementById("ans").innerHTML = "answer = "+S;
}
