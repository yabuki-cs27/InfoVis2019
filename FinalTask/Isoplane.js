function IsoPlane( volume, isovalue,a1,b1,c1,d1 )
{
  var geometry = new THREE.Geometry();
  //var material = new THREE.MeshLambertMaterial({ color: 0xffffff, vertexColors: THREE.FaceColors });
  //console.log(document.getElementById("vert").innerHTML);
  var material = new THREE.ShaderMaterial({
      vertexColors: THREE.VertexColors,
      vertexShader: document.getElementById('shader.vert').text,
      fragmentShader: document.getElementById('shader.frag').text,
  });
  material.side = THREE.DoubleSide;
  var smin = volume.min_value;
  var smax = volume.max_value;
  isovalue = KVS.Clamp( isovalue, smin, smax );
  var lut = new KVS.MarchingCubesTable();
  var cell_index = 0;
  var counter = 0;
  var cmap = [];
  var isPlane = false;
  for ( var i = 0; i < 256; i++ )
  {
      var S = i / 255.0; // [0,1]
      var R = 1;
      var G = (255.0 - i)/255;
      var B = (255.0 - i)/255;
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
              isPlane = false;
              var indices = cell_node_indices( cell_index++ );
              var vectors = cell_node_vectors( x,y,z );
              var a = a1/volume.resolution.x;
              var b = b1/volume.resolution.y;
              var c = c1/volume.resolution.z;
              var d = d1;
               index = plane_index( indices,vectors,a,b,c,d );

              if ( index == 0 ) { continue; }
              if ( index == 255 ) { continue; }

              for ( var j = 0; lut.edgeID[index][j] != -1; j += 3 )
              {
                  var eid0 = lut.edgeID[index][j];
                  var eid1 = lut.edgeID[index][j+2];
                  var eid2 = lut.edgeID[index][j+1];

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

                  if(isPlane){
                    var v01 = interpolated_vertex( v0, v1, v0.x*a+v0.y*b+v0.z*c+d, v1.x*a+v1.y*b+v1.z*c+d , 0);
                    var v23 = interpolated_vertex( v2, v3, v2.x*a+v2.y*b+v2.z*c+d, v3.x*a+v3.y*b+v3.z*c+d , 0);
                    var v45 = interpolated_vertex( v4, v5, v4.x*a+v4.y*b+v4.z*c+d, v5.x*a+v5.y*b+v5.z*c+d , 0);
                  }else{
                    var v01 = interpolated_vertex( v0, v1, val[0],val[1],isovalue );
                    var v23 = interpolated_vertex( v2, v3, val[2],val[3],isovalue );
                    var v45 = interpolated_vertex( v4, v5, val[4],val[5],isovalue );
                  }

                  geometry.vertices.push( v01 );
                  geometry.vertices.push( v23 );
                  geometry.vertices.push( v45 );

                  var id0 = counter++;
                  var id1 = counter++;
                  var id2 = counter++;
                  var face = new THREE.Face3( id0, id1, id2);
                  //var face2 = new THREE.Face3( id0, id2, id1);
                  var averageval = 0;
                  var count=0;
                  for(var i=0;i<6;i++){
                    if(val[i]>isovalue){
                      averageval+=val[i];
                      count++;
                    }
                  }
                  if(count>0){
                    averageval = parseInt(averageval/count);
                  }
                  face.color.set(new THREE.Color().setHex( cmap[averageval][1] ));
                  //face2.color.set(new THREE.Color().setHex( cmap[averageval][1] ));
                  geometry.faces.push(face);
                  //geometry.faces.push(face2);
              }
          }
          cell_index++;
      }
      cell_index += volume.resolution.x;
  }

    geometry.computeVertexNormals();

    return new THREE.Mesh( geometry, material );


    function cell_node_indices( cell_index )
    {
        var lines = volume.resolution.x;
        var slices = volume.resolution.x * volume.resolution.y;

        var id0 = cell_index;
        var id1 = id0 + 1;
        var id2 = id1 + lines;
        var id3 = id0 + lines;
        var id4 = id0 + slices;
        var id5 = id1 + slices;
        var id6 = id2 + slices;
        var id7 = id3 + slices;

        return [ id0, id1, id2, id3, id4, id5, id6, id7 ];
    }

    function cell_node_vectors( x,y,z )
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

    function plane_index( indices,vectors,a,b,c,d )
    {
        var s0 = volume.values[ indices[0] ][0];
        var s1 = volume.values[ indices[1] ][0];
        var s2 = volume.values[ indices[2] ][0];
        var s3 = volume.values[ indices[3] ][0];
        var s4 = volume.values[ indices[4] ][0];
        var s5 = volume.values[ indices[5] ][0];
        var s6 = volume.values[ indices[6] ][0];
        var s7 = volume.values[ indices[7] ][0];
        var t0 = a*vectors[0].x+b*vectors[0].y+c*vectors[0].z+d;
        var t1 = a*vectors[1].x+b*vectors[1].y+c*vectors[1].z+d;
        var t2 = a*vectors[2].x+b*vectors[2].y+c*vectors[2].z+d;
        var t3 = a*vectors[3].x+b*vectors[3].y+c*vectors[3].z+d;
        var t4 = a*vectors[4].x+b*vectors[4].y+c*vectors[4].z+d;
        var t5 = a*vectors[5].x+b*vectors[5].y+c*vectors[5].z+d;
        var t6 = a*vectors[6].x+b*vectors[6].y+c*vectors[6].z+d;
        var t7 = a*vectors[7].x+b*vectors[7].y+c*vectors[7].z+d;
        var index = 0;
        if(document.getElementById("invert").checked){
          if ( s0 > isovalue && t0 < 0 ) { index |=   1; }
          if ( s1 > isovalue && t1 < 0 ) { index |=   2; }
          if ( s2 > isovalue && t2 < 0 ) { index |=   4; }
          if ( s3 > isovalue && t3 < 0 ) { index |=   8; }
          if ( s4 > isovalue && t4 < 0 ) { index |=  16; }
          if ( s5 > isovalue && t5 < 0 ) { index |=  32; }
          if ( s6 > isovalue && t6 < 0 ) { index |=  64; }
          if ( s7 > isovalue && t7 < 0 ) { index |= 128; }
        }else{
          if ( s0 > isovalue && t0 > 0 ) { index |=   1; }
          if ( s1 > isovalue && t1 > 0 ) { index |=   2; }
          if ( s2 > isovalue && t2 > 0 ) { index |=   4; }
          if ( s3 > isovalue && t3 > 0 ) { index |=   8; }
          if ( s4 > isovalue && t4 > 0 ) { index |=  16; }
          if ( s5 > isovalue && t5 > 0 ) { index |=  32; }
          if ( s6 > isovalue && t6 > 0 ) { index |=  64; }
          if ( s7 > isovalue && t7 > 0 ) { index |= 128; }
        }
        onPlane = 0;
        if(document.getElementById("invert").checked){
          if ( t0 < 0 ) { onPlane |=   1; }
          if ( t1 < 0 ) { onPlane |=   2; }
          if ( t2 < 0 ) { onPlane |=   4; }
          if ( t3 < 0 ) { onPlane |=   8; }
          if ( t4 < 0 ) { onPlane |=  16; }
          if ( t5 < 0 ) { onPlane |=  32; }
          if ( t6 < 0 ) { onPlane |=  64; }
          if ( t7 < 0 ) { onPlane |= 128; }
        }else{
          if ( t0 > 0 ) { onPlane |=   1; }
          if ( t1 > 0 ) { onPlane |=   2; }
          if ( t2 > 0 ) { onPlane |=   4; }
          if ( t3 > 0 ) { onPlane |=   8; }
          if ( t4 > 0 ) { onPlane |=  16; }
          if ( t5 > 0 ) { onPlane |=  32; }
          if ( t6 > 0 ) { onPlane |=  64; }
          if ( t7 > 0 ) { onPlane |= 128; }
        }
        if( onPlane != 0 && onPlane != 255){
          isPlane = true;
          return onPlane;
        }
        return index;
    }

    function interpolated_vertex( v0, v1, s0,s1,s )
    {
      if(s0>s1){
        return new THREE.Vector3().addVectors( v0.multiplyScalar(s-s1), v1.multiplyScalar(s0-s) ).divideScalar( s0-s1 );
      }else{
        return new THREE.Vector3().addVectors( v0.multiplyScalar(s1-s), v1.multiplyScalar(s-s0) ).divideScalar( s1-s0 );
      }
    }
}
