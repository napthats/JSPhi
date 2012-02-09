/**
 * Created by JetBrains WebStorm.
 * User: user
 * Date: 12/01/14
 * Time: 13:19
 * To change this template use File | Settings | File Templates.
 */

var com;
if (!com) com = {};
if (!com.napthats) com.napthats = {};
if (!com.napthats.jsphi) com.napthats.jsphi = {};

(function() {
    var ns = com.napthats.jsphi;
    var KEYPAD_COMMAND = ['check', 'hit', 'go b', 'cast', 'go l', 'turn b', 'go r', 'turn l', 'go f', 'turn r'];
    var MAP_WIDTH = 7;
    var MAP_HEIGHT = 7;
    var CHIP_SIZE = 32;
    var CANVAS_WIDTH_DEFAULT = 224;
    var CANVAS_HEIGHT_DEFAULT = 240;
    var INITIAL_MAP_LIST = [
        '?', '?', '?', '?', '?', '?', '?',
        '?', '>', '%', ' ', 'o', '=', '?',
        '?', '#', '|', '{', 'I', '@', '?',
        '?', ' ', ' ', ' ', ' ', 'H', '?',
        '?', '_', 'T', ':', '+', '/', '?',
        '?', '_', ':', ':', ':', 'H', '?',
        '?', '?', '?', '?', '?', '?', '?'
    ];
    var ANIMATION_FRAME_RATE = 500;
    //keypad control (tentative)
    var km = function(){};

    ns.makePhiUI = function() {
        var phiUI = {};
        var mapChipType = 'default';
        var ctx = document.createElement('canvas').getContext('2d');
        ctx.canvas.width = CANVAS_WIDTH_DEFAULT;
        ctx.canvas.height = CANVAS_HEIGHT_DEFAULT;
        $('#map').append(ctx.canvas);
        var chipDrawer = ns.makeChipDrawer(ctx);
        var prevMapData = {};
        var prevObjectList = [];
        var animationFrame = 0;


        phiUI.showMap = function(mapData) {
            if (mapData) prevMapData = mapData;
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            for (var x = 0; x < MAP_WIDTH; x++) {
                for (var y = 0; y < MAP_HEIGHT; y++) {
                    var chipData = prevMapData.mapChipList[x + y * MAP_WIDTH];
                    var chipId = chipData.chip;

                    //ground and item
                    if (chipData.status && chipData.status.itemType) {
                        if (chipId === '%' || chipId === 'x') {
                            chipDrawer.drawChip('map', mapChipType, chipData.chip + 'i', x * CHIP_SIZE, y * CHIP_SIZE);
                        }
                        else {
                            chipDrawer.drawChip('map', mapChipType, chipData.chip, x * CHIP_SIZE, y * CHIP_SIZE);
                            chipDrawer.drawChip('map', mapChipType, 'i', x * CHIP_SIZE, y * CHIP_SIZE);
                        }
                    }
                    else {
                        chipDrawer.drawChip('map', mapChipType, chipData.chip, x * CHIP_SIZE, y * CHIP_SIZE);
                    }

                    //board
                    if (chipData.status && chipData.status.boardFlag) {
                        if  (chipId === '[' || chipId === '{' || chipId === '%') {
                            chipDrawer.drawChip('map', mapChipType, 'b', x * CHIP_SIZE, y * CHIP_SIZE);
                        }
                        else {
                            chipDrawer.drawChip('map', mapChipType, 'B', x * CHIP_SIZE, y * CHIP_SIZE);
                        }
                    }
                }
            }
        };

        phiUI.showObjects = function(objectList) {
            if (objectList) prevObjectList = objectList;
            for (var i = 0; i < prevObjectList.length; i++) {
                chipDrawer.drawChip(
                    'chara', prevObjectList[i].graphic.name, prevObjectList[i].dir + (prevObjectList[i].graphic.gigantFlag ? '*' : '') + animationFrame,
                    prevObjectList[i].x * CHIP_SIZE, prevObjectList[i].y * CHIP_SIZE
                );
                ctx.fillText(prevObjectList[i].name, prevObjectList[i].x * CHIP_SIZE, prevObjectList[i].y * CHIP_SIZE + CHIP_SIZE / 4);
            }
        };

        //bind callback for UI event
        phiUI.bind = function(type, func) {
            switch (type) {
                case 'send':
                    $('#send').click(function(e){
                        func($('#text').val());
                        $('#text').val('');
                    });
                    break;
                case 'login':
                    $('#login').click(function(e){func($('#chara_id').val())});
                    break;
                case 'logout':
                    $('#logout').click(function(e){func()});
                    break;
                //tentative
                case 'keypad':
                    km = function(kc){func(kc)};
                    break;
                default:
                    phiUI.showErrorMessage('assertion error.');
                    break;
            }
        };

        phiUI.changeMapScale = function(scale) {
            $('#map').css('width', scale * CANVAS_WIDTH_DEFAULT + 'px').css('height', scale * CANVAS_HEIGHT_DEFAULT + 'px');
            ctx.canvas.width = CANVAS_WIDTH_DEFAULT * scale;
            ctx.canvas.height = CANVAS_HEIGHT_DEFAULT * scale;
            ctx.scale(scale, scale);
        };

        //show normal message with phi style tags
        phiUI.showMessage = function(msg) {
            msg = msg.split('<').join('&lt;');
            msg = msg.split('&').join('&amp;');
            var spanTagNum = 0;
            var commentList = msg.match(/\/\*.*?\*\//g);

            //add html tags for phi style tags
            if (commentList) {
                commentList.forEach(function(element, index, array) {
                    if (element.match(/^\/\*(?:color=|style=|size=)|^\/\*\.\*\/$/)) {
                        var spanTag = element.split('=').join('_');
                        spanTag = spanTag.split('.').join('period');
                        spanTag = spanTag.split('-').join('minus_');
                        spanTag = spanTag.split('+').join('plus_');
                        spanTag = spanTag.replace(/^\/\*/, '<span class="');
                        spanTag = spanTag.replace(/\*\/$/, '">');
                        msg = msg.split(element).join(spanTag);
                        spanTagNum++;
                    }
                    else {
                        msg = msg.split(element).join('');
                    }
                });
            }

            //close all span tags
            for (var i = 0; i < spanTagNum; i++) {
                msg = msg + '</span>';
            }

            $('#log').append('<div class="message">'+msg+'</div>');
            $('#log').scrollTop(1000000);
        };

        phiUI.showClientMessage = function(msg) {
            msg = msg.split('<').join('&lt;');
            msg = msg.split('&').join('&amp;');
            $('#log').append('<div class="client_message">'+msg+'</div>');
            $('#log').scrollTop(1000000);
        };

        phiUI.showErrorMessage = function(msg) {
            msg = msg.split('<').join('&lt;');
            msg = msg.split('&').join('&amp;');
            $('#log').append('<div class="error_message">'+msg+'</div>');
            $('#log').scrollTop(1000000);
        };

        phiUI.setMapChipType = function(_mapChipType) {
            mapChipType = _mapChipType;
        };


        //set initial map and object
        prevMapData.mapChipList = [];
        for (var i = 0; i < INITIAL_MAP_LIST.length; i++) {
            prevMapData.mapChipList.push({
                chip: INITIAL_MAP_LIST[i],
                status: {
                    itemType: 0,
                    boardFlag: false,
                    roofFlag: false,
                    areaID: 0
                }
            });
        }

        prevObjectList = [{
            type: 'character',
            id: '0',
            x: 3,
            y: 4,
            dir: 'B',
            name: '',
            graphic: {
                name: 'PLAYER',
                status: 'command',
                gigantFlag: true,
                type: 'default'
            }
        }];
        
        chipDrawer.onload(function() {
            phiUI.showMap();
            phiUI.showObjects();
            //Animation
            setInterval(function() {
                animationFrame = animationFrame ? 0 : 1;
                phiUI.showMap();
                phiUI.showObjects();
            }, ANIMATION_FRAME_RATE);
        });

        //keypad control (tentative)
        $('#text').keydown(function(e){
            var keycode = e.keyCode;
            if(keycode === 13){
                $('#send').click();
            }
            else if(keycode >= 96 && keycode <= 105) {
                //TODO: move to jsphi.js
                //send_message(KEYPAD_COMMAND[keycode - 96]);
                km(KEYPAD_COMMAND[keycode - 96]);
                //end TODO
                $('#text').val('');
                e.preventDefault();
            }
        });

        $('#map_size').keydown(function(e){
            if(e.keyCode === 13) {
                phiUI.changeMapScale($('#map_size').val());
                $('#map_size').val('');
            }
        });

        return phiUI;
    };
})();


