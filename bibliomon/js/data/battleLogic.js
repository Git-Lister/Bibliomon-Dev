// ── BATTLE LOGIC (ported from Phase 5, corrected flow) ──────────────────────

function queueMsg(msg) {
    if (window.gameState.battle) window.gameState.battle.log.push(msg);
}

function advanceLog() {
    const b = window.gameState.battle;
    if (!b) return;

    if (b.log.length > 0) {
        const next = b.log.shift();
        // Only strings go into the log now – no more functions
        b.currentMsg = next;
        b.menuMode = 'message';
        if (b.log.length > 0) {
            setTimeout(() => advanceLog(), 800);
        } else {
            b.waitingForInput = true;
        }
        if (window.gameState.activeBattleScene) {
            window.gameState.activeBattleScene.updateUI();
        }
    } else {
        b.currentMsg = '';
        b.waitingForInput = false;
        if (b.battleOver) {
            return;
        }
        if (b.playerBook.currentHP <= 0) {
            processPlayerFaint();
        } else if (b.opponent.currentHP <= 0) {
            processOpponentFaint();
        } else {
            b.menuMode = 'main';
            b.selectionIdx = 0;
        }
        if (window.gameState.activeBattleScene) {
            window.gameState.activeBattleScene.updateUI();
        }
    }
}

function getModifiedStat(book, stages, key) {
    const base = book.stats[key];
    const stage = stages[key] || 0;
    return base * (STAT_MULTIPLIERS[stage] || 1);
}

function calculateDamage(move, attacker, defender, atkStages, defStages) {
    if (move.power === 0) return { dmg: 0, eff: 1 };
    const isPhys = move.category === 'physical';
    const atkStat = isPhys ? getModifiedStat(attacker, atkStages, 'atk') : getModifiedStat(attacker, atkStages, 'spAtk');
    const defStat = isPhys ? getModifiedStat(defender, defStages, 'def') : getModifiedStat(defender, defStages, 'spDef');
    let baseDamage = ((((2 * attacker.level / 5 + 2) * move.power * (atkStat / defStat)) / 50) + 2);
    let effectiveness = 1;
    if (TYPE_CHART[move.type] && TYPE_CHART[move.type][defender.type] !== undefined) {
        effectiveness = TYPE_CHART[move.type][defender.type];
    }
    let rand = 0.85 + Math.random() * 0.15;
    return { dmg: Math.floor(baseDamage * effectiveness * rand), eff: effectiveness };
}

function executeMove(moveId, attacker, defender, atkStages, defStages, attName, defName, isAttackerPlayer) {
    if (attacker.currentHP <= 0) return;
    const move = MOVES[moveId];
    const b = window.gameState.battle;

    // Step 1 – Show the move name immediately
    b.currentMsg = `${attName} used ${move.name}!`;
    b.menuMode = 'message';
    if (window.gameState.activeBattleScene) {
        window.gameState.activeBattleScene.updateUI();
    }

    // Step 2 – After a short pause, apply damage and show the result
    setTimeout(() => {
        if (move.effect !== 'neverMiss' && Math.random() > move.accuracy) {
            b.currentMsg = 'But it missed!';
            if (window.gameState.activeBattleScene) window.gameState.activeBattleScene.updateUI();
            if (b._onMoveComplete) {
                const cb = b._onMoveComplete;
                b._onMoveComplete = null;
                cb();
            }
            return;
        }

        let dmgResult = calculateDamage(move, attacker, defender, atkStages, defStages);
        let msg = '';

        if (move.power > 0) {
            let hits = 1;
            if (move.effect === 'multi2to5') hits = Math.floor(Math.random() * 4) + 2;

            let totalDmg = 0;
            for (let h = 0; h < hits; h++) {
                let chunk = calculateDamage(move, attacker, defender, atkStages, defStages).dmg;
                defender.currentHP = Math.max(0, defender.currentHP - chunk);
                totalDmg += chunk;
                if (defender.currentHP <= 0) break;
            }

            msg = hits > 1 ? `Hit ${hits} times! Total damage: ${totalDmg}.` : `Dealt ${totalDmg} damage.`;

            if (dmgResult.eff > 1) msg += ' Super effective!';
            if (dmgResult.eff < 1) msg += ' Not very effective…';

            if (move.effect === 'recoil33') {
                let rec = Math.floor(totalDmg * 0.33);
                attacker.currentHP = Math.max(0, attacker.currentHP - rec);
                msg += ` ${attName} took ${rec} recoil damage!`;
            }
            if (move.effect === 'drain50') {
                let drn = Math.floor(totalDmg * 0.50);
                attacker.currentHP = Math.min(attacker.maxHP, attacker.currentHP + drn);
                msg += ` ${attName} restored ${drn} HP.`;
            }
        }

        // Status effects (only if defender survived)
        if (defender.currentHP > 0 && move.effect) {
            const randRoll = Math.random();
            if (move.effect === 'lowerSpDef' && randRoll < 0.10 && defStages.spDef > -6) { defStages.spDef--; }
            if (move.effect === 'raiseAtk' && atkStages.atk < 6) { atkStages.atk++; }
            if (move.effect === 'lowerAtk' && defStages.atk > -6) { defStages.atk--; }
            if (move.effect === 'overdue10' && randRoll < 0.10) {
                if (isAttackerPlayer) { if (!b.opponentOverdue) { b.opponentOverdue = true; msg += ` ${defName} is Overdue!`; } }
                else { if (!b.playerOverdue) { b.playerOverdue = true; msg += ` ${defName} is Overdue!`; } }
            }
            if (move.effect === 'raiseDef' && atkStages.def < 6) { atkStages.def++; }
            if (move.effect === 'raiseSpAtk' && atkStages.spAtk < 6) { atkStages.spAtk++; }
            if (move.effect === 'heal25') { let hl = Math.floor(attacker.maxHP * 0.25); attacker.currentHP = Math.min(attacker.maxHP, attacker.currentHP + hl); msg += ` ${attName} restored ${hl} HP.`; }
            if (move.effect === 'raiseSpd2' && atkStages.spd < 6) { atkStages.spd = Math.min(6, atkStages.spd + 2); }
            if (move.effect === 'dot12.5') {
                if (isAttackerPlayer) { if (!b.opponentOverdue) { b.opponentOverdue = true; msg += ` ${defName} is now Overdue!`; } }
                else { if (!b.playerOverdue) { b.playerOverdue = true; msg += ` ${defName} is now Overdue!`; } }
            }
            if (move.effect === 'confuse' && randRoll < 0.20) {
                if (isAttackerPlayer) { if (!b.opponentConfused) { b.opponentConfused = true; b.opponentConfusedTurns = Math.floor(Math.random() * 4) + 1; msg += ` ${defName} became confused!`; } }
                else { if (!b.playerConfused) { b.playerConfused = true; b.playerConfusedTurns = Math.floor(Math.random() * 4) + 1; msg += ` ${defName} became confused!`; } }
            }
        }

        b.currentMsg = msg;
        if (window.gameState.activeBattleScene) {
            window.gameState.activeBattleScene.updateUI();
        }

        // Step 3 – Signal completion so the turn continues
        if (b._onMoveComplete) {
            const cb = b._onMoveComplete;
            b._onMoveComplete = null;
            cb();
        }
    }, 1000); // 1 second to read the move name
}

function executeBattleTurn(playerMoveId) {
    const b = window.gameState.battle;
    const pBook = b.playerBook;
    const oBook = b.opponent;
    const oMoveId = oBook.moves[Math.floor(Math.random() * oBook.moves.length)];
    b.pendingOpponentMove = oMoveId;

    const pSpeed = getModifiedStat(pBook, b.playerStages, 'spd');
    const oSpeed = getModifiedStat(oBook, b.opponentStages, 'spd');
    const playerFirst = pSpeed > oSpeed || (pSpeed === oSpeed && Math.random() < 0.5);

    if (playerFirst) {
        executeSingleMove(playerMoveId, pBook, oBook, b.playerStages, b.opponentStages, pBook.name, oBook.name, true, () => {
            if (oBook.currentHP > 0) {
                executeOpponentTurn();
            } else {
                advanceLog();
            }
        });
    } else {
        executeSingleMove(oMoveId, oBook, pBook, b.opponentStages, b.playerStages, oBook.name, pBook.name, false, () => {
            if (pBook.currentHP > 0) {
                executeSingleMove(playerMoveId, pBook, oBook, b.playerStages, b.opponentStages, pBook.name, oBook.name, true, () => {
                    if (oBook.currentHP > 0) {
                        applyEndOfTurnEffects();
                        advanceLog();
                    } else {
                        advanceLog();
                    }
                });
            } else {
                applyEndOfTurnEffects();
                advanceLog();
            }
        });
    }
}
function showThinkingAndPause(bookName, callback) {
    const b = window.gameState.battle;
    b.currentMsg = `${bookName} is thinking…`;
    b.menuMode = 'message';
    if (window.gameState.activeBattleScene) {
        window.gameState.activeBattleScene.updateUI();
    }
    setTimeout(callback, 800);   // 0.8 second pause – feels natural
}

function executeOpponentTurn() {
    const b = window.gameState.battle;
    const pBook = b.playerBook;
    const oBook = b.opponent;
    const oMoveId = b.pendingOpponentMove;

    showThinkingAndPause(oBook.name, () => {
        executeSingleMove(oMoveId, oBook, pBook, b.opponentStages, b.playerStages, oBook.name, pBook.name, false, () => {
            applyEndOfTurnEffects();
            advanceLog();
        });
    });
}

function executeSingleMove(moveId, attacker, defender, atkStages, defStages, attName, defName, isAttackerPlayer, onComplete) {
    const b = window.gameState.battle;
    b._onMoveComplete = onComplete;

    const isPlayer = (attacker === b.playerBook);

    // Confusion check
    if (isPlayer ? b.playerConfused : b.opponentConfused) {
        const turnsLeft = isPlayer ? b.playerConfusedTurns : b.opponentConfusedTurns;
        if (turnsLeft > 0) {
            if (isPlayer) b.playerConfusedTurns--;
            else b.opponentConfusedTurns--;
        }
        if (turnsLeft <= 0) {
            if (isPlayer) b.playerConfused = false;
            else b.opponentConfused = false;
            b.currentMsg = `${attName} snapped out of confusion!`;
            if (window.gameState.activeBattleScene) window.gameState.activeBattleScene.updateUI();
            if (onComplete) onComplete();
            return;
        } else {
            b.currentMsg = `${attName} is confused…`;
            if (window.gameState.activeBattleScene) window.gameState.activeBattleScene.updateUI();
            if (Math.random() < 0.5) {
                let selfDmg = Math.floor(((((2 * attacker.level / 5 + 2) * 40 * (attacker.stats.atk / attacker.stats.def)) / 50) + 2) * 0.9);
                attacker.currentHP = Math.max(0, attacker.currentHP - selfDmg);
                b.currentMsg = `It hurt itself in confusion! Took ${selfDmg} damage.`;
                if (window.gameState.activeBattleScene) window.gameState.activeBattleScene.updateUI();
                if (attacker.currentHP <= 0) {
                    attacker.currentHP = 0;
                    b.currentMsg = `${attName} fainted!`;
                    if (window.gameState.activeBattleScene) window.gameState.activeBattleScene.updateUI();
                }
                if (onComplete) onComplete();
                return;
            }
        }
    }

    executeMove(moveId, attacker, defender, atkStages, defStages, attName, defName, isAttackerPlayer);
}

function applyEndOfTurnEffects() {
    const b = window.gameState.battle;
    const pBook = b.playerBook;
    const oBook = b.opponent;

    if (pBook.currentHP > 0 && b.playerOverdue) {
        let fine = Math.floor(pBook.maxHP / 8);
        pBook.currentHP = Math.max(0, pBook.currentHP - fine);
        queueMsg(`${pBook.name} took ${fine} overdue damage!`);
    }
    if (oBook.currentHP > 0 && b.opponentOverdue) {
        let fine = Math.floor(oBook.maxHP / 8);
        oBook.currentHP = Math.max(0, oBook.currentHP - fine);
        queueMsg(`${oBook.name} took ${fine} overdue damage!`);
    }
}

function processPlayerFaint() {
    const b = window.gameState.battle;
    if (b.battleOver || b.playerFaintProcessed) return;

    queueMsg(`${b.playerBook.name} fainted!`);
    let nextIdx = window.gameState.backpack.findIndex(bk => bk.currentHP > 0);
    if (nextIdx !== -1) {
        window.gameState.activeBookIndex = nextIdx;
        b.playerBook = window.gameState.backpack[nextIdx];
        b.participants.add(b.playerBook.id);
        b.playerStages = { atk:0, def:0, spAtk:0, spDef:0, spd:0 };
        b.playerConfused = false;
        b.playerOverdue = false;
        queueMsg(`Go! ${b.playerBook.name}!`);
        advanceLog();
    } else {
        queueMsg('All your books have fainted…');
        b.battleOver = true;
        b.playerFaintProcessed = true;
        advanceLog();
    }
}

function processOpponentFaint() {
    const b = window.gameState.battle;
    if (b.processingFaint || b.battleOver) return;
    b.processingFaint = true;

    queueMsg(`${b.opponent.name} was defeated!`);

    // Award Rise‑Points
    let creditsEarned = b.type === 'wild' ? b.opponent.level * 5 : b.trainer.books.reduce((a, c) => a + c.level, 0) * 10;
    window.gameState.credits += creditsEarned;
    queueMsg(`Earned ${creditsEarned} Rise‑Points!`);

    // XP award
    let rawXP = b.type === 'wild' ? b.opponent.level * 20 : b.trainer.books.reduce((a, c) => a + c.level, 0) * 15;
    let shares = Array.from(b.participants);
    let splitAmount = Math.floor(rawXP / shares.length);

    window.gameState.backpack.forEach(book => {
        if (shares.includes(book.id)) {
            book.currentXP += splitAmount;
            queueMsg(`${book.name} gained ${splitAmount} XP.`);

            while (book.currentXP >= book.xpToNext) {
                book.currentXP -= book.xpToNext;
                book.level++;
                book.xpToNext = 50 * book.level;

                let baseTemplate = ALL_BOOKS[book.id];
                const oldMax = book.maxHP;
                book.maxHP = baseTemplate.baseStats.hp + Math.floor(baseTemplate.baseStats.hp * 0.07 * (book.level - 1));
                book.stats.atk = baseTemplate.baseStats.atk + Math.floor(baseTemplate.baseStats.atk * 0.05 * (book.level - 1));
                book.stats.def = baseTemplate.baseStats.def + Math.floor(baseTemplate.baseStats.def * 0.05 * (book.level - 1));
                book.stats.spAtk = baseTemplate.baseStats.spAtk + Math.floor(baseTemplate.baseStats.spAtk * 0.05 * (book.level - 1));
                book.stats.spDef = baseTemplate.baseStats.spDef + Math.floor(baseTemplate.baseStats.spDef * 0.05 * (book.level - 1));
                book.stats.spd = baseTemplate.baseStats.spd + Math.floor(baseTemplate.baseStats.spd * 0.05 * (book.level - 1));
                book.currentHP += (book.maxHP - oldMax);

                queueMsg(`${book.name} grew to Level ${book.level}!`);

                if (baseTemplate.evolution && book.level >= baseTemplate.evolution.evolvesAtLevel) {
                    const nextFormId = baseTemplate.evolution.evolvedFormId;
                    const nextTemplate = ALL_BOOKS[nextFormId];
                    queueMsg(`What? ${book.name} is evolving!`);

                    let originalName = book.name;
                    book.id = nextFormId;
                    book.name = nextTemplate.name;

                    const priorMax = book.maxHP;
                    book.maxHP = nextTemplate.baseStats.hp + Math.floor(nextTemplate.baseStats.hp * 0.07 * (book.level - 1));
                    book.stats.atk = nextTemplate.baseStats.atk + Math.floor(nextTemplate.baseStats.atk * 0.05 * (book.level - 1));
                    book.stats.def = nextTemplate.baseStats.def + Math.floor(nextTemplate.baseStats.def * 0.05 * (book.level - 1));
                    book.stats.spAtk = nextTemplate.baseStats.spAtk + Math.floor(nextTemplate.baseStats.spAtk * 0.05 * (book.level - 1));
                    book.stats.spDef = nextTemplate.baseStats.spDef + Math.floor(nextTemplate.baseStats.spDef * 0.05 * (book.level - 1));
                    book.stats.spd = nextTemplate.baseStats.spd + Math.floor(nextTemplate.baseStats.spd * 0.05 * (book.level - 1));
                    book.currentHP = Math.round((book.currentHP / priorMax) * book.maxHP);

                    nextTemplate.moves.forEach(m => {
                        if (m.learnLevel <= book.level && !book.moves.includes(m.moveId)) {
                            if (book.moves.length < 4) book.moves.push(m.moveId);
                        }
                    });

                    queueMsg(`Congratulations! Your ${originalName} evolved into ${book.name}!`);
                }
            }
        }
    });

    if (b.type === 'trainer') {
        b.trainerBookIndex++;
        if (b.trainerBookIndex < b.trainer.books.length) {
            let nextData = b.trainer.books[b.trainerBookIndex];
            b.opponent = createBookInstance(nextData.id, nextData.level);
            b.opponentStages = { atk:0, def:0, spAtk:0, spDef:0, spd:0 };
            b.opponentConfused = false;
            b.opponentOverdue = false;
            queueMsg(`${b.trainer.name} sent out ${b.opponent.name}!`);
            b.processingFaint = false;
            advanceLog();
            return;
        } else {
            window.gameState.defeatedTrainers.push(b.trainer.id);
            queueMsg(`You defeated Trainer ${b.trainer.name}!`);
            b.battleOver = true;
            saveGameData();
        }
    } else {
        b.battleOver = true;
    }
    b.processingFaint = false;
    advanceLog();
}

function handleEscapeAttempt() {
    const b = window.gameState.battle;
    if (b.type === 'trainer') { queueMsg("Can't run from a trainer battle!"); advanceLog(); return; }
    if (Math.random() < 0.5) {
        queueMsg('Got away safely!');
        b.battleOver = true;
        advanceLog();
    } else {
        queueMsg("Can't escape!");
        const oMoveId = b.opponent.moves[Math.floor(Math.random() * b.opponent.moves.length)];
        executeMove(oMoveId, b.opponent, b.playerBook, b.opponentStages, b.playerStages, b.opponent.name, b.playerBook.name, false);
        advanceLog();
    }
}

function handleBorrowAttempt() {
    const b = window.gameState.battle;
    if (b.type === 'trainer') {
        queueMsg("Can't borrow a trainer's book!");
        advanceLog();
        return;
    }

    const opp = b.opponent;
    const catchRate = opp.catchRate || 100;
    const maxHP = opp.maxHP;
    const currentHP = opp.currentHP;
    const rate = ((3 * maxHP - 2 * currentHP) * catchRate) / (3 * maxHP);
    const success = Math.random() * 100 < rate;

    if (success) {
        queueMsg(`Gotcha! ${opp.name} was checked out!`);
        if (window.gameState.backpack.length < 6) {
            window.gameState.backpack.push(opp);
            queueMsg(`${opp.name} was added to your backpack.`);
        } else {
            window.gameState.libraryAccount.push(opp);
            queueMsg(`Backpack full! ${opp.name} was sent to your Library Account.`);
        }
        b.battleOver = true;
        advanceLog();
        setTimeout(() => {
            if (window.gameState.activeBattleScene) {
                window.gameState.activeBattleScene.returnToOverworld();
            }
        }, 2000);
    } else {
        queueMsg('Oh no! It broke free!');
        const oMoveId = b.opponent.moves[Math.floor(Math.random() * b.opponent.moves.length)];
        executeMove(oMoveId, b.opponent, b.playerBook, b.opponentStages, b.playerStages, opp.name, b.playerBook.name, false);
        advanceLog();
    }
}

function processDirectSwap(idx) {
    const b = window.gameState.battle;
    if (window.gameState.backpack[idx].currentHP <= 0) return;
    window.gameState.activeBookIndex = idx;
    b.playerBook = window.gameState.backpack[idx];
    b.participants.add(b.playerBook.id);
    queueMsg(`Come back! Go, ${b.playerBook.name}!`);
    b.playerStages = { atk:0, def:0, spAtk:0, spDef:0, spd:0 };
    b.playerConfused = false;
    b.playerOverdue = false;
    const oMoveId = b.opponent.moves[Math.floor(Math.random() * b.opponent.moves.length)];
    executeMove(oMoveId, b.opponent, b.playerBook, b.opponentStages, b.playerStages, b.opponent.name, b.playerBook.name, false);
    advanceLog();
}

function handleBattleItemUse(itemIndex) {
    const b = window.gameState.battle;
    const items = getUsableItemsList();
    if (itemIndex < 0 || itemIndex >= items.length) return;
    const item = items[itemIndex];
    const book = b.playerBook;
    if (book.currentHP <= 0) { queueMsg("Can't use items on a fainted book!"); advanceLog(); return; }
    let used = false;
    switch (item.itemId) {
        case 'potion': book.currentHP = Math.min(book.maxHP, book.currentHP + 20); queueMsg(`Used Potion! ${book.name} restored 20 HP.`); used = true; break;
        case 'super_potion': book.currentHP = Math.min(book.maxHP, book.currentHP + 50); queueMsg(`Used Super Potion! ${book.name} restored 50 HP.`); used = true; break;
        case 'awakening': b.playerConfused = false; b.playerConfusedTurns = 0; queueMsg(`Used Awakening! ${book.name} is no longer confused.`); used = true; break;
        case 'antidote': b.playerOverdue = false; queueMsg(`Used Antidote! ${book.name} is no longer overdue.`); used = true; break;
        case 'bookmark_item': book.currentHP = book.maxHP; queueMsg(`Used Bookmark! ${book.name} fully restored.`); used = true; break;
    }
    if (used) {
        item.qty--;
        if (item.qty <= 0) window.gameState.items = window.gameState.items.filter(i => i.itemId !== item.itemId);
        const oMoveId = b.opponent.moves[Math.floor(Math.random() * b.opponent.moves.length)];
        executeMove(oMoveId, b.opponent, b.playerBook, b.opponentStages, b.playerStages, b.opponent.name, b.playerBook.name, false);
        advanceLog();
    }
}

function getUsableItemsList() {
    return window.gameState.items.filter(item => item.qty > 0);
}