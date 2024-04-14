const Canvas = require('@napi-rs/canvas');
const os = require('os');

const rarities = {
    common: 50, // Note that this is not included in the if statement, but must equal 100 - the rest of the rarities
    uncommon: 39,
    rare: 10,
    legendary: 1
}

const debugMode = 0;

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

function IsOnPi() {
    // linux = pi
    // windows = win32
    return os.platform() == "linux";
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

    padding = 3;
    paddingColor = "";

    fillColor = "";

    fontSize = '16px';
    font = 'roboto'
    textColor = "white";
    textWrap = Table.TextWrap.overflow;
    
    horizontalAlignment = Table.TextAlignment.left;
    verticalAlignment = Table.TextAlignment.center;

    constructor(rows, columns) {

        Canvas.GlobalFonts.registerFromPath("/home/pi/.fonts/gg sans Regular.ttf", "gg sans")
        Canvas.GlobalFonts.registerFromPath("/home/pi/.fonts/gg sans SemiBold.ttf", "gg sans bold")

        this.rows = rows;
        this.columns = columns;

        this.table = new Array(rows.length); // initalize table to empty array

        var cumulativeHeight = 0;
        for(var i = 0; i < this.rows.length; i++) {
            var cumulativeWidth = 0;
            this.table[i] = new Array(this.columns.length); // Adds an array of column length size (array of arrays)
            for(var j = 0; j < this.columns.length; j++) {
                this.table[i][j] = new Cell(this, cumulativeWidth + this.padding*i, cumulativeHeight * this.padding*i); // set each column of this "row" to a new cell, as well as sets the top left coordinates for each cell
                cumulativeWidth += this.columns[j];
            }
            cumulativeHeight += this.rows[i];
        }

        var _width = 0;
        this.columns.forEach(value => { _width += value });
        this.width = _width + this.padding*(this.columns.length-1);

        var _height = 0;
        this.rows.forEach(value => { _height += value });
        this.height = _height + this.padding*(this.rows.length-1);
    }

    GetCell(rowIndex, colIndex) { return this.table[rowIndex][colIndex]; }

    GetRowCount() { return this.rows.length; }
    GetColumnCount() { return this.columns.length; }

    GetCellCoords(rowIndex, colIndex) {
        return {
            x: this.GetCell(rowIndex, colIndex).x,
            y: this.GetCell(rowIndex, colIndex).y
        };
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

        // Run through and do all the clearing/filling of the background first, so as to not overrite any text or images
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
                cumulativeWidth += this.columns[j];
            }
            cumulativeHeight += this.rows[i];
        }

        cumulativeHeight = 0;
        for(var i = 0; i < this.rows.length; i++) {
            var cumulativeWidth = 0;
            for(var j = 0; j < this.columns.length; j++) {
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
                    var printText = this.GetCell(i, j).text.toString().replace(/[^\x00-\x7F]/g, "").trim();

                    context.font = this.GetCell(i, j).fontSize + " " + this.GetCell(i, j).font;
                    context.fillStyle = this.GetCell(i, j).textColor;

                    if(this.GetCell(i, j).textWrap == Table.TextWrap.clamp) {
                        if(context.measureText(printText).width > this.columns[j]) {
                            while(context.measureText(printText).width > this.columns[j]) printText = printText.slice(0, -1);
                            printText = printText.slice(0, -2) + "...";
                        }
                    }
                    else if(this.GetCell(i, j).textWrap == Table.TextWrap.scale) {
                        var scaledFontSize = this.GetCell(i, j).fontSize; // starts at the cell's font size, rather than the max size it could be (row height)
                        context.font = scaledFontSize + " " + this.GetCell(i, j).font;
                        while(context.measureText(printText).width > this.columns[j]) {
                            context.font = --scaledFontSize + " " + this.GetCell(i, j).font;
                        }
                    }

                    var verticalOffset = this.rows[i]; // bottom
                    if(this.GetCell(i, j).verticalAlignment == Table.TextAlignment.center) verticalOffset = this.rows[i]/2 + context.measureText(printText).actualBoundingBoxAscent/2
                    else if(this.GetCell(i, j).verticalAlignment == Table.TextAlignment.top) verticalOffset = context.measureText(printText).actualBoundingBoxAscent;

                    var horizontalOffset = 0; // left
                    if(this.GetCell(i, j).horizontalAlignment == Table.TextAlignment.center) horizontalOffset = this.columns[j]/2 - context.measureText(printText).width/2;
                    else if(this.GetCell(i, j).horizontalAlignment == Table.TextAlignment.right) horizontalOffset = this.columns[j] - context.measureText(printText).width;

                    context.textAlign = this.GetCell(i, j).horizontalAlignment;
                    
                    context.measureText(printText).actualBoundingBoxAscent;

                    context.fillText(printText, cumulativeWidth + horizontalOffset + this.padding*j + this.GetCell(i, j).posOffset[0], cumulativeHeight + verticalOffset + this.padding*i + this.GetCell(i, j).posOffset[1]);
                }
                cumulativeWidth += this.columns[j];
            }
            cumulativeHeight += this.rows[i];
        }
    }
    
    // #region Clear Functions

    ClearTable(context) {
        for(var i = 0; i < this.rows.length; i++) {
            for(var j = 0; j < this.columns.length; j++) {
                // first draws fill, then image, then text... order indicates layers basically, so to make fill the background, it draws first.
                context.clearRect(this.GetCellCoords(i, j).x, this.GetCellCoords(i, j).y, this.columns[j], this.rows[i]);
                this.GetCell(i, j).text = "";
                this.GetCell(i, j).image = "";
            }
        }
    }

    ClearRow(context, rowIndex) {
        // this.table[i] = new Array(this.columns.length); // Adds an array of column length size (array of arrays)
        for(var j = 0; j < this.columns.length; j++) {
            context.clearRect(this.GetCellCoords(rowIndex, j).x, this.GetCellCoords(rowIndex, j).y, this.columns[j], this.rows[rowIndex]);
            this.GetCell(rowIndex, j).text = "";
            this.GetCell(rowIndex, j).image = "";
        }
    }

    ClearCol(context, colIndex) {
        // this.table[i] = new Array(this.columns.length); // Adds an array of column length size (array of arrays)
        for(var i = 0; i < this.columns.length; i++) {
            context.clearRect(this.GetCellCoords(i, colIndex).x, this.GetCellCoords(i, colIndex).y, this.columns[j], this.rows[i]);
            this.GetCell(i, colIndex).text = "";
            this.GetCell(i, colIndex).image = "";
        }
    }

    ClearCell(context, rowIndex, colIndex) {
        context.clearRect(this.GetCellCoords(rowIndex, colIndex).x, this.GetCellCoords(rowIndex, colIndex).y, this.columns[j], this.rows[i]);
        this.GetCell(rowIndex, colIndex).text = "";
        this.GetCell(rowIndex, colIndex).image = "";
    }

    // #endregion

    // #region SetTable Functions

    SetTableStyle(fontSize, font) {
        this.fontSize = fontSize;
        this.font = font;

        for(var i = 0; i < this.rows.length; i++) {
            for(var j = 0; j < this.columns.length; j++) {
                this.GetCell(i, j).fontSize = fontSize;
                this.GetCell(i, j).font = font;
            }
        }
    }

    SetTableAlignment(horizontalAlignment, verticalAlignment) {
        this.horizontalAlignment = horizontalAlignment;
        this.verticalAlignment = verticalAlignment;

        for(var i = 0; i < this.rows.length; i++) {
            for(var j = 0; j < this.columns.length; j++) {
                this.GetCell(i, j).horizontalAlignment = horizontalAlignment;
                this.GetCell(i, j).verticalAlignment = verticalAlignment;
            }
        }
    }

    SetTableColor(fillColor, textColor) {
        this.fillColor = fillColor;
        this.textColor = textColor;

        for(var i = 0; i < this.rows.length; i++) {
            for(var j = 0; j < this.columns.length; j++) {
                this.GetCell(i, j).fillColor = fillColor;
                this.GetCell(i, j).textColor = textColor;
            }
        }
    }

    SetTableTextWrap(wrapping) {
        this.textWrap = wrapping;

        for(var i = 0; i < this.rows.length; i++) {
            for(var j = 0; j < this.columns.length; j++) {
                this.GetCell(i, j).textWrap = wrapping;
            }
        }
    }

    // #endregion

    // #region SetRow Functions

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

    SetRowStyle(rowIndex, fontSize, font) {
        if(rowIndex > this.rows.length-1) rowIndex = this.rows.length-1;
        if(rowIndex < 0) rowIndex = 0;
        
        for(var j = 0; j < this.columns.length; j++) {
            this.GetCell(rowIndex, j).fontSize = fontSize;
            this.GetCell(rowIndex, j).font = font;
        }
    }

    SetRowAlignment(rowIndex, horizontalAlignment, verticalAlignment) {
        for(var j = 0; j < this.columns.length; j++) {
            this.GetCell(rowIndex, j).horizontalAlignment = horizontalAlignment;
            this.GetCell(rowIndex, j).verticalAlignment = verticalAlignment;
        }
    }

    SetRowColor(rowIndex, fillColor, textColor) {
        if(rowIndex > this.rows.length-1) rowIndex = this.rows.length-1;
        if(rowIndex < 0) rowIndex = 0;

        for(var j = 0; j < this.columns.length; j++) {
            this.GetCell(rowIndex, j).fillColor = fillColor;
            this.GetCell(rowIndex, j).textColor = textColor;
        }
    }

    // #endregion

    // #region SetColumn Functions

    ClearColumn(colIndex) {
        // this.table[i] = new Array(this.columns.length); // Adds an array of column length size (array of arrays)
        for(var i = 0; i < this.rows.length; i++) {
            this.table[i][colIndex] = new Cell(this); // set each column of this "row" to a new cell
        }
    }

    SetColumnTextWrap(colIndex, wrapping) {
        for(var i = 0; i < this.rows.length; i++) {
            this.GetCell(i, colIndex).textWrap = wrapping;
        }
    }

    SetColumnText(colIndex, textArr) {
        for(var i = 0; i < this.rows.length; i++) {
            this.GetCell(i, colIndex).text = textArr[i] ?? "";
        }
    }

    SetColumnAlignment(colIndex, horizontalAlignment, verticalAlignment) {
        for(var i = 0; i < this.rows.length; i++) {
            this.GetCell(i, colIndex).horizontalAlignment = horizontalAlignment;
            this.GetCell(i, colIndex).verticalAlignment = verticalAlignment;
        }
    }

    SetColumnStyle(colIndex, fontSize, font) {
        if(colIndex > this.columns.length-1) colIndex = this.columns.length-1;
        if(colIndex < 0) colIndex = 0;

        for(var i = 0; i < this.rows.length; i++) {
            this.GetCell(i, colIndex).fontSize = fontSize;
            this.GetCell(i, colIndex).font = font;
        }
    }

    SetColumnColor(colIndex, fillColor, textColor) {
        if(colIndex > this.columns.length-1) colIndex = this.columns.length-1;
        if(colIndex < 0) colIndex = 0;

        for(var i = 0; i < this.rows.length; i++) {
            this.GetCell(i, colIndex).fillColor = fillColor;
            this.GetCell(i, colIndex).textColor = textColor;
        }
    }

    // #endregion

    // #region SetCell Functions

    ClearCell(rowIndex, colIndex) {
        this.GetCell(rowIndex, colIndex) = new Cell(this);
    }

    SetCellText(rowIndex, colIndex, text) {
        this.GetCell(rowIndex, colIndex).text = text;
    }

    SetCellTextWrap(rowIndex, colIndex, wrapping) {
        this.GetCell(rowIndex, colIndex).textWrap = wrapping;
    }

    SetCellStyle(rowIndex, colIndex, fontSize, font) {
        if(rowIndex > this.rows.length-1) rowIndex = this.rows.length-1;
        if(rowIndex < 0) rowIndex = 0;
        if(colIndex > this.columns.length-1) colIndex = this.columns.length-1;
        if(colIndex < 0) colIndex = 0;

        this.GetCell(rowIndex, colIndex).fontSize = fontSize;
        this.GetCell(rowIndex, colIndex).font = font;
    }

    SetCellAlignment(rowIndex, colIndex, horizontalAlignment, verticalAlignment) {
        this.GetCell(rowIndex, colIndex).horizontalAlignment = horizontalAlignment;
        this.GetCell(rowIndex, colIndex).verticalAlignment = verticalAlignment;
    }

    SetCellTextOffset(rowIndex, colIndex, xOffset, yOffset) {
        this.GetCell(rowIndex, colIndex).posOffset = [xOffset, yOffset];
    }

    SetCellColor(rowIndex, colIndex, fillColor, textColor) {
        if(rowIndex > this.rows.length-1) rowIndex = this.rows.length-1;
        if(rowIndex < 0) rowIndex = 0;
        if(colIndex > this.columns.length-1) colIndex = this.columns.length-1;
        if(colIndex < 0) colIndex = 0;

        this.GetCell(rowIndex, colIndex).fillColor = fillColor;
        this.GetCell(rowIndex, colIndex).textColor = textColor;
    }

    SetCellImage(rowIndex, colIndex, path, mode = "fit", clip = false) {
        this.GetCell(rowIndex, colIndex).image = path;
        this.GetCell(rowIndex, colIndex).mode = mode;
        this.GetCell(rowIndex, colIndex).clip = clip;
    }

    // #endregion
}

class Cell {
    x = 0;
    y = 0;
    posOffset = [0, 0];

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

    constructor(table, x, y) {
        this.fontSize = table.fontSize;
        this.font = table.font;
        this.fillColor = table.fillColor;
        this.textColor = table.textColor;
        this.textWrap = table.textWrap;
        this.horizontalAlignment = table.horizontalAlignment;
        this.verticalAlignment = table.verticalAlignment;

        this.x = x;
        this.y = y;
        this.posOffset = [0, 0];
    }
}

module.exports = {
    IsOnPi,
    debugMode,
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