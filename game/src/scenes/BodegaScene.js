const TASKS = [
  { id: 'shelves', label: 'Stock the shelves', reward: 0, emoji: '📦' },
  { id: 'sign',    label: 'Fix the sign outside', reward: 0, emoji: '🔨' },
  { id: 'open',    label: 'Open the door',  reward: 0, emoji: '🚪' },
];

export default class BodegaScene extends Phaser.Scene {
  constructor() {
    super('BodegaScene');
    this.completedTasks = new Set();
    this.isOpen = false;
    this.cash = 240;
    this.firstCustomerArrived = false;
  }

  init(data) {
    this.playerData = data;
  }

  create() {
    const W = 800, H = 600;

    this.cameras.main.fadeIn(600);

    // Floor
    this.add.rectangle(W / 2, H / 2, W, H, 0x2a1a0a);
    this.add.rectangle(W / 2, H - 40, W, 80, 0x3a2a1a);

    // Walls
    this.add.rectangle(W / 2, 60, W, 80, 0x5a3a1a);

    // Back wall
    this.add.rectangle(W / 2, H / 2, W, H - 120, 0x3d2710);

    this.add.text(W / 2, 24, 'LA BODEGA — Interior', {
      fontSize: '13px', fontFamily: 'Georgia', color: '#f4c542',
    }).setOrigin(0.5);

    this.buildInterior(W, H);
    this.buildTaskPanel(W, H);
    this.buildRadio(W);

    // Abuelo's photo on wall (emotional anchor)
    this.drawAbueloPhoto(W);

    // Back button
    const back = this.add.text(16, 16, '← La Calle', {
      fontSize: '12px', fontFamily: 'Georgia', color: '#b8a4c8',
    }).setInteractive({ cursor: 'pointer' });
    back.on('pointerover', () => back.setColor('#f4c542'));
    back.on('pointerout', () => back.setColor('#b8a4c8'));
    back.on('pointerdown', () => {
      this.scene.stop('UIScene');
      this.scene.start('BlockScene', this.playerData);
    });
  }

  buildInterior(W, H) {
    // Counter
    const counter = this.add.rectangle(W / 2, H - 140, 280, 60, 0x5a3010)
      .setStrokeStyle(2, 0xf4c542);
    this.add.text(W / 2, H - 140, 'MOSTRADOR', {
      fontSize: '9px', fontFamily: 'Georgia', color: '#8a6030',
    }).setOrigin(0.5);

    // Cash register on counter
    this.drawCashRegister(W / 2 + 80, H - 158);

    // Shelving units - LEFT
    this.leftShelf = this.drawShelfUnit(120, 280, false);

    // Shelving units - RIGHT
    this.rightShelf = this.drawShelfUnit(660, 280, false);

    // Back shelves
    this.backShelf = this.drawBackShelf(W / 2, 160);

    // Fridge
    this.drawFridge(W - 80, 320);

    // Floor tiles suggestion
    const tg = this.add.graphics();
    tg.lineStyle(1, 0x4a3a2a, 0.3);
    for (let x = 0; x < W; x += 60) {
      tg.beginPath(); tg.moveTo(x, H - 200); tg.lineTo(x, H - 40); tg.strokePath();
    }
    for (let y = H - 200; y < H - 40; y += 40) {
      tg.beginPath(); tg.moveTo(0, y); tg.lineTo(W, y); tg.strokePath();
    }
  }

  drawShelfUnit(x, y, stocked) {
    const g = this.add.graphics();
    const container = { x, y, stocked, graphics: g, items: [] };

    g.fillStyle(0x6a4020);
    g.fillRect(x - 40, y - 80, 80, 10);
    g.fillRect(x - 40, y - 40, 80, 10);
    g.fillRect(x - 40, y,      80, 10);
    g.fillRect(x - 38, y - 80, 6, 90);
    g.fillRect(x + 32, y - 80, 6, 90);

    if (stocked) this.stockShelf(container);
    return container;
  }

  stockShelf(container) {
    const { x, y } = container;
    container.stocked = true;
    container.graphics.clear();

    const g = container.graphics;
    g.fillStyle(0x6a4020);
    g.fillRect(x - 40, y - 80, 80, 10);
    g.fillRect(x - 40, y - 40, 80, 10);
    g.fillRect(x - 40, y,      80, 10);
    g.fillRect(x - 38, y - 80, 6, 90);
    g.fillRect(x + 32, y - 80, 6, 90);

    // Products on shelves
    const colors = [0xe74c3c, 0x27ae60, 0xf39c12, 0x3498db, 0x9b59b6, 0xe67e22];
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 4; col++) {
        g.fillStyle(colors[(row * 4 + col) % colors.length]);
        g.fillRect(x - 36 + col * 18, y - 76 + row * 40, 14, 22);
      }
    }
  }

  drawBackShelf(x, y) {
    const g = this.add.graphics();
    g.fillStyle(0x5a3010);
    g.fillRect(x - 180, y - 10, 360, 12);
    g.fillRect(x - 180, y + 20, 360, 12);
    g.fillRect(x - 178, y - 10, 8, 40);
    g.fillRect(x + 170, y - 10, 8, 40);

    // Some bottles/cans
    const colors2 = [0x2c3e50, 0xc0392b, 0x27ae60, 0xf39c12];
    for (let i = 0; i < 10; i++) {
      g.fillStyle(colors2[i % 4]);
      g.fillRect(x - 170 + i * 34, y - 8, 12, 20);
    }
    return g;
  }

  drawFridge(x, y) {
    const g = this.add.graphics();
    g.fillStyle(0x7a9aaa);
    g.fillRoundedRect(x - 36, y - 100, 72, 160, 6);
    g.fillStyle(0x9abccc, 0.5);
    g.fillRoundedRect(x - 30, y - 94, 60, 72, 4);
    g.fillRoundedRect(x - 30, y - 16, 60, 72, 4);
    // Handle
    g.fillStyle(0x4a6a7a);
    g.fillRect(x + 24, y - 60, 4, 20);
    g.fillRect(x + 24, y + 10, 4, 20);
    // Glow
    g.fillStyle(0x7af4ff, 0.1);
    g.fillRect(x - 26, y - 90, 52, 140);
    return g;
  }

  drawCashRegister(x, y) {
    const g = this.add.graphics();
    g.fillStyle(0x2c2c2c);
    g.fillRoundedRect(x - 20, y - 20, 40, 32, 4);
    g.fillStyle(0x1aff6a, 0.8);
    g.fillRect(x - 16, y - 18, 32, 14);
    g.fillStyle(0x444444);
    g.fillRect(x - 14, y - 2, 28, 10);
    return g;
  }

  drawAbueloPhoto(W) {
    const x = W / 2, y = 110;
    this.add.rectangle(x, y, 60, 72, 0x8b6914).setStrokeStyle(3, 0xf4c542);
    this.add.rectangle(x, y, 50, 62, 0xc8956c);
    // Simple face silhouette
    const g = this.add.graphics();
    g.fillStyle(0x7a4f35);
    g.fillEllipse(x, y - 6, 24, 28);
    g.fillStyle(0x1a0a00);
    g.fillRoundedRect(x - 12, y - 22, 24, 14, 3);
    // Caption
    this.add.text(x, y + 44, 'Abuelo\n1952–2024', {
      fontSize: '9px', fontFamily: 'Georgia', color: '#f4c542',
      align: 'center',
    }).setOrigin(0.5, 0);
  }

  buildRadio(W) {
    const x = W - 160, y = 420;
    const g = this.add.graphics();
    g.fillStyle(0x1a1a1a);
    g.fillRoundedRect(x - 40, y - 18, 80, 36, 6);
    g.fillStyle(0x333333);
    g.fillEllipse(x - 16, y, 20, 20);
    g.fillStyle(0x1aff6a);
    g.fillCircle(x + 22, y - 8, 4);

    // Animated music note
    this.musicNote = this.add.text(x + 16, y - 36, '♪', {
      fontSize: '16px', color: '#f4c542',
    }).setOrigin(0.5);

    this.tweens.add({
      targets: this.musicNote,
      y: y - 52,
      alpha: 0,
      duration: 1800,
      repeat: -1,
      ease: 'Sine.easeOut',
    });

    this.add.text(x, y + 22, 'Radio Bachata FM', {
      fontSize: '9px', fontFamily: 'Georgia', color: '#8a8a5a',
    }).setOrigin(0.5);
  }

  buildTaskPanel(W, H) {
    // Task panel on the right
    const px = W - 10, py = H / 2;
    const panel = this.add.rectangle(px - 100, py, 180, 280, 0x0a0a1a, 0.9)
      .setStrokeStyle(1, 0xf4c542);

    this.add.text(px - 100, py - 120, 'DÍA 1 — TAREAS', {
      fontSize: '11px', fontFamily: 'Georgia', color: '#f4c542',
    }).setOrigin(0.5);

    this.taskTexts = {};
    TASKS.forEach((task, i) => {
      const ty = py - 80 + i * 60;
      const row = this.add.rectangle(px - 100, ty, 160, 48, 0x1a1a2e)
        .setStrokeStyle(1, 0x3a3a5a)
        .setInteractive({ cursor: 'pointer' });

      const label = this.add.text(px - 140, ty - 10, `${task.emoji} ${task.label}`, {
        fontSize: '10px', fontFamily: 'Georgia', color: '#ffffff',
        wordWrap: { width: 140 },
      });

      const status = this.add.text(px - 100, ty + 14, '[ tap to do ]', {
        fontSize: '9px', fontFamily: 'Georgia', color: '#5a5a8a',
      }).setOrigin(0.5);

      this.taskTexts[task.id] = { label, status, row };

      row.on('pointerover', () => {
        if (!this.completedTasks.has(task.id)) row.setFillStyle(0x2a2a4e);
      });
      row.on('pointerout', () => {
        if (!this.completedTasks.has(task.id)) row.setFillStyle(0x1a1a2e);
      });
      row.on('pointerdown', () => this.completeTask(task));
    });

    // La San reminder
    this.add.rectangle(px - 100, py + 110, 160, 48, 0x1a2a1a)
      .setStrokeStyle(1, 0x27ae60);
    this.add.text(px - 100, py + 102, '💰 La San', {
      fontSize: '10px', fontFamily: 'Georgia', color: '#7af4a4',
    }).setOrigin(0.5);
    this.add.text(px - 100, py + 118, 'Viernes — $50 due', {
      fontSize: '9px', fontFamily: 'Georgia', color: '#4a8a5a',
    }).setOrigin(0.5);
  }

  completeTask(task) {
    if (this.completedTasks.has(task.id)) return;
    this.completedTasks.add(task.id);

    const { label, status, row } = this.taskTexts[task.id];
    status.setText('✓ Hecho').setColor('#7af4a4');
    row.setFillStyle(0x0a2a0a).setStrokeStyle(1, 0x27ae60);

    // Visual feedback for each task
    if (task.id === 'shelves') {
      this.stockShelf(this.leftShelf);
      this.stockShelf(this.rightShelf);
      this.showToast('¡Las anaqueles están llenas!');
    }
    if (task.id === 'sign') {
      this.showToast('¡El letrero brilla!');
    }
    if (task.id === 'open') {
      this.isOpen = true;
      this.showToast('¡La bodega está ABIERTA!');
      this.time.delayedCall(1500, () => this.triggerFirstCustomer());
    }

    if (this.completedTasks.size === TASKS.length) {
      this.time.delayedCall(2000, () => this.showDayOneDecision());
    }
  }

  triggerFirstCustomer() {
    if (this.firstCustomerArrived) return;
    this.firstCustomerArrived = true;

    const W = 800, H = 600;
    // Customer walks in
    const cg = this.add.graphics();
    cg.fillStyle(0x6a4a8a);
    cg.fillEllipse(0, H - 220, 18, 18);
    cg.fillRect(-9, H - 212, 18, 32);

    this.tweens.add({
      targets: cg,
      x: 240,
      duration: 1500,
      ease: 'Sine.easeOut',
      onComplete: () => this.showCustomerDialog(cg),
    });
  }

  showCustomerDialog(cg) {
    const W = 800, H = 600;
    const bubble = this.add.rectangle(220, H - 280, 200, 60, 0xf0f0f0)
      .setStrokeStyle(2, 0x333333);
    this.add.text(220, H - 290, 'Doña Carmen:', {
      fontSize: '9px', fontFamily: 'Georgia', color: '#333333', fontStyle: 'bold',
    }).setOrigin(0.5);
    this.add.text(220, H - 272, '"Gracias a Dios.\nEsta bodega hacía falta."', {
      fontSize: '9px', fontFamily: 'Georgia', color: '#1a0a2e', align: 'center',
    }).setOrigin(0.5);

    this.time.delayedCall(3000, () => {
      bubble.destroy();
      this.cash += 8;
      this.showToast('+$8 — Primera venta ✓');
    });
  }

  showToast(msg) {
    const W = 800;
    const toast = this.add.text(W / 2, 80, msg, {
      fontSize: '13px', fontFamily: 'Georgia', color: '#f4c542',
      backgroundColor: '#0a0a1a', padding: { x: 12, y: 6 },
    }).setOrigin(0.5).setDepth(100);

    this.tweens.add({
      targets: toast,
      y: 60,
      alpha: 0,
      duration: 2000,
      delay: 1000,
      onComplete: () => toast.destroy(),
    });
  }

  showDayOneDecision() {
    const W = 800, H = 600;

    // Modal overlay
    const overlay = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.75).setDepth(200);

    const modal = this.add.rectangle(W / 2, H / 2, 480, 280, 0x0a0a1a)
      .setStrokeStyle(2, 0xf4c542).setDepth(201);

    this.add.text(W / 2, H / 2 - 110, '💰 PRIMERA DECISIÓN', {
      fontSize: '16px', fontFamily: 'Georgia', color: '#f4c542',
    }).setOrigin(0.5).setDepth(202);

    this.add.text(W / 2, H / 2 - 72, '"La San se reúne el viernes.\nDebes $50 al grupo.\nPero la segunda nevera cuesta $80\ny solo tienes $240."', {
      fontSize: '12px', fontFamily: 'Georgia', color: '#e8d8f0',
      align: 'center', fontStyle: 'italic',
      wordWrap: { width: 420 },
    }).setOrigin(0.5).setDepth(202);

    // Option A
    const btnA = this.add.rectangle(W / 2 - 110, H / 2 + 50, 180, 48, 0x0a2a0a)
      .setStrokeStyle(2, 0x27ae60).setDepth(202).setInteractive({ cursor: 'pointer' });
    this.add.text(W / 2 - 110, H / 2 + 44, '✓ Pagar La San', {
      fontSize: '12px', fontFamily: 'Georgia', color: '#7af4a4',
    }).setOrigin(0.5).setDepth(203);
    this.add.text(W / 2 - 110, H / 2 + 58, 'Comunidad +  /  Expansión –', {
      fontSize: '9px', fontFamily: 'Georgia', color: '#4a8a5a',
    }).setOrigin(0.5).setDepth(203);

    // Option B
    const btnB = this.add.rectangle(W / 2 + 110, H / 2 + 50, 180, 48, 0x2a0a0a)
      .setStrokeStyle(2, 0xc0392b).setDepth(202).setInteractive({ cursor: 'pointer' });
    this.add.text(W / 2 + 110, H / 2 + 44, '✗ Saltar este mes', {
      fontSize: '12px', fontFamily: 'Georgia', color: '#f4a4a4',
    }).setOrigin(0.5).setDepth(203);
    this.add.text(W / 2 + 110, H / 2 + 58, 'Expansión +  /  Comunidad –', {
      fontSize: '9px', fontFamily: 'Georgia', color: '#8a4a4a',
    }).setOrigin(0.5).setDepth(203);

    const handleChoice = (choice) => {
      overlay.destroy(); modal.destroy();
      if (choice === 'san') {
        this.cash -= 50;
        this.showToast('La San: pagada. Doña Carmen sonríe. 🤝');
      } else {
        this.showToast('Segunda nevera comprada. Doña Carmen lo notó. 🥶');
      }
    };

    btnA.on('pointerdown', () => handleChoice('san'));
    btnB.on('pointerdown', () => handleChoice('skip'));
  }
}
