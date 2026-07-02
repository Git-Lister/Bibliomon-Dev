// ═══════════════════════════════════════════════════════════════════════════
//  EventQueue – sequential script engine for cut‑scenes and NPC movement
// ═══════════════════════════════════════════════════════════════════════════
class EventQueue {
    constructor(scene) {
        this.scene = scene;          // reference to OverworldScene
        this.queue = [];            // array of actions
        this.running = false;
        this.finishedCallback = null;
        
    }

    // Add an action that moves an NPC sprite step‑by‑step along a tile path
    moveNpc(npc, tilePath, stepDuration = 100) {
        this.queue.push((next) => {
            let index = 0;
            const moveNext = () => {
                if (index >= tilePath.length) {
                    next();   // path complete
                    return;
                }
                const target = tilePath[index];
                this.scene.tweens.add({
                    targets: npc,
                    x: target.x * 32 + 16,
                    y: target.y * 32 + 16,
                    duration: stepDuration,
                    ease: 'Linear',
                    onComplete: () => {
                        index++;
                        moveNext();
                    }
                });
            };
            moveNext();
        });
        return this;   // allow chaining
    }

    // Show a dialogue message and wait for it to close
    message(text, choices = null) {
        this.queue.push((next) => {
            if (choices) {
                // launch with choices – the callback fires after a choice is made
                this.scene.scene.launch('Dialogue', {
                    text: text,
                    choices: choices,
                    choiceCallback: () => {
                        next();   // continue after choice
                    }
                });
            } else {
                this.scene.scene.launch('Dialogue', {
                    text: text,
                    callback: () => {
                        next();   // continue after closing
                    }
                });
            }
            if (this.scene.scene.isActive('Overworld')) {
                this.scene.scene.pause();
            }
        });
        return this;
    }

    // Wait a number of milliseconds
    wait(ms) {
        this.queue.push((next) => {
            this.scene.time.delayedCall(ms, next);
        });
        return this;
    }

    // Run a custom function
    run(func) {
        this.queue.push((next) => {
            func();
            next();
        });
        return this;
    }

    // Start executing the queue
    start(onComplete = null) {
        this.finishedCallback = onComplete;
        this.running = true;
        this.processNext();
    }

    processNext() {
        if (this._paused) return
        if (this.queue.length === 0) {
            this.running = false;
            if (this.finishedCallback) this.finishedCallback();
            return;
        }
        const action = this.queue.shift();
        action(() => this.processNext());
    }

    pause() {
    this._paused = true;
    }

    resume() {
        this._paused = false;
        this.processNext();   // continue processing the queue
    }
}