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

    var light = new THREE.PointLight();
    light.position.set( 5, 5, 5 );
    scene.add( light );

    var renderer = new THREE.WebGLRenderer();
    renderer.setSize( width, height );
    document.body.appendChild( renderer.domElement );

    var geometry = new THREE.TorusKnotGeometry( 1, 0.3, 100, 20 );
    var material = new THREE.ShaderMaterial({
        vertexColors: THREE.VertexColors,
        vertexShader: document.getElementById('shader.vert').text,
        fragmentShader: document.getElementById('shader.frag').text,
        uniforms: {
          light_position: { type: 'v3', value: light.position }
        }
    });

    var torus_knot = new THREE.Mesh( geometry, material );
    scene.add( torus_knot );

    loop();

    function loop()
    {
      requestAnimationFrame( loop );
      torus_knot.rotation.x += 0.01;
      torus_knot.rotation.y += 0.01;
      renderer.render( scene, camera );
      //  set_attribute(tVBOList, attLocation, attStride);
/*gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, tIndex);
m.identity(mMatrix);
m.rotate(mMatrix, rad, [0, 1, 1], mMatrix);
m.multiply(tmpMatrix, mMatrix, mvpMatrix);
m.inverse(mMatrix, invMatrix);
gl.uniformMatrix4fv(uniLocation[0], false, mvpMatrix);
gl.uniformMatrix4fv(uniLocation[1], false, invMatrix);
gl.uniform3fv(uniLocation[2], lightDirection);
gl.uniform1i(uniLocation[3], 0);

// モデルをレンダリング
gl.cullFace(gl.BACK);
gl.uniform1i(uniLocation[4], false);
edgeColor = [0.0, 0.0, 0.0, 0.0];
gl.uniform4fv(uniLocation[5], edgeColor);
gl.drawElements(gl.TRIANGLES, torusData.i.length, gl.UNSIGNED_SHORT, 0);

// エッジ用モデルをレンダリング
gl.cullFace(gl.FRONT);
gl.uniform1i(uniLocation[4], true);
edgeColor = [0.0, 0.0, 0.0, 1.0];
gl.uniform4fv(uniLocation[5], edgeColor);
gl.drawElements(gl.TRIANGLES, torusData.i.length, gl.UNSIGNED_SHORT, 0);*/
    }
}
