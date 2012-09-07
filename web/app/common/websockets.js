var socket;
if (window.WebSocket) {
    socket = new WebSocket("ws://localhost:7070/myapp");
    socket.onmessage = function(event) {
        alert("Received data from websocket: " + event.data);
    }
    socket.onopen = function(event) {
        alert("Web Socket opened!");
    };
    socket.onclose = function(event) {
        alert("Web Socket closed.");
    };
} else {
    alert("Your browser does not support Websockets. (Use Chrome)");
}

function send(message) {
    if (!window.WebSocket) {
        return;
    }
    if (socket.readyState == WebSocket.OPEN) {
        socket.send(message);
    } else {
        alert("The socket is not open.");
    }
}