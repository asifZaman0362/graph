// from https://stackoverflow.com/a/7838871
CanvasRenderingContext2D.prototype.roundRect = function(x: number, y: number, w: number, h: number, r: number) {
  if (w < 2 * r) r = w / 2;
  if (h < 2 * r) r = h / 2;
  this.beginPath();
  this.moveTo(x + r, y);
  this.arcTo(x + w, y, x + w, y + h, r);
  this.arcTo(x + w, y + h, x, y + h, r);
  this.arcTo(x, y + h, x, y, r);
  this.arcTo(x, y, x + w, y, r);
  this.closePath();
  return this;
}

let config = {
  STROKE_SIZE_NORMAL: 2,
  STROKE_SIZE_HOVERED: 3,
  COLOR_LINE_NORMAL: "green",
  COLOR_LINE_HOVERED: "blue",
  COLOR_POINT_NORMAL: "orange",
  COLOR_POINT_HOVERED: "red",
  POINT_SIZE_NORMAL: 5,
  POINT_SIZE_HOVERED: 7,
};

interface Config {
  width: number         // The width of the canvas
  height: number        // The height of the canvas
  marginx: number       // The margin on the x-axis
  marginy: number       // The margin on the y-axis
  xAxisColor: string    // The color of the x axis line
  yAxisColor: string    // The color of the y axis line
}

type Ctx = CanvasRenderingContext2D;

function axes(ctx: Ctx, config: Config) {
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

class GraphPoint {
  x: number;
  y: number;
  data: Point;
  hovered: boolean;
}

class Point {
  x: number;
  y: number;
}

class LineSegment {
  start: Point;
  end: Point;
}

class PolyLine {
  points: GraphPoint[];
  hovered: boolean;
}

type Context = CanvasRenderingContext2D;
type RawData = Point[][];

let rawData: RawData = [
  [
    { x: 0, y: 100 },
    { x: 50, y: 400 },
    { x: 100, y: 100 },
    { x: 150, y: 540 },
    { x: 200, y: 300 }
  ],
];

let height = 640;
let width = 640;

function distance(a: Point, b: Point) {
  return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
}

function distanceLine(point: Point, line: LineSegment) {
  let [x0, y0, x, y, x1, y1] = [
    line.start.x,
    line.start.y,
    line.end.x,
    line.end.y,
    point.x,
    point.y,
  ];
  const numerator = Math.abs((y1 - y0) * x - (x1 - x0) * y + x1 * y0 - y1 * x0);
  const denominator = Math.sqrt((y1 - y0) ** 2 + (x1 - x0) ** 2);
  return numerator / denominator;
}

function isPointHovered(point: GraphPoint, mouse: Point) {
  let radius = point.hovered
    ? config.POINT_SIZE_HOVERED
    : config.POINT_SIZE_NORMAL;
  return distance(point, mouse) <= radius;
}

function isLineHovered(line: LineSegment, mouse: Point) {
  if (mouse.x > Math.max(line.start.x, line.end.x) || mouse.x < Math.min(line.start.x, line.end.x)
    || mouse.y > Math.max(line.start.y, line.end.y) || mouse.y < Math.min(line.start.y, line.end.y)) return false;
  let threshold = 15;
  return distanceLine(mouse, line) <= threshold;
}

function getMousePosition(canvas: HTMLCanvasElement, event: MouseEvent) {
  var rect = canvas.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  };
}

function checkForHover(mousePos: Point, data: PolyLine[]) {
  let found = false;
  for (let line of data) {
    for (let point of line.points) {
      if (found) point.hovered = false;
      else if (isPointHovered(point, mousePos)) {
        point.hovered = true;
        found = true;
      } else point.hovered = false;
    }
  }
  for (let line of data) {
    if (line.points.length == 0) continue;
    let prev = line.points[0];
    for (let point of line.points.slice(1)) {
      if (found) line.hovered = false;
      else if (isLineHovered({ start: prev, end: point }, mousePos)) {
        found = true;
        line.hovered = true;
        break;
      } else line.hovered = false;
      prev = point;
    }
  }
  return data;
}

function setup() {
  let canvas = document.createElement("canvas");
  canvas.height = height;
  canvas.width = width;
  document.body.appendChild(canvas);
  const context = canvas.getContext("2d");
  let data = transformData(rawData, 100, 100, width - 200, height - 200);
  if (!context) return;
  canvas.addEventListener("mousemove", (event: MouseEvent) => {
    const mousePos = getMousePosition(canvas, event);
    data = checkForHover(mousePos, data);
    render(context, data);
  });
}

function drawLine(ctx: Context, line: LineSegment, hovered: boolean) {
  let [color, width] = ["", 0];
  if (hovered) {
    color = config.COLOR_LINE_HOVERED;
    width = config.STROKE_SIZE_HOVERED;
  } else {
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

function drawLineCustom(ctx: Context, start: Point, end: Point, color: string, width: number) {
  ctx.lineWidth = width;
  ctx.strokeStyle = color;
  ctx.beginPath();
  ctx.moveTo(start.x, start.y);
  ctx.lineTo(end.x, end.y);
  ctx.stroke();
}

function drawPoint(ctx: Context, point: GraphPoint) {
  let [color, radius] = ["", 0];
  if (point.hovered) {
    color = config.COLOR_POINT_HOVERED;
    radius = config.POINT_SIZE_HOVERED;
    ctx.beginPath();
    const [x, y] = [point.data.x, point.data.y];
    const textSize = ctx.measureText(`${x}, ${y}`);
    const boxWidth = textSize.width + 10;
    const boxHeight = 25;
    ctx.roundRect(point.x - boxWidth / 2, (point.y - boxHeight / 2) - 30, boxWidth, boxHeight, 10);
    ctx.strokeStyle = "black";
    ctx.fillStyle = "white";
    ctx.fill();
    ctx.stroke();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "black";
    ctx.fillText(`${x}, ${y}`, point.x, point.y - 30);
    ctx.lineWidth = 1;
  } else {
    color = config.COLOR_POINT_NORMAL;
    radius = config.POINT_SIZE_NORMAL;
  }
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(point.x, point.y, radius, radius, 0, 0, Math.PI * 2);
  ctx.fill();
}

function transformData(
  data: RawData,
  startx: number,
  starty: number,
  width: number,
  height: number
) {
  let transformed: PolyLine[] = [];
  if (data.length == 0 || data[0].length == 0) return transformed;
  let max = { x: 0, y: 0 };
  let min = { x: data[0][0].x, y: data[0][0].y };
  for (let line of data) {
    for (let point of line) {
      if (point.x > max.x) max.x = point.x;
      else if (point.x < min.x) min.x = point.x;
      if (point.y > max.y) max.y = point.y;
      else if (point.y < min.y) min.y = point.y;
    }
  }
  let xfactor = (max.x - min.x) / width;
  let yfactor = (max.y - min.y) / height;
  for (let line of data) {
    let newLine = new PolyLine();
    newLine.points = [];
    for (let point of line) {
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

function drawAxes(
  ctx: CanvasRenderingContext2D,
  startx: number,
  endx: number,
  lineWidth: number,
  offsetx: number,
  intervalsx: number,
  labelx: string,
  starty: number,
  endy: number,
  offsety: number,
  intervalsy: number,
  labely: string,
  width_data: number,
  data_start_x: number,
  height_data: number,
  data_start_y: number
) {
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
  let dx = width_data / intervalsx;
  let dy = height_data / intervalsy;
  for (let x = 0; x <= intervalsx; x++) {
    let xpos = x * (endx - startx) / intervalsx + startx;
    let data_point_x = (dx * x) + data_start_x;
    ctx.fillStyle = "black";
    ctx.font = "14px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText(data_point_x.toString(), xpos, endy + 10);
  }
  for (let y = 0; y <= intervalsy; y++) {
    let ypos = y * (endy - starty) / intervalsy + starty;
    let data_point_y = height_data - (y * dy) + data_start_y;
    ctx.fillStyle = "black";
    ctx.font = "14px sans-serif";
    ctx.textBaseline = "middle";
    ctx.textAlign = "right";
    ctx.fillText(data_point_y.toString(), startx - 10, ypos);
    drawLineCustom(ctx, { x: startx + offsetx, y: ypos + offsety }, { x: endx + offsetx, y: ypos + offsety }, y == 0 ? "gray" : "gray", lineWidth);
  }
}

function render(ctx: Context, data: PolyLine[]) {
  ctx.clearRect(0, 0, width, height);
  drawAxes(ctx, 100, width - 100, 1, 0, 4, "time", 100, height - 100, 0, 10, "your mom's weight(lbs)", 200, 0, 440, 100);
  for (let line of data) {
    if (line.points.length == 0) continue;
    let prev = line.points[0];
    for (let point of line.points.slice(1)) {
      drawLine(ctx, { start: prev, end: point }, line.hovered);
      prev = point;
    }
  }
  for (let line of data) {
    if (line.points.length == 0) continue;
    for (let point of line.points) {
      drawPoint(ctx, point);
    }
  }
}

window.addEventListener("load", setup);
