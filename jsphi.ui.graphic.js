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
    var TILE_WIDTH = 32;
    var CHIP_ID_TO_TILE_ORD = {
        ' ': 0,
        'o': 5,
        ':': 1,
        '+': 2,
        '_': 4,
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
        's': 47
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

            //make canvas after loading image
            if (tileType === 'map') {
                tileSheet.addEventListener('load', function() {
                    for (var _chipId in CHIP_ID_TO_TILE_ORD) {
                        var chipCanvas = document.createElement('canvas').getContext('2d');
                        chipCanvas.width = CHIP_SIZE;
                        chipCanvas.height = CHIP_SIZE;
                        var chipOrd = CHIP_ID_TO_TILE_ORD[_chipId];
                        chipCanvas.drawImage(
                            tileSheet,
                            chipOrd % TILE_WIDTH * MAP_CHIP_WIDTH, Math.floor(chipOrd / TILE_WIDTH) * MAP_CHIP_HEIGHT,
                            MAP_CHIP_WIDTH, MAP_CHIP_HEIGHT,
                            0, 0,
                            MAP_CHIP_WIDTH, MAP_CHIP_HEIGHT
                        );
                        var chipImageData = chipCanvas.getImageData(0, 0, MAP_CHIP_WIDTH, MAP_CHIP_HEIGHT);

                        var maskCanvas = document.createElement('canvas').getContext('2d');
                        maskCanvas.drawImage(tileSheet,
                            (chipOrd + 16) % TILE_WIDTH * MAP_CHIP_WIDTH, Math.floor(chipOrd / TILE_WIDTH) * MAP_CHIP_HEIGHT,
                            MAP_CHIP_WIDTH, MAP_CHIP_HEIGHT,
                            0, 0,
                            MAP_CHIP_WIDTH, MAP_CHIP_HEIGHT
                        );
                        var maskImageData = maskCanvas.getImageData(0, 0, MAP_CHIP_WIDTH, MAP_CHIP_HEIGHT);

                        //mask image with MPHI map chip masking rule
                        for (var j = 0; j < chipImageData.data.length / 4; j++) {
                            if (maskImageData.data[j * 4] === 0) {
                                chipImageData.data[j * 4 + 3] = 0;
                            }
                        }

                        chipCanvas.putImageData(chipImageData, 0, 0);
                        chipCanvasList[tileType][tileName][_chipId] = chipCanvas.canvas;
                    }

                    //to render grass under tree
                    var treeCtx = chipCanvasList[tileType][tileName]['T'].getContext('2d');
                    treeCtx.save();
                    treeCtx.globalCompositeOperation = 'destination-over';
                    treeCtx.drawImage(chipCanvasList[tileType][tileName][':'], 0, 0);
                    treeCtx.restore();
                }, false);
            }
            else if (tileType === 'chara') {
                tileSheet.addEventListener('load', function() {
                    var chipCanvas = document.createElement('canvas').getContext('2d');
                    chipCanvas.width = CHIP_SIZE;
                    chipCanvas.height = CHIP_SIZE;
                    chipCanvas.drawImage(tileSheet, CHIP_SIZE * 2, 0, CHIP_SIZE, CHIP_SIZE, 0, 0, CHIP_SIZE, CHIP_SIZE);
                    var chipImageData = chipCanvas.getImageData(0, 0, CHIP_SIZE, CHIP_SIZE);
                    for (var i = 0; i < chipImageData.data.length / 4; i++) {
                        if (chipImageData.data[i*4] === 0 && chipImageData.data[i*4+1] === 128 && chipImageData.data[i*4+2] === 128) {
                            chipImageData.data[i*4 + 3] = 0;
                        }
                    }
                    chipCanvas.putImageData(chipImageData, 0, 0);
                    chipCanvasList[tileType][tileName][0] = chipCanvas.canvas;
                }, false);
            }

            return tileSheet;
        };

        chipDrawer.drawChip = function(tileType, tileName, chipId, x, y) {
            //loading image completed
            if (chipCanvasList[tileType][tileName] && chipCanvasList[tileType][tileName][chipId]) {
                ctx.drawImage(chipCanvasList[tileType][tileName][chipId], x, y);
            }
            //now loading or loading failed
            else if (chipCanvasList[tileType][tileName]) {
                ctx.drawImage(chipCanvasList[tileType][DEFAULT_TILE_NAME[tileType]][chipId], x, y);
            }
            //not yet
            else {
                chipDrawer.loadTileSheet(tileType, tileName);
                ctx.drawImage(chipCanvasList[tileType][DEFAULT_TILE_NAME[tileType]][chipId], x, y);
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