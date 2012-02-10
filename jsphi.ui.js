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
    var CONTROL_COMMAND = {
        49: ['1'],
        50: ['2'],
        51: ['3'],
        52: ['4'],
        53: ['5'],
        54: ['6'],
        55: ['7'],
        56: ['8'],
        57: ['9'],
        65: ['read'],
        66: ['board'],
        67: ['use'],
        68: ['erase'],
        70: ['floor item'],
        72: ['hi'],
        77: ['check', 'look'],
        //80: ['pay'],
        81: ['equip'],
        82: ['spells'],
        83: ['write'],
        86: ['sort'],
        87: ['unequip'],
        88: ['put'],
        89: ['y'],
        90: ['get'],
        96: ['check'],
        97: ['hit'],
        98: ['go b'],
        99: ['cast'],
        100: ['go l'],
        101: ['turn b'],
        102: ['go r'],
        103: ['turn l'],
        104: ['go f'],
        105: ['turn r'],
        106: ['use'],
        107: ['get'],
        109: ['put'],
        110: ['.'],
        111: ['equip'],
        190: ['.']
    };
    var CONTROL_COMMAND_SHIFT = {
        65: ['cast', 'analyze'],
        66: ['cast', 'call'],
        67: ['cast', 'create'],
        68: ['cast', 'detect'],
        69: ['cast', 'eagle eye'],
        70: ['cast', 'forget'],
        73: ['cast', 'identify'],
        75: ['cast', 'list'],
        76: ['cast', 'wizard lock'],
        77: ['cast', 'disappear'],
        78: ['cast', 'appear'],
        80: ['cast', 'party eye'],
        81: ['cast', 'wizard light'],
        82: ['cast', 'return'],
        83: ['cast', 'search'],
        85: ['cast', 'unlock'],
        87: ['cast', 'wizard eye'],
        88: ['cast', 'charge spell'],
        90: ['cast', 'destroy']
    };
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
                            chipDrawer.drawChip('map', mapChipType, chipData.chip + 'i' + chipData.status.itemType, x * CHIP_SIZE, y * CHIP_SIZE);
                        }
                        else {
                            chipDrawer.drawChip('map', mapChipType, chipData.chip, x * CHIP_SIZE, y * CHIP_SIZE);
                            chipDrawer.drawChip('map', mapChipType, 'i' + chipData.status.itemType, x * CHIP_SIZE, y * CHIP_SIZE);
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
                    $('#login').click(function(e){func()});
                    break;
                case 'logout':
                    $('#logout').click(function(e){func()});
                    break;
                case 'phirc_show':
                    $('#phirc_show').click(function(e){func()});
                    break;
                case 'newuser':
                    $('#newuser').click(function(e){
                        var newuserName;
                        var ipPort;
                        if ((newuserName = $('#newuser_name').val()) && (ipPort = $('#newuser_ip_port').val())) {
                            func(newuserName, ipPort);
                        }
                        else {
                            phiUI.showErrorMessage('Please set user name');
                        }
                    });
                    break;
                //tentative
                case 'keypad':
                    km = function(kc){func(kc)};
                    break;
                case 'phirc_load':
                    $('#phirc_load').click(function(e) {
                        var userId;
                        var ipPort;
                        if ((userId = $('#phirc_user_id').val()) && (ipPort = $('#phirc_ip_port').val())) {
                            func(userId, ipPort);
                        }
                        else {
                            phiUI.showErrorMessage('Please set user id and ip_port');
                        }
                    });
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
            else if (keycode === 9) {
                $('#control').focus();
                e.preventDefault();
            }
        });

        (function(){
            var isShiftPressed = false;
            $('#control').keydown(function(e){
                var keycode = e.keyCode;
                //debug
                console.log(keycode);
                if (keycode === 9) {
                    $('#text').focus();
                }
                if (keycode === 16) {
                    isShiftPressed = true;
                }
                else if (isShiftPressed) {
                    if (CONTROL_COMMAND_SHIFT[keycode]) {
                        km(CONTROL_COMMAND_SHIFT[keycode]);
                    }
                }
                else {
                    if (CONTROL_COMMAND[keycode]) {
                        km(CONTROL_COMMAND[keycode]);
                    }
                }
                e.preventDefault();
            });

            $('#control').keyup(function(e) {
                var keycode = e.keyCode;
                if (keycode === 16) {
                    isShiftPressed = false;
                }
            });
        })();

        $('#apply_options').click(function(e) {
            phiUI.changeMapScale($('#map_size').val());
            $('#log').css('height', $('#log_height').val() + 'px');
        });

        $('#map_size').val('1');
        $('#log_height').val('400');
        $('#newuser_name').val('newuser');
        $('#newuser_ip_port').val('napthats.com:20017');
        $('#phirc_user_id').val('guest1');
        $('#phirc_ip_port').val('napthats.com:20017');

        return phiUI;
    };
})();


