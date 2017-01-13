const makeObject = (s,z, playerPos) => {
  const randZ = (s,e) => {
    return Math.floor(Math.random() * (e-s+1)) + s;
  };
  const rand = (s,e) => {
    return Math.random() * (e-s) + s;
  };
  const x = randZ(-1,1) * 50;
  const width = rand(20,70);
  const height = rand(10,20);
  const depth = rand(10,20);
  const y = height / 2;
  const sw = width + 15;
  const sh = height + 15;
  const sd = depth + 15;

  const inCube = s.cube()
    .center(x,y,z)
    .size(width,height,depth)
    .dif(0,1,0)
    .amb(0,0.2,0)
    .go(_ => GV.camera3d.position.z < z);
  const outCube = s.cube()
    .center(x,y,z)
    .size(sw, sh, sd)
    .dif(0,1,1)
    .amb(0,0.2,0)
    .opacity(0.6)
    .go(_ => GV.camera3d.position.z < z);

  const collision = _ => {
    const px = playerPos.x;
    const py = playerPos.y;
    const pz = playerPos.z;
    if (px + 15 < x - width / 2) return false;
    if (py + 15 < y - height / 2) return false;
    if (pz + 15 < z - depth / 2) return false;
    if (px - 15 > x + width / 2) return false;
    if (py - 15 > y + height / 2) return false;
    if (pz - 15 > z + depth / 2) return false;
    return true;
  };

  const weakCollision = _ => {
    const px = playerPos.x;
    const py = playerPos.y;
    const pz = playerPos.z;
    if (px + 15 < x - sw / 2) return false;
    if (py + 15 < y - sh / 2) return false;
    if (pz + 15 < z - sd / 2) return false;
    if (px - 15 > x + sw / 2) return false;
    if (py - 15 > y + sh / 2) return false;
    if (pz - 15 > z + sd / 2) return false;
    return true;
  }

  let weakCollisionFlag = false;
  s.add(kill => {
    if (collision()) {
      gameOver();
    } else if (weakCollision()) {
      weakCollisionFlag = true;
    }

    if (GV.camera3d.position.z < z) {
      kill();
    }
    if (playerPos.z + 20 < z - depth / 2) {
      if (weakCollisionFlag) {
        onWeakCollision();
        inCube.dif(1,1,1);
        outCube.opacity(0);
      }
      weakCollisionFlag = false;
    }
  });
};
