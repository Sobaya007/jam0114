const makeBillLine = (add, addMeshToScene) => _ => {
  const contMaterial = (cont, t) => {
    cont(new THREE.MeshBasicMaterial({
      map : t,
      color : 0xffffff
    }));
  };
  const createMaterial = cont => onCreateMaterial(cont);
  const contFromTexture = t => onContFromTexture(t);
  let onCreateMaterial  = cont => onContFromTexture = t    => contMaterial(cont, t);
  let onContFromTexture   = t    => onCreateMaterial  = cont => contMaterial(cont, t);
  const createMesh     = (geom, mat) => new THREE.Mesh(geom, mat);
  const createGeometry = cont   => cont(new THREE.PlaneGeometry(1,1,1,1));
  const o = {};
  const [getMesh, manageArgs, isDead] = implementsMesh(createGeometry, o, add, addMeshToScene, createMaterial, createMesh);

  let width = 1, length = 1;
  o.width = w => getMesh(m => manageArgs(m, m => {
    if (w != null) width = w;
  }));
  o.length = h => getMesh(m => manageArgs(m, m => {
    if (h != null) length = h;
  }))
  o.axis = (x,y,z) => {
    axis.set(x,y,z);
    return o;
  };
  const cam = GV.camera3d;
  const axis = new THREE.Vector3(0,1,0).normalize();
  add(kill => {
    getMesh(mesh => {
      const camVec = new THREE.Vector3().subVectors(mesh.position, cam.position).normalize();
      const s = -Math.sqrt(1 / (1 - axis.dot(camVec)));
      const t = -axis.dot(camVec) * s;
      const n = new THREE.Vector3().addVectors(new THREE.Vector3().copy(axis).multiplyScalar(t),
          new THREE.Vector3().copy(camVec).multiplyScalar(s)).normalize();
      const up = axis;
      const side = new THREE.Vector3().crossVectors(up, n).normalize();
      const newWorld = U.makeReplacement(side, up, n);
      newWorld.multiplyMatrices(new THREE.Matrix4().makeTranslation(mesh.position.x, mesh.position.y, mesh.position.z), newWorld)
        newWorld.multiplyMatrices(newWorld, new THREE.Matrix4().makeScale(width, length, 1));
      mesh.matrixAutoUpdate = false;
      mesh.matrix = newWorld;
    }); 
    if (isDead()) kill();
  });
  return {
    billboard : o,
    cont : contFromTexture
  };
};
