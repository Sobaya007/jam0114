/*
 * 輪を表します。
 */
const makeRing = implShape => _ => {
  let radius = 1;
  let thickness = 1;
  let segments = 32;
  let angleS = 0;
  let angleE = Math.PI * 2;
  const def = f => e => {
    f(e);
    return o;
  };
  const o = {
    /*
     * radius::float->Ring
     * Ringの中心半径に関するsetterです。
     */
    radius    : def(r => radius = r),

    /*
     * thickness::float->Ring
     * Ringの厚みに関するsetterです。
     */
    thickness : def(t => thickness = t),

    /*
     * from::float->Ring
     * Ringの開始角度に関するsetterです。
     */
    from      : def(a => angleS = a * Math.PI / 180),

    /*
     * to::float->Ring
     * Ringの終了角度に関するsetterです。
     */
    to        : def(a => angleE = a * Math.PI / 180)
  };
  implShape(cont => cont(
        new THREE.RingGeometry(
          radius-thickness/2,
          radius+thickness/2,
          segments,
          segments,
          angleS,
          angleE-angleS)),
      o);
  return o;
}
