const rarities = {
    common: 50, // Note that this is not included in the if statement, but must equal 100 - the rest of the rarities
    uncommon: 39,
    rare: 10,
    legendary: 1
}

const currentTriviaSeason = 1;
const previousTriviaDates = `Season ${currentTriviaSeason}: Jan 05, 2024 - Mar 31, 2024`;
const currentTriviaDates = previousTriviaDates;//`Season ${currentTriviaSeason+1}: Apr 01, 2024 - Jun 30, 2024`;

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
 * @param {number} min The lowest number possible
 * @param {number} max The highest number possible
 * @returns randomized number
 */
function GetRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min); // The maximum and minimum are inclusive
}

/**
 * Calculates true based on a given percentage
 * @param {number} percentage The percent to calculate by
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

/**
 * Takes in a time in miliseconds and formats it to minutes and seconds as a string
 * @param {number} timeInMS 
 * @returns a string, formatted with minutes and seconds
 */
function FormatTime(timeInMS) {
    const totalSeconds = Math.round(timeInMS/1000);
    const miliseconds = timeInMS%1000;
    const seconds = totalSeconds%60;
    const minutes = (totalSeconds-seconds)/60;
    return (minutes <= 0) ? `${seconds}s` : `${minutes}m ${seconds}s ${miliseconds}ms`;
}

function StartsWithVowel(str) {
    return (str.startsWith("a") || str.startsWith("e") || str.startsWith("i") || str.startsWith("o") || str.startsWith("u"));
}

/**
 * Returns the color code for the given user
 * @param {User} user The user to get the color for
 * @returns The hexadecimal form of the user's accent color, or just piebotColor if null
 */
async function GetUserAccentColor(user) {
    const found = await user.fetch(true); // This for some reason makes it consistently be able to get accentColor
    return found.accentColor ?? piebotColor;
}

module.exports = {
    piebotColor,
    columns,
    currentTriviaSeason,
    currentTriviaDates,
    previousTriviaDates,
    GetRandomInt,
    PercentTrue,
    CalculateFoodRarity,
    FormatTime,
    StartsWithVowel,
    GetUserAccentColor
}