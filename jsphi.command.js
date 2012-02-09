/**
 * Created by JetBrains WebStorm.
 * User: napthats
 * Date: 12/02/08
 * Time: 23:15
 */

var com;
if (!com) com = {};
if (!com.napthats) com.napthats = {};
if (!com.napthats.jsphi) com.napthats.jsphi = {};

(function() {
    var ns = com.napthats.jsphi;
    var COMMAND_WS_CLOSE = '$close$';
    var TYPE_NORMAL_MESSAGE = '#NORMAL_MESSAGE#';

    ns.makeCommandExecutor = function(_phiUI, _ws) {
        var commandExecutor = {};
        var phiUI = _phiUI;
        var ws = _ws;
        var userId;
        var sendMessageEnterWorld = function(){};

        var makeTransferExec = function() {
            var state = 'ch-srv';
            var ip;
            var port;

            return function(command) {
                switch (state) {
                    case 'ch-srv':
                        ip = command.data[0];
                        port = command.data.length === 2 ? command.data[1] : '20017';
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
                            commandExecutor.exec = normalExec;
                            return;
                        }
                        else {
                            phiUI.showErrorMessage('Unexpected command in transfer.');
                            ws.send('$closesub$');
                            commandExecutor.exec = normalExec;
                            return;
                        }
                    case 'trans':
                        if (command.type === 'trs-ok') {
                            phiUI.showClientMessage('Transfer completed.');
                            ws.send('$flip$');
                            ws.send('#ch-srv-ok');
                            sendMessageEnterWorld();
                            commandExecutor.exec = normalExec;
                            ws.send('$closesub$');
                            return;
                        }
                        else if (command.type === 'trs-no') {
                            phiUI.showErrorMessage('Transfer failed.');
                            ws.send('#ch-srv-no');
                            commandExecutor.exec = normalExec;
                            ws.send('$closesub$');
                            return;
                        }
                        else {
                            phiUI.showErrorMessage('Unexpected command in transfer.');
                            ws.send('$closesub$');
                            commandExecutor.exec = normalExec;
                            return;
                        }
                }
            }
        };

        var normalExec = function(command) {
            switch (command.type) {
                case TYPE_NORMAL_MESSAGE:
                    phiUI.showMessage(command.data);
                    break;
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
                    commandExecutor.exec = normalExec;
                    ws.send(COMMAND_WS_CLOSE);
                    break;
                case 'close':
                    ws.send(COMMAND_WS_CLOSE);
                    commandExecutor.exec = normalExec;
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
                    (commandExecutor.exec = makeTransferExec())(command);
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

                //just ignore
                case 'map':
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

        commandExecutor.setUserId = function(_userId) {
            userId = _userId;
        };

        commandExecutor.resetExecutor = function() {
            commandExecutor.exec = normalExec;
        };

        commandExecutor.bind = function(type, func) {
            switch (type) {
                case 'enter_world':
                    sendMessageEnterWorld = func;
                    break;
                default:
                    phiUI.showError('assertion error.');
                    break;
            }
        };

        commandExecutor.exec = normalExec;

        return commandExecutor;
    }
})();