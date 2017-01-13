let gameOver;
let onWeakCollision;
var main = _ => {
  Core.Scene("Main", s => {
    s.onStart = _ => {};
    s.light
      .to(1, -1, 1)
      .color(1, 1, 1)
      .go(_ => false);
    const player = s.cube()
      .center(0,15,0)
      .size(30,30,30)
      .dif(1,0,0)
      .amb(0.2, 0,0)
      .opacity(0.5)
      .go(_ => false);
    const grid = [];
    grid[0] = s.grid()
      .center(0,0,0)
      .cellNum(50)
      .go(_ => false);
    grid[1] = s.grid()
      .center(0,0,-500)
      .cellNum(50)
      .go(_ => false);
    let playerPos = V.vec(0,0,0);
    let spd = 2;
    let spdX = 0;
    let spdY = 0;
    let objCount = 0;
    let score = 0;
    s.key.ArrowUp.onDown = _ => {
      if (playerPos.y === 0) {
        spdY = 6;
      }
    };

    let textKill = false;
    const makeScoreText = _ => {
      s.text()
        .text("Score : " + score)
        .center(100,70)
        .sizeH(10)
        .go(_ => {
          if (textKill) {
            textKill = false;
            makeScoreText();
            return true;
          } else {
            return false;
          }
        });
    };
    makeScoreText();
    s.add(kill => {
      playerPos.z -= spd;
      GV.camera3d.position.set(0,30 + playerPos.y,playerPos.z+100);
      GV.camera3d.lookAt(new THREE.Vector3(0,15 + playerPos.y,playerPos.z));
      player.center(playerPos.x,15 + playerPos.y,playerPos.z);

      grid[0].center(0,0,Math.floor(playerPos.z / 500) * 500);
      grid[1].center(0,0,Math.floor(1 + playerPos.z / 500) * 500);

      const T = 50;
      if (s.key.ArrowLeft.isDown) {
        spdX -= 0.5;
      }
      if (s.key.ArrowRight.isDown) {
        spdX += 0.5;
      }
      spdX *= 0.9;
      if (playerPos.x < -T && spdX < 0) spdX *= 0.01;
      if (playerPos.x > +T && spdX > 0) spdX *= 0.01;
      playerPos.x += spdX;

      spdY -= 0.2;
      playerPos.y += spdY;
      if (playerPos.y <= 0) {
        playerPos.y = 0;
        spdY = 0;
      }

      if (playerPos.z < -(objCount-2) * 2 * 100) {
        const z = -objCount * 2 * 100;
        makeObject(s,z, playerPos);
        objCount++;
      }
    });

    gameOver = _ => {
      score -= playerPos.z * 0.1;
      score = Math.floor(score);
      playerPos.x = 0;
      playerPos.y = 0;
      playerPos.z = 0;
      spd = 2;
      spdX = 0;
      spdY = 0;
      objCount = 10;
      textKill = true;
    };
    onWeakCollision = _ => {
      spd += (10 - spd) * 0.2;
      score+= 1000;
    }
    s.onStart = _ => {};

  });

  Core.Launch("Main");
};

window.addEventListener('DOMContentLoaded', main, false);
