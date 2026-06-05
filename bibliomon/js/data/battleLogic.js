// ── BATTLE LOGIC (ported from Phase 5) ──────────────────────────────────────

function queueMsg(msg) {
    if (window.gameState.battle) window.gameState.battle.log.push(msg);
}

function advanceLog() {
    const b = window.gameState.battle;
    if (!b) return;
    if (b.log.length > 0) {
        b.currentMsg = b.log.shift();
        b.menuMode = 'message';
    } else {
        b.currentMsg = '';
        if (b.battleOver) {
            window.gameState.mode = 'walk';
            window.gameState.battle = null;
            return;
        }
        if (b.playerBook.currentHP <= 0) processPlayerFaint();
        else if (b.opponent.currentHP <= 0) processOpponentFaint();
        else { b.menuMode = 'main'; b.selectionIdx = 0; }
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
    queueMsg(`${attName} used ${move.name}!`);

    if (move.effect !== 'neverMiss' && Math.random() > move.accuracy) {
        queueMsg('But it missed!');
        return;
    }

    let dmgResult = calculateDamage(move, attacker, defender, atkStages, defStages);

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

        if (hits > 1) queueMsg(`Hit ${hits} times! Total damage: ${totalDmg}.`);
        else queueMsg(`Dealt ${totalDmg} damage.`);

        if (dmgResult.eff > 1) queueMsg('Super effective!');
        if (dmgResult.eff < 1) queueMsg('Not very effective…');

        if (move.effect === 'recoil33') {
            let rec = Math.floor(totalDmg * 0.33);
            attacker.currentHP = Math.max(0, attacker.currentHP - rec);
            queueMsg(`${attName} took ${rec} recoil damage!`);
        }
        if (move.effect === 'drain50') {
            let drn = Math.floor(totalDmg * 0.50);
            attacker.currentHP = Math.min(attacker.maxHP, attacker.currentHP + drn);
            queueMsg(`${attName} restored ${drn} HP.`);
        }
    }

    if (defender.currentHP > 0 && move.effect) {
        const randRoll = Math.random();
        if (move.effect === 'lowerSpDef' && randRoll < 0.10 && defStages.spDef > -6) { defStages.spDef--; queueMsg(`${defName}'s Sp. Def fell!`); }
        if (move.effect === 'raiseAtk' && atkStages.atk < 6) { atkStages.atk++; queueMsg(`${attName}'s Attack rose!`); }
        if (move.effect === 'lowerAtk' && defStages.atk > -6) { defStages.atk--; queueMsg(`${defName}'s Attack fell!`); }
        if (move.effect === 'overdue10' && randRoll < 0.10) {
            if (isAttackerPlayer) { if (!window.gameState.battle.opponentOverdue) { window.gameState.battle.opponentOverdue = true; queueMsg(`${defName} is Overdue!`); } }
            else { if (!window.gameState.battle.playerOverdue) { window.gameState.battle.playerOverdue = true; queueMsg(`${defName} is Overdue!`); } }
        }
        if (move.effect === 'raiseDef' && atkStages.def < 6) { atkStages.def++; queueMsg(`${attName}'s Defense rose!`); }
        if (move.effect === 'raiseSpAtk' && atkStages.spAtk < 6) { atkStages.spAtk++; queueMsg(`${attName}'s Sp. Atk rose!`); }
        if (move.effect === 'heal25') { let hl = Math.floor(attacker.maxHP * 0.25); attacker.currentHP = Math.min(attacker.maxHP, attacker.currentHP + hl); queueMsg(`${attName} restored ${hl} HP.`); }
        if (move.effect === 'raiseSpd2' && atkStages.spd < 6) { atkStages.spd = Math.min(6, atkStages.spd + 2); queueMsg(`${attName}'s Speed sharply rose!`); }
        if (move.effect === 'dot12.5') {
            if (isAttackerPlayer) { if (!window.gameState.battle.opponentOverdue) { window.gameState.battle.opponentOverdue = true; queueMsg(`${defName} is now Overdue!`); } }
            else { if (!window.gameState.battle.playerOverdue) { window.gameState.battle.playerOverdue = true; queueMsg(`${defName} is now Overdue!`); } }
        }
        if (move.effect === 'confuse' && randRoll < 0.20) {
            if (isAttackerPlayer) { if (!window.gameState.battle.opponentConfused) { window.gameState.battle.opponentConfused = true; window.gameState.battle.opponentConfusedTurns = Math.floor(Math.random() * 4) + 1; queueMsg(`${defName} became confused!`); } }
            else { if (!window.gameState.battle.playerConfused) { window.gameState.battle.playerConfused = true; window.gameState.battle.playerConfusedTurns = Math.floor(Math.random() * 4) + 1; queueMsg(`${defName} became confused!`); } }
        }
    }
}

function executeBattleTurn(playerMoveId) {
    const b = window.gameState.battle;
    const pBook = b.playerBook;
    const oBook = b.opponent;
    const oMoveId = oBook.moves[Math.floor(Math.random() * oBook.moves.length)];
    const pSpeed = getModifiedStat(pBook, b.playerStages, 'spd');
    const oSpeed = getModifiedStat(oBook, b.opponentStages, 'spd');
    let playerFirst = pSpeed > oSpeed || (pSpeed === oSpeed && Math.random() < 0.5);

    function handleConfusion(isPlayer) {
        const name = isPlayer ? pBook.name : oBook.name;
        const book = isPlayer ? pBook : oBook;
        queueMsg(`${name} is confused…`);
        if (Math.random() < 0.5) {
            let selfDmg = Math.floor(((((2 * book.level / 5 + 2) * 40 * (book.stats.atk / book.stats.def)) / 50) + 2) * 0.9);
            book.currentHP = Math.max(0, book.currentHP - selfDmg);
            queueMsg(`It hurt itself in confusion! Took ${selfDmg} damage.`);
            return false;
        }
        return true;
    }

    if (playerFirst) {
        let act = true;
        if (b.playerConfused) { b.playerConfusedTurns--; if (b.playerConfusedTurns <= 0) { b.playerConfused = false; queueMsg(`${pBook.name} snapped out!`); } else act = handleConfusion(true); }
        if (act && pBook.currentHP > 0) executeMove(playerMoveId, pBook, oBook, b.playerStages, b.opponentStages, pBook.name, oBook.name, true);
        if (oBook.currentHP > 0) {
            let oAct = true;
            if (b.opponentConfused) { b.opponentConfusedTurns--; if (b.opponentConfusedTurns <= 0) { b.opponentConfused = false; queueMsg(`${oBook.name} snapped out!`); } else oAct = handleConfusion(false); }
            if (oAct && oBook.currentHP > 0) executeMove(oMoveId, oBook, pBook, b.opponentStages, b.playerStages, oBook.name, pBook.name, false);
        }
    } else {
        let oAct = true;
        if (b.opponentConfused) { b.opponentConfusedTurns--; if (b.opponentConfusedTurns <= 0) { b.opponentConfused = false; queueMsg(`${oBook.name} snapped out!`); } else oAct = handleConfusion(false); }
        if (oAct && oBook.currentHP > 0) executeMove(oMoveId, oBook, pBook, b.opponentStages, b.playerStages, oBook.name, pBook.name, false);
        if (pBook.currentHP > 0) {
            let act = true;
            if (b.playerConfused) { b.playerConfusedTurns--; if (b.playerConfusedTurns <= 0) { b.playerConfused = false; queueMsg(`${pBook.name} snapped out!`); } else act = handleConfusion(true); }
            if (act && pBook.currentHP > 0) executeMove(playerMoveId, pBook, oBook, b.playerStages, b.opponentStages, pBook.name, oBook.name, true);
        }
    }

    if (pBook.currentHP > 0 && b.playerOverdue) { let fine = Math.floor(pBook.maxHP / 8); pBook.currentHP = Math.max(0, pBook.currentHP - fine); queueMsg(`${pBook.name} took ${fine} overdue damage!`); }
    if (oBook.currentHP > 0 && b.opponentOverdue) { let fine = Math.floor(oBook.maxHP / 8); oBook.currentHP = Math.max(0, oBook.currentHP - fine); queueMsg(`${oBook.name} took ${fine} overdue damage!`); }

    advanceLog();
}

function processPlayerFaint() {
    const b = window.gameState.battle;
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
        advanceLog();
        // blackout handled by BattleScene after messages
    }
}

function processOpponentFaint() {
    const b = window.gameState.battle;
    if (b.processingFaint || b.battleOver) return;
    b.processingFaint = true;

    queueMsg(`${b.opponent.name} was defeated!`);

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
                book.maxHP = baseTemplate.baseStats.hp + Math.floor(baseTemplate.baseStats.hp * 0.10 * (book.level - 1));
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
                    book.maxHP = nextTemplate.baseStats.hp + Math.floor(nextTemplate.baseStats.hp * 0.10 * (book.level - 1));
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
    if (b.type === 'trainer') { queueMsg("Can't borrow a trainer's book!"); advanceLog(); return; }
    let opp = b.opponent;
    let rate = ((3 * opp.maxHP - 2 * opp.currentHP) * opp.catchRate) / (3 * opp.maxHP);
    if (Math.random() * 100 < rate) {
        queueMsg(`Gotcha! ${opp.name} was checked out!`);
        if (window.gameState.backpack.length < 6) window.gameState.backpack.push(opp);
        else window.gameState.libraryAccount.push(opp);
        b.battleOver = true;
        advanceLog();
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