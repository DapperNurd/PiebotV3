const Canvas = require('@napi-rs/canvas');

const rarities = {
    common: 50, // Note that this is not included in the if statement, but must equal 100 - the rest of the rarities
    uncommon: 39,
    rare: 10,
    legendary: 1
}

const currentTriviaSeason = 2;
const previousTriviaDates = `Season ${currentTriviaSeason-1}: Jan 05, 2024 - Mar 31, 2024`;
const currentTriviaDates = `Season ${currentTriviaSeason}: Apr 01, 2024 - Jun 30, 2024`;

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

class Column {
    width;
    alignment;
    constructor(width, alignment = "left") {
        this.width = width;
        this.alignment = alignment;
    }
}

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
    const miliseconds = Math.round(timeInMS%1000/10);
    const seconds = totalSeconds%60;
    const minutes = (totalSeconds-seconds)/60;
    return [minutes + "m", seconds.toString() + "s", miliseconds.toString() + "ms"];
}

function FormatTimeLeadingZeroes(timeInMS) {
    const totalSeconds = Math.round(timeInMS/1000);
    const miliseconds = Math.round(timeInMS%1000/10);
    const seconds = totalSeconds%60;
    const minutes = (totalSeconds-seconds)/60;
    return [`${minutes}m`, `${TrailingZeroes(seconds, 2)}s`, `${TrailingZeroes(miliseconds, 2)}ms`];
}

function TrailingZeroes(str, outputLength) {
    var rtn = str;
    for(i = 0; i < outputLength-str.toString().length; i++) {
        rtn = "0" + rtn;
    }
    return rtn;
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

// These are basically enums

class Table {

    static TextAlignment = {
        left: 0,
        right: 1,
        center: 2,
        bottom: 3,
        top: 4
    };

    static ImageSize = {
        fit: 0,
        stretch: 1,
    };
    
    static TextWrap = {
        clamp: 0,
        scale: 1,
        overflow: 2
    };

    rows = [];
    columns = [];

    width = 0;
    height = 0;

    table = [];

    padding = 4;
    paddingColor = "";

    fillColor = "";

    fontSize = '16px';
    font = 'roboto'
    textColor = "white";
    textWrap = Table.TextWrap.clamp;
    
    horizontalAlignment = Table.TextAlignment.left;
    verticalAlignment = Table.TextAlignment.center;

    constructor(rows, columns) {

        Canvas.GlobalFonts.registerFromPath("src\\fonts\\gg sans Regular.ttf", "gg sans")
        Canvas.GlobalFonts.registerFromPath("src\\fonts\\gg sans SemiBold.ttf", "gg sans bold")

        this.rows = rows;
        this.columns = columns;

        this.table = new Array(rows.length); // initalize table to empty array

        for(var i = 0; i < this.rows.length; i++) {
            this.table[i] = new Array(this.columns.length); // Adds an array of column length size (array of arrays)
            for(var j = 0; j < this.columns.length; j++) {
                this.table[i][j] = new Cell(this); // set each column of this "row" to a new cell
            }
        }

        var _width = 0;
        this.columns.forEach(value => { _width += value });
        this.width = _width + this.padding*(this.columns.length-1);

        var _height = 0;
        this.rows.forEach(value => { _height += value });
        this.height = _height + this.padding*(this.rows.length-1);
    }

    GetCell(rowIndex, colIndex) {
        return this.table[rowIndex][colIndex];
    }

    PrintTable() {
        for(var i = 0; i < this.rows.length; i++) {
            var msg = "";
            for(var j = 0; j < this.columns.length; j++) {
                msg += (this.GetCell(i, j).height) + ", ";
            }
        }
    }

    async DrawTable(context) {
        var cumulativeHeight = 0;

        if(this.paddingColor != "") {
            context.fillStyle = this.paddingColor;
            context.fillRect(0, 0, this.width, this.height);
        }

        for(var i = 0; i < this.rows.length; i++) {
            var cumulativeWidth = 0;
            for(var j = 0; j < this.columns.length; j++) {
                // first draws fill, then image, then text... order indicates layers basically, so to make fill the background, it draws first.
                context.clearRect(cumulativeWidth + this.padding*j, cumulativeHeight + this.padding*i, this.columns[j], this.rows[i]);
                if(this.GetCell(i, j).fillColor != "") {
                    context.font = this.GetCell(i, j).fontSize + " " + this.GetCell(i, j).font;
                    context.fillStyle = this.GetCell(i, j).fillColor;

                    context.fillRect(cumulativeWidth + this.padding*j, cumulativeHeight + this.padding*i, this.columns[j], this.rows[i]);
                }
                if(this.GetCell(i, j).image != "") {
                    const pic = await Canvas.loadImage(this.GetCell(i, j).image);
                    
                    const smallerCellSide = (this.rows[i] < this.columns[j]) ? this.rows[i] : this.columns[j];

                    const imgRatio = pic.width / pic.height;
                    const cellRatio = this.columns[j] / this.rows[i];

                    context.save();

                    // stretch
                    var imgHeight = this.rows[i];
                    var imgWidth = this.columns[j];

                    if(this.GetCell(i, j).mode != Table.ImageSize.stretch) { // stretch, or undefined
                        imgHeight = (imgRatio > cellRatio) ? this.columns[j]/imgRatio : this.rows[i];
                        imgWidth =  (imgRatio > cellRatio) ? this.columns[j] : this.rows[i]*imgRatio;
                    }

                    var verticalOffset = this.rows[i] - imgHeight; // bottom
                    if(this.GetCell(i, j).verticalAlignment == Table.TextAlignment.center) verticalOffset = verticalOffset/2;
                    else if(this.GetCell(i, j).verticalAlignment == Table.TextAlignment.top) verticalOffset = 0;

                    var horizontalOffset = this.columns[j] - imgWidth; // right
                    if(this.GetCell(i, j).horizontalAlignment == Table.TextAlignment.center) horizontalOffset = horizontalOffset/2;
                    else if(this.GetCell(i, j).horizontalAlignment == Table.TextAlignment.left) horizontalOffset = 0;

                    if(this.GetCell(i, j).clip) {
                        context.beginPath();
                        context.arc(cumulativeWidth + this.padding*j + imgWidth/2 + horizontalOffset, cumulativeHeight + this.padding*i + imgHeight/2 + verticalOffset, smallerCellSide/2, 0, Math.PI * 2, true);
                        context.clip();
                        // context.stroke(); // maybe add this as some sort of option? idk
                    }

                    context.drawImage(pic, cumulativeWidth + this.padding*j + horizontalOffset, cumulativeHeight + this.padding*i + verticalOffset, imgWidth, imgHeight); // stretch

                    context.restore();
                }
                if(this.GetCell(i, j).text != "") {
                    var printText = this.GetCell(i, j).text.replace(/[^\x00-\x7F]/g, "").trim();

                    if(this.GetCell(i, j).textWrap == Table.TextWrap.clamp) {
                        // change printText
                    }
                    else if(this.GetCell(i, j).textWrap == Table.TextWrap.clamp) {
                        // change fontSize
                    }
                    
                    context.font = this.GetCell(i, j).fontSize + " " + this.GetCell(i, j).font;
                    context.fillStyle = this.GetCell(i, j).textColor;

                    var verticalOffset = this.rows[i]; // bottom
                    if(this.GetCell(i, j).verticalAlignment == Table.TextAlignment.center)verticalOffset = this.rows[i]/2 + context.measureText(printText).actualBoundingBoxAscent/2
                    else if(this.GetCell(i, j).verticalAlignment == Table.TextAlignment.top) verticalOffset = context.measureText(printText).actualBoundingBoxAscent;

                    var horizontalOffset = 0; // left
                    if(this.GetCell(i, j).horizontalAlignment == Table.TextAlignment.center) horizontalOffset = this.columns[j]/2;
                    else if(this.GetCell(i, j).horizontalAlignment == Table.TextAlignment.right) horizontalOffset = this.columns[j];

                    context.textAlign = this.GetCell(i, j).horizontalAlignment;
                    
                    context.measureText(printText).actualBoundingBoxAscent;

                    context.fillText(printText, cumulativeWidth + horizontalOffset + this.padding*j, cumulativeHeight + verticalOffset + this.padding*i);
                }
                cumulativeWidth += this.columns[j];
            }
            cumulativeHeight += this.rows[i];
        }
    }

    SetRowText(rowIndex, textArr) {
        for(var j = 0; j < this.columns.length; j++) {
            this.GetCell(rowIndex, j).text = textArr[j] ?? "";
        }
    }

    SetRowTextWrap(rowIndex, wrapping) {
        for(var j = 0; j < this.columns.length; j++) {
            this.GetCell(rowIndex, j).textWrap = wrapping;
        }
    }

    SetCellText(rowIndex, colIndex, text) {
        this.GetCell(rowIndex, colIndex).text = text;
    }

    SetCellTextWrap(rowIndex, colIndex, wrapping) {
        this.GetCell(rowIndex, colIndex).textWrap = wrapping;
    }

    SetTableStyle(fontSize, font) {
        for(var i = 0; i < this.rows.length; i++) {
            for(var j = 0; j < this.columns.length; j++) {
                this.GetCell(i, j).fontSize = fontSize;
                this.GetCell(i, j).font = font;
            }
        }
    }

    SetTableAlignment(horizontalAlignment, verticalAlignment) {
        for(var i = 0; i < this.rows.length; i++) {
            for(var j = 0; j < this.columns.length; j++) {
                this.GetCell(i, j).horizontalAlignment = horizontalAlignment;
                this.GetCell(i, j).verticalAlignment = verticalAlignment;
            }
        }
    }

    SetTableColor(fillColor, textColor) {
        for(var i = 0; i < this.rows.length; i++) {
            for(var j = 0; j < this.columns.length; j++) {
                this.GetCell(i, j).fillColor = fillColor;
                this.GetCell(i, j).textColor = textColor;
            }
        }
    }

    SetTableTextWrap(wrapping) {
        for(var i = 0; i < this.rows.length; i++) {
            for(var j = 0; j < this.columns.length; j++) {
                this.GetCell(i, j).textWrap = wrapping;
            }
        }
    }

    SetRowStyle(index, fontSize, font) {
        if(index > this.rows.length-1) index = this.rows.length-1;
        if(index < 0) index = 0;
        
        for(var j = 0; j < this.columns.length; j++) {
            this.table[index][j].fontSize = fontSize;
            this.table[index][j].font = font;
        }
    }

    SetRowAlignment(index, horizontalAlignment, verticalAlignment) {
        for(var j = 0; j < this.columns.length; j++) {
            this.table[index][j].horizontalAlignment = horizontalAlignment;
            this.table[index][j].verticalAlignment = verticalAlignment;
        }
    }

    SetRowColor(index, fillColor, textColor) {
        if(index > this.rows.length-1) index = this.rows.length-1;
        if(index < 0) index = 0;

        for(var j = 0; j < this.columns.length; j++) {
            this.table[index][j].fillColor = fillColor;
            this.table[index][j].textColor = textColor;
        }
    }

    SetCellStyle(rowIndex, colIndex, fontSize, font) {
        if(rowIndex > this.rows.length-1) rowIndex = this.rows.length-1;
        if(rowIndex < 0) rowIndex = 0;
        if(colIndex > this.columns.length-1) colIndex = this.columns.length-1;
        if(colIndex < 0) colIndex = 0;

        this.table[rowIndex][colIndex].fontSize = fontSize;
        this.table[rowIndex][colIndex].font = font;
    }

    SetCellAlignment(rowIndex, colIndex, horizontalAlignment, verticalAlignment) {
        this.table[rowIndex][colIndex].horizontalAlignment = horizontalAlignment;
        this.table[rowIndex][colIndex].verticalAlignment = verticalAlignment;
    }

    SetCellColor(rowIndex, colIndex, fillColor, textColor) {
        if(rowIndex > this.rows.length-1) rowIndex = this.rows.length-1;
        if(rowIndex < 0) rowIndex = 0;
        if(colIndex > this.columns.length-1) colIndex = this.columns.length-1;
        if(colIndex < 0) colIndex = 0;

        this.table[rowIndex][colIndex].fillColor = fillColor;
        this.table[rowIndex][colIndex].textColor = textColor;
    }

    SetCellImage(rowIndex, colIndex, path, mode = "fit", clip = false) {
        this.table[rowIndex][colIndex].image = path;
        this.table[rowIndex][colIndex].mode = mode;
        this.table[rowIndex][colIndex].clip = clip;
    }
}

class Cell {
    fillColor;
    
    fontSize;
    font;
    textColor;
    text = "";
    textWrap;

    horizontalAlignment;
    verticalAlignment;
    
    image = "";
    mode = "fit";
    clip = true;

    constructor(table) {
        this.fontSize = table.fontSize;
        this.font = table.font;
        this.fillColor = table.fillColor;
        this.textColor = table.textColor;
        this.textWrap = table.textWrap;
        this.horizontalAlignment = table.horizontalAlignment;
        this.verticalAlignment = table.verticalAlignment;
    }
}

module.exports = {
    piebotColor,
    columns,
    Table,
    Column,
    currentTriviaSeason,
    currentTriviaDates,
    previousTriviaDates,
    GetRandomInt,
    PercentTrue,
    CalculateFoodRarity,
    FormatTime,
    FormatTimeLeadingZeroes,
    TrailingZeroes,
    StartsWithVowel,
    GetUserAccentColor
}