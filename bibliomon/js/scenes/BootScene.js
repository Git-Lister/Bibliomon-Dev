class BootScene extends Phaser.Scene {
    constructor() {
        super('Boot');
    }

    preload() {
        // ── Load individual tile images ─────────────────────────────────────
        const tileNames = [
            'dot','W','H','K','S','D','T','V','C','E','L','B','X','G',
            'P_right','P_left','P_up','P_down','Z','R','I','Y','O','M'
        ];
        tileNames.forEach(name => {
            this.load.image(`tile_${name}`, `assets/tiles/${name}.png`);
        });

        // ── Other assets ──────────────────────────────────────────────────
        this.load.spritesheet('player_walk', 'assets/images/player_walk.png',
            { frameWidth: 32, frameHeight: 32 });
        this.load.image('book_back', 'assets/images/book_back.png');
        this.load.image('book_front_arts_humanities', 'assets/images/book_front_arts_humanities.png');
        this.load.image('book_front_business_law', 'assets/images/book_front_business_law.png');
        this.load.image('book_front_science_engineering', 'assets/images/book_front_science_engineering.png');
        this.load.image('book_front_health_education', 'assets/images/book_front_health_education.png');
        this.load.image('sam', 'assets/images/sam.png');
        this.load.image('rival', 'assets/images/rival.png');
        this.load.image('student', 'assets/images/student.png');
    }

    create() {
        // ── Particle texture ──────────────────────────────────────────────
        const pg = this.add.graphics();
        pg.fillStyle(0xffffff);
        pg.fillCircle(4, 4, 4);
        pg.generateTexture('particle', 8, 8);
        pg.destroy();

        // ── Compose the tileset ────────────────────────────────────────────
        this.composeTileset();

        // ── Player walking animations ──────────────────────────────────────
        if (this.textures.exists('player_walk')) {
            const directions = ['down', 'left', 'right', 'up'];
            directions.forEach((dir, dIdx) => {
                const start = dIdx * 4;          // 4 frames per direction
                const end = start + 3;
                this.anims.create({
                    key: `walk_${dir}`,
                    frames: this.anims.generateFrameNumbers('player_walk', { start, end }),
                    frameRate: 8,
                    repeat: -1
                });
            });
        } else {
            // Fallback if external spritesheet didn't load
            this.generatePlayerSpritesheet();
            this.anims.create({
                key: 'walk_down',
                frames: this.anims.generateFrameNumbers('player_walk', { start: 0, end: 3 }),
                frameRate: 8,
                repeat: -1
            });
            // etc. – but we rely on the external sheet.
        }

        // ── Book & NPC fallbacks (if external images missing) ──────────────
        if (!this.textures.exists('book_front_arts_humanities')) this.generateBookSprites();
        if (!this.textures.exists('sam')) this.generateCharacterSprites();

        // ── Tile index map (must match the order in the composed tileset) ──
        const tileChars = [
            '.', 'W', 'H', 'K', 'S', 'D', 'T', 'V', 'C', 'E', 'L', 'B', 'X', 'G',
            'P>', 'P<', 'P^', 'Pv', 'Z', 'R', 'I', 'Y', 'O', 'M'
        ];
        window.tileIndexMap = {};
        tileChars.forEach((char, index) => { window.tileIndexMap[char] = index; });

        // ── Launch Title scene ──────────────────────────────────────────────
        this.scene.start('Title');
    }

    // ── Compose the final tileset (from individual images) ────────────────
    composeTileset() {
        const tileSize = 32;
        const cols = 24;                  // one row of 24 tiles
        const rows = 1;
        const canvas = document.createElement('canvas');
        canvas.width  = cols * tileSize;
        canvas.height = rows * tileSize;
        const ctx = canvas.getContext('2d');

        const fileNameMap = {
            '.': 'dot',   'W': 'W',     'H': 'H',     'K': 'K',
            'S': 'S',     'D': 'D',     'T': 'T',     'V': 'V',
            'C': 'C',     'E': 'E',     'L': 'L',     'B': 'B',
            'X': 'X',     'G': 'G',
            'P>': 'P_right', 'P<': 'P_left', 'P^': 'P_up', 'Pv': 'P_down',
            'Z': 'Z',     'R': 'R',     'I': 'I',     'Y': 'Y',
            'O': 'O',     'M': 'M'
        };

        const orderedChars = [
            '.', 'W', 'H', 'K', 'S', 'D', 'T', 'V', 'C', 'E', 'L', 'B', 'X', 'G',
            'P>', 'P<', 'P^', 'Pv', 'Z', 'R', 'I', 'Y', 'O', 'M'
        ];

        orderedChars.forEach((char, index) => {
            const col = index % cols;
            const row = Math.floor(index / cols);
            const x = col * tileSize;
            const y = row * tileSize;

            const texKey = `tile_${fileNameMap[char]}`;
            if (this.textures.exists(texKey)) {
                const img = this.textures.get(texKey).getSourceImage();
                ctx.drawImage(img, x, y, tileSize, tileSize);
            } else {
                this.drawProgrammaticTile(ctx, char, x, y, tileSize);
            }
        });

        this.textures.addSpriteSheet('tileset', canvas, {
            frameWidth:  tileSize,
            frameHeight: tileSize
        });
    }

    // ── Programmatic tile drawing at any size ────────────────────────────
    drawProgrammaticTile(ctx, char, x, y, size) {
        // Same logic as before, but using 'size' instead of hardcoded 16
        const s = size;
        if (char === '.') {
            ctx.fillStyle = '#fafaf9'; ctx.fillRect(x, y, s, s);
            ctx.fillStyle = '#e8e4e0';
            ctx.fillRect(x + s*0.125, y + s*0.375, s*0.75, s*0.0625);
            ctx.fillRect(x + s*0.375, y + s*0.125, s*0.0625, s*0.75);
        } else if (char === 'W') {
            ctx.fillStyle = '#2a2a2e'; ctx.fillRect(x, y, s, s);
            ctx.fillStyle = '#1e1e22';
            for (let my = s*0.25; my < s; my += s*0.3125) ctx.fillRect(x, y+my, s, s*0.0625);
            ctx.fillStyle = '#3a3a40';
            ctx.fillRect(x, y, s, s*0.0625); ctx.fillRect(x, y, s*0.0625, s);
            ctx.strokeStyle = '#18181b'; ctx.lineWidth = 1; ctx.strokeRect(x, y, s, s);
        } else if (char === 'H') {
            ctx.fillStyle = '#1e3a8a'; ctx.fillRect(x, y, s, s);
            ctx.fillStyle = '#3b82f6'; ctx.fillRect(x+s*0.125, y+s*0.125, s*0.75, s*0.25);
        } else if (char === 'K') {
            ctx.fillStyle = '#065f46'; ctx.fillRect(x, y, s, s);
        } else if (char === 'S') {
            ctx.fillStyle = '#7c2d12'; ctx.fillRect(x, y, s, s);
            const colors = ['#c0392b','#2980b9','#27ae60','#16a085'];
            colors.forEach((c,i) => { ctx.fillStyle=c; ctx.fillRect(x+s*0.0625+i*s*0.25, y, s*0.125, s*0.625); });
            ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(x, y+s-s*0.125, s, s*0.125);
        } else if (char === 'D') {
            ctx.fillStyle = '#78350f'; ctx.fillRect(x+s*0.125, y, s*0.75, s);
            ctx.fillStyle = '#ffd700'; ctx.fillRect(x+s-s*0.25, y+s*0.5, s*0.125, s*0.125);
        } else if (char === 'T') {
            ctx.fillStyle = '#fafaf9'; ctx.fillRect(x, y, s, s);
            ctx.fillStyle = '#166534'; ctx.fillRect(x+s*0.25, y+s*0.375, s*0.5, s*0.5);
            ctx.fillStyle = '#fbcfe8'; ctx.beginPath(); ctx.arc(x+s*0.5, y+s*0.3125, s*0.15625, 0, Math.PI*2); ctx.fill();
        } else if (char === 'V') {
            ctx.fillStyle = '#6b21a8'; ctx.fillRect(x, y, s, s);
            ctx.fillStyle = '#a855f7'; ctx.fillRect(x+s*0.1875, y+s*0.125, s*0.625, s*0.375);
        } else if (char === 'C') {
            ctx.fillStyle = '#9a3412'; ctx.fillRect(x+s*0.0625, y+s*0.1875, s*0.875, s*0.625);
        } else if (char === 'E') {
            ctx.fillStyle = '#71717a';
            for (let i=0; i<4; i++) ctx.fillRect(x+i*s*0.25, y+(3-i)*s*0.25, s*0.25, i*s*0.25+s*0.25);
        } else if (char === 'L') {
            ctx.fillStyle = '#d4a574'; ctx.fillRect(x+s*0.125, y+s*0.125, s*0.75, s*0.75);
            ctx.fillStyle = '#00ffcc'; ctx.fillRect(x+s*0.25, y+s*0.25, s*0.5, s*0.375);
        } else if (char === 'B') {
            ctx.fillStyle = '#7f1d1d'; ctx.fillRect(x, y, s, s);
            ctx.fillStyle = '#ffffff'; ctx.font = 'bold 12px monospace'; ctx.fillText('🔒', x+s*0.25, y+s*0.625);
        } else if (char === 'X') {
            ctx.fillStyle = '#fafaf9'; ctx.fillRect(x, y, s, s);
            ctx.fillStyle = '#eab308'; ctx.beginPath(); ctx.arc(x+s*0.5, y+s*0.5, s*0.25, 0, Math.PI*2); ctx.fill();
        } else if (char === 'G') {
            ctx.fillStyle = '#4a1e1e'; ctx.fillRect(x, y, s, s);
            ctx.fillStyle = '#fbbf24'; ctx.font = 'bold 14px monospace'; ctx.fillText('GYM', x+s*0.125, y+s*0.75);
        } else if (char.startsWith('P')) {
            ctx.fillStyle = '#0ea5e9'; ctx.fillRect(x, y, s, s);
            ctx.strokeStyle = '#fff'; ctx.lineWidth = 2;
            ctx.beginPath();
            if (char==='P>') { ctx.moveTo(x+s*0.2,y+s*0.5); ctx.lineTo(x+s*0.8,y+s*0.5); ctx.lineTo(x+s*0.55,y+s*0.25); ctx.moveTo(x+s*0.8,y+s*0.5); ctx.lineTo(x+s*0.55,y+s*0.75); }
            if (char==='P<') { ctx.moveTo(x+s*0.8,y+s*0.5); ctx.lineTo(x+s*0.2,y+s*0.5); ctx.lineTo(x+s*0.45,y+s*0.25); ctx.moveTo(x+s*0.2,y+s*0.5); ctx.lineTo(x+s*0.45,y+s*0.75); }
            if (char==='P^') { ctx.moveTo(x+s*0.5,y+s*0.8); ctx.lineTo(x+s*0.5,y+s*0.2); ctx.lineTo(x+s*0.25,y+s*0.45); ctx.moveTo(x+s*0.5,y+s*0.2); ctx.lineTo(x+s*0.75,y+s*0.45); }
            if (char==='Pv') { ctx.moveTo(x+s*0.5,y+s*0.2); ctx.lineTo(x+s*0.5,y+s*0.8); ctx.lineTo(x+s*0.25,y+s*0.55); ctx.moveTo(x+s*0.5,y+s*0.8); ctx.lineTo(x+s*0.75,y+s*0.55); }
            ctx.stroke();
        } else if (char === 'Z') {
            ctx.fillStyle = '#fafaf9'; ctx.fillRect(x, y, s, s);
            ctx.fillStyle = '#3b82f6'; ctx.fillRect(x+s*0.25, y+s*0.375, s*0.5, s*0.5);
            ctx.fillStyle = '#fbcfe8'; ctx.beginPath(); ctx.arc(x+s*0.5, y+s*0.25, s*0.15625, 0, Math.PI*2); ctx.fill();
            ctx.strokeStyle = '#000'; ctx.beginPath(); ctx.arc(x+s*0.5, y+s*0.3125, s*0.0625, 0, Math.PI); ctx.stroke();
        } else if (char === 'R') {
            ctx.fillStyle = '#1e3a8a'; ctx.fillRect(x, y, s, s);
            ctx.fillStyle = '#3b82f6'; ctx.fillRect(x+s*0.125, y+s*0.125, s*0.75, s*0.25);
        } else if (char === 'I') {
            ctx.fillStyle = '#2d5a27'; ctx.fillRect(x, y, s, s);
            ctx.strokeStyle = '#fff'; ctx.lineWidth = 1; ctx.strokeRect(x+s*0.1875, y+s*0.1875, s*0.625, s*0.625);
            ctx.fillStyle = '#00ff00'; ctx.beginPath();
            ctx.moveTo(x+s*0.25, y+s*0.5); ctx.lineTo(x+s*0.75, y+s*0.5); ctx.lineTo(x+s*0.5, y+s*0.25);
            ctx.fill();
        } else if (char === 'Y') {
            ctx.fillStyle = '#7f1d1d'; ctx.fillRect(x, y, s, s);
            ctx.strokeStyle = '#fff'; ctx.lineWidth = 1; ctx.strokeRect(x+s*0.1875, y+s*0.1875, s*0.625, s*0.625);
            ctx.fillStyle = '#ff0000'; ctx.beginPath();
            ctx.moveTo(x+s*0.75, y+s*0.5); ctx.lineTo(x+s*0.25, y+s*0.5); ctx.lineTo(x+s*0.5, y+s*0.25);
            ctx.fill();
        } else if (char === 'O') {
            ctx.fillStyle = '#8B4513'; ctx.fillRect(x+s*0.25, y+s*0.625, s*0.5, s*0.375);
            ctx.fillStyle = '#2d5a27'; ctx.beginPath(); ctx.arc(x+s*0.5, y+s*0.4375, s*0.3125, 0, Math.PI*2); ctx.fill();
        } else if (char === 'M') {
            ctx.fillStyle = '#fafaf9'; ctx.fillRect(x, y, s, s);
            ctx.fillStyle = '#dc2626'; ctx.fillRect(x+s*0.25, y+s*0.375, s*0.5, s*0.5);
            ctx.fillStyle = '#fbcfe8'; ctx.beginPath(); ctx.arc(x+s*0.5, y+s*0.25, s*0.15625, 0, Math.PI*2); ctx.fill();
            ctx.strokeStyle = '#000'; ctx.beginPath(); ctx.arc(x+s*0.5, y+s*0.3125, s*0.0625, 0, Math.PI); ctx.stroke();
        }
    }

    // ── Fallback generators (unchanged, but they now produce 32×32) ──────
    generatePlayerSpritesheet() {
        const fw = 32, fh = 32;
        const dirs = ['down','left','right','up'];
        const framesPerDir = 4;
        const total = dirs.length * framesPerDir;
        const canvas = document.createElement('canvas');
        canvas.width = fw * total; canvas.height = fh;
        const ctx = canvas.getContext('2d');
        dirs.forEach((dir, dIdx) => {
            for (let f=0; f<framesPerDir; f++) {
                const idx = dIdx*framesPerDir + f;
                const x = idx*fw, y = 0;
                ctx.fillStyle = '#2563eb';
                ctx.beginPath(); ctx.arc(x+fw/2, y+fh*0.625, fw*0.25, 0, Math.PI*2); ctx.fill();
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(x+fw*0.1875, y+fh*0.125, fw*0.625, fh*0.125);
                ctx.fillRect(x+fw*0.4375, y+fh*0.0625, fw*0.125, fh*0.25);
                if (f%2===0) { ctx.fillStyle = '#2563eb'; ctx.fillRect(x+fw*0.375, y+fh*0.75, fw*0.125, fh*0.125); }
            }
        });
        this.textures.addSpriteSheet('player_walk', canvas, { frameWidth:fw, frameHeight:fh });
    }

    generateBookSprites() {
        const types = ['arts_humanities','business_law','science_engineering','health_education'];
        const colors = { arts_humanities:'#c0392b', business_law:'#2980b9', science_engineering:'#16a085', health_education:'#27ae60' };
        const fw=64, fh=64;
        types.forEach(type => {
            const canvas = document.createElement('canvas');
            canvas.width=fw; canvas.height=fh; const ctx=canvas.getContext('2d');
            ctx.fillStyle=colors[type]; ctx.fillRect(fw*0.125, fh*0.0625, fw*0.75, fh*0.875);
            ctx.strokeStyle='#fff'; ctx.lineWidth=2; ctx.strokeRect(fw*0.125, fh*0.0625, fw*0.75, fh*0.875);
            ctx.fillStyle='#333'; ctx.fillRect(fw*0.0625, fh*0.125, fw*0.09375, fh*0.75);
            ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(fw*0.5, fh*0.4, fw*0.125, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle='#000'; ctx.beginPath(); ctx.arc(fw*0.4375, fh*0.375, fw*0.03125, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(fw*0.5625, fh*0.375, fw*0.03125, 0, Math.PI*2); ctx.fill();
            ctx.strokeStyle='#000'; ctx.lineWidth=1; ctx.beginPath(); ctx.arc(fw*0.5, fh*0.45, fw*0.0625, 0, Math.PI); ctx.stroke();
            this.textures.addImage(`book_front_${type}`, canvas);
        });
        const backCanvas = document.createElement('canvas');
        backCanvas.width=fw; backCanvas.height=fh; const bCtx=backCanvas.getContext('2d');
        bCtx.fillStyle='#8B4513'; bCtx.fillRect(fw*0.125, fh*0.0625, fw*0.75, fh*0.875);
        bCtx.strokeStyle='#fff'; bCtx.lineWidth=2; bCtx.strokeRect(fw*0.125, fh*0.0625, fw*0.75, fh*0.875);
        bCtx.fillStyle='#333'; bCtx.fillRect(fw*0.8125, fh*0.125, fw*0.09375, fh*0.75);
        bCtx.fillStyle='#fff'; bCtx.fillRect(fw*0.25, fh*0.03125, fw*0.5, fh*0.125);
        bCtx.fillRect(fw*0.375, 0, fw*0.25, fh*0.125);
        this.textures.addImage('book_back', backCanvas);
    }

    generateCharacterSprites() {
        const samCanvas = document.createElement('canvas');
        samCanvas.width=32; samCanvas.height=32; const sCtx=samCanvas.getContext('2d');
        sCtx.fillStyle='#1e40af'; sCtx.fillRect(8,12,16,16);
        sCtx.fillStyle='#fbcfe8'; sCtx.beginPath(); sCtx.arc(16,10,5,0,Math.PI*2); sCtx.fill();
        sCtx.fillStyle='#fff'; sCtx.fillRect(10,4,12,4); sCtx.fillRect(14,2,4,6);
        this.textures.addImage('sam', samCanvas);

        const rivalCanvas = document.createElement('canvas');
        rivalCanvas.width=32; rivalCanvas.height=32; const rCtx=rivalCanvas.getContext('2d');
        rCtx.fillStyle='#b91c1c'; rCtx.fillRect(8,12,16,16);
        rCtx.fillStyle='#fbcfe8'; rCtx.beginPath(); rCtx.arc(16,10,5,0,Math.PI*2); rCtx.fill();
        rCtx.fillStyle='#000'; rCtx.fillRect(10,4,12,4); rCtx.fillRect(14,2,4,6);
        this.textures.addImage('rival', rivalCanvas);

        const stuCanvas = document.createElement('canvas');
        stuCanvas.width=32; stuCanvas.height=32; const tCtx=stuCanvas.getContext('2d');
        tCtx.fillStyle='#166534'; tCtx.fillRect(8,12,16,16);
        tCtx.fillStyle='#fbcfe8'; tCtx.beginPath(); tCtx.arc(16,10,5,0,Math.PI*2); tCtx.fill();
        this.textures.addImage('student', stuCanvas);
    }
}