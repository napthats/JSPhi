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
    var MESSAGE_NEWUSER = {
        'newuser':  'DM > Please enter your name (within 31 letters):',
        'name':     'DM > Please enter your password (within 6 letters):',
        'password': 'DM > Plese enter your E-Mail address:',
        'mail':     'DM > OK ? [y/n]'
    };


    ns.makeCommandExecutor = function(_phiUI, _ws) {
        var commandExecutor = {};
        var phiUI = _phiUI;
        var ws = _ws;
        var userId;
        var finishNewuser = function(){};
        var changeWorld = function(){};

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
                            changeWorld(ip + ':' + port);
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

        var makeNewuserExec = function(_name) {
            var state = 'newuser';
            var chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            var name = _name;
            var passwd = '';
            for (var i = 0; i < 6; i++) {
                passwd += chars[Math.floor(Math.random() * chars.length)];
            }

            ws.send('#open newuser');
            ws.send('#version-cli ' + ns.CLIENT_VERSION);

            return function(command) {
                switch(state) {
                    case 'newuser':
                        if(command.data === MESSAGE_NEWUSER['newuser']) {
                            ws.send(name);
                            state = 'name';
                        }
                        break;
                    case 'name':
                        if(command.data === MESSAGE_NEWUSER['name']) {
                            ws.send(passwd);
                            state = 'password';
                        }
                        break;
                    case 'password':
                        if(command.data === MESSAGE_NEWUSER['password']) {
                            ws.send('@');
                            state = 'mail';
                        }
                        break;
                    case 'mail':
                        if(command.data === MESSAGE_NEWUSER['mail']) {
                            ws.send('y');
                            state = 'finish';
                        }
                        break;
                    case 'finish':
                        if(command.type === 'set-user-id') {
                            commandExecutor.exec = normalExec;
                            finishNewuser(command.data);
                        }
                        break;
                }
            }
        };

        var normalExec = function(command) {
            switch (command.type) {
                //normal message or special command from Jetty
                case TYPE_NORMAL_MESSAGE:
                    phiUI.showMessage(command.data);
                    break;
                case '$cnt-no':
                    phiUI.showErrorMessage('Cannot connect a server.');
                    break;

                case 'name':
                    //test
                    //phiUI.setUserName(command.data);
                    //end test
                    break;
                case 'lag':
                    ws.send('#end-lag');
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
                    phiUI.showMap(command.data.map, command.data.objectList);
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
                case 'mapset':
                    phiUI.setMapChipType(command.data);
                    break;
                case 'ex-notice':
                    if (command.data[0] === 'area') phiUI.setAreaName(command.data[1]);
                    if (command.data[0] === 'land') phiUI.setLandName(command.data[1]);
                    break;
                case 'ex-eagleeye':
                    if(command.data.length === 0) break;
                    var eagleeyeMapSize = parseInt(command.data[0].slice(2, 4));
                    for (var i = 0; i < command.data.length; i++) {
                        var line = '';
                        for (var j = 0; j < eagleeyeMapSize; j++) {
                            line += command.data[i].charAt(8 + j * 2);
                            line += ' ';
                        }
                        phiUI.showClientMessage(line);
                    }
                    break;

                //just ignore
                case 's-edit':
                case 'm-edit':
                case '.':
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
                case 'bgm':
                case 'ex-chr-conflict':
                case 'mapset-define':
                case 'guard':
                case 'end-gd':
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
                case 'ex-map':
                    //phiUI.showErrorMessage('not support ex-map.');
                    break;
                case 'ex-switch':
                    //phiUI.showErrorMessage('not support ex-switch.');
                    break;

                //should not receive
                case 'priv':
                    phiUI.showErrorMessage('Not support #priv protocol.');
                    break;
                case 'set-user-id':
                    phiUI.showClientMessage('Unexpected registration command.');
                    break;
                case 'rsv-ok':
                case 'trs_no':
                case 'trs_ok':
                    phiUI.showErrorMessage('Unexpected transfer command.');
                    break;
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
                case 'change_world':
                    changeWorld = func;
                    break;
                case 'finish_newuser':
                    finishNewuser = function(id){func(id)};
                    break;
                default:
                    phiUI.showErrorMessage('assertion error.');
                    break;
            }
        };

        commandExecutor.exec = normalExec;

        commandExecutor.startNewuser = function(name) {
            commandExecutor.exec = makeNewuserExec(name);
        };

        return commandExecutor;
    }
})();