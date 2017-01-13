/*
 * Shaderを表します
 */
const makeShader = manageArgs => _ => {
  let vertexShader;
  let fragmentShader;
  const params = {
    uniforms : {}
  };
  let vsGenParams;
  const o = {};
  let mat;

  const def = f => e => {
    f(e);
    return o;
  };

  /*
   * vs::string->Shader
   * VertexShaderに関するsetterです。
   * ソースコードを引数に取ります。
   */
  o.vs = def(vs => vertexShader = vs);

  /*
   * fs::string->Shader
   * FragmentShaderに関するsetterです。
   * ソースコードを引数に取ります。
   */
  o.fs = def(fs => fragmentShader = fs);

  /*
   * vsGen::object->Shader
   * paramを引数にとり、VertexShaderのソースコードを生成します。追加される内容は、VertexShader, FragmentShader両方の先頭に追加されます。
   * paramの内容は以下。
   *
   * position::bool
   * 'varying vec3 vPosition;'
   * を追加します。
   *
   * normal::bool
   * 'varying vec3 vNormal;'
   * を追加します。
   *
   * uv::bool
   * 'varying vec2 vUV;'
   * を追加します。
   */
  o.vsGen = def(param => {
    vsGenParams = param;
  });

  /*
   * uniform::V->Shader
   * uniform変数を追加します。
   * vsGenを使用する場合、追加されたuniform変数はVertexShaderとFragmentShaderの先頭に宣言されます。
   */
  o.uniform = def(us => {
    Object.keys(us).forEach(k => {
      const v = us[k];
      params.uniforms[k] = {};
      manageArgs(v, v => {
        if (v instanceof Array) {
          switch (v.length) {
            case 2:
              if (!params.uniforms[k].value)
                params.uniforms[k].value = new THREE.Vector2();
              params.uniforms[k].value.set(v[0], v[1]);
              break;
            case 3:
              if (!params.uniforms[k].value)
                params.uniforms[k].value = new THREE.Vector3();
              params.uniforms[k].value.set(v[0], v[1], v[2]);
              break;
            case 4:
              if (!params.uniforms[k].value)
                params.uniforms[k].value = new THREE.Vector4();
              params.uniforms[k].value.set(v[0], v[1], v[2], v[3]);
              break;
          }
        } else {
          params.uniforms[k].value = v;
        }
      })
    });
  });
  o.params = def(p => {
    Object.keys(p).forEach(k => {
      params[k] = p[k];
    });
  });
  const create = _ => {
    //====================Vertex Shader Settings======================
    if (vsGenParams) { //頂点シェーダ自動生成モード
      let vs = "";

      //varyingの追加
      if (vsGenParams.position) vs += "varying vec3 vPosition;\n";
      if (vsGenParams.normal) vs += "varying vec3 vNormal;\n";
      if (vsGenParams.uv) vs += "varying vec2 vUV;\n";

      //uniformの追加
      Object.keys(params.uniforms).forEach(k => {
        vs += "uniform ";
        const v = params.uniforms[k].value;
        let type;
        if (v instanceof THREE.Vector2) {
          type = "vec2";
        } else if (v instanceof THREE.Vector3) {
          type = "vec3";
        } else if (v instanceof THREE.Vector4) {
          type = "vec4";
        } else if (v instanceof Object) {
          type = "sampler2D";
        } else {
          type = "float";
        }
        vs += type + " " + k + ";";
      });

      //main関数の追加
      vs += "void main() {\n"
        + "gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1);";
      if (vsGenParams.position) vs += "vPosition = (modelMatrix * vec4(position,1)).xyz;\n";
      if (vsGenParams.normal) vs += "vNormal = normal;\n";
      if (vsGenParams.uv) vs += "vUV = uv;\n";
      vs += "}";
      params.vertexShader = vs;
    } else if (vertexShader) { //普通に関数を書いた場合
      params.vertexShader = vertexShader;
    } else { //特に指定しない場合
      params.vertexShader = `
        void main() {
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1);
        }`
    }

    //=======================Fragment Shader Settings=====================
    if (vsGenParams) { //頂点シェーダで自動的にvaryingが追加されていた場合
      let fs = "";
      //varyingの追加
      if (vsGenParams.position) fs += "varying vec3 vPosition;\n";
      if (vsGenParams.normal) fs += "varying vec3 vNormal;\n";
      if (vsGenParams.uv) fs += "varying vec2 vUV;\n";

      fragmentShader = fs + fragmentShader;
    }
    //uniformの追加
    Object.keys(params.uniforms).forEach(k => {
      let fs = "";
      fs += "uniform ";
      const v = params.uniforms[k].value;
      let type;
      if (v instanceof THREE.Vector2) {
        type = "vec2";
      } else if (v instanceof THREE.Vector3) {
        type = "vec3";
      } else if (v instanceof THREE.Vector4) {
        type = "vec4";
      } else if (v instanceof Object) {
        type = "sampler2D";
      } else {
        type = "float";
      }
      fs += type + " " + k + ";";
      fragmentShader = fs + fragmentShader;
    });
    params.fragmentShader = fragmentShader;

    const r = new THREE.ShaderMaterial(params);
    r.transparent = true;
    return r;
  };
  return [o, create];
};
