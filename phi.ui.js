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
    var URL_HTTP_NAPTHAS = 'http://napthats.com/chips/';
    var KEYPAD_COMMAND = ['check', 'hit', 'go b', 'cast', 'go l', 'turn b', 'go r', 'turn l', 'go f', 'turn r'];
    var MAP_WIDTH = 7;
    var MAP_HEIGHT = 7;
    var CHIP_SIZE = 64;
    var CHIP_ID_TO_NAME = {
        ' ': 'road',
        'o': 'dummy',
        ':': 'grass',
        '+': 'flower',
        '_': 'water',
        'x': 'pcircle',
        '/': 'mist',
        '>': 'tgate',
        'H': 'mwall',
        '[': 'door',
        '#': 'wwall',
        'I': 'bars',
        '%': 'pcircle_lock',
        '|': 'window',
        'T': 'wood',
        '=': 'glass',
        '{': 'door_lock',
        '@': 'rock',
        '?': 'unknown',
        //test for strage
        's': 'unknown'
        //end test
    }
    var INITIAL_MAP_LIST = [
        '?', '?', '?', '?', '?', '?', '?',
        '?', '>', '%', ' ', 'o', '=', '?',
        '?', '#', '|', '{', 'I', '@', '?',
        '?', ' ', ' ', ' ', ' ', 'H', '?',
        '?', '_', 'T', ':', '+', '/', '?',
        '?', '_', ':', ':', ':', 'H', '?',
        '?', '?', '?', '?', '?', '?', '?'
    ];
    //test for keypad control
    var km = function(){};
    //end test

    ns.makePhiUI = function() {
        var phiUI = {};
        
        phiUI.showMap = function(mapData) {
            var map_chip_list = $('div#map');
            map_chip_list.children().remove();
            for (var x = 0; x < MAP_WIDTH; x++) {
                for (var y = 0; y < MAP_HEIGHT; y++) {
                    $('<img src="' + URL_HTTP_NAPTHAS + CHIP_ID_TO_NAME[mapData.mapChipList[x + y * MAP_WIDTH].chip] + '.png" class="map_chip"/>').appendTo('div#map').css({left:x * CHIP_SIZE, top:y * CHIP_SIZE});
                }
            }
        };
        
        phiUI.showObjects = function(objectList) {
            for (var i = 0; i < objectList.length; i++) {
                var object = objectList[i];
                $('<img src="' + URL_HTTP_NAPTHAS + 'chara.png" class="chara_chip"/>').appendTo('div#map').css({left:object.x * CHIP_SIZE, top:object.y * CHIP_SIZE});
                $('<div class="chara_name">'+ object.name + '</div>').appendTo('div#map').css({left:object.x * CHIP_SIZE, top:object.y * CHIP_SIZE});
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
                    name: '',
                    status: 'command',
                    gigantFlag: false,
                    type: 'default'
                }
            }]);

            //test for keypad control
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
            //end test
        };

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
                //test
                case 'keypad':
                    km = function(kc){func(kc)};
                    break;
                //end test
                default:
                    phiUI.showError('assertion error.');
                    break;
            }
        };

        phiUI.showMessage = function(msg) {
            $('#log').prepend("<div class='message'>"+msg+"</div>");
        };

        phiUI.showClientMessage = function(msg) {
            $('#log').prepend("<div class='client_message'>"+msg+"</div>");
        };

        phiUI.showErrorMessage = function(msg) {
            $('#log').prepend("<div class='error_message'>"+msg+"</div>");
            //alert(msg);
        };

        return phiUI;
    };
})();


