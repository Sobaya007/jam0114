/*
 * 画像を表します。
 * ここからspriteやbillboardを使って、画像を表示します。
 * 画像の読み込みは非同期に行われるため、goした瞬間に表示されるとは限りません。
 */
const makeLoadImage = (sprite, billboard, billLine, textures, rootPath) => {
  const textureLoader = new THREE.TextureLoader();
  return path => { 
    path = rootPath + "img/" + path;
    //パスを鍵にしてキャッシュを行います。
    const cache = U.filter(textures, t => t.path === path);
    if (cache.length > 0) {
      return cache[0];
    }
    let texture;
    let onLoads = [];
    const exec = f => {
      if (onLoads) {
        onLoads.push(f);
      } else {
       f(texture);
      }
    };
    const o = {
      /*
       * into::string->void
       * nameを受け取り、その名前でSceneに登録します。
       */
      into : id => {
        textures[id] = o;
        return o;
      },
      /*
       * sprite::void->Sprite
       * このImageを使ってSpriteを作ります。
       */
      sprite    : _ => {
        const s = sprite();
        exec(s.cont);
        return s.sprite;
      },
      /*
       * billboard::void->Billboard
       * このImageを使ってBillboardを作ります。
       */
      billboard : _ => {
        const b = billboard();
        exec(b.cont);
        return b.billboard;
      },
      billLine : _ => {
       const b = billLine(); 
       exec(b.cont);
       return b.billboard;
      },
      getTexture : contFromTexture => {
        exec(contFromTexture);
      },
      path : path
    };
    textureLoader.load(path, t => {
      texture = t;
      //一応foreachするけど、たぶんonLoadの中は1つ
      onLoads.forEach(onLoad => onLoad(texture));
      onLoads = null;
    });
    return o;
  };
};
