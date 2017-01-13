/*
 * 直方体を表しています。
 * デフォルトのサイズは1x1x1です。
 */
const makeCube = implMesh => _ => {
  const o = {};
  implMesh(onLoad => onLoad(new THREE.CubeGeometry(1,1,1,10,10,10)), o);
  return o;
};
