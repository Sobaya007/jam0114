/*
 * 文字を表します。
 * Three.jsでは本来3D形状として文字を扱えますが、意味わからんので2次元物体として扱います。
 */
const makeText = (implShape, rootPath) => {
  const fontLoader = new THREE.FontLoader();
  const fontName = "Quango_Bold";//helvetiker_regular";
  const fontPath = rootPath + "font/" + fontName + ".typeface.json";
  let font;
  let contFromFont = [];
  const exec = f => {
    if (contFromFont) {
      contFromFont.push(f);
    } else {
      f(font);
    }
  };
  fontLoader.load(fontPath, f => {
    font = f;
    contFromFont.forEach(cont => cont(f));
    contFromFont = null;
  });

  return _ => { 
    let text = "Dlang is iizo";

    const o = {
      /*
       * text:string->Text
       * 文字に関するsetterです。
       */
      text : t => {
        text = t;
        return o;
      }
    };
    implShape(cont => {
      exec(font => {
        const geom = new THREE.TextGeometry(text, {
          font: font,
          size: 30,
          height: 2,
          curveSegments: 10,
        });
        geom.center();
        cont(geom);
      });
    }, o);
    return o;
  };
};
