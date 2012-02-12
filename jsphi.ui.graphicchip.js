/**
 * Created by JetBrains WebStorm.
 * User: napthats
 * Date: 12/02/07
 * Time: 0:37
 */

var com;
if (!com) com = {};
if (!com.napthats) com.napthats = {};
if (!com.napthats.jsphi) com.napthats.jsphi = {};

(function() {
    var ns = com.napthats.jsphi;
    var MAP_CHIP_WIDTH = 32;
    var MAP_CHIP_HEIGHT = 48;
    var CHIP_SIZE = 32;
    var MAP_TILE_WIDTH = 32;
    var CHARA_TILE_HEIGHT = 4;
    var MAP_CHIP_ID_TO_TILE_ORD = {
        ' ': 0,
        'o': 5,
        ':': 1,
        '+': 2,
        'x': 14,
        '/': 32,
        '>': 33,
        'H': 8,
        '[': 11,
        '#': 7,
        'I': 9,
        '%': 15,
        '|': 13,
        'T': 3,
        '=': 10,
        '{': 12,
        '@': 6,
        '?': 47,
        //using 'unknown' chip for strage
        's': 47,
        //item
        'xi1': 37,
        'xi2': 37,
        'xi3': 37,
        'xi4': 37,
        'xi5': 37,
        'xi6': 37,
        'xi7': 37,
        '%i1': 38,
        '%i2': 38,
        '%i3': 38,
        '%i4': 38,
        '%i5': 38,
        '%i6': 38,
        '%i7': 38,
        'i1': 35,
        'i2': 35,
        'i3': 35,
        'i4': 35,
        'i5': 35,
        'i6': 35,
        'i7': 35,
        //board
        'b': 36,
        'B': 34
        //water have special method for draw
        //,'_': 4
    };
    var CHARA_CHIP_ID_TO_TILE_ORD = {
        'B': 0,
        'R': 1,
        'F': 2,
        'L': 3,
        'B*': 4,
        'R*': 5,
        'F*': 6,
        'L*': 7,
        'Bl': 0,
        'Rl': 1,
        'Fl': 2,
        'Ll': 3,
        'Br': 0,
        'Rr': 1,
        'Fr': 2,
        'Lr': 3
    };
    var CHIP_FILE_PREFIX = {
        'chara': 'chips/chara/',
        'map': 'chips/map/'
    };
    var CHIP_FILE_SUFFIX = {
        'chara': '.bmp',
        'map': '.bmp'
    };
    var DEFAULT_TILE_NAME = {
        'chara': 'PLAYER',
        'map': 'default'
    };

    ns.makeChipDrawer = function(_ctx) {
        var chipDrawer = {};
        var ctx = _ctx;
        var chipCanvasList = {};
        chipCanvasList['map'] = {};
        chipCanvasList['chara'] = {};
        var onloadFunc = function(){};

        chipDrawer.loadTileSheet = function(tileType, tileName) {
            var tileSheet = new Image();
            tileSheet.src = CHIP_FILE_PREFIX[tileType] + tileName + CHIP_FILE_SUFFIX[tileType];
            chipCanvasList[tileType][tileName] = {};
            chipCanvasList[tileType][tileName]['DUMMY'] = true;

            //make canvas after loading image
            if (tileType === 'map') {
                tileSheet.addEventListener('load', function() {
                    for (var chipId in MAP_CHIP_ID_TO_TILE_ORD) {
                        var chipCanvas = document.createElement('canvas').getContext('2d');
                        chipCanvas.width = MAP_CHIP_WIDTH;
                        chipCanvas.height = MAP_CHIP_HEIGHT;

                        //load image
                        var chipOrd = MAP_CHIP_ID_TO_TILE_ORD[chipId];
                        chipCanvas.drawImage(
                            tileSheet,
                            chipOrd % MAP_TILE_WIDTH * MAP_CHIP_WIDTH, Math.floor(chipOrd / MAP_TILE_WIDTH) * MAP_CHIP_HEIGHT,
                            MAP_CHIP_WIDTH, MAP_CHIP_HEIGHT,
                            0, 0,
                            MAP_CHIP_WIDTH, MAP_CHIP_HEIGHT
                        );
                        var chipImageData = chipCanvas.getImageData(0, 0, MAP_CHIP_WIDTH, MAP_CHIP_HEIGHT);

                        //load mask image
                        var maskCanvas = document.createElement('canvas').getContext('2d');
                        maskCanvas.drawImage(tileSheet,
                            (chipOrd + 16) % MAP_TILE_WIDTH * MAP_CHIP_WIDTH, Math.floor(chipOrd / MAP_TILE_WIDTH) * MAP_CHIP_HEIGHT,
                            MAP_CHIP_WIDTH, MAP_CHIP_HEIGHT,
                            0, 0,
                            MAP_CHIP_WIDTH, MAP_CHIP_HEIGHT
                        );
                        var maskImageData = maskCanvas.getImageData(0, 0, MAP_CHIP_WIDTH, MAP_CHIP_HEIGHT);

                        //mask with phi2 map chip masking rule
                        for (var j = 0; j < chipImageData.data.length / 4; j++) {
                            if (maskImageData.data[j * 4] === 0) {
                                chipImageData.data[j * 4 + 3] = 0;
                            }

                            //for change item color by item_type
                            if (chipImageData.data[j * 4] === 255 && (chipImageData.data[j * 4 + 1] !== 255 || chipImageData.data[j * 4 + 2] !== 255)) {
                                if (chipId === 'i5' || chipId === '%i5' || chipId === 'xi5') {
                                    chipImageData.data[j * 4] = 0;
                                    chipImageData.data[j * 4 + 1] = 255;
                                    chipImageData.data[j * 4 + 2] = 255;
                                }
                                else if (chipId === 'i3' || chipId === '%i3' || chipId === 'xi3') {
                                    chipImageData.data[j * 4] = 0;
                                    chipImageData.data[j * 4 + 1] = 128;
                                }
                                else if (chipId === 'i4' || chipId === '%i4' || chipId === 'xi4') {
                                    chipImageData.data[j * 4] = 0;
                                    chipImageData.data[j * 4 + 2] = 255;
                                }
                                else if (chipId === 'i1' || chipId === '%i1' || chipId === 'xi1') {
                                    chipImageData.data[j * 4 + 1] = 255;
                                }
                                else if (chipId === 'i2' || chipId === '%i2' || chipId === 'xi2') {
                                    chipImageData.data[j * 4] = 0;
                                    chipImageData.data[j * 4 + 1] = 0;
                                    chipImageData.data[j * 4 + 2] = 0;
                                }
                                else if (chipId === 'i6' || chipId === '%i6' || chipId === 'xi6') {
                                    chipImageData.data[j * 4] = 255;
                                    chipImageData.data[j * 4 + 1] = 0;
                                    chipImageData.data[j * 4 + 2] = 0;
                                }
                                else if (chipId === 'i7' || chipId === '%i7' || chipId === 'xi7') {
                                    chipImageData.data[j * 4] = 255;
                                    chipImageData.data[j * 4 + 1] = 255;
                                    chipImageData.data[j * 4 + 2] = 255;
                                }
                            }
                        }

                        chipCanvas.putImageData(chipImageData, 0, 0);
                        chipCanvasList[tileType][tileName][chipId] = chipCanvas.canvas;
                    }

                    //to draw grass under tree
                    var treeChipCanvas = chipCanvasList[tileType][tileName]['T'].getContext('2d');
                    treeChipCanvas.save();
                    treeChipCanvas.globalCompositeOperation = 'destination-over';
                    treeChipCanvas.drawImage(chipCanvasList[tileType][tileName][':'], 0, 0);
                    treeChipCanvas.restore();

                    //for separating water chip
                    var WATER_ORD_TO_SUFFIX = [0,1,2,3,4,5,6,7,8,9,'a','b','c'];
                    var WATER_ORD_TO_CHIP_ORD = [39,39,39,39,40,40,40,40,41,41,41,41,43];
                    for (var dirOrd = 0; dirOrd < 4; dirOrd++) {
                        for (var waterOrd = 0; waterOrd < WATER_ORD_TO_SUFFIX.length; waterOrd++) {
                            var waterChipCanvas = document.createElement('canvas').getContext('2d');
                            waterChipCanvas.width = MAP_CHIP_WIDTH;
                            waterChipCanvas.height = MAP_CHIP_HEIGHT;

                            waterChipCanvas.drawImage(
                                tileSheet,
                                WATER_ORD_TO_CHIP_ORD[waterOrd] % MAP_TILE_WIDTH * MAP_CHIP_WIDTH + (waterOrd % 2 ? MAP_CHIP_WIDTH / 2 : 0),
                                Math.floor(WATER_ORD_TO_CHIP_ORD[waterOrd] / MAP_TILE_WIDTH) * MAP_CHIP_HEIGHT + MAP_CHIP_HEIGHT / 3 + (waterOrd % 4 >= 2 ? MAP_CHIP_HEIGHT / 3 : 0),
                                MAP_CHIP_WIDTH / 2, MAP_CHIP_HEIGHT / 3,
                                dirOrd % 2 ? MAP_CHIP_WIDTH / 2 : 0, MAP_CHIP_HEIGHT / 3 + (dirOrd % 4 >= 2 ? MAP_CHIP_HEIGHT /3 : 0),
                                MAP_CHIP_WIDTH / 2, MAP_CHIP_HEIGHT / 3
                            );

                            chipCanvasList[tileType][tileName]['_' + dirOrd + WATER_ORD_TO_SUFFIX[waterOrd]] = waterChipCanvas.canvas;
                        }
                    }
                }, false);
            }
            else if (tileType === 'chara') {
                tileSheet.addEventListener('load', function() {
                    for (var chipId in CHARA_CHIP_ID_TO_TILE_ORD) {
                        for (var frame = 0; frame < 2; frame++) {
                            var chipCanvas = document.createElement('canvas').getContext('2d');
                            chipCanvas.width = CHIP_SIZE;
                            chipCanvas.height = CHIP_SIZE;

                            //fill transparent color for thin chip
                            chipCanvas.fillStyle = '#008080';
                            chipCanvas.fillRect(0, 0, CHIP_SIZE, CHIP_SIZE);

                            //load image
                            var chipOrd = CHARA_CHIP_ID_TO_TILE_ORD[chipId];
                            var isThin = chipOrd < 4;
                            var isLeft = chipId.length === 2 && chipId.charAt(1) === 'l';
                            var isRight = chipId.length === 2 && chipId.charAt(1) === 'r';
                            chipCanvas.drawImage(
                                tileSheet,
                                (Math.floor(chipOrd / CHARA_TILE_HEIGHT) + (frame === 1 ? 1 : 0)) * (isThin ? CHIP_SIZE / 2 : CHIP_SIZE), chipOrd % CHARA_TILE_HEIGHT * CHIP_SIZE,
                                (isThin ? CHIP_SIZE / 2 : CHIP_SIZE), CHIP_SIZE,
                                (isLeft ? 0 : isRight ? CHIP_SIZE / 2 : isThin ? CHIP_SIZE / 4 : 0), 0,
                                (isThin ? CHIP_SIZE / 2 : CHIP_SIZE), CHIP_SIZE
                            );

                            var chipImageData = chipCanvas.getImageData(0, 0, CHIP_SIZE, CHIP_SIZE);
                            //mask with phi character graphic masking rule
                            for (var i = 0; i < chipImageData.data.length / 4; i++) {
                                if (chipImageData.data[i*4] === 0 && chipImageData.data[i*4+1] === 128 && chipImageData.data[i*4+2] === 128) {
                                    chipImageData.data[i*4 + 3] = 0;
                                }
                            }

                            chipCanvas.putImageData(chipImageData, 0, 0);
                            chipCanvasList[tileType][tileName][chipId + frame] = chipCanvas.canvas;
                        }
                    }
                }, false);
            }

            return tileSheet;
        };

        chipDrawer.drawChip = function(tileType, tileName, chipId, x, y, w, h) {
            var drawTileName;
            //loading image completed
            if (chipCanvasList[tileType][tileName] && chipCanvasList[tileType][tileName][chipId]) {
                drawTileName = tileName;
            }
            //now loading or loading failed
            else if (chipCanvasList[tileType][tileName]) {
                drawTileName = DEFAULT_TILE_NAME[tileType];
            }
            //not yet
            else {
                drawTileName = DEFAULT_TILE_NAME[tileType];
                chipDrawer.loadTileSheet(tileType, tileName);
            }

            //draw separating water chips
            if (tileType === 'map' && chipId.charAt(0) === '_') {
                if (chipId.length !== 5) return;
                for (var i = 0; i < 4; i++) {
                    if (w && h) ctx.drawImage(chipCanvasList[tileType][drawTileName]['_' + i + chipId.charAt(i + 1)], 0, 0, w, h, x, y, w, h);
                    else ctx.drawImage(chipCanvasList[tileType][drawTileName]['_' + i + chipId.charAt(i + 1)], x, y);
                }
            }
            else {
                if (w && h) ctx.drawImage(chipCanvasList[tileType][drawTileName][chipId], 0, 0, w, h, x, y, w, h);
                else ctx.drawImage(chipCanvasList[tileType][drawTileName][chipId], x, y);
            }
        };

        chipDrawer.onload = function(func) {onloadFunc = func};

        chipDrawer.loadTileSheet('map', DEFAULT_TILE_NAME['map']).addEventListener('load', function() {
            chipDrawer.loadTileSheet('chara', DEFAULT_TILE_NAME['chara']).addEventListener('load', function() {
                onloadFunc();
            }, false);
        }, false);

        return chipDrawer;
    };
})();