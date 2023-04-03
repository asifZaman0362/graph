interface Point {
  x: number;
  y: number;
}

interface Circle {
  pos: Point;
  radius: number;
}

interface GraphPoint {
  plotted_point: Point; // transformed point specific to the plot itself
  data_point: Point; // raw data point
  hovered: boolean;
}

interface Line {
  name: string;
  hovered: boolean;
  points: Point[];
}

let canvasElem: HTMLCanvasElement | null = null;
let ctx: CanvasRenderingContext2D;

function plotPolyLine(line: Line, canvas: CanvasRenderingContext2D) {
  canvas.lineWidth = 2;
  canvas.strokeStyle = line.hovered ? "blue" : "black";
  canvas.beginPath();
  canvas.moveTo(line.points[0].x, line.points[0].y);
  line.points.slice(1).forEach((point) => {
    canvas.lineTo(point.x, point.y);
    canvas.stroke();
  });
}

function plot(data: GraphPoint[]) {
  let line: Line = {
    name: "Basic",
    hovered: false,
    points: data.map((point) => point.plotted_point),
  };
  if (!ctx) return;
  let _ctx = ctx;
  plotPolyLine(line, _ctx);
  data.forEach((point) => {
    _ctx.fillStyle = point.hovered ? "green" : "red";
    _ctx.beginPath();
    _ctx.ellipse(
      point.plotted_point.x,
      point.plotted_point.y,
      5,
      5,
      0,
      0,
      Math.PI * 2,
      false
    );
    _ctx.fill();
  });
}

function normalised(
  data: Point[],
  width: number,
  height: number,
  start_x: number,
  start_y: number
): GraphPoint[] | null {
  let ret: GraphPoint[] = [];
  if (data == null || data.length == 0) return null;
  let max = data[0].x,
    min = data[0].x;
  data.forEach((item: Point) => {
    if (item.x > max) max = item.x;
    else if (item.x < min) min = item.x;
  });
  let diff = max - min;
  let factor = diff / width;
  console.log(factor);
  data.forEach((item) => {
    let transformed = {
      x: (item.x - min) / factor + start_x,
      y: item.y,
    };
    ret.push({
      plotted_point: transformed,
      data_point: item,
      hovered: false,
    });
  });
  return ret;
}

function getMousePos(canvas: Element, evt: MouseEvent): Point {
  var rect = canvas.getBoundingClientRect();
  return {
    x: evt.clientX - rect.left,
    y: evt.clientY - rect.top,
  };
}

function setup() {
  let points = [
    { x: 10, y: 50 },
    { x: 25, y: 40 },
    { x: 40, y: 60 },
    { x: 55, y: 90 },
  ];
  let transformed = normalised(points, 800, 800, 0, 0);
  canvasElem = document.querySelector("canvas");
  let _ctx = canvasElem?.getContext("2d");
  if (_ctx) {
    ctx = _ctx;
    if (transformed && ctx) {
      plot(transformed);
    }
  } else return;
}

function getDistanceFromLine(a: Point, b: Point, p: Point) {
  let y1 = p.y,
    x1 = p.x;
  let y0 = a.y,
    x0 = a.x;
  let y = b.y,
    x = b.x;
  let distance =
    Math.abs((y1 - y0) * x - (x1 - x0) * y + x1 * y0 - y1 * x0) /
    Math.sqrt((y1 - y0) * (y1 - y0) + (x1 - x0) * (x1 - x0));
  return distance;
}

function isMouseOverCircle(circle: Circle, mouse: Point) {
  let x = circle.pos.x,
    y = circle.pos.y,
    x1 = mouse.x,
    y1 = mouse.y;
  let dist = Math.sqrt((x - x1) * (x - x1) + (y - y1) * (y - y1));
  return dist <= circle.radius;
}

function checkHoverPoints(pos: Point, points: GraphPoint[]) {
  let mouse = {
    x: pos.x,
    y: pos.y,
  };
  let hoveredLine = false;
  for (let i = 1; i < points.length; i++) {
    let prev = points[i - 1].plotted_point;
    let next = points[i].plotted_point;
    let dist = getDistanceFromLine(prev, next, mouse);
    if (dist <= 2) {
      hoveredLine = true;
      break;
    }
  }
  for (let i = 0; i < points.length; i++) {
    let circle = {
      pos: {
        x: points[i].plotted_point.x,
        y: points[i].plotted_point.y,
      },
      radius: 5,
    };
    if (isMouseOverCircle(circle, mouse)) {
      points[i].hovered = true;
      hoveredLine = false;
      break;
    }
  }
  plot(points);
}

function onMouseMove(event: MouseEvent) {
  if (canvasElem) {
    let pos = getMousePos(canvasElem, event);
  }
}

window.addEventListener("load", setup);
