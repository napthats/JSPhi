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
    var PHIRC_DEFAULT = ['guest1', 'napthats.com:20017'];
    var WATER_CHIPS_CONSTRUCT_RULE = [
        [4, 4, 0, 0, 2, 2, 'b', 'c'],
        [5, 1, 5, 1, 2, 'a', 2, 'c'],
        [6, 3, 6, 3, 0, 9, 0, 'c'],
        [7, 3, 1, 8, 7, 3, 1, 'c']
    ];
    var DIR_TO_AROUND_CHIP_STATE_POSITION = [
        [{x: -1, y: -1}, {x:  0, y: -1}, {x: -1, y:  0}],
        [{x:  0, y: -1}, {x:  1, y: -1}, {x:  1, y:  0}],
        [{x: -1, y:  0}, {x: -1, y:  1}, {x:  0, y:  1}],
        [{x:  1, y:  0}, {x:  0, y:  1}, {x:  1, y:  1}]
    ];
    var FONT_DEFAULT = 'normal bold 8px monospace';

    ns.makePhiUI = function() {
        var phiUI = {};
        var mapChipType = 'default';
        var ctx = document.createElement('canvas').getContext('2d');
        var chipDrawer = ns.makeChipDrawer(ctx);
        var prevMapData = {};
        var prevObjectList = [];
        var animationFrame = 0;

        phiUI.showMap = function(mapData, objectList) {
            if (mapData) prevMapData = mapData;
            if (objectList) prevObjectList = objectList;
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

            for (var x = 0; x < MAP_WIDTH; x++) {
                for (var y = 0; y < MAP_HEIGHT; y++) {
                    var chipData = prevMapData.mapChipList[x + y * MAP_WIDTH];
                    var chipId = chipData.chip;

                    //construct water chip id for separating chips
                    if (chipId === '_') {
                        //add suffix for each region (upper left, upper right, lower left, lower right)
                        for (var i = 0; i < 4; i++) {
                            var aroundChipState = 0;

                            //make suffix with checking around chips
                            for (var j = 0; j < DIR_TO_AROUND_CHIP_STATE_POSITION[i].length; j++) {
                                var pos = DIR_TO_AROUND_CHIP_STATE_POSITION[i][j];
                                if (x + pos.x < 0 || x + pos.x >= MAP_WIDTH || y + pos.y < 0 || y + pos.y >= MAP_HEIGHT) {
                                    aroundChipState += Math.pow(2, j);
                                }
                                else {
                                    var aroundChip = prevMapData.mapChipList[x + pos.x + (y + pos.y) * MAP_WIDTH].chip;
                                    aroundChipState += (aroundChip === '_' || aroundChip === '?') ? Math.pow(2, j) : 0;
                                }
                            }

                            chipId += WATER_CHIPS_CONSTRUCT_RULE[i][aroundChipState];
                        }
                    }

                    //ground and item
                    if (chipData.status && chipData.status.itemType) {
                        if (chipId === '%' || chipId === 'x') {
                            chipDrawer.drawChip('map', mapChipType, chipId + 'i' + chipData.status.itemType, x * CHIP_SIZE, y * CHIP_SIZE);
                        }
                        else {
                            chipDrawer.drawChip('map', mapChipType, chipId, x * CHIP_SIZE, y * CHIP_SIZE);
                            chipDrawer.drawChip('map', mapChipType, 'i' + chipData.status.itemType, x * CHIP_SIZE, y * CHIP_SIZE);
                        }
                    }
                    else {
                        chipDrawer.drawChip('map', mapChipType, chipId, x * CHIP_SIZE, y * CHIP_SIZE);
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

                    //object
                    var objectListOnCurrentPosition = [];
                    var charaNum = 0;
                    for (var l = 0; l < prevObjectList.length; l++) {
                        if (prevObjectList[l].x === x && prevObjectList[l].y === y) {
                            objectListOnCurrentPosition.push(prevObjectList[l]);
                            if (prevObjectList[l].type === 'character') {
                                charaNum++;
                            }
                        }
                    }
                    var isFirstCharacter = true;
                    for (var k = 0; k < objectListOnCurrentPosition.length; k++) {
                        var phiObject = objectListOnCurrentPosition[k];
                        var suffix =
                            phiObject.graphic.gigantFlag ? '*' :
                                (charaNum < 2 || phiObject.type !== 'character') ? '' :
                                    isFirstCharacter ? 'l' : 'r';
                        if (suffix === 'l') isFirstCharacter = false;
                        
                        chipDrawer.drawChip(
                            'chara',
                            phiObject.graphic.name,
                            phiObject.dir + suffix + animationFrame,
                            phiObject.x * CHIP_SIZE,
                            phiObject.y * CHIP_SIZE + (chipId.charAt(0) === '_' ? CHIP_SIZE / 3 : CHIP_SIZE / 6),
                            CHIP_SIZE,
                            chipId.charAt(0) === '_' ? CHIP_SIZE / 6 * 5: CHIP_SIZE
                        );
                        ctx.save();
                        ctx.fillStyle = '#FFFFFF';
                        ctx.fillText(
                            phiObject.name,
                            phiObject.x * CHIP_SIZE,
                            phiObject.y * CHIP_SIZE + CHIP_SIZE
                        );
                        ctx.restore();
                    }
                }
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
                    $('#login').click(function(e){
                        var phirc = $('#chara_id').val().split('@');
                        func(phirc[0], phirc[1]);
                    });
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
                case 'control_keydown':
                    $('#control').keydown(function(e){func(e)});
                    break;
                case 'control_keyup':
                    $('#control').keyup(function(e){func(e)});
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
            ctx.font = FONT_DEFAULT;
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

        phiUI.setPhirc = function(phircList, selected) {
            $('.phirc_option').remove();
            $('<option/>').attr('value', PHIRC_DEFAULT.join('@')).text(PHIRC_DEFAULT[0]).addClass('phirc_option').appendTo('#chara_id');
            if (!phircList) return;
            for (var i = 0; i < phircList.length; i++) {
                $('<option/>').attr('value', phircList[i].join('@')).text(phircList[i][0]).addClass('phirc_option').appendTo('#chara_id');
            }
            if (selected) $('#chara_id').val(selected);
        };


        //set initial map and object
        prevMapData.mapChipList = [];
        for (var i = 0; i < INITIAL_MAP_LIST.length; i++) {
            prevMapData.mapChipList.push({
                chip: INITIAL_MAP_LIST[i],
                status: {
                    itemType: i === 23 ? 6 : 0,
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
            //Animation
            setInterval(function() {
                animationFrame = animationFrame ? 0 : 1;
                phiUI.showMap();
            }, ANIMATION_FRAME_RATE);
        });

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

        $('#apply_options').click(function(e) {
            phiUI.changeMapScale($('#map_size').val());
            $('#log').css('height', $('#log_height').val() + 'px');
        });

        $('#map_size').val('1');
        $('#log_height').val('400');
        $('#newuser_name').val('name');
        $('#newuser_ip_port').val('napthats.com:20017');
        $('#phirc_user_id').val('guest2');
        $('#phirc_ip_port').val('napthats.com:20017');

        ctx.canvas.width = CANVAS_WIDTH_DEFAULT;
        ctx.canvas.height = CANVAS_HEIGHT_DEFAULT;
        $('#map').append(ctx.canvas);
        ctx.font = FONT_DEFAULT;

        return phiUI;
    };
})();


