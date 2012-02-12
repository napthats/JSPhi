/**
 * Created by JetBrains WebStorm.
 * User: user
 * Date: 11/10/29
 * Time: 12:42
 * To change this template use File | Settings | File Templates.
 */


$(document).ready(function() {
    var NS_JSPHI = com.napthats.jsphi;
    NS_JSPHI.CLIENT_VERSION = '05103010';
    var NS_WEBSOCKET = com.napthats.websocket;
    var URL_WEBSOCKT = 'ws://localhost:8080/ws/';
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
        71: ['guard'],
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
    var phiUI;
    var commandExecutor;
    var ws;
    var userId;
    var serverIpPort;

    var login = function(id, ipPort) {
        userId = id;
        serverIpPort = ipPort;
        if (!userId) {
            phiUI.showErrorMessage('Please set user id first.');
            return;
        }
        //tentative
        ws.send('$open$:' + serverIpPort);
        commandExecutor.setUserId(userId);
        ws.send('#open ' + userId);
        sendMessageEnterWorld();
    };

    var logout = function() {
        commandExecutor.resetExecutor();
        ws.send('exit');
    };

    var recvMessage = function(msg){
        var phidmMessage = NS_JSPHI.phidmMessageParse(msg.data);
        if (!phidmMessage) return; //message does not exist or not end
        commandExecutor.exec(phidmMessage);
    };

    var sendMessage = function(msg) {
        ws.send(msg);
    };

    var sendMessageEnterWorld = function() {
        //test default setting
        ws.send('#map-iv 1');
        ws.send('#status-iv 1');
        ws.send('#version-cli ' + NS_JSPHI.CLIENT_VERSION);
        ws.send('#ex-switch eagleeye=form');
        ws.send('#ex-map size=57');
        ws.send('#ex-map style=turn');
        ws.send('#ex-switch ex-move-recv=true');
        ws.send('#ex-switch ex-list-mode-end=true');
        ws.send('#ex-switch ex-disp-magic=false');
        //end test
    };

    var changeWorld = function(ipPort) {
        serverIpPort = ipPort;
        savePhirc(userId, serverIpPort);
        phiUI.setPhirc(readPhircCookie(), userId + '@' + serverIpPort);
        sendMessageEnterWorld();
    };

    var finishNewuser = function(id) {
        userId = id;
        savePhirc(userId, serverIpPort);
        phiUI.setPhirc(readPhircCookie(), userId + '@' + serverIpPort);
        commandExecutor.setUserId(id);
        sendMessageEnterWorld();
    };

    var startNewuser = function(name, ipPort) {
        serverIpPort = ipPort;
        ws.send('$open$:' + serverIpPort);
        commandExecutor.startNewuser(name);
    };

    var importPhirc = function(id, ipPort) {
        userId = id;
        serverIpPort = ipPort;
        savePhirc(userId, serverIpPort);
        phiUI.setPhirc(readPhircCookie(), userId + '@' + serverIpPort);
        phiUI.showClientMessage('.phirc load completed.');
    };

    var showPhirc = function() {
        if (userId) {
            phiUI.showClientMessage(userId + ' ' + serverIpPort);
        }
        else {
            phiUI.showErrorMessage('No user login.');
        }
    };

    var savePhirc = function(id, ipPort) {
        var savedPhircList = readPhircCookie();
        if (!savedPhircList) savedPhircList = [];
        for (var i = 0; i < savedPhircList.length; i++) {
            if (id === savedPhircList[i][0]) {
                savedPhircList[i][1] = ipPort;
                break;
            }
        }
        if (i === savedPhircList.length) {
            savedPhircList.push([id, ipPort]);
        }
        writePhircCookie(savedPhircList);
    };

    //var loadPhirc = function(id) {
    //    var savedPhircList = readPhircCookie();
    //    if (!savedPhircList) return;
    //    for (var i = 0; i < savedPhircList.length; i++) {
    //        if (id === savedPhircList[i][0]) {
    //            return savedPhircList[i];
    //        }
    //    }
    //};

    NS_JSPHI.readCookie = function(key){
        var allcookies = document.cookie;
        var pos = allcookies.indexOf(key + '=');
        var value;
        if (pos !== -1) {
            var start = pos + key.length + 1;
            var end = allcookies.indexOf(';', start);
            if (end === -1) end = allcookies.length;
            value = allcookies.substring(start, end);
            value = decodeURIComponent(value);
        }
        return value;
    };

    var readPhircCookie = function() {
        var value = NS_JSPHI.readCookie('phirc');
        if (!value) return;
        var phircList = [];
        var _phircList = value.split(',');
        for (var i = 0; i < _phircList.length; i++) {
            phircList.push(_phircList[i].split('@'));
        }
        return phircList;
    };

    var writePhircCookie = function(_phircList) {
        var phircList = _phircList;
        for (var i = 0; i < phircList.length; i++) {
            phircList[i] = phircList[i].join('@');
        }
        document.cookie = 'phirc=' + encodeURIComponent(phircList.join(',')) + '; max-age=' + (60*60*24*365*10);
    };

    
    ws = NS_WEBSOCKET.connectWebSocket(URL_WEBSOCKT, recvMessage);
    phiUI = NS_JSPHI.makePhiUI();
    phiUI.setPhirc(readPhircCookie());
    phiUI.bind('send', sendMessage);
    phiUI.bind('login', login);
    phiUI.bind('logout', logout);
    phiUI.bind('newuser', startNewuser);
    phiUI.bind('phirc_load', importPhirc);
    phiUI.bind('phirc_show', showPhirc);
    commandExecutor = NS_JSPHI.makeCommandExecutor(phiUI, ws);
    commandExecutor.bind('change_world', changeWorld);
    commandExecutor.bind('finish_newuser', finishNewuser);

    //keypad control and shortcut key
    (function(){
        var isShiftPressed = false;

        phiUI.bind('control_keydown', function(e){
            var keycode = e.keyCode;
            var controlCommand = isShiftPressed ? CONTROL_COMMAND_SHIFT : CONTROL_COMMAND;
            if (keycode === 9) {
                $('#text').focus();
            }
            if (keycode === 16) {
                isShiftPressed = true;
            }
            if (controlCommand[keycode]) {
                var commands = controlCommand[keycode];
                for (var i = 0; i < commands.length; i++) {
                    ws.send(commands[i]);
                }
            }
            e.preventDefault();
        });

        phiUI.bind('control_keyup', function(e) {
            var keycode = e.keyCode;
            if (keycode === 16) {
                isShiftPressed = false;
            }
        });
    })();
});



