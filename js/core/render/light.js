/*
 * 光源を表します。
 * SpotLightは必要ないと思ったので未定義です。
 */
const makeLightBulider = (add, addToScene) => {
  let alive = true;
  const isDead = _ => !alive;
  const manageArgs = U.makeManageArgs(add, isDead);
  const def = (light, f) => {
    return e => {
      f(e);
      return light;
    };
  };
  const implementsLight = (l, l3) => {
    /*
     * color::(V,V,V)->Light
     * 光の色に関するsetterです。
     */
    l.color = (r,g,b) => {
      manageArgs(r,g,b,(r,g,b) => {
        l3.color.setRGB(r,g,b);
      });
      return l;
    };

    /*
     * 実行時点までの変更内容を登録し、そのLightをSceneに登録します。
     * 引数にはLightの削除条件を記述します。
     */
    l.go = f => {
      add(kill => {
        alive = alive && !f();
        if (!alive && GV.scene3d.children.indexOf(l3) != -1) {
          kill();
          GV.scene3d.remove(l3);
        }
      });
      addToScene(l3);
      return l;
    };
  };
  const o = {};
  /*
   * at::(V,V,V) -> PointLight
   * posを受け取り、点光源をその位置に置きます。
   */
  o.at = (x,y,z) => {
    const light = new THREE.PointLight();
    manageArgs(x,y,z, (x,y,z) => {
      light.position.set(x,y,z);
    });
    const o = {
      /*
       * intensity::V->PointLight
       * 光の強さに関するsetterです。
       */
      intensity : def(light, i => manageArgs(i, i => {
        light.intensity = i;
      })),
      /*
       * distance::V->PointLight
       * 影響のある距離に関するsetterです。
       */
      distance : def(light, d => manageArgs(d, d => {
        light.distance = d;
      })),
      /*
       * decay::V->PointLight
       * 光の減衰の強さに関するsetterです。
       */
      decay : def(light, d => manageArgs(d, d => {
        light.decay = d;
      }))
    };
    implementsLight(o, light);
    return o;
  };
  /*
   * to::(V,V,V) -> DirectionalLight
   * dirを受け取り、平行光源をその向きに置きます。
   */
  o.to = (x,y,z) => {
    const light = new THREE.DirectionalLight(0xffffff, 1);
    //ある程度離しておかないと、影がバグる
    light.position.set(-x*20,-y*20,-z*20);
    //影の設定
    light.castShadow = true;
    light.shadow.camera.left = -50;
    light.shadow.camera.right = 50;
    light.shadow.camera.top = 50;
    light.shadow.camera.bottom = -50;
    light.shadow.mapSize.width = 2048;
    light.shadow.mapSize.height = 2048;
    const o = {
      /*
       * intensity::V->DirectionalLight
       * 光の強さに関するsetterです。
       */
      intensity : def(light, i => manageArgs(i, i => {
        light.intensity = i;
      }))
    };
    implementsLight(o, light);
    return o;
  };
  return o;
};
