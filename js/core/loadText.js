const makeLoadText = (texts, rootPath) => {
  const xhrLoader = new THREE.XHRLoader();
  return path => {
    path = rootPath + path;
    const cache = U.filter(texts, t => t.path === path);
    if (cache.length > 0) {
      return cache[0];
    }
    let text;
    let onLoads = [];
    const o = {
      into : id => {
        texts[id] = o;
        return o;
      },
      getText : cont => {
        if (onLoads) {
          onLoads.push(cont);
        } else {
          cont(text);
        }
      },
      path : path
    };

    xhrLoader.load(path, t => {
      text = t;
      onLoads.forEach(onLoad => onLoad(t));
      onLoads = null;
    });
    return o;
  };
};
