// Milliseconds between frames. 100 means paint runs about 10 times a second.
const TICK_MS = 100;

const leftGutter = document.querySelector("#ascii-left");
const rightGutter = document.querySelector("#ascii-right");
const gutters = [leftGutter, rightGutter];

function makeLine(row, cols) {
  return {
    row,
    col: Math.random() * cols,
    speed: (Math.random() < 0.5 ? -1 : 1) * (0.35 + Math.random() * 0.55),
    length: 3 + Math.floor(Math.random() * 5),
    glyph: Math.random() < 0.3 ? "~" : "-"
  };
}

function makeLines(rows, cols) {
  const lines = [];
  const usedRows = new Set();
  const count = Math.min(rows, Math.max(8, Math.round(rows * 0.4)));

  function addRow(row) {
    if (usedRows.has(row)) {
      return;
    }
    usedRows.add(row);
    lines.push(makeLine(row, cols));
  }

  addRow(0);
  addRow(rows - 1);

  while (lines.length < count) {
    addRow(Math.floor(Math.random() * rows));
  }

  return lines;
}

function columnCount(pre) {
  const styles = window.getComputedStyle(pre);
  const fontSize = parseFloat(styles.fontSize) || 14;
  return Math.max(8, Math.floor(pre.clientWidth / (fontSize * 0.6)));
}

function makeField(pre) {
  const styles = window.getComputedStyle(pre);
  const lineHeight = parseFloat(styles.lineHeight) || 16.8;
  const rows = Math.max(8, Math.floor((pre.clientHeight || window.innerHeight) / lineHeight));
  const cols = columnCount(pre);

  return {
    pre,
    rows,
    cols,
    lines: makeLines(rows, cols)
  };
}

function blankGrid(rows, cols) {
  return Array.from({ length: rows }, () => Array(cols).fill(" "));
}

function wrap(value, max) {
  return ((value % max) + max) % max;
}

function paint(field) {
  const grid = blankGrid(field.rows, field.cols);

  field.lines.forEach((line) => {
    line.col = wrap(line.col + line.speed, field.cols);
    const start = Math.floor(line.col);
    for (let i = 0; i < line.length; i += 1) {
      const col = wrap(start + i, field.cols);
      if (grid[line.row][col] === " ") {
        grid[line.row][col] = line.glyph;
      }
    }
  });

  field.pre.textContent = grid.map((row) => row.join("")).join("\n");
}

function guttersAreVisible() {
  return gutters.every((pre) => pre && window.getComputedStyle(pre).display !== "none");
}

let fields = [];
let timer = null;

function stop() {
  if (timer !== null) {
    window.clearInterval(timer);
    timer = null;
  }
}

function start() {
  stop();
  if (!guttersAreVisible()) {
    fields.forEach((field) => {
      field.pre.textContent = "";
    });
    return;
  }

  fields = gutters.map(makeField);
  timer = window.setInterval(() => {
    fields.forEach(paint);
  }, TICK_MS);
}

document.addEventListener("click", () => {
  fields.forEach((field) => {
    field.lines.forEach((line) => {
      line.speed *= -1;
    });
  });
});

window.addEventListener("resize", start);
start();
