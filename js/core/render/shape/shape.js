/*
 * 2次元物体を表します。
 */
const implementsShape = (createGeom, shape, add, addShapeToScene,
    createMaterial = cont => cont(new THREE.MeshBasicMaterial({
      color: 0xffffff
    })),
    createShape = (geom, mat) => new THREE.Mesh(geom, mat)) => {
  let onCreated = [];
  let mesh;
  let alive = true;
  const getMesh = f => {
    if (onCreated) {
      onCreated.push(f);
    } else {
      f(mesh);
    }
    return shape;
  };
  const isDead = _ => !alive;
  const manageArgs = U.makeManageArgs(add, isDead);
  const shader = makeShader(manageArgs);

  /*
   * center::(V,V) -> Shape
   * 中心座標に関するsetterです。
   * nullを指定すると、そこは変更しないことになります。
   */
  shape.center = (x, y) => getMesh(m => manageArgs(x, y, (x, y) => {
    if (x !== null) m.position.setX(x);
    if (y !== null) m.position.setY(y);
  }));

  /*
   * angle::V->Shape
   * 回転角に関するsetterです。回転中心はcenter,UCWで回転、単位は度です。
   */
  shape.angle = a => getMesh(m => manageArgs(a, a => {
    m.rotation.z = a * Math.PI / 180;
  }));

  /*
   * size::(V,V) -> Shape
   * 大きさに関するsetterです。拡大中心はcenterです。
   * nullを指定すると、そこは変更しないことになります。
   */
  shape.size = (w, h) => getMesh(m => manageArgs(w, h, (w, h) => {
    const box = new THREE.Box3().setFromObject(m);
    const W = (box.max.x - box.min.x) / m.scale.x;
    const H = (box.max.y - box.min.y) / m.scale.y;
    if (w !== null) m.scale.setX(w / W);
    if (h !== null) m.scale.setY(h / H);
  }));

  /*
   * sizeW::V->Shape
   * 幅に関するsetterです。指定した幅に合わせて、縦横比が変更前と同じになるようにスケールします。
   */
  shape.sizeW = w => getMesh(m => manageArgs(w, w => {
    const box = new THREE.Box3().setFromObject(m);
    const W = box.max.x - box.min.x;
    const H = box.max.y - box.min.y;
    shape.size(w, w * H / W);
  }));

  /*
   * sizeH::V->Shape
   * 高さに関するsetterです。指定した高さに合わせて、縦横比が変更前と同じになるようにスケールします。
   */
  shape.sizeH = h => getMesh(m => manageArgs(h, h => {
    const box = new THREE.Box3().setFromObject(m);
    const W = box.max.x - box.min.x;
    const H = box.max.y - box.min.y;
    shape.size(h * W / H, h);
  }));

  /*
   * color::(V,V,V)->Shape
   * 色に関するsetterです。並びはRGBで、範囲は[0,1]です。
   * nullを指定すると、そこは変更しないことになります。
   */
  shape.color = (r, g, b) => getMesh(m => manageArgs(r, g, b, (r, g, b) => {
    if (r !== null) m.material.color.r = r;
    if (g !== null) m.material.color.g = g;
    if (b !== null) m.material.color.b = b;
  }));

  /*
   * blend::(V)->Shape
   * ブレンドに関するsetterです。Vはブレンド名です。
   */
  shape.blend = (b) => getMesh(m => manageArgs(b, b => {
    if (b == "AdditiveBlending") m.material.blending = THREE.AdditiveBlending;
    else if (b == "NormalBlending") m.material.blending = THREE.NormalBlending;
    else if (b == "SubtractiveBlending") m.material.blending = THREE.SubtractiveBlending;
    else if (b == "MultiplyBlending") m.material.blending = THREE.MultiplyBlending;
    else m.material.blending = THREE.NoBlending;
    m.material.transparent = true;
  }));

  /*
   * opacity::V->Shape
   * 透明度に関するsetterです。
   */
  shape.opacity = a => getMesh(m => manageArgs(a, a => {
    m.material.opacity = a;
    m.material.transparent = true;
  }));

  /*
   * shader::(Shader->Shader)->Shape
   * Shaderに関するsetterです。
   * 引数settingにはShaderに関する設定を記述します。
   */
  shape.shader = setting => {
    const [s, create] = shader();
    setting(s);
    createMaterial = cont => cont(create());
    return shape;
  };

  /*
   * depth::V->Shape
   * 深度に関するsetterです。範囲は[0,1]です。
   */
  shape.depth = d => getMesh(m => manageArgs(d, d => {
    if (d > 1) d = 1;
    if (d < 0) d = 0;
    m.position.setZ(-d);
  }));

  /*
   * go::(void->bool)->Shape
   * 実行時点までの変更内容を登録し、そのShapeをSceneに登録します。
   * 引数にはShapeの削除条件を記します。
   */
  shape.go = f => {
    add(kill => {
      alive = alive && !f();
      if (!alive && GV.scene2d.children.indexOf(mesh) != -1) {
        kill();
        GV.scene2d.remove(mesh);
      }
    });
    createGeom(geom => {
      createMaterial(mat => {
        mesh = createShape(geom, mat);
        addShapeToScene(mesh);
        for (let i = 0; i < onCreated.length; i++) {
          onCreated[i](mesh);
        }
        onCreated = null;
      })
    });
    return shape;
  };
  shape.center(0, 0).depth(0);
  return [getMesh, manageArgs, isDead];
};
