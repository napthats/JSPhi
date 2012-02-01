/**
 * Created by JetBrains WebStorm.
 * User: user
 * Date: 11/10/29
 * Time: 12:42
 * To change this template use File | Settings | File Templates.
 */


$(document).ready(function() {
    //const
    var NS_JSPHI = com.napthats.jsphi;
    var NS_WEBSOCKET = com.napthats.websocket;
    var COMMAND_WS_CLOSE = '$close';
    var TYPE_NORMAL_MESSAGE = '#NORMAL_MESSAGE#';
    var CLIENT_VERSION = '05103010';
    var URL_WEBSOCKT = 'ws://localhost:8080/ws/';

    //variable
    var phiUI;
    var ws;
    var userId;

    //function
    var recvMessage;
    var initialize;
    var execRecvCommand;
    var login;
    var logout;
    var makeTransferExec;
    var sendInitialMessage;
    var spExecRecvCommand;


    initialize = function() {
        ws = NS_WEBSOCKET.connectWebSocket(URL_WEBSOCKT, recvMessage);
        phiUI = NS_JSPHI.makePhiUI();
        phiUI.initialize();
        phiUI.bind('send', function(msg){ws.send(msg)});
        phiUI.bind('login', function(id){login(id)});
        phiUI.bind('logout', function(){logout()});
        //tentative support
        phiUI.bind('keypad', function(kc){ws.send(kc)});
    };

    login = function(id) {
        userId = id;
        ws.send('#open ' + id);
        sendInitialMessage();
    };

    logout = function() {
        spExecRecvCommand = null;
        ws.send('exit');
    };

    makeTransferExec = function(option) {
        var state = 'ch-srv';
        var ip = option[0];
        var port = option.length === 2 ? option[1] : '20017';

        return function(command) {
            switch (state) {
                case 'ch-srv':
                    phiUI.showClientMessage('Reserve transfer...');
                    ws.send('$sub$:' + ip + ':' + port);
                    ws.send('$flip$');
                    ws.send('#reserve ' + userId);
                    state = 'reserve';
                    return;
                case 'reserve':
                    if (command.type === 'rsv-ok') {
                        phiUI.showClientMessage('Connecting...');
                        ws.send('$flip$');
                        ws.send('#trans ' + ip + ' ' + port);
                        state = 'trans';
                        return;
                    }
                    else if (command.type === '$cnt-no') {
                        phiUI.showErrorMessage('Cannot find a server.');
                        ws.send('$flip$');
                        ws.send('#no-srv');
                        ws.send('$closesub$');
                        spExecRecvCommand = null;
                        return;
                    }
                    else {
                        phiUI.showErrorMessage('Unexpected command in transfer.');
                        ws.send('$closesub$');
                        spExecRecvCommand = null;
                        return;
                    }
                case 'trans':
                    if (command.type === 'trs-ok') {
                        phiUI.showClientMessage('Transfer completed.');
                        ws.send('$flip$');
                        ws.send('#ch-srv-ok');
                        sendInitialMessage();
                        spExecRecvCommand = null;
                        ws.send('$closesub$');
                        return;
                    }
                    else if (command.type === 'trs-no') {
                        phiUI.showErrorMessage('Transfer failed.');
                        ws.send('#ch-srv-no');
                        spExecRecvCommand = null;
                        ws.send('$closesub$');
                        return;
                    }
                    else {
                        phiUI.showErrorMessage('Unexpected command in transfer.');
                        ws.send('$closesub$');
                        spExecRecvCommand = null;
                        return;
                    }
            }
        }
    };

    sendInitialMessage = function() {
        //test default setting
        ws.send('#map-iv 1');
        ws.send('#status-iv 1');
        ws.send('#version-cli ' + CLIENT_VERSION);
        ws.send('#ex-switch eagleeye=form');
        ws.send('#ex-map size=57');
        ws.send('#ex-map style=turn');
        ws.send('#ex-switch ex-move-recv=true');
        ws.send('#ex-switch ex-list-mode-end=true');
        ws.send('#ex-switch ex-disp-magic=false');
        //end test
    }

    recvMessage = function(msg){
        var phidmMessage = NS_JSPHI.phidmMessageParse(msg.data);
        if (!phidmMessage) return; //message does not exist or not end

        if (spExecRecvCommand) {
            spExecRecvCommand(phidmMessage);
        }
        else if (phidmMessage.type === TYPE_NORMAL_MESSAGE) {
            phiUI.showMessage(phidmMessage.data);
        }
        else {
            execRecvCommand(phidmMessage);
        }
    };

    execRecvCommand = function(command) {
        switch (command.type) {
            case 'name':
                //test
                //phiUI.setUserName(command.data);
                //end test
                break;
            case 'lag':
                ws.send('#end-lag');
                break;
            case 'status':
                //test
                //phiUI.setUserStatus(command.data);
                //end test
                break;
            case 'cond':
                //test
                //phiUI.setUserCond(command.data);
                //end test
                break;
            case 'x':
                phiUI.showClientMessage('Forced disconnection.');
                spExecRecvCommand = null;
                ws.send(COMMAND_WS_CLOSE);
                break;
            case 'close':
                ws.send(COMMAND_WS_CLOSE);
                spExecRecvCommand = null;
                break;
            case 'remap':
                ws.send('#map');
                break;
            case 'm57':
                phiUI.showMap(command.data.map);
                phiUI.showObjects(command.data.objectList);
                break;
            case 'list':
            case 'more':
                command.data.forEach(function(element, index, array) {
                    phiUI.showMessage(element);
                });
                break;
            case 'ch-srv':
                (spExecRecvCommand = makeTransferExec(command.data))();
                break;
            case '$cnt-no':
                phiUI.showErrorMessage('Cannot connect a server.');
                break;

            //should deal with later
            case 'priv':
                phiUI.showErrorMessage('Not support priv.');
                break;
            case 'ex-map':
                //phiUI.showErrorMessage('not support ex-map.');
                break;
            case 'ex-switch':
                //phiUI.showErrorMessage('not support ex-switch.');
                break;
            case 'ex-eagleeye':
                phiUI.showErrorMessage('Not support eagleeye.');
                break;
            case 'set-user-id':
                phiUI.showClientMessage('Not support registration.');
                break;
            case 's-edit':
            case 'm-edit':
            case '.':
                phiUI.showErrorMessage('Not support edit.');
                break;
            case 'rsv-ok':
            case 'trs_no':
            case 'trs_ok':
                phiUI.showErrorMessage('Unexpected transfer command.');
                break;
            case 'map':
                phiUI.showErrorMessage('Not support old map protocol.');
                break;

            //just ignore
            case 'attack':
            case 'end-at':
            case 'magic':
            case 'end-mg':
            case 'version-srv':
            case 'version-dm':
            case 'leave-win':
            case 'enter-win':
            case 'user':
            case 'mapset':
            case 'bgm':
            case 'ex-chr-conflict':
            case 'mapset-define':
            case 'guard':
            case 'end-gd':
            case 'ex-notice':
                break;

            //should not receive
            case 'end-list':
            case 'end-more':
            case 'code-euc-ok':
            case 'code-utf-ok':
            case 'code-sfis-ok':
            case 'code-euc-no':
            case 'code-utf-no':
            case 'imagelist':
            case 'getimage':
            case 'end-edit':
                phiUI.showErrorMessage('Receive deprecated command from dm.');
                break;
            default:
                phiUI.showErrorMessage('Receive unknown command from dm.: ' + command.type + ', ' + command.data);
                break;
        }

    };

    initialize();
});



