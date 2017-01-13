const makeLoadSound = (audio, sounds, root) => {
 const audioLoader = new THREE.AudioLoader(); 
 return path => {
   path = root + "sound/" + path;
   const cache = U.filter(sounds, s => s.path === path);
   if (cache.length > 0) {
     return cache[0]; 
   }
   let onLoads = [];
   const exec = f => {
     if (onLoads) {
       onLoads.push(f);
     } else {
       f(sound); 
     }
   };
   const o = {
     /*
      * into::string->void
      * nameを受け取り、その名前でSceneに登録します。
      */
     into : id => {
       sounds[id] = o;
       return o;
     },
     global : _ => {
       const a = audio();
       exec(a.onLoad);
       return a.audio;
     },
     at : mesh => {
       const a = audio(mesh);
       exec(a.onLoad);
       return a.audio;
     },
     path : path
   };
   audioLoader.load(path, s => {
     //一応foreachするけど、たぶんonLoadの中は1つ
     onLoads.forEach(onLoad => onLoad(s));
     onLoads = null;
   });
   return o;
 };
};
