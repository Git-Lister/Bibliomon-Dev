const MOVES = {
    close_reading:   { name:"Close Reading", type:"arts_humanities", category:"physical", power:40, accuracy:1.0, effect:null },
    deconstruction:  { name:"Deconstruction", type:"arts_humanities", category:"special", power:50, accuracy:0.9, effect:"lowerSpDef" },
    rhetoric:        { name:"Rhetoric", type:"arts_humanities", category:"status", power:0, accuracy:1.0, effect:"raiseAtk" },
    case_study:      { name:"Case Study", type:"business_law", category:"physical", power:50, accuracy:0.95, effect:"confuse" },
    audit:           { name:"Audit", type:"business_law", category:"special", power:60, accuracy:1.0, effect:"recoil33" },
    negotiation:     { name:"Negotiation", type:"business_law", category:"status", power:0, accuracy:1.0, effect:"lowerAtk" },
    lab_experiment:  { name:"Lab Experiment", type:"science_engineering", category:"physical", power:60, accuracy:0.9, effect:"overdue10" },
    peer_review:     { name:"Peer Review", type:"science_engineering", category:"special", power:40, accuracy:1.0, effect:"raiseDef" },
    hypothesis:      { name:"Hypothesis", type:"science_engineering", category:"status", power:0, accuracy:1.0, effect:"raiseSpAtk" },
    clinical_trial:  { name:"Clinical Trial", type:"health_education", category:"physical", power:50, accuracy:0.95, effect:"drain50" },
    diagnosis:       { name:"Diagnosis", type:"health_education", category:"special", power:60, accuracy:1.0, effect:null },
    patient_care:    { name:"Patient Care", type:"health_education", category:"status", power:0, accuracy:1.0, effect:"heal25" },
    annotation:      { name:"Annotation", type:"normal", category:"physical", power:35, accuracy:1.0, effect:"multi2to5" },
    citation:        { name:"Citation", type:"normal", category:"special", power:40, accuracy:1.0, effect:"neverMiss" },
    speed_read:      { name:"Speed Read", type:"normal", category:"status", power:0, accuracy:1.0, effect:"raiseSpd2" },
    overdue_fine:    { name:"Overdue Fine", type:"normal", category:"status", power:0, accuracy:0.85, effect:"dot12.5" }
};