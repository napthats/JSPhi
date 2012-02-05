/**
 * Created by JetBrains WebStorm.
 * User: napthats
 * Date: 12/01/08
 * Time: 16:09
 * To change this template use File | Settings | File Templates.
 */

var com;
if (!com) com = {};
if (!com.napthats) com.napthats = {};
if (!com.napthats.websocket) com.napthats.websocket = {};

(function() {
    var MESSAGE_WEBSOCKET_DISABLE = 'WebsSocket disable';
    var ns = com.napthats.websocket;

    ns.connectWebSocket = function(wsurl, onMessageListener) {
        //check WebSocket enable
        if (!window.WebSocket && !window.MozWebSocket) {
            alert(MESSAGE_WEBSOCKET_DISABLE);
            return;
        }

        //connect WebSocket
        var ws = window.MozWebSocket ? new MozWebSocket(wsurl) : new WebSocket(wsurl);

        //add 'message' EventListener
        if (onMessageListener) {
            ws.addEventListener('message', onMessageListener, false);
        }

        //for finalize WebSocket
        $(window).unload(function(){
            ws.close();
            ws = null;
        });

        return {send: function(msg){
            ws.send(msg);
        }};
    }
})();
