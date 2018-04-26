var app = (function () {

class Point{
    constructor(x, y){
    this.x = x;
            this.y = y;
    }
}

var stompClient = null;
        var can = null;
        var rect = null;
        var ctx = null;
        var id = 0;
        
    var addPointToCanvas = function (point) {
        var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext("2d");
        ctx.beginPath();
        ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
        ctx.stroke();
    };
    
    var getMousePosition = function (evt) {
    canvas = document.getElementById("canvas");
            var rect = canvas.getBoundingClientRect();
            return {
            x: evt.clientX - rect.left,
                    y: evt.clientY - rect.top
            };
    };
    
    var connectAndSubscribe = function () {
        console.info('Connecting to WS...');
        var socket = new SockJS('/stompendpoint');
        stompClient = Stomp.over(socket);
        //subscribe to /topic/TOPICXX when connections succeed
        stompClient.connect({}, function (frame) {
            console.log('Connected: ' + frame);
            stompClient.subscribe('/topic/newpoint.' + id, function (eventbody) {
            ctx.beginPath();
                ctx.arc(JSON.parse(eventbody.body).x, JSON.parse(eventbody.body).y, 1, 0, 2 * Math.PI);
                ctx.stroke();
                ctx.closePath();
            });
            stompClient.subscribe('/topic/newpolygon.' + id, function (eventbody) {
            var points = JSON.parse(eventbody.body);
                ctx.beginPath();
                ctx.fillStyle = '#00FF00';
                ctx.beginPath();
                ctx.moveTo(points[0].x, points[0].y);
                ctx.lineTo(points[1].x, points[1].y);
                ctx.lineTo(points[2].x, points[2].y);
                ctx.lineTo(points[3].x, points[3].y);
                ctx.closePath();
                ctx.fill();
            });
        });
    };
    
    return {

        init: function () {
        can = document.getElementById("canvas");
                rect = can.getBoundingClientRect();
                ctx = can.getContext("2d");
                //websocket connection
                if (window.PointerEvent) {
                    can.addEventListener("pointerdown", function(event){
                        var x = parseInt(event.pageX) - parseInt(rect.left);
                        var y = parseInt(event.pageY) - parseInt(rect.top);
                        var pt = new Point(x, y);
                        stompClient.send("/app/newpoint." + id, {}, JSON.stringify(pt));
        });
        }
        },
        publishPoint: function(px, py){
        var pt = new Point(px, py);
                console.info("publishing point at " + pt);
                addPointToCanvas(pt);
                stompClient.send("/app/newpoint", {}, JSON.stringify(pt));
                //publicar el evento
        },
        disconnect: function () {
        if (stompClient !== null) {
        stompClient.disconnect();
        }
        setConnected(false);
                console.log("Disconnected");
        },
        suscribe: function (dibujo){
        id = dibujo;
                connectAndSubscribe();
        }
    };
})();