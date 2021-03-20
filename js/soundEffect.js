let menuClickSoundEffect = new Audio("sounds/sao-click-menu.mp3");
let menuCloseSoundEffect = new Audio("sounds/sao-dismiss-menu.wav");
let menuOpenSoundEffect = new Audio("sounds/sao-popup-menu.wav");
let menuWarnSoundEffect = new Audio("sounds/sao-warn-menu.wav");

let welcomeSoundEffect = new Audio("sounds/sao-popup-welcome.wav");

const sounds = {
  menuClick: menuClickSoundEffect,
  menuClose: menuCloseSoundEffect,
  menuOpen: menuOpenSoundEffect,
  menuWarn: menuWarnSoundEffect,
  welcome: welcomeSoundEffect,
};

function playSoundEffect(soundName, volume = 0.4) {
  const soundEffect = sounds[soundName];

  soundEffect.volume = volume;

  if (soundEffect.paused) {
    // soundEffect.muted = true;
    soundEffect.play();
  } else {
    soundEffect.currentTime = 0;
  }
}
