/*
 * グリッドを表しています。
 * デフォルトは100x100のサイズ中に格子が50x50個あります。
 * デバッグ用を想定しているため、色は変更できません。
 */
const makeGrid = (add, addMeshToScene) => _ => {
  let cellNum = 50; 
  const o = {};

  implementsMesh(onLoad => onLoad(new THREE.GridHelper(500, cellNum, 0xffffff, 0xffffff)), o, add, addMeshToScene,
      cont => cont(),
      (geom,mat) => geom);

  /*
   * cellNum::int->Grid
   * Gridの格子の数に関するsetterです。
   */
  o.cellNum = c => {
    cellNum = c;
    return o;
  };
  return o;
};
