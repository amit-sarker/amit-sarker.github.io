// Hero banner: Agent Town, a pixel-art town of AI agents.
// Agents walk between houses, the plaza, and the town hall. Good talks build trust (hearts).
// Hidden deceivers make promises and break them later; betrayed agents warn others, and once
// enough agents distrust someone the town exposes them and a newcomer moves in. Party leaders
// give speeches that can win listeners over, and once a day the town elects a mayor (crown),
// forming a coalition when no party has a majority. At dusk everyone goes home.
// A text box in the top-left corner narrates what happens and keeps the last few events (opened by hovering or tapping it), and a legend under the road
// names the symbols and lights up each one as its event happens. Hovering or tapping an agent opens a card with its
// party, reputation, and whom it trusts; a pinned card lets the visitor vouch for or warn about that agent.
// Illustrative, not real data.
(function () {
  'use strict';

  // ---------------------------------------------------------------- palette
  var C = {
    ink: '#1a1c2c', plum: '#5d275d', red: '#b13e53', orange: '#ef7d57', sand: '#ffcd75', lime: '#a7f070',
    green: '#38b764', grassD: '#2a9a55', grassL: '#5ccb72', teal: '#257179', navy: '#29366f', blue: '#3b5dc9',
    sky: '#41a6f6', cyan: '#73eff7', white: '#f4f4f4', mist: '#94b0c2', slate: '#566c86', dusk: '#333c57',
    dirt: '#d2ad6e', dirtD: '#b08a52', bark: '#7a4b2a', barkD: '#5a361d', pink: '#f77fbe', bad: '#ff5c6c',
    gold: '#ffd23f', stone: '#b4c4cf', stoneD: '#98aebd'
  };
  var PARTIES = [
    { name: 'Sun', c: '#ef7d57', d: '#b8583a' },
    { name: 'Sea', c: '#41a6f6', d: '#2f6fc0' },
    { name: 'Plum', c: '#a46fd8', d: '#74479f' }
  ];
  var SKINS = ['#f2c9a0', '#e0a878', '#c68642', '#8d5524', '#f6d7b0', '#b5784a'];
  var HAIRS = ['#2b1d0e', '#5a3825', '#b5651d', '#e8c170', '#1a1c2c', '#8a8a8a', '#7a2f2f'];
  var WALLS = [['#f4f4f4', '#cfd8de'], ['#ffe0a8', '#e2bd7d'], ['#d9e7ef', '#aec3d0'], ['#f6c9b0', '#d9a284']];
  var ROOFS = [['#b13e53', '#8a2c3f'], ['#3b5dc9', '#2c4596'], ['#5d275d', '#43193f'], ['#257179', '#1a5157'], ['#ef7d57', '#c45e3e']];
  var NAMES = ['Mira', 'Juno', 'Ivo', 'Lena', 'Tariq', 'Ada', 'Kofi', 'Noor', 'Ravi', 'Esme', 'Hugo', 'Yuki', 'Sana', 'Omar',
    'Pia', 'Theo', 'Zara', 'Ilan', 'Maya', 'Femi', 'Lior', 'Anya', 'Bo', 'Cyra', 'Dev', 'Elio', 'Gia', 'Hana', 'Kai', 'Luz',
    'Rex', 'Vera', 'Nico', 'Odile', 'Pax', 'Quinn'];

  // ------------------------------------------------------------- icons 5x5
  var ICONS = {
    heart: { px: ['.x.x.', 'xxxxx', 'xxxxx', '.xxx.', '..x..'], c: { x: C.pink } },
    broken: { px: ['.x.x.', 'xx.xx', 'xxx.x', '.x.x.', '..x..'], c: { x: C.bad } },
    coin: { px: ['.xxx.', 'xxdxx', 'xxdxx', 'xxdxx', '.xxx.'], c: { x: C.gold, d: C.orange } },
    mega: { px: ['....x', '..xxx', 'xxxxx', '..xxx', '....x'], c: { x: C.orange } },
    dots: { px: ['.....', '.....', 'x.x.x', '.....', '.....'], c: { x: C.ink } },
    warn: { px: ['..x..', '..x..', '..x..', '.....', '..x..'], c: { x: C.bad } },
    crown: { px: ['x.x.x', 'xxxxx', 'xdxdx'], c: { x: C.gold, d: C.red } },
    spark: { px: ['..x..', '.xxx.', '..x..'], c: { x: C.white } },
    moon: { px: ['.xxx.', 'xx...', 'xx...', 'xx...', '.xxx.'], c: { x: C.sand } },
    flags: { px: ['x...x', 'aa.bb', 'aa.bb', 'x...x', 'x...x'], c: { x: C.mist, a: PARTIES[1].c, b: PARTIES[2].c } }
  };

  // ------------------------------------------------------------------- dom
  var cv = document.getElementById('town');
  if (!cv) return;
  var stage = cv.parentElement, g = cv.getContext('2d');
  var tagLayer = document.getElementById('town-tags'), dlgText = document.getElementById('town-text');
  var dayLabel = document.getElementById('town-day'), tallyEl = document.getElementById('town-tally');
  var playBtn = document.getElementById('town-pause');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var logEl = document.getElementById('town-log'), card = document.getElementById('town-card'), dlg = document.querySelector('.town-dialog');
  dlg.addEventListener('click', function () { dlg.classList.toggle('open'); });

  // ----------------------------------------------------------------- state
  var DAY = 3600;                       // one day = 60 seconds at 1x
  var S, W, H, yA, yB, cx, P, lanes, houses, trees, bushes, lamps, field, pond, stall, well, podium, box, ground;
  var agents, nextId, tick, day, mayor, ruling, partner, rally, election, convs, effects, smoke, lastTrust = -1e9;
  var BASE_SPEED = .7, acc = 0;  // the town runs at 70% of the frame rate
  var hover = null, pinned = null, logLines = [], lastAct = -1e9;
  var paused = false, onScreen = true, speed = 1, frameNo = 0, tags = [], queue = [], shown = null, typed = 0, shownAt = -1e9;

  function mulberry(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function rand(a, b) { return a + Math.random() * (b - a); }
  function pick(arr) { return arr[(Math.random() * arr.length) | 0]; }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function px(x, y, w, h, c) { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), w, h); }

  // ----------------------------------------------------------------- world
  function build() {
    var r = stage.getBoundingClientRect(), reserve = 0;
    // below 1000px the Agent Society key gets its own strip of grass under the town; the banner grows by its height
    var key = document.querySelector('.town-key');
    if (key && r.width < 1000) {
      var kh = key.getBoundingClientRect().height, lh = key.querySelector('.town-legend').getBoundingClientRect().height;
      stage.style.setProperty('--key-h', Math.ceil(kh) + 'px'); stage.style.setProperty('--legend-h', Math.ceil(lh) + 'px');
      r = stage.getBoundingClientRect();
      reserve = kh + 20;
    }
    S = r.width < 560 ? 2 : r.width > 1600 ? 4 : 3;
    W = Math.max(150, Math.round(r.width / S)); H = Math.max(150, Math.round(r.height / S));
    cv.width = W; cv.height = H;
    var R = mulberry(20261030);
    // wide screens cut 100px of sky from the top (see .hero in style.css), so lay the town out on the uncut height
    var trim = r.width >= 1000 ? Math.round(100 / S) : 0, full = H + trim - Math.round(reserve / S);
    yA = Math.round(full * 0.52) - trim; yB = Math.round(full * 0.87) - trim; cx = Math.round(W / 2);
    P = { x0: cx - 30, x1: cx + 30, y0: yA + 4, y1: yB - 4 };
    lanes = [cx];
    for (var lx = cx - 112; lx > 24; lx -= 112) lanes.push(lx);
    for (lx = cx + 112; lx < W - 24; lx += 112) lanes.push(lx);

    houses = [];
    for (var x = 14; x <= W - 14; x += 28) {
      if (Math.abs(x - cx) < 38) continue;
      houses.push(makeHouse(x, yA - 5, 'A', R));
    }
    for (x = 16; x <= W - 16; x += 28) {
      if (x > P.x0 - 12 && x < P.x1 + 12) continue;
      if (lanes.some(function (L) { return Math.abs(L - x) < 15; })) continue;
      houses.push(makeHouse(x, yB - 5, 'B', R));
    }

    podium = { x: cx, y: P.y0 + 6 };
    stall = { x: cx - 18, y: P.y1 - 8 };
    well = { x: cx + 18, y: P.y1 - 8 };
    box = { x: cx + 12, y: yA - 3 };

    // a crop field and a pond if there is room
    field = null; pond = null;
    if (P.x0 - 70 > 6) field = { x: P.x0 - 66, y: P.y0 + 6, w: 44, h: Math.max(10, (yB - 27) - (P.y0 + 6)) };
    if (W > 260) pond = { x: Math.round(W * 0.82), y: Math.round((yA - 34) * 0.5), rx: 15, ry: 6 };

    trees = []; bushes = [];
    var topLimit = yA - 30;
    for (var i = 0; i < W / 16; i++) {
      var tx = Math.round(R() * W), ty = Math.round(10 + R() * (topLimit - 10));
      if (Math.abs(tx - cx) < 30 && ty > yA - 52) continue;
      if (pond && Math.abs(tx - pond.x) < pond.rx + 6 && Math.abs(ty - pond.y) < pond.ry + 8) continue;
      trees.push({ x: tx, y: ty });
    }
    // orchard to the right of the plaza
    for (var ox = P.x1 + 16; ox < P.x1 + 70 && ox < W - 10; ox += 14) {
      if (lanes.some(function (L) { return Math.abs(L - ox) < 9; })) continue;
      for (var oy = P.y0 + 12; oy < yB - 26; oy += 13) trees.push({ x: ox + (R() * 3 | 0), y: oy, fruit: true });
    }
    for (i = 0; i < W / 10; i++) {
      var bx = Math.round(R() * W), by = Math.round(yB + 8 + R() * Math.max(1, H - yB - 10));
      if (lanes.some(function (L) { return Math.abs(L - bx) < 5; })) continue;
      bushes.push({ x: bx, y: by });
    }
    lamps = [];
    for (var hi = 0; hi < houses.length; hi++) {
      var h = houses[hi];
      if (h.row === 'A' && hi % 2 === 0 && h.x + 14 < W - 4 && Math.abs(h.x + 14 - cx) > 30) lamps.push({ x: h.x + 14, y: yA - 5 });
    }
    lamps.push({ x: cx - 26, y: yA - 5 }, { x: cx + 26, y: yA - 5 });

    drawGround(R);
  }

  function makeHouse(x, yb, row, R) {
    var wall = WALLS[(R() * WALLS.length) | 0], roof = ROOFS[(R() * ROOFS.length) | 0];
    return { x: x, yb: yb, row: row, wall: wall[0], wallD: wall[1], roof: roof[0], roofD: roof[1], lit: false, occ: [] };
  }

  function drawGround(R) {
    ground = document.createElement('canvas'); ground.width = W; ground.height = H;
    var q = ground.getContext('2d');
    function f(x, y, w, h, c) { q.fillStyle = c; q.fillRect(x, y, w, h); }
    f(0, 0, W, H, C.green);
    for (var y = 0; y < H; y++) for (var x = 0; x < W; x++) {
      var v = R();
      if (v < .045) f(x, y, 1, 1, C.grassD); else if (v < .065) f(x, y, 1, 1, C.grassL);
    }
    for (var i = 0; i < W * H / 260; i++) {
      var fx = (R() * W) | 0, fy = (R() * H) | 0;
      f(fx, fy, 1, 1, [C.white, C.pink, C.sand, C.cyan][(R() * 4) | 0]);
    }
    // vertical lanes between the two streets
    lanes.forEach(function (L) {
      if (L === cx) return;
      f(L - 3, yA, 6, yB - yA, C.dirt); f(L - 3, yA, 1, yB - yA, C.dirtD); f(L + 2, yA, 1, yB - yA, C.dirtD);
    });
    // the two streets
    [yA, yB].forEach(function (ry) {
      f(0, ry - 4, W, 8, C.dirt); f(0, ry - 4, W, 1, C.dirtD); f(0, ry + 3, W, 1, C.dirtD);
      for (var k = 0; k < W / 6; k++) f((R() * W) | 0, ry - 3 + ((R() * 6) | 0), 1, 1, C.dirtD);
    });
    // plaza with stone tiles
    f(P.x0, P.y0 - 1, P.x1 - P.x0, P.y1 - P.y0 + 2, C.stone);
    for (var tx = P.x0; tx < P.x1; tx += 6) f(tx, P.y0, 1, P.y1 - P.y0, C.stoneD);
    for (var ty = P.y0; ty < P.y1; ty += 6) f(P.x0, ty, P.x1 - P.x0, 1, C.stoneD);
    f(P.x0, P.y0, 1, P.y1 - P.y0, C.slate); f(P.x1 - 1, P.y0, 1, P.y1 - P.y0, C.slate);
    // crop field
    if (field) {
      f(field.x - 1, field.y - 1, field.w + 2, field.h + 2, C.barkD);
      f(field.x, field.y, field.w, field.h, '#8f6a3e');
      for (var cy = field.y + 2; cy < field.y + field.h - 1; cy += 4)
        for (var cxx = field.x + 2; cxx < field.x + field.w - 1; cxx += 3) { f(cxx, cy, 1, 2, C.lime); f(cxx, cy + 1, 1, 1, C.green); }
    }
    // pond
    if (pond) {
      for (var py = -pond.ry; py <= pond.ry; py++) {
        var half = Math.round(pond.rx * Math.sqrt(1 - (py * py) / (pond.ry * pond.ry)));
        f(pond.x - half - 1, pond.y + py, half * 2 + 2, 1, C.teal);
        f(pond.x - half + 1, pond.y + py, Math.max(0, half * 2 - 2), 1, C.sky);
      }
      f(pond.x - 6, pond.y - 2, 4, 1, C.cyan); f(pond.x + 3, pond.y + 1, 3, 1, C.cyan);
    }
  }

  // --------------------------------------------------------------- agents
  function makeAgent(name, party, deceiver, home) {
    return {
      id: nextId++, name: name, party: party, deceiver: deceiver, exposed: false, home: home,
      x: 0, y: 0, dir: 'down', moving: false, path: [], goal: null, state: 'idle', wait: rand(30, 200),
      speed: rand(.32, .42), skin: pick(SKINS), hair: pick(HAIRS), trust: {}, cool: rand(60, 400),
      pending: [], betrayals: 0, hidden: false, off: ((Math.random() * 4) | 0) - 2, flash: 0, wakeAt: 0, spark: 0
    };
  }
  function T(a, b) { var v = a.trust[b.id]; return v === undefined ? .45 : v; }
  function setT(a, b, v) { a.trust[b.id] = clamp(v, 0, 1); }
  function live() { return agents.filter(function (a) { return !a.gone; }); }
  function reputation(b) {
    var s = 0, n = 0;
    agents.forEach(function (a) { if (a !== b && !a.gone) { s += T(a, b); n++; } });
    return n ? s / n : .45;
  }
  function leaderOf(p) {
    var best = null, bv = -1;
    agents.forEach(function (a) {
      if (a.gone || a.exposed || a.leaving || a.party !== p) return;
      var r = reputation(a) + (a === mayor ? .05 : 0);
      if (r > bv) { bv = r; best = a; }
    });
    return best;
  }
  function unusedName() {
    var used = {}; agents.forEach(function (a) { used[a.name] = 1; });
    var free = NAMES.filter(function (n) { return !used[n]; });
    return free.length ? pick(free) : 'Agent ' + nextId;
  }

  function populate() {
    agents = []; nextId = 1;
    var n = clamp(Math.round(W / 21), 9, 22), names = NAMES.slice().sort(function () { return Math.random() - .5; });
    var nDec = n >= 14 ? 2 : 1;
    for (var i = 0; i < n; i++) {
      var a = makeAgent(names[i], i % 3, i < nDec, houses[i % houses.length]);
      a.home.occ.push(a);
      placeRandom(a);
      agents.push(a);
    }
    // a few friendships already exist
    agents.forEach(function (a) { agents.forEach(function (b) { if (a !== b) setT(a, b, rand(.3, .6)); }); });
    // deceivers start with promises that will be broken soon
    agents.filter(function (a) { return a.deceiver; }).forEach(function (d, k) {
      var victims = agents.filter(function (v) { return !v.deceiver; }).sort(function () { return Math.random() - .5; }).slice(0, 2);
      victims.forEach(function (v, j) { setT(v, d, .74); d.pending.push({ v: v, at: tick + 420 + k * 1500 + j * 520 }); });
    });
    // a mayor from yesterday's election
    var counts = [0, 0, 0]; agents.forEach(function (a) { counts[a.party]++; });
    ruling = counts.indexOf(Math.max.apply(null, counts));
    var l = agents.filter(function (a) { return a.party === ruling && !a.deceiver; })[0];
    mayor = l || leaderOf(ruling); partner = -1;
  }

  function placeRandom(a) {
    var v = Math.random();
    if (v < .4) { a.x = rand(8, W - 8); a.y = yA + a.off; }
    else if (v < .75) { a.x = rand(8, W - 8); a.y = yB + a.off; }
    else { a.x = rand(P.x0 + 6, P.x1 - 6); a.y = rand(P.y0 + 10, P.y1 - 4); }
  }

  // ------------------------------------------------------------ movement
  function inPlaza(x, y) { return x > P.x0 + 2 && x < P.x1 - 2 && y > P.y0 - 1 && y < P.y1 + 1; }
  function inPlazaX(x) { return x > P.x0 + 3 && x < P.x1 - 3; }
  function roadY(road, a) { return (road === 'A' ? yA : yB) + a.off; }
  function nearestRoad(y) { return Math.abs(y - yA) <= Math.abs(y - yB) ? 'A' : 'B'; }

  // dest: { x, y, kind: 'road' | 'door' | 'plaza' | 'edge', road }
  function go(a, dest, goal) {
    var pts = [], x = a.x, y = a.y, road;
    a.goal = goal || 'wander'; a.state = 'walk';
    if (dest.kind === 'plaza' && inPlaza(x, y)) { a.path = [{ x: dest.x, y: y }, { x: dest.x, y: dest.y }]; return; }
    if (Math.abs(y - yA) < 6) road = 'A';
    else if (Math.abs(y - yB) < 6) road = 'B';
    else if (inPlaza(x, y)) { road = nearestRoad(y); pts.push({ x: x, y: roadY(road, a) }); }
    else { road = y < yA ? 'A' : 'B'; pts.push({ x: x, y: roadY(road, a) }); }
    var tr = dest.road;
    if (road !== tr) {
      var L = lanes[0], bestCost = 1e9;
      lanes.forEach(function (ln) { var c = Math.abs(x - ln) + Math.abs(ln - dest.x); if (c < bestCost) { bestCost = c; L = ln; } });
      if (L === cx) L = inPlazaX(dest.x) ? dest.x : inPlazaX(x) ? x : cx + a.off * 2;
      pts.push({ x: L, y: roadY(road, a) }, { x: L, y: roadY(tr, a) });
    }
    pts.push({ x: dest.x, y: roadY(tr, a) });
    if (dest.kind === 'door' || dest.kind === 'plaza') pts.push({ x: dest.x, y: dest.y });
    a.path = pts;
  }
  function doorOf(h) { return { x: h.x, y: h.yb - 1, kind: 'door', road: h.row }; }
  function plazaPoint(x, y) { return { x: x, y: y, kind: 'plaza', road: nearestRoad(y) }; }

  function wander(a) {
    var v = Math.random(), others = live().filter(function (o) { return o !== a && !o.hidden; });
    if ((a.deceiver && !a.exposed && v < .5) || v < .12) {
      var o = pick(others); if (o && !inPlaza(o.x, o.y)) return go(a, { x: o.x + rand(-6, 6), y: o.y, kind: 'road', road: nearestRoad(o.y) });
    }
    if (v < .45) return go(a, { x: rand(6, W - 6), y: 0, kind: 'road', road: Math.random() < .55 ? 'A' : 'B' });
    if (v < .62) return go(a, doorOf(pick(houses)), 'visit');
    if (v < .76) return go(a, plazaPoint(stall.x + rand(-4, 4), stall.y + 6));
    if (v < .88) return go(a, plazaPoint(rand(P.x0 + 6, P.x1 - 6), rand(P.y0 + 8, P.y1 - 4)));
    go(a, { x: cx + rand(-14, 14), y: 0, kind: 'road', road: 'A' });
  }

  function moveAgent(a) {
    if (!a.path.length) { a.moving = false; return; }
    var p = a.path[0], dx = p.x - a.x, dy = p.y - a.y, d = Math.hypot(dx, dy);
    if (d <= a.speed) {
      a.x = p.x; a.y = p.y; a.path.shift();
      if (!a.path.length) { a.moving = false; arrive(a); }
      return;
    }
    a.x += dx / d * a.speed; a.y += dy / d * a.speed; a.moving = true;
    a.dir = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 'left' : 'right') : (dy < 0 ? 'up' : 'down');
  }

  function arrive(a) {
    var goal = a.goal; a.goal = null;
    if (goal === 'home') { a.hidden = true; a.state = 'home'; a.home.lit = true; return; }
    if (goal === 'leave') { a.gone = true; a.hidden = true; return; }
    if (goal === 'rally' || goal === 'gather' || goal === 'vote') { a.state = goal === 'rally' ? 'speak' : 'listen'; a.dir = goal === 'rally' ? 'down' : (a.y > podium.y ? 'up' : 'down'); if (goal === 'vote') a.dir = 'up'; return; }
    a.state = 'idle'; a.wait = rand(40, 220);
  }

  // ------------------------------------------------------------- effects
  // the legend item for a symbol lights up whenever that symbol appears in the town
  var legendItems = {}, TAG_ICON = { trust: 'heart', betrayal: 'broken', deceptive: 'warn', influence: 'mega', election: 'crown', power: 'crown', coalition: 'flags' };
  Array.prototype.forEach.call(document.querySelectorAll('.town-legend canvas[data-icon]'), function (c) { legendItems[c.dataset.icon] = c.parentElement; });
  function pulse(icon) {
    var li = legendItems[icon];
    if (!li || reduce) return;
    li.classList.remove('lit'); void li.offsetWidth; li.classList.add('lit');
  }
  function bubble(a, icon, dur) { a.bubble = { icon: icon, until: tick + dur }; pulse(icon); }
  function floatIcon(x, y, icon, dur) { effects.push({ type: 'float', x: x, y: y, icon: icon, t0: tick, dur: dur || 70 }); pulse(icon); }
  function sparkle(a) { effects.push({ type: 'spark', a: a, t0: tick, dur: 50 }); pulse('flags'); }

  // ----------------------------------------------------------- the story
  function phase() { return (tick % DAY) / DAY; }
  function crossed(p) { var a = ((tick - 1) % DAY) / DAY, b = (tick % DAY) / DAY; return a < p && b >= p; }
  function timeName(p) { return p < .25 ? 'MORNING' : p < .5 ? 'NOON' : p < .74 ? 'AFTERNOON' : p < .84 ? 'EVENING' : 'NIGHT'; }
  function isDay() { var p = phase(); return p < .76 || p > .975; }

  function say(text, pri) { queue.push({ text: text, pri: pri || 0, at: frameNo, day: day }); }
  // the three events before the current one stay in the text box (shown on hover or tap), so a visitor can follow the story
  function drawLog() {
    dlg.classList.toggle('has-log', logLines.length > 0);
    logEl.innerHTML = '';
    logLines.forEach(function (m) {
      var li = document.createElement('li'); li.textContent = 'D' + m.day + ' \u00b7 ' + m.text; logEl.appendChild(li);
    });
  }

  function tag(kind, follow, wx, wy) {
    if (tags.length >= 3) { var old = tags.shift(); old.el.remove(); }
    var el = document.createElement('div');
    el.className = 'town-tag tag-' + kind; el.textContent = kind.toUpperCase();
    tagLayer.appendChild(el);
    tags.push({ el: el, follow: follow, wx: wx, wy: wy, born: frameNo });
    pulse(TAG_ICON[kind]);
  }

  function startTalk(a, b) {
    [a, b].forEach(function (s) { s.state = 'talk'; s.path = []; s.moving = false; s.goal = null; });
    a.dir = a.x < b.x ? 'right' : 'left'; b.dir = a.x < b.x ? 'left' : 'right';
    var out = { type: 'friendly' };
    // gossip: someone who was betrayed warns the other
    var pair = [[a, b], [b, a]];
    for (var k = 0; k < 2 && out.type === 'friendly'; k++) {
      var w = pair[k][0], l = pair[k][1];
      agents.forEach(function (d) {
        if (out.type !== 'friendly' || d === w || d === l || !d.deceiver || d.exposed || d.gone) return;
        if (T(w, d) < .25 && T(l, d) > T(w, d) + .15) out = { type: 'warn', w: w, l: l, d: d };
      });
    }
    if (out.type === 'friendly') {
      var D = a.deceiver && !a.exposed ? a : b.deceiver && !b.exposed ? b : null, Hn = D === a ? b : a;
      if (D && !Hn.deceiver && D.pending.length < 3) out = { type: 'promise', d: D, h: Hn };
      else if (D && Hn.deceiver) out = { type: 'chat' };
    }
    convs.push({ a: a, b: b, t0: tick, out: out });
  }

  function endTalk(c) {
    var a = c.a, b = c.b, o = c.out;
    if (o.type === 'friendly') {
      var before = Math.min(T(a, b), T(b, a)), bonus = a.party === b.party ? .04 : 0;
      setT(a, b, T(a, b) + .2 + bonus); setT(b, a, T(b, a) + .2 + bonus);
      floatIcon(a.x, a.y - 14, 'heart'); floatIcon(b.x, b.y - 14, 'heart');
      if (Math.min(T(a, b), T(b, a)) >= .7 && tick - lastTrust > 420) {
        lastTrust = tick;
        tag('trust', null, (a.x + b.x) / 2, a.y - 16);
        say(a.name + ' and ' + b.name + (before < .7 ? ' now trust each other.' : ' trust each other even more.'), 1);
      }
    } else if (o.type === 'promise') {
      setT(o.h, o.d, T(o.h, o.d) + .2);
      o.d.pending.push({ v: o.h, at: tick + rand(420, 800) });
      floatIcon(o.h.x, o.h.y - 14, 'heart');
      say(o.d.name + ' makes ' + o.h.name + ' a promise.', 0);
    } else if (o.type === 'warn') {
      setT(o.l, o.d, T(o.l, o.d) - .25 * (.6 + T(o.l, o.w)));
      floatIcon(o.l.x, o.l.y - 14, 'warn');
      say(o.w.name + ' warns ' + o.l.name + ' about ' + o.d.name + '.', 1);
    }
    [a, b].forEach(function (s) { if (s.state === 'talk') { s.state = 'idle'; s.wait = rand(20, 60); } s.cool = rand(420, 720); s.bubble = null; });
  }

  function updateTalks() {
    convs = convs.filter(function (c) {
      var k = tick - c.t0;
      if (k === 1) bubble(c.a, 'dots', 34);
      if (k === 36) bubble(c.b, c.out.type === 'warn' && c.out.w === c.b ? 'warn' : 'dots', 34);
      if (k === 36 && c.out.type === 'warn' && c.out.w === c.a) bubble(c.a, 'warn', 34);
      if (k === 72 && c.out.type === 'promise') bubble(c.out.d, 'coin', 40);
      if (k >= 110) { endTalk(c); return false; }
      return true;
    });
    if (tick % 6 || convs.length >= 3 || !isDay() || election) return;
    var free = agents.filter(function (a) { return !a.gone && !a.hidden && !a.exposed && !a.leaving && a.cool <= 0 && (a.state === 'idle' || (a.state === 'walk' && a.goal === 'wander')); });
    for (var i = 0; i < free.length; i++) for (var j = i + 1; j < free.length; j++) {
      var a = free[i], b = free[j];
      if (Math.abs(a.x - b.x) < 8 && Math.abs(a.y - b.y) < 5 && Math.random() < .3) { startTalk(a, b); return; }
    }
  }

  function updateBetrayals() {
    agents.forEach(function (d) {
      if (!d.deceiver || d.exposed || d.gone) return;
      d.pending = d.pending.filter(function (p) {
        if (tick < p.at) return true;
        var v = p.v;
        if (v.gone) return false;
        if (v.hidden || v.state === 'talk') { p.at = tick + 120; return true; }
        setT(v, d, T(v, d) - .65); v.flash = 70; d.betrayals++;
        floatIcon(v.x, v.y - 14, 'broken', 90);
        tag('betrayal', v);
        say(d.name + ' broke a promise to ' + v.name + '!', 2);
        return false;
      });
    });
  }

  function checkExposure() {
    var n = live().length, need = Math.max(3, Math.ceil(n * .2));
    agents.forEach(function (d) {
      if (!d.deceiver || d.exposed || d.gone) return;
      var against = agents.filter(function (a) { return a !== d && !a.gone && T(a, d) < .22; }).length;
      if (against < need) return;
      d.exposed = true; d.pending = []; d.leaveAt = tick + 300;
      tag('deceptive', d);
      say('The town exposes ' + d.name + ' as deceptive!', 2);
      if (mayor === d) { mayor = null; ruling = -1; partner = -1; say('Mayor ' + d.name + ' loses power.', 2); }
    });
    agents.forEach(function (d) {
      if (d.exposed && !d.leaving && !d.gone && tick >= d.leaveAt && !d.hidden) {
        d.leaving = true; d.state = 'walk';
        go(d, { x: d.x < W / 2 ? -14 : W + 14, y: 0, kind: 'road', road: 'A' }, 'leave');
        d.arrivalAt = tick + 480;
      }
      if (d.gone && d.arrivalAt && tick >= d.arrivalAt) { d.arrivalAt = 0; newcomer(); }
    });
  }

  function newcomer() {
    var deceivers = agents.filter(function (a) { return a.deceiver && !a.gone; }).length, target = live().length >= 14 ? 2 : 1;
    var home = houses.slice().sort(function (p, q) { return p.occ.filter(function (o) { return !o.gone; }).length - q.occ.filter(function (o) { return !o.gone; }).length; })[0];
    var a = makeAgent(unusedName(), (Math.random() * 3) | 0, deceivers < target, home);
    home.occ.push(a);
    var fromLeft = Math.random() < .5;
    a.x = fromLeft ? -10 : W + 10; a.y = yA + a.off;
    agents.forEach(function (o) { if (o !== a && !o.gone) { setT(a, o, .45); setT(o, a, .45); } });
    agents.push(a);
    go(a, { x: rand(W * .2, W * .8), y: 0, kind: 'road', road: 'A' });
    say(a.name + ' moves into town.', 1);
  }

  // influence: a party leader speaks at the plaza and tries to win people over
  var rallyTurn = 0;
  function startRally() {
    if (rally || election || !isDay()) return;
    for (var k = 0; k < 3; k++) {
      var p = (rallyTurn++) % 3, L = leaderOf(p);
      if (!L || L.hidden || L.state === 'talk') continue;
      var pool = agents.filter(function (a) { return a !== L && !a.gone && !a.hidden && !a.exposed && !a.leaving && a.state !== 'talk'; })
        .sort(function (u, v) { return Math.hypot(u.x - cx, u.y - podium.y) - Math.hypot(v.x - cx, v.y - podium.y); }).slice(0, 6);
      if (pool.length < 2) return;
      go(L, plazaPoint(podium.x, podium.y + 1), 'rally');
      pool.forEach(function (a, i) {
        var row = i < 3 ? 0 : 1, col = (i % 3) - 1;
        go(a, plazaPoint(podium.x + col * 10 + (row ? 5 : 0), podium.y + 13 + row * 8), 'gather');
      });
      rally = { L: L, p: p, crowd: pool, t0: tick, stage: 'gather' };
      return;
    }
  }
  function updateRally() {
    if (!rally) return;
    var r = rally, L = r.L;
    if (L.gone || L.exposed || !isDay()) { endRally(); return; }
    if (r.stage === 'gather') {
      var here = r.crowd.filter(function (a) { return a.state === 'listen'; }).length;
      if (L.state === 'speak' && (here >= Math.min(3, r.crowd.length) || tick - r.t0 > 720)) {
        r.stage = 'speech'; r.ts = tick;
        tag('influence', L);
        say(L.name + ' of the ' + PARTIES[r.p].name + ' party gives a speech.', 1);
      }
      return;
    }
    var k = tick - r.ts;
    if (k % 50 === 1) bubble(L, 'mega', 40);
    if (k === 30 || k === 130) { var lis = r.crowd.filter(function (a) { return a.state === 'listen'; }); if (lis.length) bubble(pick(lis), 'dots', 30); }
    if (k >= 250) {
      var joined = 0;
      r.crowd.forEach(function (a) {
        if (a.state !== 'listen') return;
        setT(a, L, T(a, L) + .05);
        if (a.party !== r.p) {
          var chance = clamp(-.15 + .75 * T(a, L) + (L === mayor ? .1 : 0), 0, .8);
          if (Math.random() < chance) { a.party = r.p; joined++; sparkle(a); }
        }
      });
      say(joined ? joined + (joined === 1 ? ' listener joins' : ' listeners join') + ' the ' + PARTIES[r.p].name + ' party.' : 'Nobody switches parties this time.', 1);
      endRally();
    }
  }
  function endRally() {
    if (!rally) return;
    [rally.L].concat(rally.crowd).forEach(function (a) { if (a.state === 'speak' || a.state === 'listen' || a.goal === 'rally' || a.goal === 'gather') { a.state = 'idle'; a.goal = null; a.path = []; a.wait = rand(10, 90); } });
    rally = null;
  }

  // power: once a day everyone votes at the town hall
  function startElection() {
    if (election || !isDay()) return;
    endRally();
    convs.slice().forEach(endTalk); convs = [];
    var voters = agents.filter(function (a) { return !a.gone && !a.hidden && !a.exposed && !a.leaving; });
    if (voters.length < 3) return;
    var spots = [];
    for (var r = 0; spots.length < voters.length; r++) {
      for (var c = -3; c <= 3 && spots.length < voters.length; c++) {
        var y = yA + 2 + r * 7;
        spots.push(y < P.y0 + 2 ? { x: cx + c * 8, y: 0, kind: 'road', road: 'A' } : plazaPoint(cx + c * 8, y));
      }
    }
    voters.sort(function (u, v) { return Math.abs(u.x - cx) - Math.abs(v.x - cx); });
    voters.forEach(function (a, i) { go(a, spots[i], 'vote'); });
    election = { stage: 'gather', t0: tick, voters: voters, tally: [0, 0, 0], next: 0, flying: 0 };
    tag('election', null, cx, yA - 44);
    say('ELECTION DAY! Everyone heads to the town hall.', 2);
  }
  function voteOf(a) {
    var best = 0, bv = -1;
    for (var p = 0; p < 3; p++) {
      var L = leaderOf(p); if (!L) continue;
      var v = (L === a ? 1 : T(a, L)) + (a.party === p ? .25 : 0);
      if (v > bv) { bv = v; best = p; }
    }
    return best;
  }
  function updateElection() {
    var e = election; if (!e) return;
    if (e.stage === 'gather') {
      var here = e.voters.filter(function (a) { return a.state === 'listen' || a.gone; }).length;
      if (here >= e.voters.length * .85 || tick - e.t0 > 600) { e.stage = 'vote'; e.tv = tick; }
      return;
    }
    if (e.stage === 'vote') {
      if ((tick - e.tv) % 12 === 0 && e.next < e.voters.length) {
        var a = e.voters[e.next++];
        if (!a.gone) {
          var p = voteOf(a);
          effects.push({ type: 'ballot', x0: a.x, y0: a.y - 10, p: p, t0: tick, dur: 34, e: e });
          e.flying++;
        }
      }
      if (e.next >= e.voters.length && e.flying === 0) { e.stage = 'count'; e.tc = tick; }
      return;
    }
    if (e.stage === 'count' && tick - e.tc === 30) {
      var total = e.tally[0] + e.tally[1] + e.tally[2];
      var order = [0, 1, 2].filter(function (p) { return leaderOf(p); }).sort(function (p, q) { return e.tally[q] - e.tally[p]; });
      if (!order.length) { election = null; return; }
      var top = order[0], L = leaderOf(top), co = -1;
      if (e.tally[top] * 2 <= total) {
        var bestQ = -1, bv = -1;
        order.slice(1).forEach(function (q) { var Lq = leaderOf(q); var v = T(L, Lq) + T(Lq, L); if (e.tally[q] > 0 && v > bv) { bv = v; bestQ = q; } });
        if (bestQ >= 0 && (e.tally[top] + e.tally[bestQ]) * 2 > total) {
          co = bestQ;
          tag('coalition', null, cx, yA - 30);
          say('No majority. ' + PARTIES[top].name + ' and ' + PARTIES[co].name + ' form a coalition.', 2);
        }
      }
      var again = mayor === L;
      mayor = L; ruling = top; partner = co;
      tag('power', L);
      say(again ? L.name + ' stays mayor for the ' + PARTIES[top].name + ' party.' : L.name + ' of the ' + PARTIES[top].name + ' party is the new mayor!', 2);
      e.stage = 'done'; e.td = tick;
      go(L, { x: cx, y: yA - 6, kind: 'door', road: 'A' }, 'mayor');
    }
    if (e.stage === 'done' && tick - e.td > 200) {
      e.voters.forEach(function (a) { if (a.state === 'listen') { a.state = 'idle'; a.wait = rand(10, 160); } });
      election = null; tallyEl.textContent = '';
    }
  }

  // ------------------------------------------------------------ day cycle
  function dusk() {
    endRally(); convs.slice().forEach(endTalk); convs = [];
    if (election) { election.voters.forEach(function (a) { if (a.state === 'listen') a.state = 'idle'; }); election = null; tallyEl.textContent = ''; }
    agents.forEach(function (a) { if (!a.gone && !a.hidden && !a.leaving) go(a, doorOf(a.home), 'home'); });
    say('Evening falls. Everyone walks home.', 0);
  }
  function dawn() {
    agents.forEach(function (a) { if (a.state === 'home' && !a.gone) a.wakeAt = tick + rand(0, 150); });
  }

  // ------------------------------------------------------------ main step
  function step() {
    tick++;
    if (tick % DAY === 0) { day++; say('Day ' + day + ' begins.', 0); }
    if (crossed(.78)) dusk();
    if (crossed(.965)) dawn();
    if (crossed(.11) || crossed(.6)) startRally();
    if (crossed(.38)) startElection();

    agents.forEach(function (a) {
      if (a.gone) return;
      if (a.cool > 0) a.cool--;
      if (a.flash > 0) a.flash--;
      if (a.bubble && tick > a.bubble.until) a.bubble = null;
      if (a.state === 'home') {
        if (a.wakeAt && tick >= a.wakeAt) {
          a.wakeAt = 0; a.hidden = false; a.x = a.home.x; a.y = a.home.yb - 1; a.state = 'idle'; a.wait = rand(20, 120);
          a.home.lit = a.home.occ.some(function (o) { return o.state === 'home' && !o.gone; });
        }
        return;
      }
      if (a.state === 'walk') moveAgent(a);
      else if (a.state === 'idle') { if (--a.wait <= 0 && isDay() && !election) wander(a); }
    });
    if (!isDay()) houses.forEach(function (h) { h.lit = h.occ.some(function (o) { return o.state === 'home' && !o.gone; }); });

    updateTalks();
    updateBetrayals();
    if (tick % 30 === 0) checkExposure();
    updateRally();
    updateElection();

    effects = effects.filter(function (f) {
      var k = (tick - f.t0) / f.dur;
      if (f.type === 'ballot' && k >= 1) { f.e.tally[f.p]++; f.e.flying--; tallyEl.textContent = PARTIES.map(function (pp, i) { return pp.name.toUpperCase() + ' ' + f.e.tally[i]; }).join(' · '); }
      return k < 1;
    });
    if (tick % 50 === 0) houses.forEach(function (h) { if (h.lit && Math.random() < .6) smoke.push({ x: h.x + 5, y: h.yb - 18, t0: tick }); });
    smoke = smoke.filter(function (s) { return tick - s.t0 < 120; });
  }

  // ------------------------------------------------------------- drawing
  function drawIcon(name, x, y, ctx) {
    var ic = ICONS[name], c = ctx || g;
    ic.px.forEach(function (row, j) {
      for (var i = 0; i < row.length; i++) { var ch = row[i]; if (ch === '.') continue; c.fillStyle = ic.c[ch]; c.fillRect(Math.round(x) + i, Math.round(y) + j, 1, 1); }
    });
  }
  function drawBubble(a, icon) {
    var bx = Math.round(a.x) - 4, by = Math.round(a.y) - 22;
    px(bx, by + 1, 9, 6, C.ink); px(bx + 1, by, 7, 8, C.ink);
    px(bx + 1, by + 1, 7, 6, C.white);
    px(bx + 3, by + 8, 2, 1, C.ink); px(bx + 4, by + 9, 1, 1, C.ink); px(bx + 3, by + 7, 2, 1, C.white);
    drawIcon(icon, bx + 2, by + 2);
  }

  function drawAgent(a) {
    var x = Math.round(a.x) - 3, y = Math.round(a.y) - 11;
    var shirt = PARTIES[a.party].c, shade = PARTIES[a.party].d, pants = C.dusk, shoe = C.ink, skin = a.skin, hair = a.hair;
    g.fillStyle = 'rgba(26,28,44,.28)'; g.fillRect(x + 1, y + 10, 5, 2);
    if (a.flash > 0 && (a.flash >> 3) % 2) { px(x - 2, y - 2, 11, 1, C.bad); px(x - 2, y + 12, 11, 1, C.bad); px(x - 2, y - 2, 1, 15, C.bad); px(x + 8, y - 2, 1, 15, C.bad); }
    px(x + 2, y, 3, 1, hair); px(x + 1, y + 1, 5, 1, hair);
    if (a.dir === 'up') { px(x + 1, y + 2, 5, 2, hair); px(x + 2, y + 4, 3, 1, skin); }
    else {
      px(x + 1, y + 2, 5, 2, skin); px(x + 2, y + 4, 3, 1, skin);
      if (a.dir === 'down') { px(x + 1, y + 2, 1, 1, hair); px(x + 5, y + 2, 1, 1, hair); px(x + 2, y + 3, 1, 1, C.ink); px(x + 4, y + 3, 1, 1, C.ink); }
      else if (a.dir === 'left') { px(x + 5, y + 2, 1, 2, hair); px(x + 2, y + 3, 1, 1, C.ink); }
      else { px(x + 1, y + 2, 1, 2, hair); px(x + 4, y + 3, 1, 1, C.ink); }
    }
    var step = a.moving && ((tick >> 3) & 1);
    px(x + 1, y + 5, 5, 3, shirt); px(x + 1, y + 7, 5, 1, shade);
    px(x, y + 5 + (step ? 1 : 0), 1, 2, shirt); px(x, y + 7 + (step ? 1 : 0), 1, 1, skin);
    px(x + 6, y + 5 + (step ? 0 : 0), 1, 2, shirt); px(x + 6, y + 7 - (step ? 1 : 0), 1, 1, skin);
    px(x + 1, y + 8, 5, 1, pants);
    if (step) { px(x + 1, y + 9, 2, 1, pants); px(x + 4, y + 9, 2, 1, pants); px(x + 1, y + 10, 1, 1, shoe); px(x + 5, y + 10, 1, 1, shoe); }
    else { px(x + 2, y + 9, 1, 1, pants); px(x + 4, y + 9, 1, 1, pants); px(x + 2, y + 10, 1, 1, shoe); px(x + 4, y + 10, 1, 1, shoe); }
    if (a === mayor) drawIcon('crown', x + 1, y - 4);
    else if (!a.exposed && rally && rally.L === a) { px(x + 7, y - 2, 1, 8, C.barkD); px(x + 8, y - 2, 4, 3, shirt); }
    if (a.exposed) { drawIcon('warn', x + 1, y - 7); }
    if (a.bubble) drawBubble(a, a.bubble.icon);
  }

  function drawHouse(h) {
    var x = h.x - 9, yb = h.yb;
    px(x, yb - 10, 18, 10, h.wall); px(x, yb - 1, 18, 1, h.wallD); px(x + 17, yb - 10, 1, 10, h.wallD);
    px(h.x - 2, yb - 7, 4, 7, C.bark); px(h.x - 2, yb - 7, 4, 1, C.barkD); px(h.x + 1, yb - 4, 1, 1, C.sand);
    var glass = h.lit ? C.sand : C.sky;
    [x + 2, x + 12].forEach(function (wx) { px(wx, yb - 8, 4, 4, h.wallD); px(wx + 1, yb - 7, 2, 2, glass); });
    px(x + 13, yb - 18, 2, 5, C.barkD);
    for (var r = 0; r < 7; r++) { var w = 22 - r * 3; px(h.x - (w >> 1), yb - 11 - r, w, 1, r % 3 === 0 ? h.roofD : h.roof); }
  }
  function drawHall() {
    var yb = yA - 5;
    px(cx - 23, yb - 2, 46, 2, C.slate); px(cx - 21, yb - 4, 42, 2, C.mist);
    px(cx - 19, yb - 21, 38, 17, '#d6e0e7'); px(cx - 19, yb - 21, 38, 1, C.mist);
    for (var i = 0; i < 5; i++) { var xx = cx - 18 + i * 8 + (i > 2 ? 2 : 0); if (Math.abs(xx + 1 - cx) < 4) continue; px(xx, yb - 20, 3, 16, C.white); px(xx + 2, yb - 20, 1, 16, C.mist); }
    px(cx - 3, yb - 13, 6, 9, C.dusk); px(cx - 3, yb - 13, 6, 1, C.sand);
    var lit = !isDay();
    [cx - 13, cx + 9].forEach(function (wx) { px(wx, yb - 16, 4, 5, lit ? C.sand : C.sky); });
    for (var r = 0; r < 9; r++) { var w = 46 - r * 5; if (w < 4) break; px(cx - (w >> 1), yb - 22 - r, w, 1, r === 0 ? C.slate : r % 3 === 0 ? '#2a3046' : C.dusk); }
    px(cx - 2, yb - 27, 5, 4, C.white); px(cx, yb - 26, 1, 2, C.ink);
    px(cx, yb - 44, 1, 15, C.slate);
    var wave = (tick >> 4) & 1, top = ruling >= 0 ? PARTIES[ruling].c : C.mist, bot = partner >= 0 ? PARTIES[partner].c : top;
    px(cx + 1, yb - 44 + wave, 9, 3, top); px(cx + 1, yb - 41 + wave, 9, 3, bot); px(cx + 10, yb - 43 + wave, 1, 4, ruling >= 0 ? PARTIES[ruling].d : C.slate);
  }
  function drawTree(t) {
    g.fillStyle = 'rgba(26,28,44,.22)'; g.fillRect(t.x - 4, t.y, 9, 2);
    px(t.x - 1, t.y - 3, 2, 3, C.bark);
    var rows = [3, 7, 9, 9, 9, 7, 5];
    for (var r = 0; r < rows.length; r++) px(t.x - (rows[r] >> 1), t.y - 3 - rows.length + r, rows[r], 1, r < 2 ? C.green : C.grassD);
    px(t.x - 2, t.y - 9, 2, 1, C.lime);
    if (t.fruit) { px(t.x - 2, t.y - 6, 1, 1, C.red); px(t.x + 2, t.y - 7, 1, 1, C.red); px(t.x, t.y - 4, 1, 1, C.red); }
  }
  function drawBush(b) { px(b.x - 2, b.y - 2, 5, 2, C.grassD); px(b.x - 1, b.y - 3, 3, 1, C.green); }
  function drawLamp(l) { px(l.x, l.y - 7, 1, 7, C.slate); px(l.x - 1, l.y - 9, 3, 2, isDay() ? C.mist : C.sand); }
  function drawStall() {
    var x = stall.x - 8, y = stall.y;
    px(x, y - 3, 16, 5, C.bark); px(x, y - 3, 16, 1, C.barkD);
    px(x + 2, y - 4, 2, 1, C.red); px(x + 6, y - 4, 2, 1, C.lime); px(x + 10, y - 4, 2, 1, C.sand);
    px(x, y - 10, 1, 8, C.barkD); px(x + 15, y - 10, 1, 8, C.barkD);
    for (var i = 0; i < 16; i += 2) { px(x + i, y - 13, 2, 3, i % 4 ? C.white : C.red); }
  }
  function drawWell() {
    var x = well.x, y = well.y;
    px(x - 5, y - 4, 10, 5, C.mist); px(x - 4, y - 4, 8, 2, C.teal); px(x - 5, y, 10, 1, C.slate);
    px(x - 5, y - 11, 1, 7, C.barkD); px(x + 4, y - 11, 1, 7, C.barkD);
    for (var r = 0; r < 3; r++) px(x - 6 + r, y - 12 - r, 12 - r * 2, 1, C.red);
  }
  function drawPodium() { px(podium.x - 6, podium.y - 3, 12, 4, C.bark); px(podium.x - 6, podium.y - 3, 12, 1, C.sand); px(podium.x - 5, podium.y + 1, 10, 1, C.barkD); }
  function drawBox() { px(box.x - 3, box.y - 6, 7, 6, C.bark); px(box.x - 3, box.y - 6, 7, 1, C.sand); px(box.x - 1, box.y - 6, 3, 1, C.ink); }

  function render() {
    g.drawImage(ground, 0, 0);
    var list = [];
    trees.forEach(function (t) { list.push([t.y, drawTree, t]); });
    bushes.forEach(function (b) { list.push([b.y, drawBush, b]); });
    houses.forEach(function (h) { list.push([h.yb, drawHouse, h]); });
    lamps.forEach(function (l) { list.push([l.y, drawLamp, l]); });
    list.push([yA - 5, drawHall, null], [stall.y, drawStall, null], [well.y, drawWell, null], [podium.y, drawPodium, null]);
    if (election) list.push([box.y, drawBox, null]);
    agents.forEach(function (a) { if (!a.hidden && !a.gone) list.push([a.y, drawAgent, a]); });
    list.sort(function (p, q) { return p[0] - q[0]; });
    list.forEach(function (it) { it[1](it[2]); });

    smoke.forEach(function (s) { var k = (tick - s.t0) / 120; g.fillStyle = 'rgba(200,210,220,' + (.6 * (1 - k)) + ')'; g.fillRect(Math.round(s.x + Math.sin(k * 6) * 2), Math.round(s.y - k * 14), 2, 2); });
    effects.forEach(function (f) {
      var k = (tick - f.t0) / f.dur;
      if (f.type === 'float') { if (k < .8 || (tick >> 2) & 1) drawIcon(f.icon, f.x - 2, f.y - k * 10); }
      else if (f.type === 'spark') { var a = f.a; drawIcon('spark', a.x - 6 + (k * 3 | 0), a.y - 13 - k * 6); drawIcon('spark', a.x + 3, a.y - 8 - k * 8); }
      else if (f.type === 'ballot') {
        var bx = f.x0 + (box.x - f.x0) * k, by = f.y0 + (box.y - 7 - f.y0) * k - Math.sin(Math.PI * k) * 16;
        px(bx - 2, by - 2, 4, 4, C.ink); px(bx - 1, by - 1, 2, 2, PARTIES[f.p].c);
      }
    });

    drawSelection();

    // dusk tint, night, and the lights
    var p = phase(), dark = 0, warm = 0;
    if (p > .74 && p < .86) { warm = Math.sin((p - .74) / .12 * Math.PI) * .18; }
    if (p > .78) dark = Math.min(1, (p - .78) / .07); if (p > .95) dark = Math.max(0, 1 - (p - .95) / .03);
    if (warm > 0) { g.fillStyle = 'rgba(239,125,87,' + warm + ')'; g.fillRect(0, 0, W, H); }
    if (dark > 0) {
      g.fillStyle = 'rgba(14,18,46,' + (.62 * dark) + ')'; g.fillRect(0, 0, W, H);
      g.globalCompositeOperation = 'lighter';
      lamps.forEach(function (l) { glow(l.x, l.y - 8, 12, .32 * dark); });
      houses.forEach(function (h) { if (h.lit) { glow(h.x - 5, h.yb - 6, 6, .3 * dark); glow(h.x + 5, h.yb - 6, 6, .3 * dark); } });
      glow(cx, yA - 16, 16, .25 * dark);
      g.globalCompositeOperation = 'source-over';
      houses.forEach(function (h) { if (h.lit) { px(h.x - 6, h.yb - 7, 2, 2, C.sand); px(h.x + 4, h.yb - 7, 2, 2, C.sand); } });
      lamps.forEach(function (l) { px(l.x - 1, l.y - 9, 3, 2, C.sand); });
    }
  }
  // the selected agent gets gold corners, with lines to the agents it trusts (pink) and distrusts (red)
  function drawSelection() {
    var a = pinned || hover;
    if (!a || a.hidden || a.gone) return;
    live().forEach(function (o) {
      if (o === a || o.hidden) return;
      var t = T(a, o), col = t >= .65 ? C.pink : t < .25 ? C.bad : null;
      if (!col) return;
      var dx = o.x - a.x, dy = (o.y - 5) - (a.y - 5), n = Math.max(1, Math.round(Math.hypot(dx, dy) / 3));
      for (var i = 1; i < n; i++) px(a.x + dx * i / n, a.y - 5 + dy * i / n, 1, 1, col);
    });
    var x = Math.round(a.x) - 6, y = Math.round(a.y) - 14, c = C.gold;
    px(x, y, 3, 1, c); px(x, y, 1, 3, c); px(x + 11, y, 3, 1, c); px(x + 13, y, 1, 3, c);
    px(x, y + 16, 3, 1, c); px(x, y + 14, 1, 3, c); px(x + 11, y + 16, 3, 1, c); px(x + 13, y + 14, 1, 3, c);
  }
  function glow(x, y, r, a) {
    var gr = g.createRadialGradient(x, y, 0, x, y, r);
    gr.addColorStop(0, 'rgba(255,205,117,' + a + ')'); gr.addColorStop(1, 'rgba(255,205,117,0)');
    g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2);
  }

  // --------------------------------------------------- labels and dialog
  function updateOverlay() {
    var sx = stage.clientWidth / W, sy = stage.clientHeight / H, placed = [], sr = stage.getBoundingClientRect();
    var blocked = blockers.map(function (el) { var r = el.getBoundingClientRect(); return [r.left - sr.left - 6, r.top - sr.top - 6, r.right - sr.left + 6, r.bottom - sr.top + 6]; });
    tags = tags.filter(function (t) {
      var age = frameNo - t.born;
      if (age > 260 || (t.follow && t.follow.gone)) { t.el.remove(); return false; }
      var wx = t.follow ? t.follow.x : t.wx, wy = t.follow ? t.follow.y - 24 : t.wy;
      var x = clamp(wx * sx, 50, stage.clientWidth - 50), y = Math.max(16, wy * sy);
      // stack labels that would sit on top of each other
      for (var n = 0; n < 4 && placed.some(function (q) { return Math.abs(q[0] - x) < 90 && Math.abs(q[1] - y) < 22; }); n++) y -= 24;
      placed.push([x, y]);
      t.el.style.transform = 'translate(' + Math.round(x) + 'px,' + Math.round(y) + 'px) translate(-50%,-100%)';
      var w = t.el.offsetWidth, h = t.el.offsetHeight;
      var hidden = blocked.some(function (b) { return x - w / 2 < b[2] && x + w / 2 > b[0] && y - h < b[3] && y > b[1]; });
      t.el.style.opacity = hidden ? '0' : String(Math.min(1, age / 12, (260 - age) / 30));
      return true;
    });
    updateCard(sx, sy);
    var p = phase();
    dayLabel.textContent = 'DAY ' + day + ' · ' + timeName(p);
    queue = queue.filter(function (m) { return frameNo - m.at < (m.pri > 1 ? 900 : m.pri ? 420 : 240) / speed; });
    if (queue.length && frameNo - shownAt > 170 / speed) {
      var best = 0; for (var i = 1; i < queue.length; i++) if (queue[i].pri > queue[best].pri) best = i;
      if (shown) { logLines.unshift(shown); if (logLines.length > 3) logLines.length = 3; drawLog(); }
      shown = queue.splice(best, 1)[0]; shownAt = frameNo; typed = 0;
    }
    if (shown && typed < shown.text.length) {
      typed = reduce ? shown.text.length : Math.min(shown.text.length, typed + 1.4);
      dlgText.textContent = shown.text.slice(0, Math.floor(typed));
    }
  }

  // ------------------------------------------------------- agent card
  function doing(a) {
    if (a.leaving) return 'leaving town';
    if (a.state === 'home') return 'at home';
    if (a.state === 'talk') return 'chatting';
    if (a.state === 'speak') return 'giving a speech';
    if (a.state === 'listen') return election ? 'voting' : 'listening';
    if (a.goal === 'home') return 'going home';
    if (a.goal === 'vote') return 'going to vote';
    if (a.goal === 'rally' || a.goal === 'gather') return 'going to a speech';
    return a.state === 'walk' ? 'walking' : 'looking around';
  }
  function names(list) { return list.length ? list.slice(0, 3).map(function (o) { return o.name; }).join(', ') : 'nobody yet'; }
  var cardFor = null, cardKey = '';
  function updateCard(sx, sy) {
    if (pinned && (pinned.gone || pinned.hidden)) pinned = null;
    if (hover && (hover.gone || hover.hidden)) hover = null;
    var a = pinned || hover;
    if (!a) { if (!card.hidden) { card.hidden = true; cardFor = null; } return; }
    var others = live().filter(function (o) { return o !== a; });
    var trusts = others.filter(function (o) { return T(a, o) >= .65; }).sort(function (p, q) { return T(a, q) - T(a, p); });
    var wary = others.filter(function (o) { return T(a, o) < .25; }).sort(function (p, q) { return T(a, p) - T(a, q); });
    var rep = Math.round(reputation(a) * 100), role = a.exposed ? 'EXPOSED' : a === mayor ? 'MAYOR' : '';
    var key = [a.id, a.party, role, rep, doing(a), names(trusts), names(wary), !!pinned].join('|');
    if (key !== cardKey) {
      cardKey = key;
      var P0 = PARTIES[a.party];
      card.innerHTML =
        '<div class="tc-head"><span class="tc-dot" style="background:' + P0.c + '"></span><b>' + a.name + '</b>' +
        (role ? '<span class="tc-role' + (a.exposed ? ' bad' : '') + '">' + role + '</span>' : '') + '</div>' +
        '<p>' + P0.name + ' party &middot; ' + doing(a) + '</p>' +
        '<p class="tc-rep">Reputation <span class="tc-bar"><i style="width:' + rep + '%"></i></span> ' + rep + '</p>' +
        '<p><span class="tc-k pink">Trusts</span> ' + names(trusts) + '</p>' +
        '<p><span class="tc-k red">Wary of</span> ' + names(wary) + '</p>' +
        (pinned ? '<div class="tc-btns"><button type="button" data-act="vouch"><canvas data-icon="heart"></canvas>Vouch</button>' +
          '<button type="button" data-act="warn"><canvas data-icon="warn"></canvas>Warn</button></div>'
          : '<p class="tc-hint">Click to vouch or warn</p>');
      Array.prototype.forEach.call(card.querySelectorAll('canvas[data-icon]'), function (c) { c.width = 5; c.height = 5; drawIcon(c.dataset.icon, 0, 0, c.getContext('2d')); });
    }
    if (cardFor !== a) { cardFor = a; card.hidden = false; }
    card.classList.toggle('pinned', !!pinned);
    // sit beside the agent, on whichever side has room, and stay inside the banner
    var cw = card.offsetWidth, ch = card.offsetHeight, ax = a.x * sx, ay = a.y * sy;
    var x = ax + 18 + cw < stage.clientWidth - 8 ? ax + 18 : ax - 18 - cw;
    var y = clamp(ay - ch / 2 - 10, 70, stage.clientHeight - ch - 8);
    card.style.transform = 'translate(' + Math.round(clamp(x, 8, stage.clientWidth - cw - 8)) + 'px,' + Math.round(y) + 'px)';
  }
  function agentAt(e) {
    var r = stage.getBoundingClientRect(), wx = (e.clientX - r.left) * W / stage.clientWidth, wy = (e.clientY - r.top) * H / stage.clientHeight;
    var best = null, bd = 1e9, reach = S === 2 ? 9 : 7;
    agents.forEach(function (a) {
      if (a.gone || a.hidden) return;
      var d = Math.hypot(a.x - wx, a.y - 5 - wy);
      if (Math.abs(a.x - wx) < reach && wy > a.y - 15 && wy < a.y + 4 && d < bd) { bd = d; best = a; }
    });
    return best;
  }
  function outside(e) { return e.target.closest && e.target.closest('nav, .town-key, .town-pause, .town-card, .town-dialog'); }
  stage.addEventListener('pointermove', function (e) {
    if (e.pointerType !== 'mouse') return;
    hover = outside(e) ? null : agentAt(e);
    stage.style.cursor = hover ? 'pointer' : '';
  });
  stage.addEventListener('pointerleave', function () { hover = null; stage.style.cursor = ''; });
  stage.addEventListener('click', function (e) {
    if (outside(e)) return;
    var a = agentAt(e);
    pinned = a && a !== pinned ? a : null;
    if (!pinned && e.pointerType !== 'mouse') hover = null;
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') pinned = null; });
  // the visitor takes part: vouching raises nearby agents' trust in this agent, a warning lowers it
  card.addEventListener('click', function (e) {
    var b = e.target.closest('button'), a = pinned;
    if (!b || !a || frameNo - lastAct < 40) return;
    lastAct = frameNo;
    var vouch = b.dataset.act === 'vouch';
    var near = live().filter(function (o) { return o !== a && !o.hidden && Math.hypot(o.x - a.x, o.y - a.y) < 50; });
    near.forEach(function (o) { setT(o, a, T(o, a) + (vouch ? .12 : -.15)); });
    floatIcon(a.x, a.y - 14, vouch ? 'heart' : 'warn', 80);
    near.slice(0, 5).forEach(function (o) { floatIcon(o.x, o.y - 14, vouch ? 'heart' : 'warn', 60); });
    var who = near.length ? (near.length === 1 ? near[0].name : near.length + ' neighbors') : '';
    say(vouch ? 'You vouch for ' + a.name + '. ' + (who ? who + ' trust ' + a.name + ' a little more.' : 'Nobody is near enough to hear.')
      : 'You warn the town about ' + a.name + '. ' + (who ? who + ' trust ' + a.name + ' a little less.' : 'Nobody is near enough to hear.'), 3);
    shownAt = -1e9;
    checkExposure();
  });

  // ------------------------------------------------------------ run loop
  function reset() {
    tags.forEach(function (t) { t.el.remove(); }); tags = []; queue = []; shown = null; shownAt = -1e9;
    logLines = []; drawLog(); hover = pinned = null; card.hidden = true;
    tick = Math.round(DAY * .05); day = 1; rally = null; election = null; convs = []; effects = []; smoke = [];
    tallyEl.textContent = '';
    build(); populate();
    say('Welcome to Agent Town. ' + (mayor ? mayor.name + ' of the ' + PARTIES[ruling].name + ' party is mayor.' : ''), 2);
  }
  function loop() {
    if (onScreen) {
      frameNo++;
      if (!paused) { acc += BASE_SPEED * speed; while (acc >= 1) { step(); acc -= 1; } }
      render(); updateOverlay();
    }
    requestAnimationFrame(loop);
  }

  var blockers = Array.prototype.slice.call(document.querySelectorAll('.town-dialog, .town-pause, .town-key, nav ul'));
  // the legend under the road and the agent card on the photo reuse the town's own pixel icons
  Array.prototype.forEach.call(document.querySelectorAll('canvas[data-icon]'), function (c) {
    c.width = 5; c.height = 5; drawIcon(c.dataset.icon, 0, c.dataset.icon === 'crown' ? 1 : 0, c.getContext('2d'));
  });
  function setPaused(p) {
    paused = p; playBtn.textContent = p ? 'Play' : 'Pause';
    playBtn.setAttribute('aria-label', p ? 'Play the town animation' : 'Pause the town animation');
  }
  playBtn.addEventListener('click', function () { setPaused(!paused); });
  // rebuild the town only when the width changes, since phones change the height while scrolling
  var lastW = stage.clientWidth, rt;
  window.addEventListener('resize', function () {
    clearTimeout(rt);
    rt = setTimeout(function () { if (Math.abs(stage.clientWidth - lastW) > 40) { lastW = stage.clientWidth; reset(); } }, 250);
  });
  // skip the work while the banner is scrolled out of view
  if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { onScreen = es[0].isIntersecting; }).observe(stage);

  reset();
  // the key's height depends on the pixel font, so lay the town out again once the font has loaded
  if (document.fonts && document.fonts.ready && stage.clientWidth < 1000) document.fonts.ready.then(function () { if (!reduce) reset(); else build(); });
  if (reduce) {
    // with reduced motion, start paused on a busy moment of the day
    for (var k = 0; k < DAY * .36; k++) step();
    setPaused(true);
  }
  requestAnimationFrame(loop);
})();
