/*
 * マウスからの入力を支配します。
 */
const [makeMouse, registerMouseListeners] = (_ => {
  const makeMouseButton = _ => {
    let on = true;
    let isPressing = false;
    const state = _ => on;
    const setIsPressing = p => isPressing = p;
    const o = {
      /*
       * onDown::void->void
       * ボタンを押したときのEventListenerです。
       */
      onDown : _ => {
        console.log('Mouse Down');
      },

      /*
       * onUp::void->void
       * ボタンを離したときのEventListenerです。
       */
      onUp   : _ => {
        console.log('Mouse Up');
      },

      /*
       * isDown::bool
       * ボタンが押されているかを表します。
       */
      isDown : false,

      /*
       * isUp::bool
       * ボタンが離されているかを表します。
       */
      isUp   : true,
      on : _ => {
        on = true;
        o.isDown = isPressing;
        o.isUp = !isPressing;
      },
      off : _ => {
        on = false;
        o.isDown = false;
        o.isUp = true;
      }
    };
    return {
      o : o,
      state : state, 
      setIsPressing : setIsPressing
    };
  };
  const left = makeMouseButton();
  const right = makeMouseButton();
  const middle = makeMouseButton();
  const makeMouse = _ => {
    const o = {
      /*
       * left::MouseButton
       * 左ボタン用のMouseButtonです。
       */
      left   : left.o,

      /*
       * right::MouseButton
       * 右ボタン用のMouseButtonです。
       */
      right  : right.o,

      /*
       * middle::MouseButton
       * 中ボタン用のMouseButtonです。
       */
      middle : middle.o,

      /*
       * pos::Object
       * マウスカーソルの位置です。
       */
      pos    : {x:0, y:0}
    };
    return o;
  };

  const registerMouseListeners = mouse => {
    const getButton = n => {
      switch (n) {
        case 0:
          return left;
        case 1:
          return middle;
        case 2:
          return right;
        default:
          console.log("Unknown Mouse Button");
      }
    }
    document.onmousedown = e => {
      const button = getButton(e.button);
      button.setIsPressing(true);
      if (button.state()) {
        button.o.isDown = true;
        button.o.isUp = false;
        button.o.onDown();
      }
    };
    document.onmouseup = e => {
      const button = getButton(e.button);
      button.setIsPressing(false);
      button.o.isDown = false;
      button.o.isUp = true;
      button.o.onUp();
    };
    document.onmousemove = e => {
      mouse.pos.x =  (e.clientX / window.innerWidth  - 0.5) * 2 * GV.W_ASP;
      mouse.pos.y = -(e.clientY / window.innerHeight - 0.5) * 2 * GV.H_ASP
    };
  };
  return [makeMouse, registerMouseListeners];
})();
