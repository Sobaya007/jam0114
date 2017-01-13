/*
 * モデルの読み込まれたデータを表します。
 * ModelはこのModelDataをもとに複製して作られます。
 */
const makeLoadModel = (makeModel, models, rootPath) => {
  const jsonLoader = new THREE.JSONLoader();
  const objectLoader = new THREE.ObjectLoader();
  const xhrLoader = new THREE.XHRLoader();
  return (path, multi, hasAnimation) => { 
    const modelPath = rootPath + "model/" + path; 
    const animPath = modelPath.replace(".json", "") + "_actionlist.json";
    //modelPathでキャッシュ
    const cache = U.filter(models, m => m.path === modelPath);
    if (cache.length > 0) {
     return cache[0];
    }
    let scene;
    let animData;
    let onLoads = [];
    const o = {
      /*
       * into::string->void
       * nameを受け取り、その名前でSceneに登録します。
       */
      into : id => {
        models[id] = o;
        return o;
      },

      /*
       * make::void->Model
       * ModelDataをもとにModelを作成します。
       */
      make : _ => {
       const m = makeModel(); 
       if (onLoads) {
        onLoads.push(m.onLoad); 
       } else {
         const clone = new THREE.Scene;
         clone.copy(scene, true);
         m.onLoad(clone, animData);
       }
       return m.model;
      },
      path : modelPath
    };
    //アニメーションの区切り目をファイルから読み取る
    //ないとは思うが万が一ここの処理がモデル読み込みがあるとバグる
    if (hasAnimation) {
      xhrLoader.load(animPath, content => {
        animData = JSON.parse(content); 
        const keys = Object.keys(animData);
        let beforeStartFrame = -1;
        for (let i = 0; i < keys.length; i++) {
          const k = keys[i];
          const v = animData[k];
          if (beforeStartFrame >= v) {
            console.log("Please Sort Start Frame");
            return;
          }
          animData[k] = {
            startFrame : v
          };
          if (i == 0) continue;
          animData[keys[i-1]].endFrame = v-1;
          beforeStartFrame = v;
        }
      });
    }

    if (multi) {
      objectLoader.load(modelPath, s => {
        scene = s;
        //なんか回転したほうが良さ
        scene.rotation.set(-Math.PI/2, 0, 0);
        //モデルのアニメーション用に必要
        scene.children.forEach(c => {
          c.material.morphTargets = true;
        });
        //最後のendFrameを埋める
        const endFrame = scene.children[0].morphTargetInfluences.length-1;
        if (endFrame <= animData[Object.keys(animData)[Object.keys(animData).length-1]].startFrame) {
          console.log("Any Error. Maybe actionlist is wrong data.");
        }
        animData[Object.keys(animData)[Object.keys(animData).length-1]].endFrame = endFrame;
        const clone = new THREE.Scene;
        clone.copy(scene, true);
        onLoads.forEach(onLoad => onLoad.forEach(f => f(clone, animData)));
        onLoads = null;
      });
    } else {
     jsonLoader.load(modelPath, (geom, mat) => {
       const mesh = new THREE.Mesh(geom, mat[0]);
       onLoads.forEach(onLoad => onLoad.forEach(f => f(mesh)));
     });
    }
    return o;
  };
};
