const rarities = {
    common: 50, // Note that this is not included in the if statement, but must equal 100 - the rest of the rarities
    uncommon: 39,
    rare: 10,
    legendary: 1
}

const piebotColor = '#be1a34';

const columns = [
    'pieCount',
    'muffinCount',
    'potatoCount',
    'pizzaCount',
    'iceCreamCount',
    'cakeCount',
    'brownieCount',
    'chocolateCount',
    'sandwichCount',
    'pastaCount',
    'fishCount',
    'trashCount'
]

/**
 * Gets a random integer between a given range, both inclusive
 * @param {*} min The lowest number possible
 * @param {*} max The highest number possible
 * @returns randomized number
 */
function GetRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min); // The maximum and minimum are inclusive
}

/**
 * Calculates true based on a given percentage
 * @param {*} percentage The percent to calculate by
 * @returns True | False
 */
function PercentTrue(percentage) {
    return GetRandomInt(1, 100) <= percentage; 
}

/**
 * Returns common, uncommon, rare, or legendary based on the rarity of each category
 * @returns string rarity
 */
function CalculateFoodRarity() {
    const num = GetRandomInt(1, 100);
    if (num <= rarities.legendary) return 'legendary'; // Does not use else ifs because it returns
    if (num <= rarities.rare + rarities.legendary) return 'rare';
    if (num <= rarities.uncommon + rarities.rare + rarities.legendary) return 'uncommon';
    return 'common';
}

module.exports = {
    piebotColor,
    columns,
    GetRandomInt,
    PercentTrue,
    CalculateFoodRarity
}