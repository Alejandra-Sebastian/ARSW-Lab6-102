var app = (function () {

    class Point{
        constructor(x,y){
            this.x=x;
            this.y=y;
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
            //x: parseInt(event.pageX) - parseInt(rect.left),
            //y: parseInt(event.pageY) - parseInt(rect.top)
        };
    };


    var connectAndSubscribe = function () {
        console.info('Connecting to WS...');
        var socket = new SockJS('/stompendpoint');
        stompClient = Stomp.over(socket);
        
        //subscribe to /topic/newpoint when connections succeed
        stompClient.connect({}, function (frame) {
            console.log('Connected: ' + frame);
            stompClient.subscribe('/topic/newpoint.' + id, function (eventbody) {
                //var pt=JSON.parse(eventbody.body);
                //addPointToCanvas(pt);
                ctx.beginPath();
                ctx.arc(JSON.parse(eventbody.body).x, JSON.parse(eventbody.body).y, 1, 0, 2 * Math.PI);
                ctx.stroke();
                ctx.closePath();

            });
        });

    };
    
    
    return {

        init: function (paintId) {
            var can = document.getElementById("canvas");
            
            //websocket connection
            can = document.getElementById("canvas");
            //rect = can.getBoundingClientRect();
            ctx = can.getContext("2d");
            id = paintId;
            connectAndSubscribe();
            
            if (window.PointerEvent) {
                can.addEventListener("pointerdown", function(event){
                    //var x = parseInt(event.pageX) - parseInt(rect.left);
                    //var y = parseInt(event.pageY) - parseInt(rect.top);
                    var gmp = getMousePosition(event);
                    var pt = new Point(gmp.x, gmp.y);
                    stompClient.send("/topic/newpoint." + id, {}, JSON.stringify(pt));
                });
            }
        },
        

        publishPoint: function(px,py){
            connectAndSubscribe();
            var pt=new Point(px,py);
            console.info("publishing point at "+pt);
            //addPointToCanvas(pt);
            stompClient.send("/topic/newpoint." + id, {}, JSON.stringify(pt));
            //alert(JSON.stringify(pt));

            //publicar el evento
        },

        disconnect: function () {
            if (stompClient !== null) {
                stompClient.disconnect();
            }
            setConnected(false);
            console.log("Disconnected");
        }
    };

})();