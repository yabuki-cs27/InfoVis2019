function Isosurfaces( volume, isovalue )
{
  var geometry = new THREE.Geometry();
  var material = new THREE.MeshLambertMaterial({ color: 0xffffff, vertexColors: THREE.FaceColors });
  //console.log(document.getElementById("vert").innerHTML);
  var smin = volume.min_value;
  var smax = volume.max_value;
  isovalue = KVS.Clamp( isovalue, smin, smax );

  var lut = new KVS.MarchingCubesTable();
  //console.log(lut);
  var cell_index = 0;
  var counter = 0;
  var cmap = [];
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
              var indices = cell_node_indices( cell_index++ );
              var index = table_index( indices );
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
                  val[0] = volume.values[cell_index+vid0[0]+vid0[1]*lines+vid0[2]*slices][0];
                  val[1] = volume.values[cell_index+vid1[0]+vid1[1]*lines+vid1[2]*slices][0];
                  val[2] = volume.values[cell_index+vid2[0]+vid2[1]*lines+vid2[2]*slices][0];
                  val[3] = volume.values[cell_index+vid3[0]+vid3[1]*lines+vid3[2]*slices][0];
                  val[4] = volume.values[cell_index+vid4[0]+vid4[1]*lines+vid4[2]*slices][0];
                  val[5] = volume.values[cell_index+vid5[0]+vid5[1]*lines+vid5[2]*slices][0];
                  //if(x==100)console.log(v0,v1,v2,v3,v4,v5);
                  var v01 = interpolated_vertex( v0, v1, val[0],val[1] );
                  var v23 = interpolated_vertex( v2, v3, val[2],val[3] );
                  var v45 = interpolated_vertex( v4, v5, val[4],val[5] );


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

    function table_index( indices )
    {
        var s0 = volume.values[ indices[0] ][0];
        var s1 = volume.values[ indices[1] ][0];
        var s2 = volume.values[ indices[2] ][0];
        var s3 = volume.values[ indices[3] ][0];
        var s4 = volume.values[ indices[4] ][0];
        var s5 = volume.values[ indices[5] ][0];
        var s6 = volume.values[ indices[6] ][0];
        var s7 = volume.values[ indices[7] ][0];

        var index = 0;
        if ( s0 > isovalue ) { index |=   1; }
        if ( s1 > isovalue ) { index |=   2; }
        if ( s2 > isovalue ) { index |=   4; }
        if ( s3 > isovalue ) { index |=   8; }
        if ( s4 > isovalue ) { index |=  16; }
        if ( s5 > isovalue ) { index |=  32; }
        if ( s6 > isovalue ) { index |=  64; }
        if ( s7 > isovalue ) { index |= 128; }

        return index;
    }

    function interpolated_vertex( v0, v1, s0,s1 )
    {
        return new THREE.Vector3().addVectors( v0.multiplyScalar(s0+1), v1.multiplyScalar(s1+1) ).divideScalar( s0+s1+2 );
    }
}
