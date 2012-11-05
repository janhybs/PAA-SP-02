(function () {
    var canvas, canvas;
    var context, context;
    var isDown;
    var lastPoint;
    var strokeWeight = 5;
    var DrawSomething = {};
    var intID = -1;
    var _isSupported = null;

    DrawSomething.isSupported = function () {
        if (_isSupported === null) {
            var tmpCanvas;
            _isSupported = !!(tmpCanvas = document.createElement ('canvas')).getContext
                    && tmpCanvas.toDataURL ("image/png").indexOf ("data:image/png") === 0;
        }

        return _isSupported;
    };

    DrawSomething.clearCanvas = function () {
        context.fillStyle = "#FFFFFF";
        context.fillRect (0, 0, canvas.width, canvas.height);
    };


    DrawSomething.onMouseDown = function (e) {
        isDown = true;

        if (e.touches && e.touches.length > 0)
            DrawSomething.startDrawing (DrawSomething.getCoords (e.touches[0]));
        else
            DrawSomething.startDrawing (DrawSomething.getCoords (e));
        e.preventDefault ();

    };

    DrawSomething.onMouseUp = function (e) {
        isDown = false;

        if (e.touches && e.touches.length > 0)
            DrawSomething.endDrawing (DrawSomething.getCoords (e.touches[0]));
        else
            DrawSomething.endDrawing (DrawSomething.getCoords (e));
        e.preventDefault ();
    };

    DrawSomething.onMouseMove = function (e) {
        if (!isDown)
            return;

        if (e.touches && e.touches.length > 0)
            DrawSomething.addDrawing (DrawSomething.getCoords (e.touches[0]));
        else
            DrawSomething.addDrawing (DrawSomething.getCoords (e));
        e.preventDefault ();
    };

    DrawSomething.onMouseLeave = function (e) {
        isDown = false;
        e.preventDefault ();
    };

    DrawSomething.getCoords = function (e) {
        if (e.offsetX)
            return new Point (e.offsetX, e.offsetY);
        else if (e.layerX)
            return new Point (e.layerX - canvas.offsetLeft, e.layerY - canvas.offsetTop);
        else if (e.pageX)
            return new Point (e.pageX - canvas.offsetLeft, e.pageY - canvas.offsetTop);
    };

    DrawSomething.startDrawing = function (point) {
        context.lineJoin = 'round';
        context.lineCap = 'round';
        context.lineWidth = strokeWeight;
        lastPoint = point;
    };

    DrawSomething.endDrawing = function (point) {
        if (lastPoint.x === point.x && lastPoint.y === point.y) {
            context.beginPath ();
            context.moveTo (lastPoint.x, lastPoint.y);
            context.lineTo (point.x, point.y);
            context.lineTo (point.x + 0.001, point.y + 0.001);
            context.stroke ();
        }
    };

    DrawSomething.getImageData = function (type) {
        return canvas.toDataURL (type || "image/png");
    };

    DrawSomething.addDrawing = function (point) {
        context.beginPath ();
        context.moveTo (lastPoint.x, lastPoint.y);
        context.lineTo (point.x, point.y);
        context.stroke ();
        lastPoint = point;
    };

    DrawSomething.changeColor = function (event) {
        var color = event.target.innerHTML;
        if (color !== "Fill") {
            context.strokeStyle = color;
            $ ("#drawSomething li").cls ("selected", "remove");
            $ (event.target).cls ("selected", "add");
        } else {
            context.fillStyle = context.strokeStyle;
            context.fillRect (0, 0, canvas.width, canvas.height);
        }

    };

    DrawSomething.setStrokeWeight = function (value) {
        if (typeof (value) === 'string')
            value = value.charAt (0) === "+" ? strokeWeight + 1 : strokeWeight - 1;
        value = value > 40 ? 40 : value < 1 ? 1 : value;
        $ ("#strokeWidth").html (strokeWeight = value);
    };


    DrawSomething.init = function () {
        canvas = $ ('#drawCanvas').find ();
        context = canvas.getContext ('2d');
        context.fillStyle = "#FFFFFF";
        context.fillRect (0, 0, canvas.width, canvas.height);

        canvas.onmousedown = DrawSomething.onMouseDown;
        canvas.onmouseup = DrawSomething.onMouseUp;
        canvas.onmousemove = DrawSomething.onMouseMove;
        canvas.onmouseout = DrawSomething.onMouseLeave;

        canvas.ontouchstart = DrawSomething.onMouseDown;
        canvas.ontouchend = DrawSomething.onMouseUp;
        canvas.ontouchmove = DrawSomething.onMouseMove;

        $ ("#drawSomething li").on ("click", DrawSomething.changeColor);

        $ ('#strokeInc').on ('mouseup', function () {
            clearInterval (intID);
        });

        $ ('#strokeDec').on ('mouseup', function () {
            clearInterval (intID);
        });

        $ ('#strokeInc').on ('mousedown', function (e) {
            e.preventDefault ();
            DrawSomething.setStrokeWeight ("+1");
            clearInterval (intID);
            intID = setTimeout (function () {
                intID = setInterval (function () {
                    DrawSomething.setStrokeWeight ("+1");
                }, 100);
            }, 250);
        });

        $ ('#strokeDec').on ('mousedown', function (e) {
            e.preventDefault ();
            DrawSomething.setStrokeWeight ("-1");
            clearInterval (intID);
            setTimeout (function () {
                intID = setInterval (function () {
                    DrawSomething.setStrokeWeight ("-1");
                }, 100);
            }, 250);
        });

        $ ('#drawCanvas').on ('click', function (e) {
            e.preventDefault ();
        });
        $ ('#drawCanvas').on ('touchstart', function (e) {
            e.preventDefault ();
        });
    };

    window.DrawSomething = DrawSomething;
}) ();


















function Point (x, y) {
    this.x = x;
    this.y = y;
}