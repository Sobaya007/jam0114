/*
 * ビルボードを定義します。
 * ビルボードとは、常にカメラの方を向く矩形の3次元上の物体のことです。
 * 主にエフェクトのパーティクルなどで使われることを想定しています。
 */
const makeBillboard = (add, addMeshToScene) => _ => {
  const contMaterial = (cont, t) => {
    cont(new THREE.MeshBasicMaterial({
      map : t,
      color : 0xffffff
    }))
  };
  const createMaterial = cont => onCreateMaterial(cont);
  const contFromTexture = t => onContFromTexture(t);
  let onCreateMaterial = cont => onContFromTexture = t => contMaterial(cont, t);
  let onContFromTexture = t => onCreateMaterial = cont => contMaterial(cont, t);
  const createMesh = (geom, mat) => new THREE.Mesh(geom, mat);
  const createGeometry = cont => cont(new THREE.PlaneGeometry(1,1,1,1));
  const o = {};
  const [getMesh, manageArgs, isDead] = implementsMesh(createGeometry, o, add, addMeshToScene, createMaterial, createMesh);

  /*
   * angle::V->BillBoard
   * BillBoardの角度に関するsetterです。回転中心はcenter、UCWで回転、単位は度です。
   */
  o.angle = a => getMesh(m => manageArgs(a, a => {
    //Spriteはrotationが効かないので、SpriteMaterialからやる必要がある
    m.material.rotation = a * Math.PI / 180;
  }));

  /*
   * @Override
   */
  o.size = (w,h) => getMesh(m => manageArgs(w,h, (w,h) => {
    //Spriteはデフォルトのサイズが1x1らしい
    if (w !== null) m.scale.setX(w);
    if (h !== null) m.scale.setY(h);
  }));

  const cam = GV.camera3d;
  add(kill => {
    getMesh(mesh => {
      const camVec = new THREE.Vector3().subVectors(cam.position, mesh.position).normalize();
      const up = cam.up;
      const side = new THREE.Vector3().crossVectors(up, camVec).normalize();
      const newWorld = U.makeReplacement(side, up, camVec);
      newWorld.multiplyMatrices(new THREE.Matrix4().makeTranslation(mesh.position.x, mesh.position.y, mesh.position.z), newWorld)
        newWorld.multiplyMatrices(newWorld, new THREE.Matrix4().makeScale(mesh.scale.x, mesh.scale.y, mesh.scale.z));
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
