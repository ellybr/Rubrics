export default class BlockScene extends Phaser.Scene {
  constructor() {
    super('BlockScene');
  }

  init(data) {
    this.playerData = data;
  }

  create() {
    const W = 800, H = 600;

    this.add.rectangle(W / 2, H / 2, W, H, 0x0d1f0d);

    // Sky gradient suggestion
    this.add.rectangle(W / 2, 80, W, 160, 0x1a2a4a);

    // Street
    this.add.rectangle(W / 2, H - 60, W, 120, 0x2a2a2a);
    this.add.rectangle(W / 2, H - 60, W, 4, 0xf4c542);

    // Sidewalk
    this.add.rectangle(W / 2, H - 110, W, 20, 0x8a8a7a);

    this.add.text(W / 2, 30, 'LA CALLE', {
      fontSize: '11px', fontFamily: 'Georgia', color: '#7a8a7a',
    }).setOrigin(0.5);

    this.buildingsData = [
      { x: 90,  label: 'Vacant\nLot',    color: 0x3a2a1a, locked: true,  w: 100, h: 130 },
      { x: 220, label: 'Boarded\nUp',    color: 0x2a3a2a, locked: true,  w: 110, h: 160 },
      { x: 370, label: 'LA BODEGA',      color: 0x7a3e00, locked: false, w: 140, h: 180, isMain: true },
      { x: 540, label: 'Boarded\nUp',    color: 0x2a3a2a, locked: true,  w: 110, h: 150 },
      { x: 680, label: 'Empty\nStorefront', color: 0x3a3a2a, locked: true, w: 100, h: 130 },
    ];

    this.buildingObjects = [];
    this.buildingsData.forEach(b => this.drawBuilding(b));

    // Street details
    this.addStreetLife(W, H);

    // UI bar top
    this.drawTopBar(W);

    // Instruction
    this.add.text(W / 2, H - 28, 'Click the bodega to enter', {
      fontSize: '12px', fontFamily: 'Georgia', color: '#f4c542',
      fontStyle: 'italic',
    }).setOrigin(0.5);
  }

  drawBuilding(b) {
    const groundY = 480;
    const bx = b.x;
    const by = groundY - b.h / 2;

    const building = this.add.rectangle(bx, by, b.w, b.h, b.color);
    building.setStrokeStyle(1, b.locked ? 0x3a3a3a : 0xf4c542);

    // Roof
    const roofGraphics = this.add.graphics();
    roofGraphics.fillStyle(b.locked ? 0x2a2a2a : 0x5a2e00);
    roofGraphics.fillRect(bx - b.w / 2 - 6, by - b.h / 2 - 12, b.w + 12, 16);

    if (b.isMain) {
      // Sign
      this.add.rectangle(bx, by - b.h / 2 + 30, 120, 28, 0x1a0a00)
        .setStrokeStyle(2, 0xf4c542);
      this.add.text(bx, by - b.h / 2 + 30, 'LA BODEGA', {
        fontSize: '11px', fontFamily: 'Georgia', color: '#f4c542', fontStyle: 'bold',
      }).setOrigin(0.5);

      // Door
      this.add.rectangle(bx, groundY - 30, 28, 60, 0x2c1810)
        .setStrokeStyle(1, 0x8b6914);
      this.add.circle(bx + 10, groundY - 30, 3, 0xf4c542);

      // Windows
      [-42, 42].forEach(ox => {
        this.add.rectangle(bx + ox, by, 28, 36, 0x8ab4d4)
          .setStrokeStyle(2, 0x5a7a94);
        // Window cross
        this.add.rectangle(bx + ox, by, 28, 2, 0x5a7a94);
        this.add.rectangle(bx + ox, by, 2, 36, 0x5a7a94);
      });

      // Awning
      const aw = this.add.graphics();
      aw.fillStyle(0xc0392b);
      aw.fillRect(bx - 72, groundY - 80, 144, 20);
      // Awning stripes
      for (let i = 0; i < 8; i++) {
        aw.fillStyle(0xe74c3c);
        aw.fillRect(bx - 72 + i * 18, groundY - 80, 9, 20);
      }

      // Clickable zone
      const clickZone = this.add.rectangle(bx, by, b.w, b.h, 0x000000, 0)
        .setInteractive({ cursor: 'pointer' });
      clickZone.on('pointerover', () => building.setFillStyle(0x9a5200));
      clickZone.on('pointerout', () => building.setFillStyle(b.color));
      clickZone.on('pointerdown', () => {
        this.cameras.main.fade(500, 0, 0, 0);
        this.time.delayedCall(500, () => {
          this.scene.start('BodegaScene', this.playerData);
          this.scene.launch('UIScene', this.playerData);
        });
      });

    } else {
      // Boarded windows
      for (let row = 0; row < 2; row++) {
        for (let col = 0; col < 2; col++) {
          const wx = bx - 22 + col * 44;
          const wy = by - 20 + row * 50;
          this.add.rectangle(wx, wy, 28, 32, 0x1a1a1a).setStrokeStyle(1, 0x3a3a3a);
          const xg = this.add.graphics();
          xg.lineStyle(1, 0x5a4a3a);
          xg.beginPath(); xg.moveTo(wx - 12, wy - 14); xg.lineTo(wx + 12, wy + 14); xg.strokePath();
          xg.beginPath(); xg.moveTo(wx + 12, wy - 14); xg.lineTo(wx - 12, wy + 14); xg.strokePath();
        }
      }

      // Lock icon
      this.add.text(bx, groundY - 30, '🔒', { fontSize: '20px' }).setOrigin(0.5);
      this.add.text(bx, by + b.h / 2 - 20, b.label, {
        fontSize: '10px', fontFamily: 'Georgia', color: '#5a5a5a', align: 'center',
      }).setOrigin(0.5, 1);
    }
  }

  addStreetLife(W, H) {
    const groundY = H - 110;

    // Hydrant
    const hg = this.add.graphics();
    hg.fillStyle(0xc0392b);
    hg.fillRect(740, groundY - 20, 16, 20);
    hg.fillRect(736, groundY - 24, 24, 8);

    // Trash bags (real NYC energy)
    [300, 310].forEach(x => {
      this.add.ellipse(x, groundY - 6, 22, 20, 0x1a3a1a).setStrokeStyle(1, 0x0a1a0a);
    });

    // Street lamp
    const lamp = this.add.graphics();
    lamp.fillStyle(0x4a4a4a);
    lamp.fillRect(622, groundY - 90, 6, 90);
    lamp.fillStyle(0xf4e89a);
    lamp.fillRect(610, groundY - 96, 30, 10);
    lamp.fillStyle(0xf4e89a, 0.3);
    lamp.fillEllipse(625, groundY - 80, 50, 30);

    // Mural on bodega left wall (cultural touch)
    const mural = this.add.graphics();
    mural.fillStyle(0xc0392b, 0.7);
    mural.fillRect(298, 360, 4, 80);
    mural.fillStyle(0x27ae60, 0.7);
    mural.fillRect(306, 360, 4, 80);
    mural.fillStyle(0x3498db, 0.7);
    mural.fillRect(314, 360, 4, 80);

    // Pedestrians (simple silhouettes)
    this.addPedestrian(120, groundY);
    this.addPedestrian(600, groundY);
  }

  addPedestrian(x, groundY) {
    const g = this.add.graphics();
    g.fillStyle(0x4a4a6a);
    g.fillEllipse(x, groundY - 44, 14, 14);
    g.fillRect(x - 6, groundY - 36, 12, 28);
    g.fillRect(x - 8, groundY - 8, 6, 20);
    g.fillRect(x + 2, groundY - 8, 6, 20);

    // Simple walk animation
    this.tweens.add({
      targets: g,
      x: x > 400 ? -50 : W + 50,
      duration: Phaser.Math.Between(6000, 10000),
      repeat: -1,
      delay: Phaser.Math.Between(0, 3000),
    });
  }

  drawTopBar(W) {
    this.add.rectangle(W / 2, 16, W, 32, 0x0a0a1a, 0.9);
    this.add.text(20, 16, `Bienvenida, ${this.playerData?.playerName || 'Marisol'}`, {
      fontSize: '12px', fontFamily: 'Georgia', color: '#f4c542',
    }).setOrigin(0, 0.5);
    this.add.text(W - 20, 16, 'Día 1  |  $240 en mano', {
      fontSize: '12px', fontFamily: 'Georgia', color: '#7af4a4',
    }).setOrigin(1, 0.5);
  }
}
