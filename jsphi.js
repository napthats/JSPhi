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
    var serverIpPort;

    var login = function() {
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
        ws.send('floor item');
        //end test
    };

    var changeWorld = function(ipPort) {
        serverIpPort = ipPort;
        sendMessageEnterWorld();
    };

    var finishNewuser = function(id) {
        userId = id;
        commandExecutor.setUserId(id);
        sendMessageEnterWorld();
    };

    var startNewuser = function(name, ipPort) {
        serverIpPort = ipPort;
        ws.send('$open$:' + serverIpPort);
        commandExecutor.startNewuser(name);
    };

    var loadPhirc = function(id, ipPort) {
        userId = id;
        serverIpPort = ipPort;
        phiUI.showClientMessage('.phirc load completed.');
    };

    var showPhirc = function() {
        if (userId) {
            phiUI.showClientMessage(userId + ' ' + serverIpPort);
        }
        else {
            phiUI.showErrorMessage('No user is prepared.');
        }
    };
    

    ws = NS_WEBSOCKET.connectWebSocket(URL_WEBSOCKT, recvMessage);
    phiUI = NS_JSPHI.makePhiUI();
    phiUI.bind('send', sendMessage);
    phiUI.bind('login', login);
    phiUI.bind('logout', logout);
    phiUI.bind('newuser', startNewuser);
    phiUI.bind('phirc_load', loadPhirc);
    phiUI.bind('phirc_show', showPhirc);
    //tentative support
    phiUI.bind('keypad', function(commandList){
        for (var i = 0; i < commandList.length; i++) {
            ws.send(commandList[i]);
        }
    });
    commandExecutor = NS_JSPHI.makeCommandExecutor(phiUI, ws);
    commandExecutor.bind('change_world', changeWorld);
    commandExecutor.bind('finish_newuser', finishNewuser);
});



