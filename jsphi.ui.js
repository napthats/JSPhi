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
    var INITIAL_MAP_LIST = [
        '?', '?', '?', '?', '?', '?', '?',
        '?', '>', '%', ' ', 'o', '=', '?',
        '?', '#', '|', '{', 'I', '@', '?',
        '?', ' ', ' ', ' ', ' ', 'H', '?',
        '?', '_', 'T', ':', '+', '/', '?',
        '?', '_', ':', ':', ':', 'H', '?',
        '?', '?', '?', '?', '?', '?', '?'
    ];
    //keypad control (tentative)
    var km = function(){};
    var charapng = new Image();
    charapng.src = 'chips/chara/PLAYER.bmp';
    var mapChipType = 'default';

    ns.makePhiUI = function() {
        var phiUI = {};
        var ctx = document.createElement('canvas').getContext('2d');
        ctx.canvas.width = 224;
        ctx.canvas.height = 240;
        $('#map').append(ctx.canvas);
        var chipDrawer = ns.makeChipDrawer(ctx);

        var charaChipList = (function() {
            var result = {};
            var charaChipCanvasList = {};

            charapng.addEventListener('load', function() {
                var chipCanvas = document.createElement('canvas').getContext('2d');
                chipCanvas.width = CHIP_SIZE;
                chipCanvas.height = CHIP_SIZE;
                chipCanvas.drawImage(charapng, CHIP_SIZE * 2, 0, CHIP_SIZE, CHIP_SIZE, 0, 0, CHIP_SIZE, CHIP_SIZE);
                var chipImageData = chipCanvas.getImageData(0, 0, CHIP_SIZE, CHIP_SIZE);
                for (var i = 0; i < chipImageData.data.length / 4; i++) {
                    if (chipImageData.data[i*4] === 0 && chipImageData.data[i*4+1] === 128 && chipImageData.data[i*4+2] === 128) {
                        chipImageData.data[i*4 + 3] = 0;
                    }
                }
                chipCanvas.putImageData(chipImageData, 0, 0);
                charaChipCanvasList['chara'] = chipCanvas.canvas;

                result.drawChara = function(phiObjectName, x, y) {
                    ctx.drawImage(charaChipCanvasList[phiObjectName], x, y);
                };
            }, false);

            result.drawChara = function(phiObjectName, x, y) {
                //using default character chip (tentative)
                charapng.addEventListener('load', function(){ctx.drawImage(charaChipCanvasList[phiObjectName], x, y)}, false);
            };

            return result;
        })();

        phiUI.showMap = function(mapData) {
            ctx.fillRect(0, 0, 224, 240);
            for (var x = 0; x < MAP_WIDTH; x++) {
                for (var y = 0; y < MAP_HEIGHT; y++) {
                    chipDrawer.drawChip('map', mapChipType, mapData.mapChipList[x + y * MAP_WIDTH].chip, x * CHIP_SIZE, y * CHIP_SIZE);
                }
            }
        };
        
        phiUI.showObjects = function(objectList) {
            for (var i = 0; i < objectList.length; i++) {
                var phiObject = objectList[i];
                //using default character chip(tentative)
                chipDrawer.drawChip('chara', phiObject.graphic.name, 0, phiObject.x * CHIP_SIZE, phiObject.y * CHIP_SIZE);
                ctx.fillText(phiObject.name, phiObject.x * CHIP_SIZE, phiObject.y * CHIP_SIZE + CHIP_SIZE / 4);
            }
        };

        phiUI.initialize = function() {
            //set initial map
            var initialMapData = {};
            initialMapData.mapChipList = [];
            for (var i = 0; i < INITIAL_MAP_LIST.length; i++) {
                initialMapData.mapChipList.push({
                    chip: INITIAL_MAP_LIST[i],
                    status: {
                        itemType: 0,
                        messageFlag: false,
                        roofFlag: false,
                        areaID: 0
                    }
                });
            }
            phiUI.showMap(initialMapData);

            //set initial chara graphic
            phiUI.showObjects([{
                type: 'character',
                id: '0',
                x: 3,
                y: 4,
                dir: 'S',
                name: '',
                graphic: {
                    name: 'PLAYER',//debug
                    status: 'command',
                    gigantFlag: false,
                    type: 'default'
                }
            }]);

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
                    phiUI.showError('assertion error.');
                    break;
            }
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

        return phiUI;
    };
})();


