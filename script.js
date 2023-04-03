var canvasElem = null;
var ctx;
function plotPolyLine(line, canvas) {
    canvas.lineWidth = 2;
    canvas.strokeStyle = line.hovered ? "blue" : "black";
    canvas.beginPath();
    canvas.moveTo(line.points[0].x, line.points[0].y);
    line.points.slice(1).forEach(function (point) {
        canvas.lineTo(point.x, point.y);
        canvas.stroke();
    });
}
function plot(data) {
    var line = {
        name: "Basic",
        hovered: false,
        points: data.map(function (point) { return point.plotted_point; })
    };
    if (!ctx)
        return;
    var _ctx = ctx;
    plotPolyLine(line, _ctx);
    data.forEach(function (point) {
        _ctx.fillStyle = point.hovered ? "green" : "red";
        _ctx.beginPath();
        _ctx.ellipse(point.plotted_point.x, point.plotted_point.y, 5, 5, 0, 0, Math.PI * 2, false);
        _ctx.fill();
    });
}
function normalised(data, width, height, start_x, start_y) {
    var ret = [];
    if (data == null || data.length == 0)
        return null;
    var max = data[0].x, min = data[0].x;
    data.forEach(function (item) {
        if (item.x > max)
            max = item.x;
        else if (item.x < min)
            min = item.x;
    });
    var diff = max - min;
    var factor = diff / width;
    console.log(factor);
    data.forEach(function (item) {
        var transformed = {
            x: (item.x - min) / factor + start_x,
            y: item.y
        };
        ret.push({
            plotted_point: transformed,
            data_point: item,
            hovered: false
        });
    });
    return ret;
}
function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}
function setup() {
    var points = [
        { x: 10, y: 50 },
        { x: 25, y: 40 },
        { x: 40, y: 60 },
        { x: 55, y: 90 },
    ];
    var transformed = normalised(points, 800, 800, 0, 0);
    canvasElem = document.querySelector("canvas");
    var _ctx = canvasElem === null || canvasElem === void 0 ? void 0 : canvasElem.getContext("2d");
    if (_ctx) {
        ctx = _ctx;
        if (transformed && ctx) {
            plot(transformed);
        }
    }
    else
        return;
}
function getDistanceFromLine(a, b, p) {
    var y1 = p.y, x1 = p.x;
    var y0 = a.y, x0 = a.x;
    var y = b.y, x = b.x;
    var distance = Math.abs((y1 - y0) * x - (x1 - x0) * y + x1 * y0 - y1 * x0) /
        Math.sqrt((y1 - y0) * (y1 - y0) + (x1 - x0) * (x1 - x0));
    return distance;
}
function isMouseOverCircle(circle, mouse) {
    var x = circle.pos.x, y = circle.pos.y, x1 = mouse.x, y1 = mouse.y;
    var dist = Math.sqrt((x - x1) * (x - x1) + (y - y1) * (y - y1));
    return dist <= circle.radius;
}
function checkHoverPoints(pos, points) {
    var mouse = {
        x: pos.x,
        y: pos.y
    };
    var hoveredLine = false;
    for (var i = 1; i < points.length; i++) {
        var prev = points[i - 1].plotted_point;
        var next = points[i].plotted_point;
        var dist = getDistanceFromLine(prev, next, mouse);
        if (dist <= 2) {
            hoveredLine = true;
            break;
        }
    }
    for (var i = 0; i < points.length; i++) {
        var circle = {
            pos: {
                x: points[i].plotted_point.x,
                y: points[i].plotted_point.y
            },
            radius: 5
        };
        if (isMouseOverCircle(circle, mouse)) {
            points[i].hovered = true;
            hoveredLine = false;
            break;
        }
    }
    plot(points);
}
function onMouseMove(event) {
    if (canvasElem) {
        var pos = getMousePos(canvasElem, event);
    }
}
window.addEventListener("load", setup);
