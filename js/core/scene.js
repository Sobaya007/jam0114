/*
 * Sceneを表します。Sceneを使って生成されたものはそのSceneに所属し、stepやdrawが行われます。
 */
const makeScene = (startScene, kill, rootPath) => { 
  const s = {
    /*
     * image::{string:Image}
     * 読み込まれたImageを格納しています。鍵はintoで登録された名前です。
     */
    image : {},

    /*
     * model::{string:ModelData}
     * 読み込まれたModeldataを格納しています。鍵はintoで登録された名前です。
     */
    model : {},

    /*
     * textContent::{string:string}
     * 読み込まれたテキストのデータを格納しています。鍵はintoで登録された名前です。
     */
    textContent : {},
    sound : {},
    steps : [],
    isRunning : false
  };
  const shapes = [];
  const meshes = [];

  //============便利グッズ==============
  const addShapeToScene = obj => {
    s.add(kill => {
      GV.scene2d.add(obj);
      shapes.push(obj);
      kill();
    });
  };
  const addMeshToScene = obj => {
    meshes.push(obj);
    s.add(kill => {
      GV.scene3d.add(obj);
      meshes.push(obj);
      kill();
    });
  };

  const implShape = (createGeom, shape) =>
    implementsShape(createGeom, shape, s.add, addShapeToScene);

  const implMesh = (createGeom, shape) =>
    implementsMesh(createGeom, shape, s.add, addMeshToScene);

  /*
   * onStart::void->void
   * Scene開始時に呼び出されるリスナーです。
   */
  s.onStart = _ => {
    console.log("You didn't set 'onStart'.");
  };

  /*
   * to::(string, (void->void)->void)->void
   * (sceneName, kill)を受け取り、そのSceneに移行します。
   * killを呼び出すと、移行前のSceneのStepが止まり、onStart内でTHREE.jsのsceneにaddされたものがすべてremoveされます。
   */
  s.to = (nextSceneName, onEnd) => {
    Core.Add(_ => {
      onEnd(kill);
    });
    startScene(nextSceneName);
  };

  /*
   * add::((void->void)->void)->void
   * stepを受け取り、毎フレーム実行するようにします。実行はそのSceneで行われます。
   * stepはkillを受け取るstep用関数です。
   */
  s.add = step => {
    s.steps.push(step);
  };

  const sprite    = makeSprite(s.add,   addShapeToScene);
  const billboard = makeBillboard(s.add, addMeshToScene);
  const billLine  = makeBillLine(s.add, addMeshToScene);
  const audio     = makeAudio();

  /*
   * ease::Ease
   * Scene用のEaseです。実行はそのSceneで行われます。
   */
  s.ease = makeEase(s.add, s.remove);

  const keyItems = makeKeyItems();
  /*
   * key::KeySet
   * KeySetを表します。KeyEventはそのScene内でのみ発行されます。
   */
  s.key = keyItems[0];
  s.registerKeyListeners = keyItems[1];

  /*
   * mouse::Mouse
   * Mouseを表します。MouseEventはそのScene内でのみ発行されます。
   */
  s.mouse = makeMouse();

  s.registerMouseListeners = _ => {
    registerMouseListeners(s.mouse);
  };

  /*
   * loadImage::string->Image
   * pathを受け取り、Imageを返します。pathのrootは"/Resource/img/"です。
   */
  s.loadImage = makeLoadImage(sprite, billboard, billLine, s.image, rootPath);

  /*
   * loadModel::string->ModelData
   * pathを受け取り、ModelDataを返します。pathのrootは"/Resource/model/"です。
   */
  s.loadModel = makeLoadModel(
      makeModel(s, addMeshToScene), s.model, rootPath);

  s.loadSound = makeLoadSound(audio, s.sound, rootPath);

  s.loadText = makeLoadText(s.textContent, rootPath);

  /*
   * light::LightBuilder
   * LightBuilderを表します。
   */
  s.light = makeLightBulider(s.add, addMeshToScene);

  /*
   * rect::void->Rect
   * Rectを返します。
   */
  s.rect = makeRect(implShape);

  /*
   * ring::void->Ring
   * Ringを返します。
   */
  s.ring = makeRing(implShape);

  /*
   * text::void->Text
   * Textを返します。
   */
  s.text = makeText(implShape, rootPath);

  /*
   * plane::void->Plane
   * Planeを返します。
   */
  s.plane = makePlane(implMesh);

  /*
   * cube::void->Cube
   * Cubeを返します。
   */
  s.cube = makeCube(implMesh);

  s.capsule = makeCapsule(implMesh);

  /*
   * cylinder::void->Cylinder
   * Cylinderを返します。
   */
  s.cylinder = makeCylinder(implMesh);

  /*
   * grid::void->Grid
   * Gridを返します。
   */
  s.grid = makeGrid(s.add, addMeshToScene);

  return {
    scene : s,
    shapes : shapes,
    meshes : meshes
  };
};
