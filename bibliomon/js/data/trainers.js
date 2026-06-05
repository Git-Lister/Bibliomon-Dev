const GROUND_TRAINERS = [
    { id:"t1", name:"Fresher Fiona", dialogue:"I've been studying all week! Let's see if you prepared.", books:[{id:"norton_anthology_base",level:5},{id:"ways_of_seeing_base",level:5}] },
    { id:"t2", name:"Bookworm Ben", dialogue:"My items are late, but my theoretical framework is solid!", books:[{id:"company_law_base",level:6}] },
    { id:"t3", name:"Seminar Sam", dialogue:"Did you completely parse this week's technical reading assignment?", books:[{id:"thermo_base",level:4},{id:"human_body_base",level:5}] },
    { id:"t4", name:"Lit-Review Lucy", dialogue:"My bibliography is longer than your entire thesis proposal!", books:[{id:"norton_anthology_base",level:6}] },
    { id:"t5", name:"Lab-Partner Logan", dialogue:"Let's perform an empirical analysis on type weaknesses!", books:[{id:"thermo_base",level:6},{id:"econ_dummies_base",level:5}] },
    { id:"t6", name:"Cramming Chloe", dialogue:"The assessment begins in ten minutes! Clear the floor!", books:[{id:"human_body_base",level:7}] }
];

// Gym 1 trainers and leader
const GYM1_TRAINERS = [
    { id:"gym1_t1", name:"Archival Assistant Tom", dialogue:"I've catalogued every book in this section!", books:[ {id:"ways_of_seeing_base", level:8}, {id:"history_western_art_base", level:9} ] },
    { id:"gym1_t2", name:"Conservation Specialist Sue", dialogue:"Handle the manuscripts with care... and your team!", books:[ {id:"norton_anthology_base", level:9}, {id:"ways_of_seeing_base", level:10} ] }
];
const GYM1_LEADER = {
    id:"gym1_leader", name:"Head Archivist Miriam",
    dialogue:"You've navigated the stacks admirably. Now face the definitive collection!",
    books:[ {id:"norton_anthology_base", level:12}, {id:"ways_of_seeing_base", level:13}, {id:"history_western_art_base", level:14} ],
    defeatMessage:"Impressive research. You've earned the Archive Badge."
};

// Trainer map for ground floor (populated later)
window.gameState.trainerMap = {};