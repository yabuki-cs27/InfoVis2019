function Isosurfaces( volume, isovalue )
{
  var geometry = new THREE.Geometry();
  //var material = new THREE.MeshLambertMaterial({ color: 0xffffff, vertexColors: THREE.FaceColors });
  //console.log(document.getElementById("vert").innerHTML);
  var material = new THREE.ShaderMaterial({
      vertexColors: THREE.VertexColors,
      vertexShader: document.getElementById('shader.vert').text,
      fragmentShader: document.getElementById('shader.frag').text,
  });
  var smin = volume.min_value;
  var smax = volume.max_value;
  isovalue = KVS.Clamp( isovalue, smin, smax );
  var lut = new KVS.MarchingCubesTable();
  console.log(lut);
  var cell_index = 0;
  var counter = 0;
  var cmap = [];
  for ( var i = 0; i < 256; i++ )
  {
    var S = i / 255.0; // [0,1]
    var R = Math.max( Math.cos( ( S - 1.0 ) * Math.PI ), 0.0 );
    var G = Math.max( Math.cos( ( S - 0.5 ) * Math.PI ), 0.0 );
    var B = Math.max( Math.cos( S * Math.PI ), 0.0 );
    var color = new THREE.Color( R, G, B );
    cmap.push( [ S, '0x' + color.getHexString() ] );
  }
  var lut2 = new THREE.Lut( 'rainbow', cmap.length );
  lut2.addColorMap( 'mycolormap', cmap );
  for ( var z = 0; z < volume.resolution.z - 1; z++ )
  {
      for ( var y = 0; y < volume.resolution.y - 1; y++ )
      {
          for ( var x = 0; x < volume.resolution.x - 1; x++ )
          {
            //a+d=0,c*0.5+d=0,b+c+d=0;a+b+c+0.5+d=0
            //a=-d,c=-2d,b=d;
              //cell_index++;
              var indices = cell_node_indices( x,y,z );
              var index = table_index( indices,1/volume.resolution.x,(-1/volume.resolution.y),(1/volume.resolution.z)*2,-1 );

              if ( index == 0 ) { continue; }
              if ( index == 255 ) { continue; }

              for ( var j = 0; lut.edgeID[index][j] != -1; j += 3 )
              {
                  var eid0 = lut.edgeID[index][j];
                  var eid1 = lut.edgeID[index][j+1];
                  var eid2 = lut.edgeID[index][j+2];

                  var vid0 = lut.vertexID[eid0][0];
                  var vid1 = lut.vertexID[eid0][1];
                  var vid2 = lut.vertexID[eid1][0];
                  var vid3 = lut.vertexID[eid1][1];
                  var vid4 = lut.vertexID[eid2][0];
                  var vid5 = lut.vertexID[eid2][1];

                  var v0 = new THREE.Vector3( x + vid0[0], y + vid0[1], z + vid0[2] );
                  var v1 = new THREE.Vector3( x + vid1[0], y + vid1[1], z + vid1[2] );
                  var v2 = new THREE.Vector3( x + vid2[0], y + vid2[1], z + vid2[2] );
                  var v3 = new THREE.Vector3( x + vid3[0], y + vid3[1], z + vid3[2] );
                  var v4 = new THREE.Vector3( x + vid4[0], y + vid4[1], z + vid4[2] );
                  var v5 = new THREE.Vector3( x + vid5[0], y + vid5[1], z + vid5[2] );

                  var lines = volume.resolution.x;
                  var slices = volume.resolution.x * volume.resolution.y;
                  var val = []
                  val[0] = volume.values[parseInt(v0.x+v0.y*lines+v0.z*slices)][0];
                  val[1] = volume.values[parseInt(v1.x+v1.y*lines+v1.z*slices)][0];
                  val[2] = volume.values[parseInt(v2.x+v2.y*lines+v2.z*slices)][0];
                  val[3] = volume.values[parseInt(v3.x+v3.y*lines+v3.z*slices)][0];
                  val[4] = volume.values[parseInt(v4.x+v4.y*lines+v4.z*slices)][0];
                  val[5] = volume.values[parseInt(v5.x+v5.y*lines+v5.z*slices)][0];
                  var v01 = interpolated_vertex( v0, v1, 0,0 );
                  var v23 = interpolated_vertex( v2, v3, 0,0 );
                  var v45 = interpolated_vertex( v4, v5, 0,0 );

                  geometry.vertices.push( v01 );
                  geometry.vertices.push( v23 );
                  geometry.vertices.push( v45 );

                  var id0 = counter++;
                  var id1 = counter++;
                  var id2 = counter++;
                  var face = new THREE.Face3( id0, id1, id2);
                  var averageval = 0;
                  var count=0;
                  for(var i=0;i<6;i++){
                    if(val[i]>0){
                      averageval+=val[i];
                      count++;
                    }
                  }
                  if(count>0){
                    averageval = parseInt(averageval/count);
                  }
                  //face.color.set(new THREE.Color().setHex( cmap[volume.values[cell_index][0]][1] ));
                  face.color.set(new THREE.Color().setHex( cmap[averageval][1] ));
                  geometry.faces.push(face);
              }
          }
          cell_index++;
      }
      cell_index += volume.resolution.x;
  }

    geometry.computeVertexNormals();

    return new THREE.Mesh( geometry, material );

    function cell_node_indices( x,y,z )
    {
        var lines = volume.resolution.x;
        var slices = volume.resolution.x * volume.resolution.y;

        var id0 = new THREE.Vector3(x,y,z);
        var id1 = new THREE.Vector3(x+1,y,z);
        var id2 = new THREE.Vector3(x+1,y+1,z);
        var id3 = new THREE.Vector3(x,y+1,z);
        var id4 = new THREE.Vector3(x,y,z+1);
        var id5 = new THREE.Vector3(x+1,y,z+1);
        var id6 = new THREE.Vector3(x+1,y+1,z+1);
        var id7 = new THREE.Vector3(x,y+1,z+1);

        return [ id0, id1, id2, id3, id4, id5, id6, id7 ];
    }

    function table_index( indices,a,b,c,d )
    {
        var s0 = a*indices[0].x+b*indices[0].y+c*indices[0].z+d;
        var s1 = a*indices[1].x+b*indices[1].y+c*indices[1].z+d;
        var s2 = a*indices[2].x+b*indices[2].y+c*indices[2].z+d;
        var s3 = a*indices[3].x+b*indices[3].y+c*indices[3].z+d;
        var s4 = a*indices[4].x+b*indices[4].y+c*indices[4].z+d;
        var s5 = a*indices[5].x+b*indices[5].y+c*indices[5].z+d;
        var s6 = a*indices[6].x+b*indices[6].y+c*indices[6].z+d;
        var s7 = a*indices[7].x+b*indices[7].y+c*indices[7].z+d;

        var index = 0;
        if ( s0 > 0 ) { index |=   1; }
        if ( s1 > 0 ) { index |=   2; }
        if ( s2 > 0 ) { index |=   4; }
        if ( s3 > 0 ) { index |=   8; }
        if ( s4 > 0 ) { index |=  16; }
        if ( s5 > 0 ) { index |=  32; }
        if ( s6 > 0 ) { index |=  64; }
        if ( s7 > 0 ) { index |= 128; }

        return index;
    }

    function interpolated_vertex( v0, v1, s0,s1 )
    {
        return new THREE.Vector3().addVectors( v0.multiplyScalar(s0+1), v1.multiplyScalar(s1+1) ).divideScalar( s0+s1+2 );
    }
}
