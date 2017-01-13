/* * 3次元物体を表します。
*/
const implementsMesh = (createGeom, shape, add, addMeshToScene,
    createMaterial = cont => cont(new THREE.MeshPhongMaterial({
      color: 0xffffff
    })),
    createMesh = (geom, mat) => new THREE.Mesh(geom, mat)) => {
  let onCreated = []; //::[THREE.Mesh->void]
  let mesh; //::THREE.Mesh
  let alive = true;
  //(THREE.Mesh->void)->Mesh
  const getMesh = contFromMesh => {
    if (onCreated) {
      onCreated.push(contFromMesh);
    } else {
      contFromMesh(mesh);
    }
    return shape;
  };
  const isDead = _ => !alive;
  const manageArgs = U.makeManageArgs(add, isDead);
  const shader = makeShader(manageArgs);

  /*
   * center::(V,V,V) -> Mesh
   * 中心座標に関するsetterです。
   * nullを指定すると、そこは変更しないことになります。
   */
  shape.center = (x, y, z) => getMesh(m => manageArgs(x, y, z, (x, y, z) => {
    if (x !== null) m.position.setX(x);
    if (y !== null) m.position.setY(y);
    if (z !== null) m.position.setZ(z);
  }));

  /*
   * rotate::(float,float,float,V) -> Mesh
   * 回転に関するsetterです。回転中心はcenter、UCWで回転、単位は度です。
   * 引数はAxis-Angle形式です。
   */
  shape.rotate = (x, y, z, a) => getMesh(m => manageArgs(a, a => {
    const axis = new THREE.Vector3(x, y, z).normalize();
    m.quaternion.setFromAxisAngle(axis, a * Math.PI / 180);
  }));

  /*
   * size::(V,V,V) -> Mesh
   * 大きさに関するsetterです。拡大中心はcenterです。
   * nullを指定すると、そこは変更しないことになります。
   */
  shape.size = (w, h, d) => getMesh(m => manageArgs(w, h, d, (w, h, d) => {
    const box = new THREE.Box3().setFromObject(m);
    const W = (box.max.x - box.min.x) / m.scale.x;
    const H = (box.max.y - box.min.y) / m.scale.y;
    const D = (box.max.z - box.min.z) / m.scale.z;
    if (w !== null) m.scale.setX(w / W);
    if (h !== null) m.scale.setY(h / H);
    if (d !== null) m.scale.setZ(d / D);
  }));

  /*
   * sizeW::V->Mesh
   * 幅に関するsetterです。指定した幅に合わせて、縦横比が変更前と同じになるようにスケールします。
   */
  shape.sizeW = w => getMesh(m => manageArgs(w, w => {
    const box = new THREE.Box3().setFromObject(m);
    const W = box.max.x - box.min.x;
    const H = box.max.y - box.min.y;
    const D = box.max.z - box.min.z;
    shape.size(
        w,
        w * H / W,
        w * D / W);
  }));

  /*
   * sizeH::V->Mesh
   * 高さに関するsetterです。指定した高さに合わせて、縦横比が変更前と同じになるようにスケールします。
   */
  shape.sizeH = h => getMesh(m => manageArgs(h, h => {
    const box = new THREE.Box3().setFromObject(m);
    const W = box.max.x - box.min.x;
    const H = box.max.y - box.min.y;
    const D = box.max.z - box.min.z;
    shape.size(
        h * W / H,
        h,
        h * D / H);
  }));

  /*
   * sizeD::V->Mesh
   * 奥行きに関するsetterです。指定した奥行きに合わせて、縦横比が変更前と同じになるようにスケールします。
   */
  shape.sizeD = d => getMesh(m => manageArgs(d, d => {
    const box = new THREE.Box3().setFromObject(m);
    const W = box.max.x - box.min.x;
    const H = box.max.y - box.min.y;
    const D = box.max.z - box.min.z;
    shape.size(
        d * W / D,
        d * H / D,
        d);
  }));

  /*
   * amb::(V,V,V)->Mesh
   * 環境色に関するsetterです。並びはRGBで、範囲は[0,1]です。
   * nullを指定すると、そこは変更しないことになります。
   */
  shape.amb = (r, g, b) => getMesh(m => manageArgs(r, g, b, (r, g, b) => {
    //多分これ
    if (r !== null) m.material.emissive.r = r;
    if (g !== null) m.material.emissive.g = g;
    if (b !== null) m.material.emissive.b = b;
  }));

  /*
   * dif::(V,V,V)->Mesh
   * 拡散色に関するsetterです。並びはRGBで、範囲は[0,1]です。
   * nullを指定すると、そこは変更しないことになります。
   */
  shape.dif = (r, g, b) => getMesh(m => manageArgs(r, g, b, (r, g, b) => {
    //なぜかこれ
    if (r !== null) m.material.color.r = r;
    if (g !== null) m.material.color.g = g;
    if (b !== null) m.material.color.b = b;
  }));

  /*
   * spc::(V,V,V)->Mesh
   * 反射色に関するsetterです。並びはRGBで、範囲は[0,1]です。
   * nullを指定すると、そこは変更しないことになります。
   */
  shape.spc = (r, g, b) => getMesh(m => manageArgs(r, g, b, (r, g, b) => {
    if (r !== null) m.material.specular.r = r;
    if (g !== null) m.material.specular.g = g;
    if (b !== null) m.material.specular.b = b;
  }));

  /*
   * shine::V->Mesh
   * 輝度に関するsetterです。
   */
  shape.shine = s => getMesh(m => manageArgs(s, s => {
    m.material.shininess = s;
  }));

  /*
   * opacity::V->Mesh
   * 透明度に関するsetterです。
   */
  shape.opacity = a => getMesh(m => manageArgs(a, a => {
    m.material.opacity = a;
    m.material.transparent = true;
  }));

  /*
   * texture::Image->Mesh
   * テクスチャを設定する関数です。
   */
  shape.texture = image => exec(m => {
    image.getTexture(texture => {
      m.material.map = texture;
      m.material.needsUpdate = true;
    });
  });

  /*
   * blend :: int->Mesh
   * ブレンドの方法を決めます。
   * 引数にはThree.jsによって作られたブレンドモードを指定します。
   * NoBlending
   * NormalBlending
   * AdditiveBlending
   * SubtractiveBlending
   * MultiplyBlending
   * AdditiveAlphaBlending
   */
  shape.blend = b => getMesh(m => {
    m.material.blending = b;
    m.material.transparent = true;
  });

  /*
   * customBlend ::((int,int,int)->void)->Mesh
   * ブレンドの方法を決めます。
   * THREE.jsによって作られたものではないものを作るときに使います
   */
  shape.customBlend = (src, dst, eq) => getMesh(m => {
    m.material.blending = THREE.CustomBlending;
    m.material.blendSrc = src;
    m.material.blendDst = dst;
    m.material.blendEquation = eq;
  });

  /*
   * castShadow::bool->Mesh
   * 影を生成するかを決定するsetterです。
   */
  shape.castShadow = b => getMesh(m => {
    m.castShadow = b;
  });

  /*
   * receiveShadow::bool->Mesh
   * 影を描画するかを決定するsetterです。
   */
  shape.receiveShadow = b => getMesh(m => {
    m.receiveShadow = b;
  });

  /*
   * shader::(Shader->Shader)->Mesh
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
   * go::(void->bool)->Mesh
   * 実行時点までの変更内容を登録し、そのMeshをSceneに登録します。
   * 引数にはMeshの削除条件を記します。
   */
  shape.go = f => {
    add(kill => {
      alive = alive && !f();
      if (!alive && GV.scene3d.children.indexOf(mesh) != -1) {
        kill();
        GV.scene3d.remove(mesh);
      }
    });
    createGeom(geom => {
      createMaterial(mat => {
        mesh = createMesh(geom, mat);
        addMeshToScene(mesh);
        for (let i = 0; i < onCreated.length; i++) {
          onCreated[i](mesh);
        }
        onCreated = null;
      });
    });
    return shape;
  };

  shape.add = c => mesh.add(c);
  return [getMesh, manageArgs, isDead];
};
