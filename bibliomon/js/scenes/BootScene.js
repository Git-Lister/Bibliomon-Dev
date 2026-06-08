class BootScene extends Phaser.Scene {
    constructor() {
        super('Boot');
    }

    preload() {
        // Nothing to load externally – we generate assets in create()
    }

    create() {
        this.generateTileset();
        this.generatePlayerSpritesheet();
        this.generateBookSprites();
        this.scene.start('Overworld');
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

    // Front sprites (opponent) – one per type
    types.forEach(type => {
        const canvas = document.createElement('canvas');
        canvas.width = frameWidth; canvas.height = frameHeight;
        const ctx = canvas.getContext('2d');
        // Book shape
        ctx.fillStyle = colors[type];
        ctx.fillRect(8, 4, 32, 40);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.strokeRect(8, 4, 32, 40);
        // Spine
        ctx.fillStyle = '#333333';
        ctx.fillRect(4, 8, 6, 32);
        // Face (simple)
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

    // Back sprite (player's book) – one generic, or per type? We'll do one generic for now.
    const backCanvas = document.createElement('canvas');
    backCanvas.width = frameWidth; backCanvas.height = frameHeight;
    const bCtx = backCanvas.getContext('2d');
    bCtx.fillStyle = '#8B4513';
    bCtx.fillRect(8, 4, 32, 40);
    bCtx.strokeStyle = '#ffffff';
    bCtx.lineWidth = 2;
    bCtx.strokeRect(8, 4, 32, 40);
    bCtx.fillStyle = '#333';
    bCtx.fillRect(38, 8, 6, 32); // spine on the right
    // Small face on back? No, just a back view – maybe a graduation cap?
    bCtx.fillStyle = '#ffffff';
    bCtx.fillRect(14, 2, 20, 4); // cap
    bCtx.fillRect(20, 0, 8, 4);
    this.textures.addImage('book_back', backCanvas);
}

    // ── Generate a 16×16 tileset with one tile per map character ──
    generateTileset() {
        const tileSize = 16;
        const cols = 16;  // enough columns for all our tile types
        const rows = 8;
        const canvas = document.createElement('canvas');
        canvas.width = cols * tileSize;
        canvas.height = rows * tileSize;
        const ctx = canvas.getContext('2d');


        // ── Tile mapping: index → map char ─────────────────────────────────────
        const tileDefs = [
            { char: '.', color: '#fafaf9', detail: 'dot'         },   // Carpet floor
            { char: 'W', color: '#27272a', stroke: '#18181b'    },   // Concrete wall
            { char: 'H', color: '#1e3a8a'                       },   // Help Desk counter (interactable)
            { char: 'K', color: '#065f46'                       },   // Kitchenette (heal + save)
            { char: 'S', color: '#7c2d12', detail: 'books'      },   // Bookshelf (wild encounter zone)
            { char: 'D', color: '#78350f'                       },   // Study door
            { char: 'T', color: '#fafaf9', detail: 'trainer'    },   // Trainer (NPC battle)
            { char: 'V', color: '#6b21a8'                       },   // Vending machine (gives Potion)
            { char: 'C', color: '#9a3412'                       },   // Café counter (gives Super Potion)
            { char: 'E', color: '#71717a'                       },   // Staircase (floor transition)
            { char: 'L', color: '#d4a574'                       },   // Library Account Terminal
            { char: 'B', color: '#7f1d1d'                       },   // Barrier (locked until puzzle solved)
            { char: 'X', color: '#fafaf9', detail: 'goal'       },   // Puzzle goal tile
            { char: 'G', color: '#4a1e1e', detail: 'gym'        },   // Gym entrance
            { char: 'P>', color: '#0ea5e9'                      },   // Spin tile (right arrow)
            { char: 'P<', color: '#0ea5e9'                      },   // Spin tile (left arrow)
            { char: 'P^', color: '#0ea5e9'                      },   // Spin tile (up arrow)
            { char: 'Pv', color: '#0ea5e9'                      },   // Spin tile (down arrow)
            { char: 'Z', color: '#fafaf9', detail: 'staff'      }    // Staff member (decorative)
        ];

        tileDefs.forEach((def, index) => {
            const col = index % cols;
            const row = Math.floor(index / cols);
            const x = col * tileSize;
            const y = row * tileSize;

            // Fill base colour
            ctx.fillStyle = def.color;
            ctx.fillRect(x, y, tileSize, tileSize);

            // Add detail
            if (def.char === 'W' && def.stroke) {
                ctx.strokeStyle = def.stroke;
                ctx.lineWidth = 1;
                ctx.strokeRect(x, y, tileSize, tileSize);
            } else if (def.detail === 'dot') {
                ctx.fillStyle = '#e7e5e4';
                ctx.fillRect(x + 4, y + 4, 1, 1);
            } else if (def.detail === 'books') {
                const colors = ['#c0392b', '#2980b9', '#27ae60', '#16a085'];
                colors.forEach((c, i) => {
                    ctx.fillStyle = c;
                    ctx.fillRect(x + 1 + i * 4, y, 2, 10);
                });
            } else if (def.detail === 'trainer') {
                ctx.fillStyle = '#dc2626';
                ctx.fillRect(x + 4, y + 4, 8, 8);
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
                // Draw arrow
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                if (def.char === 'P>') { ctx.moveTo(x + 3, y + 8); ctx.lineTo(x + 13, y + 8); ctx.lineTo(x + 9, y + 4); ctx.moveTo(x + 13, y + 8); ctx.lineTo(x + 9, y + 12); }
                if (def.char === 'Pv') { ctx.moveTo(x + 8, y + 3); ctx.lineTo(x + 8, y + 13); ctx.lineTo(x + 4, y + 9); ctx.moveTo(x + 8, y + 13); ctx.lineTo(x + 12, y + 9); }
                if (def.char === 'P<') { ctx.moveTo(x + 13, y + 8); ctx.lineTo(x + 3, y + 8); ctx.lineTo(x + 7, y + 4); ctx.moveTo(x + 3, y + 8); ctx.lineTo(x + 7, y + 12); }
                if (def.char === 'P^') { ctx.moveTo(x + 8, y + 13); ctx.lineTo(x + 8, y + 3); ctx.lineTo(x + 4, y + 7); ctx.moveTo(x + 8, y + 3); ctx.lineTo(x + 12, y + 7); }
                ctx.stroke();
            } else if (def.detail === 'staff') {
                // Friendly staff member
                ctx.fillStyle = '#3b82f6';  // blue uniform
                ctx.fillRect(x + 5, y + 5, 6, 8);
                ctx.fillStyle = '#fbcfe8';  // face
                ctx.beginPath();
                ctx.arc(x + 8, y + 3, 2.5, 0, Math.PI * 2);
                ctx.fill();
                // Smile
                ctx.strokeStyle = '#000';
                ctx.beginPath();
                ctx.arc(x + 8, y + 4, 1, 0, Math.PI);
                ctx.stroke();
            }

            // Store the tile index mapping
            if (!this.tileIndexMap) this.tileIndexMap = {};
            this.tileIndexMap[def.char] = index;
        });

        // Add to Phaser texture manager as a spritesheet
        this.textures.addSpriteSheet('tileset', canvas, {
            frameWidth: tileSize,
            frameHeight: tileSize
        });

        // Make mapping available globally
        window.tileIndexMap = this.tileIndexMap;
    }

    // ── Generate a 4-directional player walking spritesheet ──
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

                // Base body (blue circle)
                ctx.fillStyle = '#2563eb';
                ctx.beginPath();
                ctx.arc(x + 8, y + 10, 5, 0, Math.PI * 2);
                ctx.fill();

                // Cap (graduation cap)
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(x + 3, y + 2, 10, 2);
                ctx.fillRect(x + 7, y + 1, 2, 4);

                // Simple direction indicator (small offset for "step" frames)
                const offsets = [
                    { dx: 0, dy: 0 },  // frame 1: neutral
                    { dx: 1, dy: 0 },  // frame 2: shift right
                    { dx: -1, dy: 0 }  // frame 3: shift left
                ];
                const off = offsets[f];
                // Slightly move the cap or body? We'll keep it simple for now.
                // The spritesheet will just have identical frames, but we'll still use frame cycling.
                // For real, you'd draw different leg positions; here we'll just vary the cap slightly.
                if (f === 1) {
                    ctx.fillStyle = '#2563eb';
                    ctx.fillRect(x + 6, y + 12, 2, 2); // "foot"
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

        // Create animations
        directions.forEach((dir, dIdx) => {
            const start = dIdx * framesPerDir;
            const end = start + framesPerDir - 1;
            this.anims.create({
                key: `walk_${dir}`,
                frames: this.anims.generateFrameNumbers('player_walk', { start, end }),
                frameRate: 8,
                repeat: -1
            });
        });
    }
}