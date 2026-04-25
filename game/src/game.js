import CharacterScene from './scenes/CharacterScene.js';
import BlockScene from './scenes/BlockScene.js';
import BodegaScene from './scenes/BodegaScene.js';
import UIScene from './scenes/UIScene.js';

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: 'game-container',
  backgroundColor: '#1a0a2e',
  scene: [CharacterScene, BlockScene, BodegaScene, UIScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
};

new Phaser.Game(config);
