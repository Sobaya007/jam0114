/*
 * 便利関数まとめ
 */
const U = (() => {
  const xhrLoader = new THREE.XHRLoader();
  let u = {};

  u.loadText = (path, listener) => {
    xhrLoader.load(path, listener);
  };
  /*
   * makeRotationFromTo::(vec, vec)->mat
   * 回します
   */
  u.makeRotationFromTo = (a, b) => {
    const axis = new THREE.Vector3().crossVectors(a,b).normalize(); 
    const angle = Math.acos(a.dot(b));
    return new THREE.Matrix4().makeRotationAxis(axis, angle);
  };
  u.makeReplacement = (x,y,z) => {
    const m = new THREE.Matrix4(); 
    m.elements[0] = x.x;
    m.elements[1] = x.y;
    m.elements[2] = x.z;
    m.elements[3] = 0;
    m.elements[4] = y.x;
    m.elements[5] = y.y;
    m.elements[6] = y.z;
    m.elements[7] = 0;
    m.elements[8] = z.x;
    m.elements[9] = z.y;
    m.elements[10] = z.z;
    m.elements[11] = 0;
    m.elements[12] = 0;
    m.elements[13] = 0;
    m.elements[14] = 0;
    m.elements[15] = 1;
    return m;
  };
  u.normalize = v => {
    const length = Math.sqrt(v.x*v.x + v.y*v.y + v.z*v.z);
    return {
      x : v.x / length,
      y : v.y / length,
      z : v.z / length
    };
  };
  u.distance = (a,b) => {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    const dz = a.z - b.z;
    return Math.sqrt(dx*dx + dy*dy + dz*dz);
  };
  /*
   * reduce::([a], (a,a)->b)->b
   * 畳みます。
   */
  u.reduce = (array, func) => {
    let val = array[0];
    for (let i = 1; i < array.length; i++) {
      val = func(val, array[i]);
    }
    return val;
  };

  /*
   * filter::([a], a->bool)->[a]
   * フィルターします。
   */
  u.filter = (array, pred) => {
    let val = [];
    for (let i = 0; i < array.length; i++) {
      if (pred(array[i]))
        val.push(array[i]);
    }
    return val;
  };

  /*
   * all::([a], a->bool)->bool
   * 全部が条件を満たしたらtrue
   */
  u.all = (array, pred) => {
    for (let i = 0; i < array.length; i++) {
      if (!pred(array[i])) return false;
    }
    return true;
  };

  /*
   * any::([a], a->bool)->bool;
   * 1つでも条件を満たしたらtrue
   */
  u.any = (array, pred) => !u.all(array, x => !pred(x));

  /*
   * map::([a], a->b)->[b]
   * 全部変換
   */
  u.map = (array, func) => {
    let val = [];
    for (let i = 0; i < array.length; i++) {
      val.push(func(array[i]));
    }
    return val;
  };

  /*
   * dropTail::[a]->[a]
   * ケツだけ落とす
   */
  u.dropTail = array => {
    let val = [];
    for (let i = 0; i < array.length-1; i++) {
      val.push(array[i]);
    }
    return val;
  };

  /*
   * last::[a]->a
   * ケツ
   */
  u.last = array => array[array.length-1];
  //アロー関数内ではargumentsが使えなかった
  /*
   * makeManageArgs::(((void->void)->void)->void, void->bool)->(([V], ([V]->void))->void)
   * addとisDeadを受け取って、manageArgsを返す関数です。
   * manageArgs::([V], ([V]->void))->void
   *                     V = float | Ease
   * manageArgsは、引数リストと関数を受け取る関数です。
   * 引数リストの中のものの型はfloatかEaseかのどちらかで、
   * floatだった場合にはそのまま関数に適用し、
   * Easeだった場合にはそれを更新しながら毎フレーム関数に適用するようにします。
   */
  u.makeManageArgs = (add, isDead) => function(...args) {
    const realArgs = U.dropTail(args);
    const func = U.last(args);
    if (U.all(realArgs, x => !(x instanceof Object) && (typeof x) !== "function")) { //is Normal Value
      func(...realArgs);
    } else {       // has some dynamic object
      let aliveCount = 0;
      for (let i = 0; i < realArgs.length; i++) {
        const arg = realArgs[i];
        if (arg.value && (typeof arg.value) === "function") { //is Ease Object
          let killFlag = false;
          //親のEaseがkillをしたら子供もすべて死ぬようにする
          const target = arg.parent ? arg.parent : arg;
          const pre = target.kill;
          aliveCount++;
          target.kill = _ => { 
            pre();
            killFlag = true;
            aliveCount--;
          };
          //追加
          add(kill => { //step for update arg
            realArgs[i] = arg.value();
            if (killFlag || isDead()) {
              kill();
              arg.kill();
            }
          });
          realArgs[i] = arg.value();
        } else if ((typeof arg) === "function") {
          //追加
          add(kill => { //step for update arg
            realArgs[i] = arg(realArgs[i]);
            if (isDead()) kill();
          });
          realArgs[i] = arg(realArgs[i]);
          aliveCount = 1;
        }
      }
      add(kill => { //step for applying realArgs
        func(...realArgs);
        if (aliveCount <= 0) kill();
        if (isDead()) kill();
      });
      func(...realArgs);
    }
  };
  return u;
})();
