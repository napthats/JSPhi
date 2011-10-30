/**
 * Created by JetBrains WebStorm.
 * User: user
 * Date: 11/10/29
 * Time: 12:42
 * To change this template use File | Settings | File Templates.
 */

$(document).ready(function() {
    var MESSAGE_WEBSOCKET_DISABLE = 'WebsSocket disable';
    var URL_WS_NAPTHAS = 'ws://napthats.com:8888/ws/';
    var URL_HTTP_NAPTHAS = 'http://napthats.com:8888/';
    var MAP_WIDTH = 5;
    var MAP_HEIGHT = 5;
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
        '{': 'door_lock',
        '@': 'rock',
        '?': 'unknown',
        's': 'unknown' //storage
    }

    var pc_name;

    //check WebSocket enable
    if (!window.WebSocket && !window.MozWebSocket) {
        alert(MESSAGE_WEBSOCKET_DISABLE);
        return;
    }

    //connect WebSocket
    var wsurl = URL_WS_NAPTHAS;
    var ws = window.MozWebSocket ? new MozWebSocket(wsurl) : new WebSocket(wsurl);

    //for finalize WebSocket
    $(window).unload(function(){
        ws.send('exit');
        ws.close();
        ws = null;
    });

    //handle message receive
    ws.addEventListener('message', function(msg) {
        if (msg === null || msg.data === null) {
            return;
        }
        if (msg.data[0] === '#') {
            exec_recv_command(msg.data);
        }
        else {
            show_message(msg.data);
        }
    }, false);

    //handle message send
    $('#send').click(function(e) {
        var text = $('#text').val();
        if (text[0] === '#') {
            exec_send_command(text);
        }
        else {
            send_message(text);
        }
        $('#text').val('');
    });

    //message send with enter key
    $('#text').keyup(function(event){
        if(event.keyCode == 13){
            $('#send').click();
        }
    });


    function show_message(msg) {
        $('#log').prepend("<div class='message'>"+msg+"</div>");
    }

    function send_message(msg) {
        ws.send(msg);
    }

    function exec_recv_command(command) {
        if (command.search(/^#map M/) === 0) {
            var map_list = parse_map_command(command);
            show_map(map_list);
        }
        else if (command.search(/^#map C/) === 0) {
            parse_chara_command(command);
        }
    }

    function exec_send_command(command) {
        if (command.search(/^#start/) === 0) {
            initialize_connect(command);
        }
    }

    function initialize_connect(command) {
        pc_name = command.substring(7);
        send_message('#open ' + pc_name);
        send_message('#map-iv 1');
        send_message('#status-iv 1');

        //test for using old protocol
//        send_message('#version-cli 05107100');
//        send_message('#ex-switch eagleeye=form');
//        send_message('#ex-map size=57');
//        send_message('#ex-map style=turn');
//        send_message('#ex-switch ex-move-recv=true');
//        send_message('#ex-switch ex-list-mode-end=true');
//        send_message('#ex-switch ex-disp-magic=false');
        //end test
    }

    function parse_map_command (command) {
        var map_list = [];
        for (var i = 0; i < MAP_WIDTH * MAP_HEIGHT; i++) {
            map_list[i] = command[18 + 2 * i];
        }
        return map_list;
    }

    function show_map(map_list) {
        var map_chip_list = $('div#map');
//        var map_chip_list = $('div#map li');
        map_chip_list.children().remove();
        for (var x = 0; x < MAP_WIDTH; x++) {
            for (var y = 0; y < MAP_HEIGHT; y++) {
                $('<img src="' + URL_HTTP_NAPTHAS + CHIP_ID_TO_NAME[map_list[x + y * MAP_WIDTH]] + '.png" class="map_chip"/>').appendTo('div#map').css({left:x * CHIP_SIZE, top:y * CHIP_SIZE});
            }
        }
        //test for using old protocol
        show_chara(pc_name, 2, 3);
        //end test
    }

    function parse_chara_command (command) {
        show_chara(command.slice(15, 46), command[9], command[11]);
    }
    
    function show_chara(name, x, y) {
        $('<img src="' + URL_HTTP_NAPTHAS + 'chara.png" class="chara_chip"/>').appendTo('div#map').css({left:x * CHIP_SIZE, top:y * CHIP_SIZE});
        $('<div class="chara_name">'+ name + '</div>').appendTo('div#map').css({left:x * CHIP_SIZE, top:y * CHIP_SIZE});
    }
});



