const socket = io();
let state = null;
const map = new Image();
let mapLoaded = false;
let fogPattern = null;

function fitCanvas(canvas) {
  if (!state) return;
  canvas.width = state.cols * state.gridSize;
  canvas.height = state.rows * state.gridSize;
}

function loadMap(onDone) {
  mapLoaded = false;
  if (!state || !state.mapUrl) {
    if (onDone) onDone();
    return;
  }
  map.onload = () => { mapLoaded = true; if (onDone) onDone(); };
  map.src = state.mapUrl;
}

function makeFogPattern(ctx) {
  if (fogPattern) return fogPattern;
  const p = document.createElement('canvas');
  p.width = 160;
  p.height = 160;
  const g = p.getContext('2d');
  const base = g.createLinearGradient(0, 0, 160, 160);
  base.addColorStop(0, '#1f6478');
  base.addColorStop(0.45, '#2a7f96');
  base.addColorStop(1, '#16495b');
  g.fillStyle = base;
  g.fillRect(0, 0, p.width, p.height);
  for (let i = 0; i < 260; i++) {
    const x = Math.random() * p.width;
    const y = Math.random() * p.height;
    const r = 10 + Math.random() * 45;
    const grd = g.createRadialGradient(x, y, 0, x, y, r);
    grd.addColorStop(0, `rgba(120,210,230,${0.035 + Math.random() * 0.08})`);
    grd.addColorStop(1, 'rgba(30,95,115,0)');
    g.fillStyle = grd;
    g.beginPath();
    g.arc(x, y, r, 0, Math.PI * 2);
    g.fill();
  }
  fogPattern = ctx.createPattern(p, 'repeat');
  return fogPattern;
}

function drawFogTile(ctx, c, r, size, viewMode, dmFogOpacity) {
  const x = c * size;
  const y = r * size;
  if (viewMode === 'player') {
    ctx.fillStyle = makeFogPattern(ctx);
    ctx.fillRect(x, y, size, size);
    ctx.fillStyle = 'rgba(130,220,235,0.04)';
    ctx.fillRect(x, y, size, 1);
    ctx.fillRect(x, y, 1, size);
    ctx.fillStyle = 'rgba(5,22,30,0.18)';
    ctx.fillRect(x, y, size, size);
    return;
  }

  ctx.fillStyle = `rgba(32,110,130,${Math.min(0.75, dmFogOpacity + 0.12)})`;
  ctx.fillRect(x, y, size, size);
  ctx.strokeStyle = 'rgba(95,230,255,0.9)';
  ctx.lineWidth = 2;
  ctx.strokeRect(x + 1, y + 1, size - 2, size - 2);

  ctx.strokeStyle = 'rgba(95,230,255,0.38)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x + 4, y + 4);
  ctx.lineTo(x + size - 4, y + size - 4);
  ctx.moveTo(x + size - 4, y + 4);
  ctx.lineTo(x + 4, y + size - 4);
  ctx.stroke();
}

function drawBase(ctx, canvas, viewMode = 'player', options = {}) {
  const dmFogOpacity = options.dmFogOpacity ?? 0.35;
  const showGrid = options.showGrid ?? viewMode === 'dm';
  const selectedCells = options.selectedCells || new Set();

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#111';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (state && state.mapUrl && mapLoaded) {
    ctx.drawImage(map, 0, 0, canvas.width, canvas.height);
  } else {
    ctx.fillStyle = '#222';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ddd';
    ctx.font = '24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Upload a map on the DM screen', canvas.width / 2, canvas.height / 2);
  }

  if (state) {
    for (let r = 0; r < state.rows; r++) {
      for (let c = 0; c < state.cols; c++) {
        if (state.fog[r][c]) drawFogTile(ctx, c, r, state.gridSize, viewMode, dmFogOpacity);
      }
    }
  }

  if (viewMode === 'dm' && selectedCells.size) {
    ctx.fillStyle = 'rgba(80,170,255,0.35)';
    ctx.strokeStyle = 'rgba(80,170,255,0.95)';
    ctx.lineWidth = 3;
    for (const key of selectedCells) {
      const [r, c] = key.split(',').map(Number);
      const x = c * state.gridSize;
      const y = r * state.gridSize;
      ctx.fillRect(x, y, state.gridSize, state.gridSize);
      ctx.strokeRect(x + 2, y + 2, state.gridSize - 4, state.gridSize - 4);
    }
  }

  if (showGrid && state) {
    ctx.strokeStyle = 'rgba(255,255,255,0.28)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= canvas.width; x += state.gridSize) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
    }
    for (let y = 0; y <= canvas.height; y += state.gridSize) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
    }
  }
}

function formatSavedTime(iso) {
  if (!iso) return 'Not saved yet';
  return `Saved ${new Date(iso).toLocaleString()}`;
}
