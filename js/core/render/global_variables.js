const GV = (_ => { //Global Variables
  const t = {};
  //===============constants================
  //Renderer
  t.W_ASP = 16;
  t.H_ASP = 9;
  //Camera
  const C_FOV = 60;
  const C_NEAR = 1;
  const C_FAR = 1000;
  const C_DAMP = 0.25;
  //Loaders
  const audioLoader = new THREE.AudioLoader();

  //=================add renderer==============
  const renderer = (() => {
    const renderer = new THREE.WebGLRenderer({antialias : true});
    renderer.setClearColor(0xc0c0c0);
    renderer.setClearColor(0);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.autoClear = false;
    renderer.shadowMap.enabled = true;
    document.body.appendChild(renderer.domElement);

    return renderer;
  })();

  const stats = (_ => {
    const stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.top = '0px';
    stats.domElement.style.zIndex = 100;
    document.body.appendChild(stats.domElement);
    return stats;
  })();

  //=====================3D====================
  //make scene
  t.scene3d = new THREE.Scene();
  t.scene3d.fog = new THREE.Fog(0, 200,500);

  //make camera
  t.camera3d = (() => {
    const camera = new THREE.PerspectiveCamera(
        C_FOV, 
        t.W_ASP/t.H_ASP,
        C_NEAR, 
        C_FAR);
    camera.position.set(0,0,50);
    return camera;
  })();
  //add control
  t.control = (() => {
    var c = new THREE.OrbitControls(t.camera3d, renderer.domElement);
    c.enableDamping = true;
    c.dampingFactor = C_DAMP;
    c.enableZoom = true;
    return c;
  })();
  //add ear
  t.audioListener = (_ => {
    const audioListener = new THREE.AudioListener();
    t.camera3d.add(audioListener);
    return audioListener;
  })();

  //=========================2D==================
  t.scene2d = new THREE.Scene();
  //make camera
  t.camera2d = (() => {
    const camera = new THREE.OrthographicCamera(
        -t.W_ASP*10, t.W_ASP*10, //Left, Right
        t.H_ASP*10, -t.H_ASP*10, //Top,  Bottom
        -1, 1.5);              //Near, Far
    camera.position.set(0,0,0.1);
    return camera;
  })();

  //add light
  const light2d = (() => {
    const l = new THREE.AmbientLight(0xffffff);
    t.scene2d.add(l);
    return l;
  })();

  //======================Render=================
  t.render = _ => {
    renderer.clear();
    renderer.render(t.scene3d, t.camera3d);
    renderer.render(t.scene2d, t.camera2d);
  };

  //=====================Updates==================
  t.updateControl = _ => {
//    GV.control.update();
    stats.update();
  };

  //=======================Event Listener===================
  const onResize = _=> {
    let w = window.innerWidth;
    let h = window.innerHeight;
    if (w * t.H_ASP > t.W_ASP * h) {//width is too big
      w = h * t.W_ASP / t.H_ASP;
    } else { //height is too big
      h = w * t.H_ASP / t.W_ASP;
    }
    const x = (window.innerWidth - w) / 2;
    const y = (window.innerHeight - h) / 2;
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setViewport(x,y,w,h);
  };

  onResize();

  window.addEventListener('resize', onResize, false);
  return t;
})();
