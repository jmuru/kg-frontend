export function findPosition(obj) {
    let curleft = 0, curtop = 0;
    if (obj.offsetParent) {
        do {
            curleft += obj.offsetLeft;
            curtop += obj.offsetTop;
        } while (obj = obj.offsetParent);
        return { x: curleft, y: curtop };
    }
    return undefined;
}

export function  rgbToHex(r,g,b) {
    if (r > 255 || g > 255 || b > 255)
        throw "Invalid color component";
    return ((r << 16) | (g << 8) | b).toString(16);
}

function buildEmptyMatrix(height) {
    var m = [];
    for (var i = 0; i < height; i++) {
        m.push([]);
    }
    return m
}

export function recordMappingMatrix(canvas) {
    let colorMatrix = buildEmptyMatrix(24);
    let context = canvas.getContext('2d');
    for (let height = 0; height < 24; height++ ){
        for (let index = 0; index < 24; index++) {
            let w = index * 10;
            let h = height * 10

            let p = context.getImageData(w, h, 9, 9).data;
            let hex = "#" + ("000000" + rgbToHex(p[0], p[1], p[2])).slice(-6);
            switch (hex) {
                case "#000000":
                    colorMatrix[height][index] = "outline";
                    break;
                case "#ffffff":
                    colorMatrix[height][index] = "empty";
                    break;
                default:
                    colorMatrix[height][index] = `color_${hex}`;
                    break;
            }
        }
    }
    return colorMatrix;
}