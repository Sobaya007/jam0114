/*
 * スプライトを定義します。
 * スプライトとは、簡単に扱える矩形の2次元上の物体のことです。
 * 主にUIなどで使われることを想定しています。
 */
const makeSprite = (add, addShapeToScene) => _ => {
  const contMaterial = (cont, t) => {
    cont(new THREE.SpriteMaterial({
      map : t,
      color : 0xffffff
    }))
  };
  const createMaterial = cont => onCreateMaterial(cont);
  const contFromTexture = t => onContFromTexture(t);
  let onCreateMaterial = cont => onContFromTexture = t => contMaterial(cont, t);
  let onContFromTexture = t => onCreateMaterial = cont => contMaterial(cont, t);
  const createMesh = (geom, mat) => new THREE.Sprite(mat);
  const createGeometry = cont => cont();
  const o = {};
  const [getMesh, manageArgs, isDead] = implementsShape(createGeometry, o, add, addShapeToScene, createMaterial, createMesh);

  /*
   * @Override
   */
  o.angle = a => getMesh(m => manageArgs(a, a => {
    m.material.rotation = a * Math.PI / 180;
  }));

  /*
   * @Override
   */
  o.size = (w,h) => getMesh(m => manageArgs(w,h, (w,h) => {
    if (w !== null) m.scale.setX(w);
    if (h !== null) m.scale.setY(h);
  }));
  
  o.trim = (x,y,w,h) => getMesh(m => manageArgs(x,y,w,h, (x,y,w,h) => {
    m.material.map.offset.set(x,y);
    m.material.map.repeat.set(w,h);
   }));
  
  return {
    sprite : o,
    cont : contFromTexture
  };
};
