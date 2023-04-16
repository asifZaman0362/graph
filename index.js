var config = {
    STROKE_SIZE_NORMAL: 2,
    STROKE_SIZE_HOVERED: 3,
    COLOR_LINE_NORMAL: "green",
    COLOR_LINE_HOVERED: "blue",
    COLOR_POINT_NORMAL: "orange",
    COLOR_POINT_HOVERED: "red",
    POINT_SIZE_NORMAL: 5,
    POINT_SIZE_HOVERED: 7,
};
function axes(ctx, config) {
    ctx.lineWidth = 2;
    ctx.strokeStyle = config.xAxisColor;
    ctx.moveTo(config.marginx, config.height - config.marginy);
    ctx.lineTo(config.width - config.marginx, config.height - config.marginy);
    ctx.stroke();
    ctx.strokeStyle = config.yAxisColor;
    ctx.moveTo(config.marginx, config.marginy);
    ctx.lineTo(config.marginx, config.height - config.marginy);
    ctx.stroke();
}
var GraphPoint = /** @class */ (function () {
    function GraphPoint() {
    }
    return GraphPoint;
}());
var Point = /** @class */ (function () {
    function Point() {
    }
    return Point;
}());
var LineSegment = /** @class */ (function () {
    function LineSegment() {
    }
    return LineSegment;
}());
var PolyLine = /** @class */ (function () {
    function PolyLine() {
    }
    return PolyLine;
}());
var rawData = [
    [
        { x: 0, y: 100 },
        { x: 50, y: 400 },
        { x: 100, y: 100 },
        { x: 150, y: 540 },
        { x: 200, y: 300 }
    ],
];
var height = 640;
var width = 640;
function distance(a, b) {
    return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
}
function distanceLine(point, line) {
    var _a = [
        line.start.x,
        line.start.y,
        line.end.x,
        line.end.y,
        point.x,
        point.y,
    ], x0 = _a[0], y0 = _a[1], x = _a[2], y = _a[3], x1 = _a[4], y1 = _a[5];
    var numerator = Math.abs((y1 - y0) * x - (x1 - x0) * y + x1 * y0 - y1 * x0);
    var denominator = Math.sqrt(Math.pow((y1 - y0), 2) + Math.pow((x1 - x0), 2));
    return numerator / denominator;
}
function isPointHovered(point, mouse) {
    var radius = point.hovered
        ? config.POINT_SIZE_HOVERED
        : config.POINT_SIZE_NORMAL;
    return distance(point, mouse) <= radius;
}
function isLineHovered(line, mouse) {
    if (mouse.x > Math.max(line.start.x, line.end.x) || mouse.x < Math.min(line.start.x, line.end.x)
        || mouse.y > Math.max(line.start.y, line.end.y) || mouse.y < Math.min(line.start.y, line.end.y))
        return false;
    var threshold = 15;
    return distanceLine(mouse, line) <= threshold;
}
function getMousePosition(canvas, event) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
    };
}
function checkForHover(mousePos, data) {
    var found = false;
    for (var _i = 0, data_1 = data; _i < data_1.length; _i++) {
        var line = data_1[_i];
        for (var _a = 0, _b = line.points; _a < _b.length; _a++) {
            var point = _b[_a];
            if (found)
                point.hovered = false;
            else if (isPointHovered(point, mousePos)) {
                point.hovered = true;
                found = true;
            }
            else
                point.hovered = false;
        }
    }
    for (var _c = 0, data_2 = data; _c < data_2.length; _c++) {
        var line = data_2[_c];
        if (line.points.length == 0)
            continue;
        var prev = line.points[0];
        for (var _d = 0, _e = line.points.slice(1); _d < _e.length; _d++) {
            var point = _e[_d];
            if (found)
                line.hovered = false;
            else if (isLineHovered({ start: prev, end: point }, mousePos)) {
                found = true;
                line.hovered = true;
                break;
            }
            else
                line.hovered = false;
            prev = point;
        }
    }
    return data;
}
function setup() {
    var canvas = document.createElement("canvas");
    canvas.height = height;
    canvas.width = width;
    document.body.appendChild(canvas);
    var context = canvas.getContext("2d");
    var data = transformData(rawData, 100, 100, width - 200, height - 200);
    if (!context)
        return;
    canvas.addEventListener("mousemove", function (event) {
        var mousePos = getMousePosition(canvas, event);
        data = checkForHover(mousePos, data);
        render(context, data);
    });
}
function drawLine(ctx, line, hovered) {
    var _a = ["", 0], color = _a[0], width = _a[1];
    if (hovered) {
        color = config.COLOR_LINE_HOVERED;
        width = config.STROKE_SIZE_HOVERED;
    }
    else {
        color = config.COLOR_LINE_NORMAL;
        width = config.STROKE_SIZE_NORMAL;
    }
    ctx.lineWidth = width;
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(line.start.x, line.start.y);
    ctx.lineTo(line.end.x, line.end.y);
    ctx.stroke();
}
function drawLineCustom(ctx, start, end, color, width) {
    ctx.lineWidth = width;
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
}
function drawPoint(ctx, point) {
    var _a = ["", 0], color = _a[0], radius = _a[1];
    if (point.hovered) {
        color = config.COLOR_POINT_HOVERED;
        radius = config.POINT_SIZE_HOVERED;
    }
    else {
        color = config.COLOR_POINT_NORMAL;
        radius = config.POINT_SIZE_NORMAL;
    }
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(point.x, point.y, radius, radius, 0, 0, Math.PI * 2);
    ctx.fill();
}
function transformData(data, startx, starty, width, height) {
    var transformed = [];
    if (data.length == 0 || data[0].length == 0)
        return transformed;
    var max = { x: 0, y: 0 };
    var min = { x: data[0][0].x, y: data[0][0].y };
    for (var _i = 0, data_3 = data; _i < data_3.length; _i++) {
        var line = data_3[_i];
        for (var _a = 0, line_1 = line; _a < line_1.length; _a++) {
            var point = line_1[_a];
            if (point.x > max.x)
                max.x = point.x;
            else if (point.x < min.x)
                min.x = point.x;
            if (point.y > max.y)
                max.y = point.y;
            else if (point.y < min.y)
                min.y = point.y;
        }
    }
    var xfactor = (max.x - min.x) / width;
    var yfactor = (max.y - min.y) / height;
    for (var _b = 0, data_4 = data; _b < data_4.length; _b++) {
        var line = data_4[_b];
        var newLine = new PolyLine();
        newLine.points = [];
        for (var _c = 0, line_2 = line; _c < line_2.length; _c++) {
            var point = line_2[_c];
            newLine.points.push({
                x: (point.x - min.x) / xfactor + startx,
                y: height - ((point.y - min.y) / yfactor - starty),
                data: point,
                hovered: false,
            });
        }
        transformed.push(newLine);
    }
    return transformed;
}
function drawAxes(ctx, startx, endx, lineWidth, offsetx, intervalsx, labelx, starty, endy, offsety, intervalsy, labely, width_data, data_start_x, height_data, data_start_y) {
    // draw y axis
    drawLineCustom(ctx, { x: startx + offsetx, y: starty + offsety }, { x: startx + offsetx, y: endy + offsety }, "black", lineWidth);
    // draw y axis label
    ctx.save();
    ctx.translate(startx - 50, (endy - starty) / 2 + starty);
    ctx.rotate(Math.PI * 1.5);
    ctx.fillStyle = "black";
    ctx.textAlign = "center";
    ctx.fillText(labely, 0, 0);
    ctx.restore();
    // draw x axis
    drawLineCustom(ctx, { x: startx + offsetx, y: endy }, { x: endx + offsetx, y: endy }, "black", lineWidth);
    // draw x axis label
    ctx.fillStyle = "black";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText(labelx, (endx - startx) / 2 + startx, endy + 30);
    var dx = width_data / intervalsx;
    var dy = height_data / intervalsy;
    for (var x = 0; x <= intervalsx; x++) {
        var xpos = x * (endx - startx) / intervalsx + startx;
        var data_point_x = (dx * x) + data_start_x;
        ctx.fillStyle = "black";
        ctx.font = "14px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.fillText(data_point_x.toString(), xpos, endy + 10);
    }
    for (var y = 0; y <= intervalsy; y++) {
        var ypos = y * (endy - starty) / intervalsy + starty;
        var data_point_y = height_data - (y * dy) + data_start_y;
        ctx.fillStyle = "black";
        ctx.font = "14px sans-serif";
        ctx.textBaseline = "middle";
        ctx.textAlign = "right";
        ctx.fillText(data_point_y.toString(), startx - 10, ypos);
        drawLineCustom(ctx, { x: startx + offsetx, y: ypos + offsety }, { x: endx + offsetx, y: ypos + offsety }, y == 0 ? "gray" : "gray", lineWidth);
    }
}
function render(ctx, data) {
    ctx.clearRect(0, 0, width, height);
    drawAxes(ctx, 100, width - 100, 1, 0, 4, "time", 100, height - 100, 0, 10, "your mom's weight(lbs)", 200, 0, 440, 100);
    for (var _i = 0, data_5 = data; _i < data_5.length; _i++) {
        var line = data_5[_i];
        if (line.points.length == 0)
            continue;
        var prev = line.points[0];
        for (var _a = 0, _b = line.points.slice(1); _a < _b.length; _a++) {
            var point = _b[_a];
            drawLine(ctx, { start: prev, end: point }, line.hovered);
            prev = point;
        }
    }
    for (var _c = 0, data_6 = data; _c < data_6.length; _c++) {
        var line = data_6[_c];
        if (line.points.length == 0)
            continue;
        for (var _d = 0, _e = line.points; _d < _e.length; _d++) {
            var point = _e[_d];
            drawPoint(ctx, point);
        }
    }
}
window.addEventListener("load", setup);
