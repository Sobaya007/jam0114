const makeAudio = _ => mesh => {

  let audio;
  let onLoads = [];
  const onLoad = sound => {
    audio.setBuffer(sound);
    onLoads.forEach(f => f());
    onLoads = null;
  };
  const o = {};

  const def = f => e => {
    f(e);
    return o; 
  };
  const exec = f => {
    if (onLoads) onLoads.push(f);
    else f();
  };
  o.spdScale = def(spd => audio.setPlaybackRate(spd));
  o.gain = def(g => audio.setVolume(g));
  o.play = def(_ => {
    audio.setLoop(false);
    exec(_ => audio.play());
  });
  o.playLoop = def(_ => {
    audio.setLoop(true);
    exec(_ => audio.play());
  });
  o.stop = def(_ => {
    exec(_ => audio.stop());
  });
  if (mesh === undefined) {
    //無引数。普通の音声。 
    audio = new THREE.Audio(GV.audioListener);
    return {
      audio  : o,
      onLoad : onLoad 
    };
  } else {
    //物体が発する音声
    audio = new THREE.PositionalAudio(GV.audioListener);
    mesh.add(audio);
    return {
      audio  : o,
      onLoad : onLoad 
    };
  }
};
