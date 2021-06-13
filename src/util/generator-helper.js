export function applyColorPalette(mapping, palette) {
    if (!mapping) {
        return [];
    }
    let paletteMap = {};
    paletteMap["empty"] = "#ffffff";
    paletteMap["outline"] = "#000000";
    paletteMap["pupils"] = "#fffffe";
    let paletteCopy = palette;
    let colorMapping = [];
    for (let i = 0; i < 24; i++) {
        const currentRow = mapping[i];
        currentRow.forEach(el => {
            if (!paletteCopy.length && !paletteMap.hasOwnProperty(el)) {
                paletteMap[el] = `#${Math.floor(Math.random()*16777215).toString(16)}`;
            }
            if (paletteMap.hasOwnProperty(el)) {
            } else {
                let rIndex = getRandomColorFromPalette(paletteCopy)
                paletteMap[el] = `#${paletteCopy[rIndex]}`;
                paletteCopy.splice(rIndex, 1);
            }
        });
    }
    colorMapping = applyColorMap(mapping, paletteMap);
    return colorMapping;
}

function getRandomColorFromPalette(palette) {
    let length = palette.length;
    return Math.floor(Math.random() * length);
}

function applyColorMap(map, pMap) {
    let final = [];
    for (let i = 0; i < 24; i++) {
        let transformRow = map[i].map(el => {
            return pMap[el];
        })
        final.push(transformRow);
    }
    return final
}

export function getBackgroundColorMap(bg) {
    const mapping = [];
    for (let i = 0; i < 24; i++) {
        mapping.push(bg[i])
    }
    return mapping;
}

export function mergeLayers(source, edit) {
    if (edit.length < 24) {
        return source;
    }
    let start = source;
    for (let index = 0; index < source.length; index++) {
        for (let j = 0; j < source.length; j++) {
            if (edit[index][j] == "#ffffff") {
                continue;
            } else {
                start[index][j] = edit[index][j];
            }
        }
    }
    return start;
}

export function redrawFromMatrix(colorMatrix, canvasContext) {
    for (var height = 0; height < 24; height++ ){
        for (let index = 0; index < 24; index++) {
            if (colorMatrix[height][index] === "#ffffff") {
                canvasContext.fillStyle = "#ffffff";
            } else {
                canvasContext.fillStyle = colorMatrix[height][index]
            }
            var w = index * 10;
            var h = height * 10
            canvasContext.fillRect(w, h, 10, 10);
        }
    }
}

function rowColorMarker(row) {
    let formatted = row.map(element => {
        if (element === "#ffffff") {
            return "empty";
        }
        return `color_${element}`;
    });
    return formatted;
}

export function convertCoordToObj(coord) {
    let coordObj = {};
    coord.map((row, index) => {
        coordObj[index] = rowColorMarker(row);
    });
    return coordObj
}