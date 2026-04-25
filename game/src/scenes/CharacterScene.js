export default class CharacterScene extends Phaser.Scene {
  constructor() {
    super('CharacterScene');
    this.skinIndex = 2;
    this.hairIndex = 0;
    this.styleIndex = 0;
    this.playerName = 'Marisol';
  }

  create() {
    const W = 800, H = 600;

    // Background
    this.add.rectangle(W / 2, H / 2, W, H, 0x1a0a2e);

    // Title
    this.add.text(W / 2, 32, 'LA BODEGA', {
      fontSize: '32px', fontFamily: 'Georgia', color: '#f4c542',
      stroke: '#7a3e00', strokeThickness: 4,
    }).setOrigin(0.5);

    this.add.text(W / 2, 68, 'Conoce a tu protagonista', {
      fontSize: '14px', fontFamily: 'Georgia', color: '#e8b4b8',
    }).setOrigin(0.5);

    // Character preview area
    this.previewBg = this.add.rectangle(200, 320, 240, 360, 0x2d1b4e).setStrokeStyle(2, 0xf4c542);
    this.charGraphics = this.add.graphics();
    this.drawCharacter();

    // Name display under character
    this.nameTag = this.add.text(200, 510, this.playerName, {
      fontSize: '18px', fontFamily: 'Georgia', color: '#f4c542',
    }).setOrigin(0.5);

    // Right panel: options
    this.buildOptionsPanel(W, H);

    // Opening story text
    this.add.text(W / 2 + 20, H - 60,
      '"Abuelo left me everything.\nNow I have to figure out what that means."', {
        fontSize: '11px', fontFamily: 'Georgia', color: '#b8a4c8',
        align: 'center', fontStyle: 'italic',
        wordWrap: { width: 340 },
      }).setOrigin(0.5, 1);
  }

  buildOptionsPanel(W) {
    const x = 460;
    let y = 110;
    const labelStyle = { fontSize: '13px', fontFamily: 'Georgia', color: '#f4c542' };
    const optStyle = { fontSize: '12px', fontFamily: 'Georgia', color: '#ffffff' };

    // --- SKIN TONE ---
    this.add.text(x, y, 'TONO DE PIEL', labelStyle);
    y += 22;
    const skins = [0xfde8c8, 0xe8c49a, 0xc8956c, 0xa0714f, 0x7a4f35, 0x4a2c1a];
    const skinCircles = [];
    skins.forEach((color, i) => {
      const cx = x + i * 36;
      const circle = this.add.circle(cx, y + 12, 14, color).setInteractive({ cursor: 'pointer' });
      circle.setStrokeStyle(i === this.skinIndex ? 3 : 1, i === this.skinIndex ? 0xf4c542 : 0x555555);
      circle.on('pointerdown', () => {
        this.skinIndex = i;
        skinCircles.forEach((c, j) => c.setStrokeStyle(j === i ? 3 : 1, j === i ? 0xf4c542 : 0x555555));
        this.drawCharacter();
      });
      skinCircles.push(circle);
    });

    // --- HAIR ---
    y += 50;
    this.add.text(x, y, 'CABELLO', labelStyle);
    y += 22;
    const hairs = ['Blowout', 'Rizos', 'Trenzas', 'Recogido', 'Locs'];
    const hairBtns = [];
    hairs.forEach((h, i) => {
      const btn = this.add.text(x + (i % 3) * 112, y + Math.floor(i / 3) * 28, `◆ ${h}`, optStyle)
        .setInteractive({ cursor: 'pointer' });
      btn.on('pointerover', () => { if (this.hairIndex !== i) btn.setColor('#f4c542'); });
      btn.on('pointerout', () => { if (this.hairIndex !== i) btn.setColor('#ffffff'); });
      btn.on('pointerdown', () => {
        this.hairIndex = i;
        hairBtns.forEach((b, j) => b.setColor(j === i ? '#f4c542' : '#ffffff'));
        this.drawCharacter();
      });
      if (i === this.hairIndex) btn.setColor('#f4c542');
      hairBtns.push(btn);
    });

    // --- STYLE ---
    y += 70;
    this.add.text(x, y, 'ESTILO', labelStyle);
    y += 22;
    const styles = ['"Still Corporate"', '"Block Mode"', '"Abuelo\'s Apron"'];
    const styleBtns = [];
    styles.forEach((s, i) => {
      const btn = this.add.text(x, y + i * 28, `◆ ${s}`, optStyle)
        .setInteractive({ cursor: 'pointer' });
      btn.on('pointerover', () => { if (this.styleIndex !== i) btn.setColor('#f4c542'); });
      btn.on('pointerout', () => { if (this.styleIndex !== i) btn.setColor('#ffffff'); });
      btn.on('pointerdown', () => {
        this.styleIndex = i;
        styleBtns.forEach((b, j) => b.setColor(j === i ? '#f4c542' : '#ffffff'));
        this.drawCharacter();
      });
      if (i === this.styleIndex) btn.setColor('#f4c542');
      styleBtns.push(btn);
    });

    // --- NAME ---
    y += 100;
    this.add.text(x, y, 'NOMBRE', labelStyle);
    y += 22;
    const names = ['Marisol', 'Yanelis', 'Rosaly', 'Darianna', 'Camila'];
    const nameBtns = [];
    names.forEach((n, i) => {
      const btn = this.add.text(x + (i % 3) * 112, y + Math.floor(i / 3) * 28, n, optStyle)
        .setInteractive({ cursor: 'pointer' });
      btn.on('pointerover', () => { if (this.playerName !== n) btn.setColor('#f4c542'); });
      btn.on('pointerout', () => { if (this.playerName !== n) btn.setColor('#ffffff'); });
      btn.on('pointerdown', () => {
        this.playerName = n;
        nameBtns.forEach((b, j) => b.setColor(names[j] === n ? '#f4c542' : '#ffffff'));
        this.nameTag.setText(n);
      });
      if (n === this.playerName) btn.setColor('#f4c542');
      nameBtns.push(btn);
    });

    // --- START BUTTON ---
    y += 70;
    const startBtn = this.add.rectangle(x + 130, y, 220, 44, 0xf4c542)
      .setInteractive({ cursor: 'pointer' });
    this.add.text(x + 130, y, 'Entra a La Bodega →', {
      fontSize: '14px', fontFamily: 'Georgia', color: '#1a0a2e', fontStyle: 'bold',
    }).setOrigin(0.5);

    startBtn.on('pointerover', () => startBtn.setFillStyle(0xffe066));
    startBtn.on('pointerout', () => startBtn.setFillStyle(0xf4c542));
    startBtn.on('pointerdown', () => {
      this.scene.start('BlockScene', {
        skinIndex: this.skinIndex,
        hairIndex: this.hairIndex,
        styleIndex: this.styleIndex,
        playerName: this.playerName,
      });
    });
  }

  drawCharacter() {
    const g = this.charGraphics;
    g.clear();

    const skins = [0xfde8c8, 0xe8c49a, 0xc8956c, 0xa0714f, 0x7a4f35, 0x4a2c1a];
    const skin = skins[this.skinIndex];

    const cx = 200, cy = 300;

    // Outfit colors per style
    const outfitColors = [0x2c4a7c, 0xc0392b, 0x7a3e00];
    const outfit = outfitColors[this.styleIndex];

    // Body
    g.fillStyle(outfit);
    g.fillRoundedRect(cx - 28, cy - 10, 56, 80, 8);

    // Apron overlay
    if (this.styleIndex === 2) {
      g.fillStyle(0xf5e6c8);
      g.fillRoundedRect(cx - 18, cy, 36, 60, 4);
      g.fillStyle(0x8b4513);
      g.fillRect(cx - 2, cy - 10, 4, 10);
    }

    // Neck
    g.fillStyle(skin);
    g.fillRect(cx - 8, cy - 22, 16, 16);

    // Head
    g.fillStyle(skin);
    g.fillEllipse(cx, cy - 52, 52, 58);

    // Hair
    this.drawHair(g, cx, cy, skin);

    // Face features
    g.fillStyle(0x1a0a0a);
    g.fillEllipse(cx - 10, cy - 56, 7, 7);
    g.fillEllipse(cx + 10, cy - 56, 7, 7);

    // Smile
    g.lineStyle(2, 0x7a3e00);
    g.beginPath();
    g.arc(cx, cy - 46, 10, 0.1, Math.PI - 0.1);
    g.strokePath();

    // Arms
    g.fillStyle(skin);
    g.fillEllipse(cx - 38, cy + 20, 16, 50);
    g.fillEllipse(cx + 38, cy + 20, 16, 50);

    // Legs
    g.fillStyle(0x1a1a2e);
    g.fillRoundedRect(cx - 24, cy + 68, 20, 60, 4);
    g.fillRoundedRect(cx + 4, cy + 68, 20, 60, 4);

    // Shoes
    g.fillStyle(0x2c1810);
    g.fillEllipse(cx - 14, cy + 132, 28, 14);
    g.fillEllipse(cx + 14, cy + 132, 28, 14);
  }

  drawHair(g, cx, cy, skin) {
    const hairColors = [0x1a0a00, 0x2c1810, 0x4a2c1a, 0x1a0a00, 0x1a0a00];
    const hc = hairColors[this.hairIndex];

    g.fillStyle(hc);
    switch (this.hairIndex) {
      case 0: // Blowout - sleek straight
        g.fillRoundedRect(cx - 30, cy - 86, 60, 36, 6);
        g.fillRect(cx - 30, cy - 66, 8, 32);
        g.fillRect(cx + 22, cy - 66, 8, 32);
        break;
      case 1: // Rizos - curly
        for (let i = 0; i < 8; i++) {
          const angle = (i / 8) * Math.PI * 2;
          g.fillCircle(cx + Math.cos(angle) * 26, cy - 60 + Math.sin(angle) * 20, 12);
        }
        g.fillCircle(cx, cy - 68, 14);
        break;
      case 2: // Trenzas - braids
        g.fillRoundedRect(cx - 26, cy - 86, 52, 30, 4);
        g.fillRect(cx - 14, cy - 58, 10, 90);
        g.fillRect(cx + 4, cy - 58, 10, 90);
        g.fillStyle(0xf4c542);
        g.fillCircle(cx - 9, cy + 34, 5);
        g.fillCircle(cx + 9, cy + 34, 5);
        break;
      case 3: // Recogido - bun
        g.fillRoundedRect(cx - 26, cy - 84, 52, 24, 4);
        g.fillCircle(cx, cy - 84, 18);
        g.fillStyle(0x8b6914);
        g.fillCircle(cx, cy - 84, 6);
        break;
      case 4: // Locs
        g.fillRoundedRect(cx - 26, cy - 86, 52, 28, 4);
        for (let i = -3; i <= 3; i++) {
          g.fillRoundedRect(cx + i * 8 - 3, cy - 60, 6, 100, 3);
        }
        break;
    }
  }
}
