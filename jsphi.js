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
    var phiUI;
    var commandExecutor;
    var ws;
    var userId;

    var login = function(id) {
        //tentative
        ws.send('$open$:napthats.com:20017');
        userId = id;
        commandExecutor.setUserId(userId);
        ws.send('#open ' + id);
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
        ws.send('floor item');
        //end test
    };

    var finishNewuser = function(id) {
        userId = id;
        commandExecutor.setUserId(id);
        sendMessageEnterWorld();
    };

    var startNewuser = function(name) {
        ws.send('$open$:napthats.com:20017');
        commandExecutor.startNewuser(name);
    };


    ws = NS_WEBSOCKET.connectWebSocket(URL_WEBSOCKT, recvMessage);
    phiUI = NS_JSPHI.makePhiUI();
    phiUI.bind('send', function(msg){sendMessage(msg)});
    phiUI.bind('login', function(id){login(id)});
    phiUI.bind('logout', logout);
    phiUI.bind('newuser', function(name){startNewuser(name)});
    //tentative support
    phiUI.bind('keypad', function(kc){ws.send(kc)});
    commandExecutor = NS_JSPHI.makeCommandExecutor(phiUI, ws);
    commandExecutor.bind('enter_world', sendMessageEnterWorld);
    commandExecutor.bind('finish_newuser', function(id){finishNewuser(id)});
});



