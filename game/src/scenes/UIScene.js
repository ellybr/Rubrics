export default class UIScene extends Phaser.Scene {
  constructor() {
    super({ key: 'UIScene', active: false });
    this.cash = 240;
    this.day = 1;
    this.trust = 60;
    this.sanPaid = false;
  }

  init(data) {
    this.playerData = data;
  }

  create() {
    const W = 800;

    // Top bar background
    this.bar = this.add.rectangle(W / 2, 16, W, 32, 0x0a0a14, 0.95);

    // Name
    this.add.text(12, 16, `${this.playerData?.playerName || 'Marisol'}`, {
      fontSize: '12px', fontFamily: 'Georgia', color: '#f4c542',
    }).setOrigin(0, 0.5);

    // Day
    this.dayText = this.add.text(160, 16, 'Día 1', {
      fontSize: '12px', fontFamily: 'Georgia', color: '#b8a4c8',
    }).setOrigin(0, 0.5);

    // Cash
    this.cashText = this.add.text(W / 2, 16, '💵 $240', {
      fontSize: '13px', fontFamily: 'Georgia', color: '#7af4a4',
    }).setOrigin(0.5);

    // Community trust bar
    this.add.text(W - 180, 16, 'Comunidad:', {
      fontSize: '10px', fontFamily: 'Georgia', color: '#b8a4c8',
    }).setOrigin(0, 0.5);

    this.trustBarBg = this.add.rectangle(W - 70, 16, 100, 10, 0x2a2a2a);
    this.trustBar = this.add.rectangle(W - 70 - 50 + this.trust / 2, 16, this.trust, 10, 0x27ae60);

    // La San indicator
    this.sanText = this.add.text(W - 10, 32, 'La San: viernes', {
      fontSize: '8px', fontFamily: 'Georgia', color: '#4a8a5a',
    }).setOrigin(1, 0);
  }

  updateCash(amount) {
    this.cash = amount;
    this.cashText.setText(`💵 $${this.cash}`);
  }

  updateTrust(val) {
    this.trust = Phaser.Math.Clamp(val, 0, 100);
    this.trustBar.setDisplaySize(this.trust, 10);
    const color = this.trust > 60 ? 0x27ae60 : this.trust > 30 ? 0xf39c12 : 0xc0392b;
    this.trustBar.setFillStyle(color);
  }
}
