/*
 * 平面を表します。デフォルトではサイズは200x200、向きはz軸を法線とするようになっています。
 */

const makePlane = implMesh => _ => {
  const o = {};
  let noise = false;
  implMesh(onLoad => {
    const geom = new THREE.PlaneGeometry(200,200,200,200);
    if (noise) {
      const noise = new SimplexNoise;
      geom.vertices.forEach(v => {
        v.z += 1 * noise.noise(v.x / 10, v.y / 10);
      });
      geom.computeVertexNormals();
      geom.computeFaceNormals();
    }
    onLoad(geom);
  }, o);

  /*
   * noise::void->Plane
   * 平面をでこぼこにします。
   */
  o.noise = _ => {
    noise = true;
    return o; 
  };
  return o;
};
