/*
 * 矩形を表します。
 */
const makeRect = implShape => _ => {
  const o = {};
  implShape(cont => cont(new THREE.PlaneGeometry(1,1,10,10)), o);
  return o;
}
