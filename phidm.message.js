/**
 * Created by JetBrains WebStorm.
 * User: user
 * Date: 12/01/13
 * Time: 22:02
 * To change this template use File | Settings | File Templates.
 */

var com;
if (!com) com = {};
if (!com.napthats) com.napthats = {};
if (!com.napthats.jsphi) com.napthats.jsphi = {};

(function() {
    //const
    var DUMMY_MESSAGE_FOR_ERROR = {
        type: 'ERROR'
    };
    var TYPE_OF_NORMAL_MESSAGE = '#NORMAL_MESSAGE#';
    var MULTILINE_START_END_COMMAND = {
        's-edit': '.',
        'm-edit': '.',
        more: 'end-more',
        list: 'end-list'
    };
    var MULTILINE_COMMAND = {
        m57: {
            start: '',
            end: '.'
        },
        'ex-eagleeye': {
            start: 'start',
            end: 'end'
        }
    };
    var CHAR_TO_OBJECT_TYPE = {
        C: 'character',
        B: 'background_object',
        F: 'effect_object'
    };
    //test for using default
    var numToGraphicStatus = function(num) {
        return 'command';
    }
    var numToGraphicStatus = function(num) {
        return 'default';
    }
    //end test

    //variable;
    var ns = com.napthats.jsphi;
    var currentMultilineMessageCommand = null; //multiline mode if it isn't null
    var multilineMessageLog = [];

    //function
    var isMultilineStartCommand;
    var isMultilineEndCommand;
    var endMultilineMode;
    var parseInMultilineMode;
    var parseInNormalMode;
    var makeErrorMessage;



    ns.phidmMessageParse = function(msg) {
        endMultilineMode = function() {
            currentMultilineMessageCommand = null;
            multilineMessageLog = [];
        };

        makeErrorMessage = function(errorData) {
            var result = DUMMY_MESSAGE_FOR_ERROR;
            result.data = errorData;
            return result;
        }

        parseInMultilineMode = function(command, parameters) {
            var result = {type: command, data: ''};
            switch (command) {
                case 'm57':
                    if (!parameters) return makeErrorMessage([command, '']);
                    switch (parameters.charAt(0)) {
                        case '.':
                            result.data = multilineMessageLog;
                            endMultilineMode();
                            return result;
                        case 'M':
                            result = {};
                            result.dir = parameters.charAt(2);
                            result.time = parseInt(parameters.substr(4,8), 16);
                            result.mapChipList = [];
                            var mapString = parameters.substr(13, 98);

                            for (var i = 0; i < 98; i += 2) {
                                var chip = mapString[i];
                                var status = mapString[i + 1];
                                result.mapChipList.push({
                                    chip: chip,
                                    status: {
                                        itemType: status & 0x70,
                                        messageFlag: status & 0xf === 0xf ? true : false,
                                        roofFlag: status & 0x8 === 0x8 ? true : false,
                                        areaID: status & 0x6
                                    }
                                });
                            }
                            //note: overwrite M if it exists already
                            multilineMessageLog.map = result;
                            return;
                        case 'O':
                            result = {};
                            result.type = CHAR_TO_OBJECT_TYPE[parameters.charAt(2)];
                            result.id = parseInt(parameters.substr(3, 4));
                            result.x = parseInt(parameters.charAt(8));
                            result.y = parseInt(parameters.charAt(10));
                            result.dir = parameters.charAt(12);
                            result.name = parameters.substr(14, 31);
                            result.graphic = {
                                status: numToGraphicStatus(parseInt(parameters.substr(46, 2))),
                                name: parameters.substr(49, 15),
                                gigantFlag: parameters.charAt(65) === '*' ? true : false,
                                type: numToGraphicStatus(parameters.substr(67,2))
                            };
                            if (!(multilineMessageLog.objectList)) multilineMessageLog.objectList = [];
                            multilineMessageLog.objectList.push(result);
                            return;
                    }
                    return makeErrorMessage([command, parameters])

                //not support eagleeye yet
                case 'ex-eageleeye':
                    if (parameters === 'end') {
                        result.data = multilineMessageLog;
                        endMultilineMode();
                        return result;
                    }
                    else {
                        multilineMessageLog.push(parameters);
                        return;
                    }

                case 'end-more':
                    if (currentMultilineMessageCommand !== 'more') return makeErrorMessage([command, parameters]);
                    result.type = currentMultilineMessageCommand;
                    result.data = multilineMessageLog;
                    endMultilineMode();
                    return result;
                case 'end-list':
                    if (currentMultilineMessageCommand !== 'list') return makeErrorMessage([command, parameters]);
                    result.type = currentMultilineMessageCommand;
                    result.data = multilineMessageLog;
                    endMultilineMode();
                    return result;
                case '.':
                    if (currentMultilineMessageCommand !== 's-edit' && currentMultilineMessageCommand !== 'm-edit') return makeErrorMessage([command, parameters]);
                    result.type = currentMultilineMessageCommand;
                    result.data = multilineMessageLog;
                    endMultilineMode();
                    return result;

                case TYPE_OF_NORMAL_MESSAGE:
                    multilineMessageLog.push(parameters);
                    return;
            }
        };

        //note: ignore too much parameters
        parseInNormalMode = function(command, parameters) {
            var result = {type: command, data: ''};
            switch (command) {
                //general multiline style
                case 'm57':
                    currentMultilineMessageCommand = 'm57';
                    return parseInMultilineMode(command, parameters);
                case 'ex-eagleeye':
                    if (parameters !== 'start') return makeErrorMessage([command,parameters]);
                    currentMultilineMessageCommand = 'ex-eagleeye';
                    return;

                //start-end multiline style
                case 's-edit':
                    currentMultilineMessageCommand = 's-edit';
                    return;
                case 'm-edit':
                    currentMultilineMessageCommand = 'm-edit';
                    return;
                case 'more':
                    currentMultilineMessageCommand = 'more';
                    return;
                case 'list':
                    currentMultilineMessageCommand = 'list';
                    return;
                case 'imagelist':
                    currentMultilineMessageCommand = 'imagelist';
                    return;
                //should appear in multiline mode
                case 'end-more':
                    return makeErrorMessage([command, parameters]);
                case 'end-list':
                    return makeErrorMessage([command, parameters]);
                case '.':
                    return makeErrorMessage([command, parameters]);

                //key=value style
                case 'ex-notice':
                case 'ex-map':
                case 'ex-switch':
                    result.data = parameters.split('=', 2);
                    return result;

                //some parameters
                case 'status':
                    result.data = [parameters.substr(0, 31), parameters.substr(34).split(/[ :]+/, 10)];
                    return result;

                //two parameters
                case 'user':
                case 'priv':
                case 'mapset-define':
                    result.data = parameters.split(' ', 2);
                    return result;

                //one parameter
                case 'cond':
                case 'name':
                case 'mapChipList':
                case 'ch-srv':
                case 'getimage':
                case 'version-srv':
                case 'leave-win':
                case 'enter-win':
                case 'set-user-id':
                case 'mapset':
                case 'bgm':
                case 'version-dm':
                    result.data = parameters;
                    return result;

                //no parameter
                default:
                    return result;
            }
        };


        if (!msg) return;
        //special command of phi_dm
        if (msg.charAt(0) === '#') {
            msg = msg.replace(/\r|\n/g, '');
            msg = msg.replace(/\s+$/, '');
            //split at the first space
            var firstSpaceIdx = msg.indexOf(' ');
            var command = firstSpaceIdx === -1 ? msg.substring(1) : msg.substring(1, firstSpaceIdx);
            if (currentMultilineMessageCommand) {
                return parseInMultilineMode(command, msg.substring(firstSpaceIdx + 1));
            }
            else {
                return parseInNormalMode(command, msg.substring(firstSpaceIdx + 1));
            }
        }
        //normal message or part of multiline command
        else {
            if (currentMultilineMessageCommand) {
                return parseInMultilineMode(TYPE_OF_NORMAL_MESSAGE, msg);
            }
            else {
                return {
                    type: TYPE_OF_NORMAL_MESSAGE,
                    data: msg
                };
            }
        }
    };
})();

