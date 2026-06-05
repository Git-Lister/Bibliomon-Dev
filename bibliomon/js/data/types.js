const TYPE_CHART = {
    arts_humanities: { business_law: 2, science_engineering: 0.5 },
    business_law: { health_education: 2, arts_humanities: 0.5 },
    health_education: { science_engineering: 2, business_law: 0.5 },
    science_engineering: { arts_humanities: 2, health_education: 0.5 }
};

const STAT_MULTIPLIERS = { '-6':2/8, '-5':2/7, '-4':2/6, '-3':2/5, '-2':2/4, '-1':2/3, '0':1, '1':1.5, '2':2, '3':2.5, '4':3, '5':3.5, '6':4 };