/*
 * 諸機能を提供する大本のオブジェクトです。
 */

const Core = (_ => {
  const rootPath = "./Resource/";
  let c = {};
  let scenes = {};
  let steps = [];
  let currentScenes = [];

  /*
   * Add :: ((void->void)->void)->void
   * stepを受け取り、毎フレーム実行するようにします。
   * 実行はCoreで行われます。
   * stepはkillを受け取るstep用関数です。
   */
  c.Add = step => {
    steps.push(step);
  };

  /*
   * Scene :: (string,Scene->void)->void
   * (name,onLoad)を受け取り、Sceneを保存します。
   */
  c.Scene = (name, onLoad) => {
    //ここで作られたSceneを殺す関数。
    //Sceneが停止すると同時に、そのシーンで定義た物体もTHREE.jsのSceneから除去されます。
    const kill = _ => {
      currentScenes = U.filter(currentScenes, 
          scene => !(scene === s));
      s.shapes.forEach(
          shape => GV.scene2d.remove(shape));
      s.meshes.forEach(
          mesh  => GV.scene3d.remove(mesh));
      s.shapes.length = 0;
      s.meshes.length = 0;
      s.isRunning = false;
    };
    const s = makeScene(startScene, kill, rootPath);
    onLoad(s.scene);
    scenes[name] = s;
  };

  /*
   * Launch :: string->void
   * sceneNameを受け取り、保存されたSceneを実行します。
   */
  c.Launch = sceneName => {

    //stepList内の全stepを実行し、次の世代のstepListを返す
    const stepAll = stepList => {
      const nextList = [];
      for (let i = 0; i < stepList.length; i++) {
        const step = stepList[i];
        let alive = true;
        const kill = _ => alive = false; 
        step(kill);
        if (alive) nextList.push(step);
      }
      return nextList;
    };

    const animate = _ => {
      requestAnimationFrame(animate);   //次回の要求
      steps = stepAll(steps);           //step
      currentScenes.forEach(cs => cs.steps = stepAll(cs.steps));  //step
      GV.updateControl();               //Controlのstep
      GV.render();                      //描画
    };

    startScene(sceneName, _ =>{});

    animate();                          //初期条件
  };

  /*
   * Ease::Ease
   * Core用のEaseです。実行はCoreで行われます。
   */
  c.Ease = makeEase(c.Add, c.Remove);

  //指定した名前のシーンを開始します。
  //その際、前に起動していたSceneが自動的に削除されることはありません。
  const startScene = nextSceneName => {
    const nextScene = scenes[nextSceneName].scene;
    nextScene.isRunning = true;
    currentScenes.push(nextScene);
    nextScene.onStart(); //初期化リスナー
    scenes[nextSceneName].shapes.forEach(s => GV.scene2d.add(s));
    scenes[nextSceneName].meshes.forEach(m => GV.scene3d.add(m));
    nextScene.registerKeyListeners();
    nextScene.registerMouseListeners();
  };

  return c;  
})();
