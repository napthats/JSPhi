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
    var TYPE_OF_NORMAL_MESSAGE = '#NORMAL_MESSAGE#';

    //variable
    var phiUI;
    var ws;

    //function
    var recvMessage;
    var initialize;
    var execRecvCommand;
    var login;
    var logout;


    initialize = function() {
        ws = NS_WEBSOCKET.connectWebSocket('ws://napthats.com/ws/', recvMessage);
        phiUI = NS_JSPHI.makePhiUI();
        phiUI.initialize();
        phiUI.bind('send', function(msg){ws.send(msg)});
        phiUI.bind('login', function(id){login(id)});
        phiUI.bind('logout', function(){logout()});
        //test
        phiUI.bind('keypad', function(kc){ws.send(kc)});
        //end test
    };

    login = function(id) {
        ws.send('$open');
        //test using default value
        ws.send('#open ' + id);
        ws.send('#map-iv 1');
        ws.send('#status-iv 1');
        ws.send('#version-cli 05107100');
        ws.send('#ex-switch eagleeye=form');
        ws.send('#ex-map size=57');
        ws.send('#ex-map style=turn');
        ws.send('#ex-switch ex-move-recv=true');
        ws.send('#ex-switch ex-list-mode-end=true');
        ws.send('#ex-switch ex-disp-magic=false');
        //end test
    };

    logout = function() {
        ws.send('exit');
    };


    recvMessage = function(msg){
        var phidmMessage = NS_JSPHI.phidmMessageParse(msg.data);
        if (!phidmMessage) return; //message does not exist or not end

        if (phidmMessage.type === TYPE_OF_NORMAL_MESSAGE) {
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
                phiUI.showClientMessage('forced disconnection.');
                ws.send(COMMAND_WS_CLOSE);
                break;
            case 'close':
                ws.send(COMMAND_WS_CLOSE);
                break;
            case 'remap':
                ws.send('#mapChipList');
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

            //should deal with later
            case 'priv':
                phiUI.showErrorMessage('not support priv.');
                break;
            case 'ex-map':
                //phiUI.showErrorMessage('not support ex-map.');
                break;
            case 'ex-switch':
                //phiUI.showErrorMessage('not support ex-switch.');
                break;
            case 'ex-eagleeye':
                phiUI.showErrorMessage('not support eagleeye.');
                break;
            case 'set-user-id':
                phiUI.showClientMessage('not support registration.');
                break;
            case 's-edit':
            case 'm-edit':
            case '.':
                phiUI.showErrorMessage('not support edit.');
                break;
            case 'ch_srv':
            case 'trs_no':
            case 'trs_ok':
                phiUI.showErrorMessage('not support transfer to other server.');
                break;
            case 'mapChipList':
                phiUI.showErrorMessage('not support read old map protocol.');
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
                phiUI.showErrorMessage('receive deprecated command from dm.');
                break;
            default:
                phiUI.showErrorMessage('receive unknown command from dm.: ' + command.type + ', ' + command.data);
                break;
        }

    }

    initialize();
});



