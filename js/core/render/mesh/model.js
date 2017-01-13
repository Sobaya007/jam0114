/*
 * 3Dモデルを表します。
 * 2016/11/21現在、Blenderでのモデルの読み込みは観測しています。
 */
const makeModel = (s, addMeshToScene) => _ => {
  const o = {}; 
  let animName;
  let nextAnimName;
  let animInfluence = 1;
  let frame;
  let nextAnimFrame;
  let transitEase;
  const onLoad = [];
  let loaded = false;
  let pos = [0,0,0]; let size = [10,10]; 
  const [getMesh, manageArgs, isDead] = implementsMesh(f => {
    onLoad.push((scene,animData) => {
      loaded = true;
      if (animData) {
        //step用の準備をする
        //アニメーションの最初のフレーム
        const animStartFrame = animName => animData[animName].startFrame;
        //アニメーション最後のフレーム
        const animEndFrame = animName => animData[animName].endFrame;
        //アニメーションの長さ
        const animLength = animName => animEndFrame(animName) - animStartFrame(animName) + 1;
        //フレーム(全体としてみたVer.)
        const getRealFrame = (animName, frame) => {
          if (frame > animLength(animName)-1) return animStartFrame(animName);
          return animStartFrame(animName) + frame; 
        }
        //Influenceを削除
        let clearInfluence = [];
        const setInfluence = (mesh, animName, frame, influence) => {
          //現在のフレームがpとnの間にあるので、Influenceをその2つに配分
          const p = getRealFrame(animName, Math.floor(frame));
          const n = getRealFrame(animName, Math.ceil(frame));
          const rate = frame - Math.floor(frame);
          mesh.morphTargetInfluences[p] += (1 - rate) * influence;
          mesh.morphTargetInfluences[n] += rate * influence;
          //Influenceの削除要請
          clearInfluence.push(_ => {
            mesh.morphTargetInfluences[p] = 0;
            mesh.morphTargetInfluences[n] = 0;
          });
        };
        const stepFrame = (animName, frame) => {
          frame += 1.5;
          if (frame >= animLength(animName))
            frame -= animLength(animName);
          return frame;
        };
        frame = 0;

        //毎フレームステップ
        s.add(kill => {
          if (!animName) return;
          clearInfluence.forEach(c => c());
          clearInfluence.length = 0;
          frame = stepFrame(animName, frame);
          scene.children.forEach(c => setInfluence(c, animName, frame, animInfluence));
          if (nextAnimName) {
            nextAnimFrame = stepFrame(nextAnimName, nextAnimFrame);
            scene.children.forEach(c => setInfluence(c, nextAnimName, nextAnimFrame, 1 - animInfluence));
          }
          scene.children.forEach(c => c.skeleton.update());
        if (isDead()) kill();
        });
      }
      f(scene); 
    }); 
  }, o, s.add, addMeshToScene,
  cont => cont(),
  (geom, mat) => geom); 
  /*
   * play::string->Model
   * animNameを引数にして、そのアニメーションを再生します。
   */
  o.play = a => {
    animName = a; 
    return o;
  };
  /*
   * to::(string, int)->Model
   * (animName, period)を引数にして、そのアニメーションにperiodかけて移行します。
   */
  o.to = (name, period) => {
    if (nextAnimName) {
      if (transitEase) transitEase.kill();
      animName = name;
      animInfluence = 1 - animInfluence;
    }
    nextAnimName = name;
    nextAnimFrame = 0;
    transitEase = s.ease.make(animInfluence).linear().to(0).period(period).on(1, _ => {
      animName = name;
      nextAnimName = null;
      animInfluence = 1;
      frame = nextAnimFrame;
    }).onStep(v => {
      if (nextAnimName) {
        animInfluence = v;
      }
    });
    return o;
  };
  //centerとsizeで来た値をここで吸い取っておく
  const preCenter = o.center;
  /*
   * @Override
   */
  o.center = (x,y,z) => {
    pos[0] = x; pos[1] = y; pos[2] = z;
    return preCenter(x,y,z); 
  };
  const preSize = o.size;
  /*
   * @Override
   */
  o.size = (w,h,d) => {
    size[0] = w; size[1] = h;
    return preSize(w,h,d);
  };
  return {
    model : o,
    onLoad : onLoad
  };
};
