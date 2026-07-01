class BootScene extends Phaser.Scene {
    constructor() {
        super('Boot');
    }

    preload() {
        // Try to load external spritesheets / images.
        // If a file is missing, Phaser will simply skip it (no error).
        this.load.spritesheet('tileset_ext', 'assets/images/tileset.png',
            { frameWidth: 16, frameHeight: 16 });
        this.load.spritesheet('player_walk_ext', 'assets/images/player_walk.png',
            { frameWidth: 16, frameHeight: 16 });

        this.load.image('book_front_arts_humanities_ext', 'assets/images/book_front_arts_humanities.png');
        this.load.image('book_front_business_law_ext', 'assets/images/book_front_business_law.png');
        this.load.image('book_front_science_engineering_ext', 'assets/images/book_front_science_engineering.png');
        this.load.image('book_front_health_education_ext', 'assets/images/book_front_health_education.png');
        this.load.image('book_back_ext', 'assets/images/book_back.png');

        this.load.image('sam_ext', 'assets/images/sam.png');
        this.load.image('rival_ext', 'assets/images/rival.png');
        this.load.image('student_ext', 'assets/images/student.png');
    }

    create() {
        // ── Particle texture for faint effects (always generated) ────────
        const pg = this.add.graphics();
        pg.fillStyle(0xffffff);
        pg.fillCircle(4, 4, 4);
        pg.generateTexture('particle', 8, 8);
        pg.destroy();

        // ── Tileset – use external if loaded, otherwise generate ─────────
        if (this.textures.exists('tileset_ext')) {
            // Use the external spritesheet under the key 'tileset'
            this.textures.renameTexture('tileset_ext', 'tileset');
        } else {
            // No external file – generate the tileset programmatically
            this.generateTileset();
        }

        // ── Player walking sheet – use external or generate ──────────────
        if (this.textures.exists('player_walk_ext')) {
            this.textures.renameTexture('player_walk_ext', 'player_walk');
        } else {
            this.generatePlayerSpritesheet();
        }

        // ── Book sprites – use external or generate ──────────────────────
        const bookTypes = [
            'arts_humanities', 'business_law',
            'science_engineering', 'health_education'
        ];
        let allBooksLoaded = true;
        bookTypes.forEach(type => {
            if (!this.textures.exists(`book_front_${type}_ext`)) allBooksLoaded = false;
        });
        if (!this.textures.exists('book_back_ext')) allBooksLoaded = false;

        if (allBooksLoaded) {
            bookTypes.forEach(type => {
                this.textures.renameTexture(`book_front_${type}_ext`, `book_front_${type}`);
            });
            this.textures.renameTexture('book_back_ext', 'book_back');
        } else {
            this.generateBookSprites();
        }

        // ── NPC sprites – use external or generate ───────────────────────
        if (this.textures.exists('sam_ext')) {
            this.textures.renameTexture('sam_ext', 'sam');
        } else {
            this.generateCharacterSprites();
        }
        if (this.textures.exists('rival_ext')) {
            this.textures.renameTexture('rival_ext', 'rival');
        }
        if (this.textures.exists('student_ext')) {
            this.textures.renameTexture('student_ext', 'student');
        }
        // (generateCharacterSprites creates all three, so if one is missing
        //  we just call it once – the others will be overwritten if external
        //  versions existed, which is fine.)

        // ── Tile‑index map (must match spritesheet order) ─────────────────
        const tileChars = [
            '.', 'W', 'H', 'K', 'S', 'D', 'T', 'V', 'C', 'E', 'L', 'B', 'X', 'G',
            'P>', 'P<', 'P^', 'Pv', 'Z', 'R', 'I', 'Y', 'O', 'M'
        ];
        window.tileIndexMap = {};
        tileChars.forEach((char, index) => {
            window.tileIndexMap[char] = index;
        });

        // ── Create player walking animations ─────────────────────────────
        if (this.textures.exists('player_walk')) {
            const directions = ['down', 'left', 'right', 'up'];
            directions.forEach((dir, dIdx) => {
                const start = dIdx * 3;
                const end = start + 2;
                this.anims.create({
                    key: `walk_${dir}`,
                    frames: this.anims.generateFrameNumbers('player_walk',
                        { start, end }),
                    frameRate: 8,
                    repeat: -1
                });
            });
        }

        this.scene.start('Title');
    }

    // ── Programmatic fallback methods (unchanged from previous versions) ──

    generateCharacterSprites() {
        const samCanvas = document.createElement('canvas');
        samCanvas.width = 16; samCanvas.height = 16;
        const sCtx = samCanvas.getContext('2d');
        sCtx.fillStyle = '#1e40af';
        sCtx.fillRect(4, 6, 8, 8);
        sCtx.fillStyle = '#fbcfe8';
        sCtx.beginPath(); sCtx.arc(8, 5, 2.5, 0, Math.PI * 2); sCtx.fill();
        sCtx.fillStyle = '#ffffff';
        sCtx.fillRect(5, 2, 6, 2);
        sCtx.fillRect(7, 1, 2, 3);
        this.textures.addImage('sam', samCanvas);

        const rivalCanvas = document.createElement('canvas');
        rivalCanvas.width = 16; rivalCanvas.height = 16;
        const rCtx = rivalCanvas.getContext('2d');
        rCtx.fillStyle = '#b91c1c';
        rCtx.fillRect(4, 6, 8, 8);
        rCtx.fillStyle = '#fbcfe8';
        rCtx.beginPath(); rCtx.arc(8, 5, 2.5, 0, Math.PI * 2); rCtx.fill();
        rCtx.fillStyle = '#000000';
        rCtx.fillRect(5, 2, 6, 2);
        rCtx.fillRect(7, 1, 2, 3);
        this.textures.addImage('rival', rivalCanvas);

        const stuCanvas = document.createElement('canvas');
        stuCanvas.width = 16; stuCanvas.height = 16;
        const tCtx = stuCanvas.getContext('2d');
        tCtx.fillStyle = '#166534';
        tCtx.fillRect(4, 6, 8, 8);
        tCtx.fillStyle = '#fbcfe8';
        tCtx.beginPath(); tCtx.arc(8, 5, 2.5, 0, Math.PI * 2); tCtx.fill();
        this.textures.addImage('student', stuCanvas);
    }

    generateBookSprites() {
        const types = ['arts_humanities', 'business_law', 'science_engineering', 'health_education'];
        const colors = {
            arts_humanities: '#c0392b',
            business_law: '#2980b9',
            science_engineering: '#16a085',
            health_education: '#27ae60'
        };
        const frameWidth = 48, frameHeight = 48;

        types.forEach(type => {
            const canvas = document.createElement('canvas');
            canvas.width = frameWidth; canvas.height = frameHeight;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = colors[type];
            ctx.fillRect(8, 4, 32, 40);
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.strokeRect(8, 4, 32, 40);
            ctx.fillStyle = '#333333';
            ctx.fillRect(4, 8, 6, 32);
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(24, 20, 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#000000';
            ctx.beginPath();
            ctx.arc(22, 19, 1.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(28, 19, 1.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(24, 23, 2, 0, Math.PI);
            ctx.stroke();
            this.textures.addImage(`book_front_${type}`, canvas);
        });

        const backCanvas = document.createElement('canvas');
        backCanvas.width = frameWidth; backCanvas.height = frameHeight;
        const bCtx = backCanvas.getContext('2d');
        bCtx.fillStyle = '#8B4513';
        bCtx.fillRect(8, 4, 32, 40);
        bCtx.strokeStyle = '#ffffff';
        bCtx.lineWidth = 2;
        bCtx.strokeRect(8, 4, 32, 40);
        bCtx.fillStyle = '#333';
        bCtx.fillRect(38, 8, 6, 32);
        bCtx.fillStyle = '#ffffff';
        bCtx.fillRect(14, 2, 20, 4);
        bCtx.fillRect(20, 0, 8, 4);
        this.textures.addImage('book_back', backCanvas);
    }

    generateTileset() {
        const tileSize = 16;
        const cols = 16;
        const rows = 8;
        const canvas = document.createElement('canvas');
        canvas.width = cols * tileSize;
        canvas.height = rows * tileSize;
        const ctx = canvas.getContext('2d');

        const tileDefs = [
            { char: '.', color: '#fafaf9', detail: 'dot'        },
            { char: 'W', color: '#27272a', stroke: '#18181b'  },
            { char: 'H', color: '#1e3a8a'                       },
            { char: 'K', color: '#065f46'                       },
            { char: 'S', color: '#7c2d12', detail: 'books'      },
            { char: 'D', color: '#78350f'                       },
            { char: 'T', color: '#fafaf9', detail: 'student'    },
            { char: 'V', color: '#6b21a8'                       },
            { char: 'C', color: '#9a3412'                       },
            { char: 'E', color: '#71717a'                       },
            { char: 'L', color: '#d4a574'                       },
            { char: 'B', color: '#7f1d1d'                       },
            { char: 'X', color: '#fafaf9', detail: 'goal'       },
            { char: 'G', color: '#4a1e1e', detail: 'gym'        },
            { char: 'P>', color: '#0ea5e9'                      },
            { char: 'P<', color: '#0ea5e9'                      },
            { char: 'P^', color: '#0ea5e9'                      },
            { char: 'Pv', color: '#0ea5e9'                      },
            { char: 'Z', color: '#fafaf9', detail: 'staff'      },
            { char: 'R', color: '#1e3a8a', detail: 'reception'  },
            { char: 'I', color: '#2d5a27', detail: 'entryGate'  },
            { char: 'Y', color: '#7f1d1d', detail: 'exitGate'   },
            { char: 'O', color: '#2d5a27', detail: 'plant'      },
            { char: 'M', color: '#fafaf9', detail: 'rival'      },
        ];

        tileDefs.forEach((def, index) => {
            const col = index % cols;
            const row = Math.floor(index / cols);
            const x = col * tileSize;
            const y = row * tileSize;

            ctx.fillStyle = def.color;
            ctx.fillRect(x, y, tileSize, tileSize);

            if (def.char === 'W') {
                ctx.fillStyle = '#2a2a2e';
                ctx.fillRect(x, y, tileSize, tileSize);
                ctx.fillStyle = '#1e1e22';
                for (let my = 4; my < tileSize; my += 5) {
                    ctx.fillRect(x, y + my, tileSize, 1);
                }
                ctx.fillStyle = '#3a3a40';
                ctx.fillRect(x, y, tileSize, 1);
                ctx.fillRect(x, y, 1, tileSize);
                if (def.stroke) {
                    ctx.strokeStyle = def.stroke;
                    ctx.lineWidth = 1;
                    ctx.strokeRect(x, y, tileSize, tileSize);
                }
            } else if (def.detail === 'dot') {
                ctx.fillStyle = '#fafaf9';
                ctx.fillRect(x, y, tileSize, tileSize);
                ctx.fillStyle = '#e8e4e0';
                ctx.fillRect(x + 2, y + 6, 12, 1);
                ctx.fillRect(x + 6, y + 2, 1, 12);
            } else if (def.detail === 'books') {
                const colors = ['#c0392b', '#2980b9', '#27ae60', '#16a085'];
                colors.forEach((c, i) => {
                    ctx.fillStyle = c;
                    ctx.fillRect(x + 1 + i * 4, y, 2, 10);
                });
                ctx.fillStyle = 'rgba(0,0,0,0.3)';
                ctx.fillRect(x, y + tileSize - 2, tileSize, 2);
            } else if (def.detail === 'student') {
                ctx.fillStyle = '#166534';
                ctx.fillRect(x + 4, y + 6, 8, 8);
                ctx.fillStyle = '#fbcfe8';
                ctx.beginPath();
                ctx.arc(x + 8, y + 5, 2.5, 0, Math.PI * 2);
                ctx.fill();
            } else if (def.detail === 'goal') {
                ctx.fillStyle = '#eab308';
                ctx.beginPath();
                ctx.arc(x + 8, y + 8, 4, 0, Math.PI * 2);
                ctx.fill();
            } else if (def.detail === 'gym') {
                ctx.fillStyle = '#fbbf24';
                ctx.font = 'bold 10px monospace';
                ctx.fillText('GYM', x + 2, y + 13);
            } else if (def.char.startsWith('P')) {
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                if (def.char === 'P>') { ctx.moveTo(x+3,y+8); ctx.lineTo(x+13,y+8); ctx.lineTo(x+9,y+4); ctx.moveTo(x+13,y+8); ctx.lineTo(x+9,y+12); }
                if (def.char === 'Pv') { ctx.moveTo(x+8,y+3); ctx.lineTo(x+8,y+13); ctx.lineTo(x+4,y+9); ctx.moveTo(x+8,y+13); ctx.lineTo(x+12,y+9); }
                if (def.char === 'P<') { ctx.moveTo(x+13,y+8); ctx.lineTo(x+3,y+8); ctx.lineTo(x+7,y+4); ctx.moveTo(x+3,y+8); ctx.lineTo(x+7,y+12); }
                if (def.char === 'P^') { ctx.moveTo(x+8,y+13); ctx.lineTo(x+8,y+3); ctx.lineTo(x+4,y+7); ctx.moveTo(x+8,y+3); ctx.lineTo(x+12,y+7); }
                ctx.stroke();
            } else if (def.detail === 'staff') {
                ctx.fillStyle = '#3b82f6';
                ctx.fillRect(x + 5, y + 5, 6, 8);
                ctx.fillStyle = '#fbcfe8';
                ctx.beginPath();
                ctx.arc(x + 8, y + 3, 2.5, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = '#000';
                ctx.beginPath();
                ctx.arc(x + 8, y + 4, 1, 0, Math.PI);
                ctx.stroke();
            } else if (def.detail === 'reception') {
                ctx.fillStyle = '#1e3a8a';
                ctx.fillRect(x, y, tileSize, tileSize);
                ctx.fillStyle = '#3b82f6';
                ctx.fillRect(x + 2, y + 2, tileSize - 4, 4);
            } else if (def.detail === 'entryGate') {
                ctx.fillStyle = '#2d5a27';
                ctx.fillRect(x, y, tileSize, tileSize);
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 1;
                ctx.strokeRect(x + 3, y + 3, tileSize - 6, tileSize - 6);
                ctx.fillStyle = '#00ff00';
                ctx.beginPath();
                ctx.moveTo(x + 4, y + 8);
                ctx.lineTo(x + 12, y + 8);
                ctx.lineTo(x + 9, y + 4);
                ctx.moveTo(x + 12, y + 8);
                ctx.lineTo(x + 9, y + 12);
                ctx.fill();
            } else if (def.detail === 'exitGate') {
                ctx.fillStyle = '#7f1d1d';
                ctx.fillRect(x, y, tileSize, tileSize);
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 1;
                ctx.strokeRect(x + 3, y + 3, tileSize - 6, tileSize - 6);
                ctx.fillStyle = '#ff0000';
                ctx.beginPath();
                ctx.moveTo(x + 12, y + 8);
                ctx.lineTo(x + 4, y + 8);
                ctx.lineTo(x + 7, y + 4);
                ctx.moveTo(x + 4, y + 8);
                ctx.lineTo(x + 7, y + 12);
                ctx.fill();
            } else if (def.detail === 'plant') {
                ctx.fillStyle = '#8B4513';
                ctx.fillRect(x + 4, y + 10, 8, 6);
                ctx.fillStyle = '#2d5a27';
                ctx.beginPath();
                ctx.arc(x + 8, y + 7, 5, 0, Math.PI * 2);
                ctx.fill();
            } else if (def.detail === 'rival') {
                ctx.fillStyle = '#dc2626';
                ctx.fillRect(x + 5, y + 5, 6, 8);
                ctx.fillStyle = '#fbcfe8';
                ctx.beginPath();
                ctx.arc(x + 8, y + 3, 2.5, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = '#000';
                ctx.beginPath();
                ctx.arc(x + 8, y + 4, 1, 0, Math.PI);
                ctx.stroke();
            }

            if (!this.tileIndexMap) this.tileIndexMap = {};
            this.tileIndexMap[def.char] = index;
        });

        this.textures.addSpriteSheet('tileset', canvas, {
            frameWidth: tileSize,
            frameHeight: tileSize
        });
    }

    generatePlayerSpritesheet() {
        const frameWidth = 16;
        const frameHeight = 16;
        const directions = ['down', 'left', 'right', 'up'];
        const framesPerDir = 3;
        const totalFrames = directions.length * framesPerDir;
        const canvas = document.createElement('canvas');
        canvas.width = frameWidth * totalFrames;
        canvas.height = frameHeight;
        const ctx = canvas.getContext('2d');

        directions.forEach((dir, dIdx) => {
            for (let f = 0; f < framesPerDir; f++) {
                const frameIdx = dIdx * framesPerDir + f;
                const x = frameIdx * frameWidth;
                const y = 0;

                ctx.fillStyle = '#2563eb';
                ctx.beginPath();
                ctx.arc(x + 8, y + 10, 5, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = '#ffffff';
                ctx.fillRect(x + 3, y + 2, 10, 2);
                ctx.fillRect(x + 7, y + 1, 2, 4);

                if (f === 1) {
                    ctx.fillStyle = '#2563eb';
                    ctx.fillRect(x + 6, y + 12, 2, 2);
                } else if (f === 2) {
                    ctx.fillStyle = '#2563eb';
                    ctx.fillRect(x + 10, y + 12, 2, 2);
                }
            }
        });

        this.textures.addSpriteSheet('player_walk', canvas, {
            frameWidth: frameWidth,
            frameHeight: frameHeight
        });
    }
}