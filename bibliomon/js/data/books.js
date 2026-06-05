// ── BOOK DATA ────────────────────────────────────────────────────────────────
const ALL_BOOKS = {
    // Arts & Humanities
    norton_anthology_base: {
        id: "norton_anthology_base",
        name: "The Norton Anthology",
        type: "arts_humanities",
        baseStats: { hp: 45, atk: 45, def: 40, spAtk: 50, spDef: 50, spd: 40 },
        moves: [
            { moveId: "close_reading", learnLevel: 1 },
            { moveId: "rhetoric", learnLevel: 5 },
            { moveId: "deconstruction", learnLevel: 10 },
            { moveId: "citation", learnLevel: 15 }
        ],
        catchRate: 100
    },
    ways_of_seeing_base: {
        id: "ways_of_seeing_base",
        name: "Ways of Seeing",
        type: "arts_humanities",
        baseStats: { hp: 40, atk: 35, def: 30, spAtk: 60, spDef: 45, spd: 50 },
        moves: [
            { moveId: "deconstruction", learnLevel: 1 },
            { moveId: "close_reading", learnLevel: 1 },
            { moveId: "rhetoric", learnLevel: 6 },
            { moveId: "speed_read", learnLevel: 12 }
        ],
        catchRate: 100
    },
    history_western_art_base: {
        id: "history_western_art_base",
        name: "A History of Western Art",
        type: "arts_humanities",
        baseStats: { hp: 55, atk: 40, def: 45, spAtk: 35, spDef: 50, spd: 30 },
        moves: [
            { moveId: "close_reading", learnLevel: 1 },
            { moveId: "rhetoric", learnLevel: 4 },
            { moveId: "annotation", learnLevel: 8 },
            { moveId: "deconstruction", learnLevel: 13 }
        ],
        catchRate: 100
    },

    // Business & Law
    company_law_base: {
        id: "company_law_base",
        name: "Company Law: A Guide",
        type: "business_law",
        baseStats: { hp: 50, atk: 40, def: 55, spAtk: 35, spDef: 45, spd: 35 },
        moves: [
            { moveId: "case_study", learnLevel: 1 },
            { moveId: "negotiation", learnLevel: 5 },
            { moveId: "audit", learnLevel: 9 },
            { moveId: "citation", learnLevel: 14 }
        ],
        catchRate: 100
    },
    econ_dummies_base: {
        id: "econ_dummies_base",
        name: "Economics for Dummies",
        type: "business_law",
        baseStats: { hp: 45, atk: 35, def: 40, spAtk: 45, spDef: 40, spd: 55 },
        moves: [
            { moveId: "citation", learnLevel: 1 },
            { moveId: "case_study", learnLevel: 3 },
            { moveId: "speed_read", learnLevel: 8 },
            { moveId: "negotiation", learnLevel: 12 }
        ],
        catchRate: 100
    },
    marketing_mgmt_base: {
        id: "marketing_mgmt_base",
        name: "Marketing Management",
        type: "business_law",
        baseStats: { hp: 45, atk: 45, def: 40, spAtk: 50, spDef: 55, spd: 40 },
        moves: [
            { moveId: "case_study", learnLevel: 1 },
            { moveId: "negotiation", learnLevel: 4 },
            { moveId: "audit", learnLevel: 10 },
            { moveId: "overdue_fine", learnLevel: 15 }
        ],
        catchRate: 100
    },

    // Science & Engineering
    thermo_base: {
        id: "thermo_base",
        name: "Fundamentals of Thermodynamics",
        type: "science_engineering",
        baseStats: { hp: 40, atk: 35, def: 35, spAtk: 60, spDef: 45, spd: 40 },
        moves: [
            { moveId: "peer_review", learnLevel: 1 },
            { moveId: "hypothesis", learnLevel: 4 },
            { moveId: "lab_experiment", learnLevel: 9 },
            { moveId: "citation", learnLevel: 13 }
        ],
        catchRate: 100
    },
    algorithms_base: {
        id: "algorithms_base",
        name: "Introduction to Algorithms",
        type: "science_engineering",
        baseStats: { hp: 45, atk: 40, def: 35, spAtk: 50, spDef: 40, spd: 55 },
        moves: [
            { moveId: "citation", learnLevel: 1 },
            { moveId: "peer_review", learnLevel: 3 },
            { moveId: "speed_read", learnLevel: 7 },
            { moveId: "lab_experiment", learnLevel: 12 }
        ],
        catchRate: 100
    },
    eng_maths_base: {
        id: "eng_maths_base",
        name: "Engineering Mathematics",
        type: "science_engineering",
        baseStats: { hp: 50, atk: 55, def: 45, spAtk: 35, spDef: 40, spd: 30 },
        moves: [
            { moveId: "lab_experiment", learnLevel: 1 },
            { moveId: "annotation", learnLevel: 5 },
            { moveId: "hypothesis", learnLevel: 10 },
            { moveId: "close_reading", learnLevel: 14 }
        ],
        catchRate: 100
    },

    // Health & Education
    human_body_base: {
        id: "human_body_base",
        name: "The Human Body Book",
        type: "health_education",
        baseStats: { hp: 55, atk: 45, def: 50, spAtk: 35, spDef: 45, spd: 30 },
        moves: [
            { moveId: "clinical_trial", learnLevel: 1 },
            { moveId: "patient_care", learnLevel: 5 },
            { moveId: "diagnosis", learnLevel: 9 },
            { moveId: "citation", learnLevel: 14 }
        ],
        catchRate: 100
    },
    becoming_nurse_base: {
        id: "becoming_nurse_base",
        name: "Becoming a Nurse",
        type: "health_education",
        baseStats: { hp: 50, atk: 35, def: 55, spAtk: 40, spDef: 50, spd: 35 },
        moves: [
            { moveId: "patient_care", learnLevel: 1 },
            { moveId: "clinical_trial", learnLevel: 4 },
            { moveId: "diagnosis", learnLevel: 8 },
            { moveId: "negotiation", learnLevel: 12 }
        ],
        catchRate: 100
    },
    principles_ed_base: {
        id: "principles_ed_base",
        name: "Principles of Education",
        type: "health_education",
        baseStats: { hp: 45, atk: 40, def: 40, spAtk: 55, spDef: 60, spd: 30 },
        moves: [
            { moveId: "citation", learnLevel: 1 },
            { moveId: "diagnosis", learnLevel: 3 },
            { moveId: "patient_care", learnLevel: 7 },
            { moveId: "hypothesis", learnLevel: 13 }
        ],
        catchRate: 100
    }
};

// ── EVOLUTION CHAIN BUILDER ─────────────────────────────────────────────────
(function initializeEvolutionDatabase() {
    const keys = Object.keys(ALL_BOOKS);
    keys.forEach(key => {
        const base = ALL_BOOKS[key];
        const token = key.replace("_base", "");

        // Revised Edition (evolves at level 16 → annotated at 32)
        const revId = token + "_revised";
        if (!ALL_BOOKS[revId]) {
            ALL_BOOKS[revId] = {
                id: revId,
                name: base.name + " (Revised)",
                type: base.type,
                baseStats: {
                    hp: Math.round(base.baseStats.hp * 1.16),
                    atk: Math.round(base.baseStats.atk * 1.16),
                    def: Math.round(base.baseStats.def * 1.16),
                    spAtk: Math.round(base.baseStats.spAtk * 1.16),
                    spDef: Math.round(base.baseStats.spDef * 1.16),
                    spd: Math.round(base.baseStats.spd * 1.16)
                },
                moves: [...base.moves, { moveId: "speed_read", learnLevel: 16 }],
                catchRate: Math.max(10, base.catchRate - 30),
                evolution: { evolvesAtLevel: 32, evolvedFormId: token + "_annotated" }
            };
        }

        // Annotated Edition (final form)
        const annId = token + "_annotated";
        if (!ALL_BOOKS[annId]) {
            ALL_BOOKS[annId] = {
                id: annId,
                name: base.name + " (Annotated)",
                type: base.type,
                baseStats: {
                    hp: Math.round(base.baseStats.hp * 1.35),
                    atk: Math.round(base.baseStats.atk * 1.35),
                    def: Math.round(base.baseStats.def * 1.35),
                    spAtk: Math.round(base.baseStats.spAtk * 1.35),
                    spDef: Math.round(base.baseStats.spDef * 1.35),
                    spd: Math.round(base.baseStats.spd * 1.35)
                },
                moves: [
                    ...base.moves,
                    { moveId: "speed_read", learnLevel: 16 },
                    { moveId: "overdue_fine", learnLevel: 32 }
                ],
                catchRate: Math.max(5, base.catchRate - 60),
                evolution: null
            };
        }

        // Link base → revised
        base.evolution = { evolvesAtLevel: 16, evolvedFormId: revId };
    });
})();

// ── BOOK INSTANCE FACTORY ────────────────────────────────────────────────────
function createBookInstance(bookId, level) {
    const template = ALL_BOOKS[bookId];
    if (!template) return null;

    const hp = template.baseStats.hp + Math.floor(template.baseStats.hp * 0.10 * (level - 1));
    const inst = {
        id: bookId,
        name: template.name,
        type: template.type,
        level: level,
        maxHP: hp,
        currentHP: hp,
        currentXP: 0,
        xpToNext: 50 * level,
        catchRate: template.catchRate,
        baseStats: template.baseStats,
        stats: {
            atk: template.baseStats.atk + Math.floor(template.baseStats.atk * 0.05 * (level - 1)),
            def: template.baseStats.def + Math.floor(template.baseStats.def * 0.05 * (level - 1)),
            spAtk: template.baseStats.spAtk + Math.floor(template.baseStats.spAtk * 0.05 * (level - 1)),
            spDef: template.baseStats.spDef + Math.floor(template.baseStats.spDef * 0.05 * (level - 1)),
            spd: template.baseStats.spd + Math.floor(template.baseStats.spd * 0.05 * (level - 1))
        },
        moves: []
    };

    // Learn eligible moves up to current level
    let eligible = template.moves.filter(m => m.learnLevel <= level);
    eligible.sort((a, b) => b.learnLevel - a.learnLevel);
    inst.moves = eligible.slice(0, 4).map(m => m.moveId);
    return inst;
}