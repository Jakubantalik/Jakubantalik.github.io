/* Magnetic radiation, for jakubantalik.com. A joke: an iPhone laid beside an
   Android phone "irradiates" the page from that edge, as TV static.

   Two takes: 4D Static, and 4E Soft (the same at 45% strength). Every detail
   can be tuned in the lab's Tune panel; Copy puts the settings on the
   clipboard, to bake in as the defaults below.

   On the live site nothing shows for ordinary visitors: no mouse, no preview,
   and no WebGL until a phone reading arrives. The lab (?lab) adds the takes,
   the Tune panel, the preview and the Phone card (Magnet Bridge, learning the
   iPhone). A phone that has connected once reconnects on its own after that.

   What moves it, first that applies:
   - the Magnet Bridge app on the same Android phone (ws://127.0.0.1:47613),
     with the iPhone's field learned once per side, as in Magnetic Home;
   - a mouse near an edge of the window;
   - the lab's preview: the demo, or the phone held at one edge.

   The static is drawn on one fixed WebGL canvas that ignores the pointer.
   Specks fly in from the edge and stick to the words and icons they hit;
   letters scramble and split red and cyan, icons tear. Text is split into
   words and letters only near the source and only while it is there, then
   put back exactly as it was. */
(() => {
  'use strict';
  if (window.__radiation) return;

  const qs = new URLSearchParams(location.search);
  const LAB = !!window.__radiationLab || qs.has('lab');
  const store = {
    get(k, d) {
      try {
        const v = localStorage.getItem('radiation.' + k);
        return v == null ? d : JSON.parse(v);
      } catch {
        return d;
      }
    },
    set(k, v) {
      try {
        localStorage.setItem('radiation.' + k, JSON.stringify(v));
      } catch {}
    },
  };
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const smooth = (a, b, x) => {
    const t = clamp((x - a) / (b - a), 0, 1);
    return t * t * (3 - 2 * t);
  };
  const clock = () => performance.now() / 1000;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isDark = () => document.documentElement.getAttribute('data-theme') === 'dark';

  /* -------------------------------------------------------------- settings */

  // [key, label, min, max, step, default, group, unit]
  const PARAMS = [
    ['strength', 'Strength', 0.05, 1, 0.05, 1, 'Effect', '%'],
    ['reach', 'Size', 0.4, 2, 0.05, 1, 'Effect', '×'],
    ['width', 'Width', 0.2, 3, 0.05, 1, 'Effect', '×'],
    ['opacity', 'Opacity', 0, 1.5, 0.05, 1, 'Effect', '×'],
    ['fadeIn', 'Fade in', 0.03, 1, 0.01, 0.12, 'Effect', 's'],
    ['fadeOut', 'Fade out', 0.05, 2, 0.05, 0.3, 'Effect', 's'],
    ['tint', 'Colour', 0, 0, 0, '#1f47ff', 'Effect', 'color'],
    ['density', 'Density', 0, 1, 0.02, 0.5, 'Snow', ''],
    ['grain', 'Grain size', 1, 6, 0.1, 1.6, 'Snow', 'px'],
    ['fps', 'Flicker rate', 2, 60, 1, 24, 'Snow', 'fps'],
    ['chroma', 'Channel offset', 0, 6, 0.1, 1.6, 'Snow', 'px'],
    ['fringe', 'Colour fringes', 0, 1, 0.05, 1, 'Snow', ''],
    ['tearChance', 'Torn rows', 0, 1, 0.02, 0.22, 'Tearing', ''],
    ['tearShift', 'Tear distance', 0, 120, 1, 30, 'Tearing', 'px'],
    ['band', 'Row height', 4, 60, 1, 16, 'Tearing', 'px'],
    ['tearRate', 'Tear rate', 1, 30, 1, 10, 'Tearing', 'Hz'],
    ['roll', 'Rolling bar', 0, 1, 0.02, 0.18, 'Glow', ''],
    ['rollSpeed', 'Roll speed', 0, 2, 0.05, 0.35, 'Glow', ''],
    ['track', 'Tracking lines', 0, 1, 0.05, 0.8, 'Glow', ''],
    ['rail', 'Edge line', 0, 2, 0.05, 1, 'Glow', ''],
    ['rate', 'Amount', 0, 400, 5, 160, 'Particles', '/s'],
    ['pspeed', 'Speed', 0.2, 3, 0.05, 1, 'Particles', '×'],
    ['turb', 'Turbulence', 0, 1500, 10, 500, 'Particles', ''],
    ['psize', 'Size', 0.5, 4, 0.1, 1, 'Particles', '×'],
    ['stick', 'Stick time', 0, 3, 0.05, 0.85, 'Particles', 's'],
    ['spread', 'Spread', 0.2, 2, 0.05, 1.3, 'Particles', '×'],
    ['textReach', 'Reach', 0.3, 2.5, 0.05, 1, 'Text', '×'],
    ['scramble', 'Scramble', 0, 2, 0.05, 1, 'Text', '×'],
    ['jitter', 'Letter jitter', 0, 6, 0.1, 2.4, 'Text', '×'],
    ['split', 'Red/cyan split', 0, 8, 0.1, 3.4, 'Text', 'px'],
    ['hitBoost', 'Hit flare', 0, 1, 0.05, 0.35, 'Text', ''],
    ['iconGlitch', 'Glitch', 0, 2, 0.05, 1, 'Icons', '×'],
    ['iconJitter', 'Jitter', 0, 6, 0.1, 2, 'Icons', '×'],
  ];
  const DEFAULTS = Object.fromEntries(PARAMS.map((p) => [p[0], p[5]]));
  const TAKES = {
    '4D': { name: 'Static', over: {} },
    // tuned in the lab, 2026-11-11
    '4E': {
      name: 'Soft',
      over: {
        strength: 0.8, reach: 0.85, width: 0.9, opacity: 0.5, density: 0.48, grain: 1, fps: 25,
        tearChance: 0.12, band: 31, roll: 0.32,
        rate: 400, pspeed: 0.45, psize: 0.5, stick: 0.4, textReach: 0.65,
      },
    },
  };
  const firstTake = qs.get('take') || store.get('take', '4E');
  let take = TAKES[firstTake] ? firstTake : '4E';
  let P = load(take);

  function base(id) {
    return { ...DEFAULTS, ...TAKES[id].over };
  }
  function load(id) {
    return { ...base(id), ...store.get('params.' + id, {}) };
  }
  /** Keeps only what differs from the take's defaults. */
  function save() {
    const b = base(take);
    store.set('params.' + take, Object.fromEntries(Object.entries(P).filter(([k, v]) => v !== b[k])));
  }
  function rgb(hex) {
    const n = parseInt(String(hex).slice(1), 16) || 0;
    return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
  }

  /* ---------------------------------------------------------------- source */

  // Where the radiation comes from: a point on the screen's edge, and how
  // strong (0..1). The point is s, running clockwise round the edge: 0 the
  // bottom-left corner, 1 top-left, 2 top-right, 3 bottom-right, so between
  // 0 and 1 it is on the left edge, 1 to 2 the top, and so on. `want` is what
  // the input says; `cur` follows it, gliding round the edge.
  const OUT = 22; // the phone lies just outside the screen
  const want = { s: 0.7, level: 0, ut: 0 };
  const cur = { s: 0.7, level: 0, ut: 0 };
  let fx = 0; // what the effect shows: the phone's level times the strength

  const wrap4 = (s) => ((s % 4) + 4) % 4;
  /** A side (left/top/right/bottom, with how far along it, 0..1 down or
   *  across) or a corner (topLeft, ...) as s. */
  function toS(side, along = 0.5) {
    switch (side) {
      case 'left': return 1 - along;
      case 'top': return 1 + along;
      case 'right': return 2 + along;
      case 'bottom': return 4 - along;
      case 'topLeft': return 1;
      case 'topRight': return 2;
      case 'bottomRight': return 3;
      default: return 0; // bottomLeft
    }
  }

  function follow(dt) {
    const d = wrap4(want.s - cur.s + 2) - 2; // the short way round
    if (Math.abs(d) > 1.2 && cur.level >= 0.02) {
      // Too far to glide (left to right): fade out, then jump.
      cur.level += (0 - cur.level) * (1 - Math.exp(-dt / 0.07));
      return;
    }
    if (Math.abs(d) > 1.2 || cur.level < 0.02) cur.s = want.s;
    else cur.s = wrap4(cur.s + d * (1 - Math.exp(-dt / 0.18)));
    const tau = want.level > cur.level ? P.fadeIn : P.fadeOut;
    cur.level += (want.level - cur.level) * (1 - Math.exp(-dt / tau));
    if (want.level === 0 && cur.level < 0.002) cur.level = 0;
    cur.ut += (want.ut - cur.ut) * (1 - Math.exp(-dt / 0.2));
  }

  /** Distance from the source as the effect sees it: inward counts less
   *  the wider the effect is. */
  function reachDistance(dx, dy, g) {
    return Math.hypot(dx * g.A[0] + dy * g.A[1], (dx * g.N[0] + dy * g.N[1]) / P.width);
  }

  // Outward normals of the four edges, in the order s runs through them.
  const EDGE_N = [[-1, 0], [0, -1], [1, 0], [0, 1]];
  const CORNER_ZONE = 90; // px either side of a corner where it turns diagonal

  function geometry() {
    const w = innerWidth;
    const h = innerHeight;
    const reach = clamp(0.55 * Math.min(w, h), 170, 420) * P.reach;
    const s = wrap4(cur.s);
    const e = Math.floor(s) % 4;
    const f = s - Math.floor(s);
    const len = e % 2 ? w : h;
    const Q = [[0, h * (1 - f)], [w * f, 0], [w, h * f], [w * (1 - f), h]][e];
    // Near a corner the phone faces the page diagonally.
    let n = EDGE_N[e];
    const toStart = f * len;
    const toEnd = (1 - f) * len;
    const corner = toStart < toEnd ? e : (e + 1) % 4;
    const t = smooth(0, CORNER_ZONE, Math.min(toStart, toEnd));
    if (t < 1) {
      const a = EDGE_N[(corner + 3) % 4];
      const b = EDGE_N[corner];
      const diag = [(a[0] + b[0]) / Math.SQRT2, (a[1] + b[1]) / Math.SQRT2];
      n = [diag[0] + (n[0] - diag[0]) * t, diag[1] + (n[1] - diag[1]) * t];
      const l = Math.hypot(n[0], n[1]);
      n = [n[0] / l, n[1] / l];
    }
    const N = [-n[0], -n[1]];
    return {
      w, h, reach,
      textReach: reach * (w > 700 ? 1.7 : 1.15) * P.textReach,
      P: [Q[0] + n[0] * OUT, Q[1] + n[1] * OUT],
      N,
      A: [-N[1], N[0]],
    };
  }

  /* ------------------------------------------------------------- the mouse */

  let sim = null;
  let simAt = -1e9;
  let overLab = false;
  const MOUSE = LAB || qs.has('magnetsim');
  addEventListener(
    'pointermove',
    (e) => {
      if (!MOUSE || e.pointerType !== 'mouse') return;
      simAt = clock();
      const w = innerWidth;
      const h = innerHeight;
      const x = e.clientX;
      const y = e.clientY;
      const reach = clamp(0.3 * Math.min(w, h), 140, 280);
      const near = nearestEdge(x, y);
      const level = overLab ? 0 : Math.pow(clamp(1 - near.d / reach, 0, 1), 1.2);
      sim = { s: near.s, level, ut: 30 + level * 250 };
      wake();
    },
    { passive: true },
  );
  document.documentElement.addEventListener('mouseleave', () => {
    if (sim) sim.level = 0;
    wake();
  });

  /** The point on the screen's edge nearest to (x, y), as s, and how far. */
  function nearestEdge(x, y) {
    const w = innerWidth;
    const h = innerHeight;
    const d = { left: x, right: w - x, top: y, bottom: h - y };
    let side = 'left';
    for (const k in d) if (d[k] < d[side]) side = k;
    const along = side === 'left' || side === 'right' ? clamp(y / h, 0, 1) : clamp(x / w, 0, 1);
    return { s: toS(side, along), d: Math.max(0, d[side]) };
  }

  /* ----------------------------------------------------------- the preview */

  // demo, off, or a place held: left, topLeft, top, topRight, right
  const HOLDS = { left: toS('left', 0.3), topLeft: 1, top: 1.5, topRight: 2, right: toS('right', 0.3) };
  let preview = LAB ? store.get('preview', 'demo') : 'off';
  // The demo walks the phone round: left, the corner, top, the corner, right,
  // then takes it away.
  function demo(t) {
    const stops = [HOLDS.left, HOLDS.topLeft, HOLDS.top, HOLDS.topRight, HOLDS.right];
    const step = 1.7;
    const period = step * stops.length + 1.6;
    const u = t % period;
    const k = Math.min(stops.length - 1, Math.floor(u / step));
    const away = u > step * stops.length;
    const level = away ? 0 : u < 0.8 ? smooth(0, 0.8, u) : 0.9 + 0.1 * Math.sin(u * 4.5);
    return { s: stops[k], level, ut: 20 + level * 240 };
  }

  /* -------------------------------------------------- Magnet Bridge, phone */

  const len = (v) => Math.hypot(v[0], v[1], v[2]);
  const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const median = (xs) => xs.slice().sort((a, b) => a - b)[xs.length >> 1];

  /** A field held steady for a second (Magnetic Home's GrabState). */
  class GrabState {
    constructor(previous) {
      this.previous = previous || null;
      this.buffer = [];
      this.progress = 0;
      this.done = false;
    }
    tick(f, now) {
      if (this.done) return null;
      const p = this.previous;
      const stillOnLast = p && len(sub(f.delta, p)) < Math.max(8, 0.25 * len(p));
      if (f.strength < 15 || f.calibrating || stillOnLast) {
        this.buffer = [];
        this.progress = 0;
        return null;
      }
      this.buffer.push([now, f.delta]);
      while (this.buffer.length && now - this.buffer[0][0] > 1.2) this.buffer.shift();
      const med = [0, 1, 2].map((i) => median(this.buffer.map((b) => b[1][i])));
      const spread = Math.max(...this.buffer.map((b) => len(sub(b[1], med))));
      if (spread > Math.max(4, 0.12 * f.strength)) {
        this.buffer = [[now, f.delta]];
        this.progress = 0;
        return null;
      }
      const held = now - this.buffer[0][0];
      this.progress = Math.min(1, held);
      if (held < 1) return null;
      this.done = true;
      return med;
    }
  }

  /** Keeps the strongest steady field and hands it over once the phone is
   *  taken away (Magnetic Home's SideHold). */
  class SideHold {
    constructor(previous) {
      this.hold = new GrabState(previous);
      this.held = null;
    }
    get progress() {
      return this.held ? 1 : this.hold.progress;
    }
    tick(f, now) {
      const g = this.hold.tick(f, now);
      if (g) {
        if (len(g) > (this.held ? len(this.held) : 0)) this.held = g;
        this.hold = new GrabState(g);
      }
      if (!this.held) return null;
      return f.strength < Math.max(10, 0.3 * len(this.held)) ? this.held : null;
    }
  }

  // The places the iPhone is learned at, in order round the edge:
  // [key, how to say it, can be skipped].
  const PLACES = [
    ['left', 'beside the left edge', false],
    ['topLeft', 'at the top-left corner', true],
    ['top', 'beside the top edge', false],
    ['topRight', 'at the top-right corner', true],
    ['right', 'beside the right edge', true],
  ];
  let sides = store.get('phoneSides', null); // { left: [x,y,z], topLeft: [...], ... }

  const PLACE_NAMES = { left: 'left', topLeft: 'top-left', top: 'top', topRight: 'top-right', right: 'right' };

  /** Where a learned place sits on the edge, as s. Beside the left or right
   *  edge it is a third of the way down the page: well clear of the corners
   *  (Chrome's bar takes the top of the screen, so the sensor's own height
   *  would sit almost in the corner). */
  function placeS(key) {
    if (key === 'left' || key === 'right') return toS(key, 0.32);
    return toS(key);
  }

  let phoneLive = null; // the last match, for the Phone card

  /** Which learned place the field is closest to, and how close the phone is.
   *  Between two neighbouring places (left and the top-left corner, say) the
   *  point lands in between, by how well each matches. */
  function locate(delta) {
    const n = len(delta);
    phoneLive = { n, ms: [] };
    if (!sides || n < 4) return { level: 0, ut: n };
    const learned = PLACES.map((p) => p[0]).filter((k) => sides[k]);
    const ms = learned
      .map((k, i) => {
        const size = len(sides[k]);
        const m = dot(delta, sides[k]) / (n * size);
        // The iPhone never gives more field at a place than it did touching
        // it, when it was learned: a field much stronger than that is from
        // somewhere nearer the sensor, however well the direction matches.
        const cap = size * 1.3 + 6;
        const fit = n <= cap ? 1 : clamp(1 - (n - cap) / (0.5 * size + 6), 0, 1);
        return { k, i, m, fit, score: m * fit - (1 - fit) };
      })
      .sort((a, b) => b.score - a.score);
    phoneLive.ms = ms;
    const best = ms[0];
    if (best.m < 0.6 || best.fit <= 0) return { level: 0, ut: n };
    let s = placeS(best.k);
    let size = len(sides[best.k]);
    const next = ms[1];
    if (next && next.fit > 0 && Math.abs(next.i - best.i) === 1) {
      // How far round from the best place to its neighbour the field has
      // turned; only when it lies between the two.
      const a = sides[best.k];
      const b = sides[next.k];
      const angle = (u, v) => Math.acos(clamp(dot(u, v) / (len(u) * len(v)), -1, 1));
      const ta = angle(delta, a);
      const tb = angle(delta, b);
      if (ta + tb < angle(a, b) * 1.25 + 0.1) {
        const k = ta / (ta + tb);
        s = wrap4(s + (wrap4(placeS(next.k) - s + 2) - 2) * k);
        size += (len(b) - size) * k;
      }
    }
    const ratio = n / size; // 1 when touching, as learned
    const level = clamp(Math.cbrt(ratio) * 1.15 - 0.12, 0, 1) * smooth(4, 14, n) * smooth(0.6, 0.8, best.m);
    return { s, level, ut: n };
  }

  /** What the phone reads now, in words: the field and the best matches. */
  function liveText() {
    const p = phoneLive;
    if (!p) return '';
    if (p.n < 4 || !p.ms.length) return `Now ${Math.round(p.n)} µT: nothing near.`;
    const top = p.ms.slice(0, 2).map((x) => `${PLACE_NAMES[x.k]} ${Math.round(x.m * 100)}%${x.fit < 1 ? ' (too strong for it)' : ''}`);
    return `Now ${Math.round(p.n)} µT · ${top.join(' · then ')}`;
  }

  const bridge = {
    ws: null,
    state: 'idle', // idle | connecting | open | failed
    device: '',
    frame: null,
    frameAt: -1e9,
    phone: null,
    touchOffset: null,
    connect() {
      if (this.state === 'open' || this.state === 'connecting') return;
      this.state = 'connecting';
      lab.render();
      let ws;
      try {
        ws = new WebSocket('ws://127.0.0.1:47613');
      } catch {
        this.state = 'failed';
        lab.render();
        return;
      }
      this.ws = ws;
      ws.onopen = () => {
        this.state = 'open';
        store.set('bridgeOk', true);
        if (preview === 'demo') setPreview('off');
        lab.render();
        wake();
      };
      ws.onclose = () => {
        this.ws = null;
        this.frame = null;
        this.state = 'failed';
        learn.cancel();
        lab.render();
        this.retry();
      };
      ws.onmessage = (m) => this.receive(String(m.data));
    },
    send(obj) {
      if (this.ws && this.ws.readyState === 1) this.ws.send(JSON.stringify(obj));
    },
    /** A phone that has connected before keeps trying while the page is in
     *  view, so starting the app after opening the page is fine. */
    retry() {
      if (!store.get('bridgeOk', false) || this.timer) return;
      this.timer = setTimeout(() => {
        this.timer = 0;
        if (document.visibilityState === 'visible' && this.state === 'failed') this.connect();
        else this.retry();
      }, 4000);
    },
    receive(text) {
      let d;
      try {
        d = JSON.parse(text);
      } catch {
        return;
      }
      if (d.type === 'hello') {
        this.device = `${d.manufacturer || ''} ${d.model || ''}`.trim();
        lab.render();
      } else if (d.type === 'm') {
        const f = {
          pos: d.pos ? { x: d.pos[0], y: d.pos[1] } : null,
          strength: d.s || 0,
          delta: d.d || [0, 0, 0],
          calibrating: !!d.cal,
        };
        const now = clock();
        this.frame = f;
        this.frameAt = now;
        if (learn.active) {
          learn.tick(f, now);
          this.phone = { level: 0, ut: f.strength };
        } else if (sides) {
          this.phone = locate(f.delta);
          if (now - (this.liveAt || 0) > 0.2) {
            this.liveAt = now;
            lab.live(liveText());
          }
        } else if (f.pos && f.strength > 4) {
          this.phone = fromMagnet(f);
        } else {
          this.phone = { level: 0, ut: f.strength };
        }
        wake();
      }
    },
  };
  addEventListener(
    'touchstart',
    (e) => {
      const t = e.touches[0];
      if (t) bridge.touchOffset = [t.screenX - t.clientX, t.screenY - t.clientY];
    },
    { passive: true },
  );

  /** Without a learned phone, a plain magnet: the bridge's own locator. */
  function fromMagnet(f) {
    const o = bridge.touchOffset || [0, Math.max(0, screen.height - innerHeight)];
    return { s: nearestEdge(f.pos.x - o[0], f.pos.y - o[1]).s, level: smooth(4, 40, f.strength), ut: f.strength };
  }

  /** "Learn the iPhone": a field per place, as in Magnetic Home. */
  const learn = {
    active: false,
    step: 0, // 0 = zeroing, then 1 + index into PLACES
    zeroUntil: 0,
    hold: null,
    got: {},
    start() {
      this.active = true;
      this.step = 0;
      this.got = {};
      this.hold = new SideHold(null);
      this.zeroUntil = clock() + 1.5;
      bridge.send({ type: 'calibrate' });
      lab.render();
    },
    get place() {
      return this.step > 0 ? PLACES[this.step - 1] : null;
    },
    tick(f, now) {
      if (this.step === 0) {
        if (now > this.zeroUntil && !f.calibrating) this.step = 1;
        lab.render();
        return;
      }
      const g = this.hold.tick(f, now);
      if (g) {
        this.got[this.place[0]] = g;
        if (navigator.vibrate) navigator.vibrate(30);
        this.hold = new SideHold(g);
        this.next();
      }
      lab.render();
    },
    next() {
      this.step += 1;
      if (this.step > PLACES.length) this.finish();
    },
    skip() {
      this.next();
      lab.render();
    },
    finish() {
      this.active = false;
      if (Object.keys(this.got).length >= 2) {
        sides = this.got;
        store.set('phoneSides', sides);
      }
      lab.render();
    },
    cancel() {
      if (!this.active) return;
      this.active = false;
      lab.render();
    },
  };

  /* ------------------------------------------------------------ the canvas */

  const VERT = `#version 300 es
in vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }`;

  // TV snow in three channels a little apart, rows of the page torn sideways,
  // a rolling bar, tracking lines and a jittering line on the edge.
  const FRAG = `#version 300 es
precision highp float;
uniform vec2 uRes;
uniform float uDpr;
uniform vec2 uP;
uniform vec2 uN;
uniform vec2 uA;
uniform float uLevel;
uniform float uTime;
uniform float uDark;
uniform float uReach;
uniform float uWidth;
uniform vec3 uTint;
uniform float uOpacity;
uniform float uDensity;
uniform float uGrain;
uniform float uFps;
uniform float uChroma;
uniform float uFringe;
uniform float uTearChance;
uniform float uTearShift;
uniform float uBand;
uniform float uTearRate;
uniform float uRoll;
uniform float uRollSpeed;
uniform float uTrack;
uniform float uRail;
out vec4 outColor;

float hash(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }

void main() {
  vec2 p = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y) / uDpr;
  vec2 q0 = p - uP;
  float along = dot(q0, uA);
  float dEdge = dot(q0, uN) - 22.0;
  float t = uTime, L = uLevel;
  float reach = uReach * (0.45 + 0.55 * L);
  float e = length(vec2(along / (reach * 1.2), max(dEdge, 0.0) / (reach * uWidth)));
  float fall = exp(-e * e * 2.0);
  float frame = floor(t * uFps);
  float torn = step(1.0 - uTearChance, hash(vec2(floor(p.y / uBand), floor(t * uTearRate))));
  vec2 q = p + vec2((hash(vec2(floor(p.y / 2.0), frame)) - 0.5) * uTearShift * torn, 0.0);
  float mask = fall * (0.45 + 0.55 * torn);
  float th = 1.0 - uDensity * mask;
  vec2 o = vec2(uChroma, 0.0);
  float nr = step(th, hash(floor((q + o) / uGrain) + frame * 1.31));
  float ng = step(th, hash(floor(q / uGrain) + frame * 2.17));
  float nb = step(th, hash(floor((q - o) / uGrain) + frame * 3.07));
  float snow = max(nr, max(ng, nb));
  float roll = exp(-pow((fract(p.y / 240.0 - t * uRollSpeed) - 0.5) * 7.0, 2.0)) * fall;
  float track = step(0.993, hash(vec2(floor(p.y), floor(t * 8.0)))) * fall;
  // the line hugs the screen's own border near the phone, so at a corner it
  // bends round both edges
  vec2 screenSize = uRes / uDpr;
  float border = min(min(p.x, p.y), min(screenSize.x - p.x, screenSize.y - p.y));
  float jit = (hash(vec2(floor((p.x + p.y) / 6.0), frame)) - 0.5) * 3.0;
  float rail = (1.0 - smoothstep(0.0, 1.2, abs(border - 2.0 - jit))) * exp(-pow(length(q0) / reach, 2.0));
  bool dark = uDark > 0.5;
  vec3 base = dark ? mix(uTint, vec3(1.0), 0.7) : uTint;
  vec3 col = base;
  if (nr > nb) col = mix(base, dark ? vec3(1.0, 0.35, 0.5) : vec3(0.95, 0.15, 0.45), uFringe);
  else if (nb > nr) col = mix(base, dark ? vec3(0.3, 0.9, 1.0) : vec3(0.0, 0.62, 1.0), uFringe);
  float glow = roll * uRoll + track * uTrack + rail * uRail;
  float s = snow * mask * 0.85;
  col = mix(col, dark ? mix(uTint, vec3(1.0), 0.45) : uTint, clamp(glow / (s + glow + 1e-3), 0.0, 1.0));
  float d = clamp((s + glow) * L * uOpacity, 0.0, 1.5);
  if (dark) outColor = vec4(col * d, min(d * 0.6, 1.0));
  else { float a = 1.0 - exp(-d * 2.4); outColor = vec4(col * a, a); }
}`;

  // Specks: square pixels, a short tail behind the ones in flight.
  const SPECK_VERT = `#version 300 es
in vec2 aXY;
in vec2 aData;
uniform vec2 uRes;
uniform float uDpr;
out float vA;
void main() {
  vec2 clip = aXY / (uRes / uDpr) * 2.0 - 1.0;
  gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
  gl_PointSize = max(1.0, aData.x * uDpr);
  vA = aData.y;
}`;

  const SPECK_FRAG = `#version 300 es
precision mediump float;
in float vA;
uniform float uDark;
uniform vec3 uTint;
out vec4 outColor;
void main() {
  if (uDark > 0.5) outColor = vec4(mix(uTint, vec3(1.0), 0.75) * vA * 1.4, vA * 0.6);
  else outColor = vec4(uTint * vA, vA);
}`;

  /* ---------------------------------------------------------------- specks */

  // Specks on the CPU, so they can hit the page: each word and icon near the
  // phone is a box, and a speck that enters one sticks there for a moment.
  const parts = (() => {
    const MAX = 900;
    const TAIL = 2;
    const STRIDE = 4; // x, y, size, alpha
    const buf = new Float32Array(MAX * TAIL * STRIDE);
    let list = [];
    let carry = 0;
    let count = 0;

    function emit(g, dt) {
      if (fx < 0.05 || P.rate <= 0) return;
      carry += P.rate * fx * dt;
      const reach = g.reach * (0.45 + 0.55 * fx);
      while (carry >= 1 && list.length < MAX) {
        carry -= 1;
        const r1 = Math.random();
        const r2 = Math.random();
        const r3 = Math.random();
        const off = (r1 - 0.5) * reach * P.spread;
        const s = (220 + 260 * r2) * P.pspeed;
        const across = (r3 - 0.5) * 160 * P.pspeed;
        list.push({
          x: g.P[0] + g.N[0] * OUT + g.A[0] * off,
          y: g.P[1] + g.N[1] * OUT + g.A[1] * off,
          vx: g.N[0] * s + g.A[0] * across,
          vy: g.N[1] * s + g.A[1] * across,
          age: 0,
          life: 1.4 * Math.max(0.25, P.width),
          size: (1.5 + r3) * P.psize,
          seed: Math.random(),
          stuck: false,
        });
      }
      if (carry > 1) carry = 0;
    }

    function step(g, time, dt, targets) {
      emit(g, dt);
      const w = innerWidth;
      const h = innerHeight;
      for (const p of list) {
        p.age += dt;
        if (!p.stuck) {
          p.vx += Math.sin(time * 3.1 + p.seed * 40 + p.y * 0.03) * P.turb * dt;
          p.vy += Math.cos(time * 2.7 + p.seed * 31 + p.x * 0.03) * P.turb * dt;
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          for (const t of targets) {
            if (p.x > t.l && p.x < t.r && p.y > t.t && p.y < t.b) {
              t.ref.hit = Math.min(1.2, t.ref.hit + P.hitBoost);
              p.stuck = true;
              p.vx = p.vy = 0;
              p.life = p.age + P.stick * (0.47 + Math.random() * 1.06);
              break;
            }
          }
        }
        if (p.age > p.life || p.x < -80 || p.y < -80 || p.x > w + 80 || p.y > h + 80) p.dead = true;
      }
      list = list.filter((p) => !p.dead);
      fill();
    }

    function fill() {
      const fade = clamp(fx * 4, 0, 1);
      let n = 0;
      for (const p of list) {
        let a = Math.min(1, p.age / 0.06) * (1 - smooth(p.life * 0.65, p.life, p.age)) * fade;
        if (p.stuck && Math.random() < 0.3) a *= 0.25; // flicker where they stuck
        const tail = p.stuck ? 1 : TAIL;
        for (let k = 0; k < tail; k++) {
          const o = n * STRIDE;
          buf[o] = p.x - p.vx * k * 0.012;
          buf[o + 1] = p.y - p.vy * k * 0.012;
          buf[o + 2] = p.size * (1 - k * 0.18);
          buf[o + 3] = a * (1 - k / (tail + 0.5));
          n++;
        }
      }
      count = n;
    }

    function clear() {
      list = [];
      count = 0;
      carry = 0;
    }

    return {
      buf,
      step,
      clear,
      get count() {
        return count;
      },
      get alive() {
        return list.length > 0;
      },
    };
  })();

  /* ----------------------------------------------------------- the icons */

  // RGB split and torn slices for icons and images, as SVG filters at four
  // strengths. The noise behind the tears is reseeded a dozen times a second.
  const glitch = (() => {
    const NS = 'http://www.w3.org/2000/svg';
    const ICONS = '.project-icon, .project-arrow, #themeToggle, .mobile-customize-icon, .style-button svg';
    const LEVELS = [
      [3, 0.8],
      [7, 1.5],
      [13, 2.4],
      [22, 3.4],
    ];
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('width', '0');
    svg.setAttribute('height', '0');
    svg.setAttribute('aria-hidden', 'true');
    svg.style.position = 'absolute';
    svg.innerHTML =
      '<defs>' +
      LEVELS.map(
        ([s, dx], i) => `<filter id="rad-g${i + 1}" x="-25%" y="-25%" width="150%" height="150%" color-interpolation-filters="sRGB">
<feTurbulence type="fractalNoise" baseFrequency="0 0.12" numOctaves="1" seed="1" result="n"/>
<feComponentTransfer in="n" result="bands"><feFuncR type="discrete" tableValues="0.5 0.5 0.5 0.18 0.5 0.5 0.82 0.5 0.5 0.5"/><feFuncG type="discrete" tableValues="0.5"/></feComponentTransfer>
<feDisplacementMap in="SourceGraphic" in2="bands" scale="${s}" xChannelSelector="R" yChannelSelector="G" result="torn"/>
<feColorMatrix in="torn" type="matrix" values="1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0" result="r"/>
<feOffset in="r" dx="${dx}" result="ro"/>
<feColorMatrix in="torn" type="matrix" values="0 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 1 0" result="gb"/>
<feOffset in="gb" dx="${-dx}" result="gbo"/>
<feBlend in="ro" in2="gbo" mode="screen"/>
</filter>`,
      ).join('') +
      '</defs>';
    const turbs = [...svg.querySelectorAll('feTurbulence')];

    let icons = null;
    let lastTick = 0;
    let busy = false;

    function read() {
      if (!icons) icons = [...document.querySelectorAll(ICONS)].map((el) => ({ el, cx: 0, cy: 0, w: 0, h: 0, f: 0, hit: 0, lvl: 0, jx: 0 }));
      for (const ic of icons) {
        const r = ic.el.getBoundingClientRect();
        ic.cx = r.left + r.width / 2;
        ic.cy = r.top + r.height / 2;
        ic.w = r.width;
        ic.h = r.height;
      }
    }

    function compute(g) {
      for (const ic of icons) {
        ic.f = ic.w ? fx * Math.pow(clamp(1 - reachDistance(ic.cx - g.P[0], ic.cy - g.P[1], g) / g.textReach, 0, 1), 1.25) : 0;
      }
    }

    function write(time, dt) {
      busy = false;
      const tick = time - lastTick > 0.08;
      if (tick) lastTick = time;
      for (const ic of icons) {
        ic.hit = Math.max(0, ic.hit - dt * 2.2);
        const k = (ic.f * 1.1 + ic.hit) * P.iconGlitch;
        const lvl = k < 0.06 ? 0 : Math.min(4, (k < 0.3 ? 1 : k < 0.6 ? 2 : k < 0.9 ? 3 : 4) + 1);
        if (lvl !== ic.lvl) {
          ic.el.style.filter = lvl ? `url(#rad-g${lvl})` : '';
          ic.lvl = lvl;
        }
        if (tick) {
          const jx = lvl && Math.random() < k * 0.5 ? (Math.random() - 0.5) * 3 * Math.min(1, k) * P.iconJitter : 0;
          if (jx !== ic.jx) {
            ic.el.style.translate = jx ? `${jx.toFixed(1)}px 0` : '';
            ic.jx = jx;
          }
        }
        if (lvl || ic.jx) busy = true;
      }
      if (busy && tick) {
        for (const t of turbs) {
          t.setAttribute('seed', String((Math.random() * 1000) | 0));
          t.setAttribute('baseFrequency', `0 ${(0.06 + Math.random() * 0.16).toFixed(3)}`);
        }
      }
    }

    function reset() {
      if (!icons) return;
      for (const ic of icons) {
        ic.el.style.filter = '';
        ic.el.style.translate = '';
        ic.lvl = 0;
        ic.jx = 0;
        ic.hit = 0;
      }
    }

    return {
      svg,
      read,
      compute,
      write,
      reset,
      get list() {
        return icons || [];
      },
      get busy() {
        return busy;
      },
    };
  })();

  /* ------------------------------------------------------------- the text */

  const GLYPHS = 'ABCDEFGHJKLMNPRSTUVXYZ0123456789#%&@$*+=<>/\\|';
  const TEXT = '.name, .about-bio, .work-tab-btn, .project-title, .project-desc, .site-footer > span, .footer-links a';

  const text = (() => {
    let blocks = null;
    const ro = 'ResizeObserver' in window ? new ResizeObserver((es) => es.forEach((e) => (e.target.__radMeasure = true))) : null;
    addEventListener('resize', () => blocks && blocks.forEach((b) => (b.el.__radMeasure = true)));

    function collect() {
      blocks = [...document.querySelectorAll(TEXT)].map((el) => ({ el, words: null, rect: null, idle: 0 }));
    }

    function split(b) {
      b.words = [];
      const walker = document.createTreeWalker(b.el, NodeFilter.SHOW_TEXT);
      const nodes = [];
      while (walker.nextNode()) nodes.push(walker.currentNode);
      for (const n of nodes) {
        if (!n.nodeValue.trim()) continue;
        const frag = document.createDocumentFragment();
        for (const part of n.nodeValue.split(/(\s+)/)) {
          if (!part) continue;
          if (/^\s+$/.test(part)) {
            frag.appendChild(document.createTextNode(part));
          } else {
            const s = document.createElement('span');
            s.className = 'rad-w';
            s.textContent = part;
            frag.appendChild(s);
            b.words.push({ el: s, text: part, rx: 0, ry: 0, w: 0, h: 0, cx: 0, cy: 0, f: 0, hit: 0, glow: 0, chars: null, styled: false, tick: -1 });
          }
        }
        n.parentNode.replaceChild(frag, n);
      }
      b.el.__radMeasure = true;
    }

    function unsplit(b) {
      for (const w of b.words) w.el.replaceWith(document.createTextNode(w.text));
      b.el.normalize();
      b.words = null;
    }

    // Letters as boxes of their own; the word keeps its width (letters lose
    // their kerning), so the line does not move.
    function splitChars(w, width) {
      w.el.style.width = width + 'px';
      w.el.textContent = '';
      w.chars = [...w.text].map((ch) => {
        const s = document.createElement('span');
        s.className = 'rad-c';
        s.textContent = ch;
        w.el.appendChild(s);
        return { el: s, ch, glyph: null, jx: 0 };
      });
      w.measureChars = true;
    }

    function unsplitChars(w) {
      w.el.textContent = w.text;
      w.el.style.width = '';
      w.chars = null;
    }

    function reset() {
      if (!blocks) return;
      for (const b of blocks) {
        if (!b.words) continue;
        for (const w of b.words) {
          if (w.chars) unsplitChars(w);
          w.el.style.textShadow = '';
        }
        unsplit(b);
      }
    }

    const targets = []; // boxes the specks can hit
    let busy = false;

    function step(g, time, dt) {
      if (!blocks) collect();
      const L = fx;
      const R = g.textReach;
      const [px, py] = g.P;
      const motion = reducedMotion ? 0.25 : 1;
      targets.length = 0;
      busy = false;

      // Read: where each block and icon is now.
      for (const b of blocks) {
        const r = b.el.getBoundingClientRect();
        b.rect = r;
        const dx = Math.max(r.left - px, 0, px - r.right);
        const dy = Math.max(r.top - py, 0, py - r.bottom);
        // the specks fly further than the glow: split text further out
        b.near = r.width > 0 && r.height > 0 && L > 0.01 && Math.hypot(dx, dy) < R * 1.5 * Math.max(1, P.width);
      }
      glitch.read();

      // Split the blocks the radiation reaches; put back the ones it left.
      for (const b of blocks) {
        if (b.near && !b.words) split(b);
        if (b.words && !b.near) {
          const resting = b.words.every((w) => !w.styled && !w.chars);
          b.idle = resting ? b.idle + dt : 0;
          if (b.idle > 0.5) unsplit(b);
        } else {
          b.idle = 0;
        }
      }

      // Measure words (home positions, relative to their block).
      const toMeasure = blocks.filter((b) => b.words && (b.el.__radMeasure || b.words.some((w) => w.measureChars)));
      if (toMeasure.length) {
        for (const b of toMeasure) for (const w of b.words) if (w.chars) for (const c of w.chars) c.el.style.transform = '';
        for (const b of toMeasure) {
          const br = b.el.getBoundingClientRect();
          b.rect = br;
          for (const w of b.words) {
            if (b.el.__radMeasure) {
              const r = w.el.getBoundingClientRect();
              w.rx = r.left + r.width / 2 - br.left;
              w.ry = r.top + r.height / 2 - br.top;
              w.w = r.width;
              w.h = r.height;
            }
            if (w.chars && (w.measureChars || b.el.__radMeasure)) {
              for (const c of w.chars) c.el.style.width = c.el.getBoundingClientRect().width + 'px';
              w.measureChars = false;
            }
          }
          b.el.__radMeasure = false;
          if (ro && !b.observed) {
            ro.observe(b.el);
            b.observed = true;
          }
        }
      }

      const needChars = [];
      for (const b of blocks) {
        if (!b.words) continue;
        for (const w of b.words) {
          w.cx = b.rect.left + w.rx;
          w.cy = b.rect.top + w.ry;
          w.f = L * Math.pow(clamp(1 - reachDistance(w.cx - px, w.cy - py, g) / R, 0, 1), 1.25);
          targets.push({ ref: w, l: w.cx - w.w / 2, r: w.cx + w.w / 2, t: w.cy - w.h / 2, b: w.cy + w.h / 2 });
          if ((w.f > 0.02 || w.hit > 0) && !w.chars) needChars.push(w);
        }
      }
      glitch.compute(g);
      for (const ic of glitch.list) {
        if (ic.w) targets.push({ ref: ic, l: ic.cx - ic.w / 2, r: ic.cx + ic.w / 2, t: ic.cy - ic.h / 2, b: ic.cy + ic.h / 2 });
      }
      const widths = needChars.map((w) => w.el.getBoundingClientRect().width);
      needChars.forEach((w, i) => splitChars(w, widths[i]));

      parts.step(g, time, dt, targets);

      for (const b of blocks) {
        if (!b.words) continue;
        for (const w of b.words) {
          scramble(w, time, dt, motion);
          if (w.styled || w.chars) busy = true;
        }
      }
      glitch.write(time, dt);
      // Keep going until every block, icon and speck is put back.
      if (blocks.some((b) => b.words) || glitch.busy || parts.alive) busy = true;
    }

    // Letters scramble into glyphs and twitch sideways, the word splits into
    // red and cyan, and a speck that strikes it makes it flare. Nothing moves
    // off its line.
    function scramble(w, t, dt, motion) {
      w.hit = Math.max(0, w.hit - dt * 2.5);
      if (!w.chars) return;
      const f = w.f;
      const k = Math.min(1.2, f + w.hit);
      w.glow += (Math.min(1, k) - w.glow) * (1 - Math.exp(-dt / 0.06));
      const tick = Math.floor(t * 15) !== w.tick;
      w.tick = Math.floor(t * 15);
      let any = false;
      for (const c of w.chars) {
        if (tick) {
          const p = Math.pow(f, 1.3) * 1.1 * P.scramble + w.hit * 0.9;
          const g = Math.random() < p ? GLYPHS[(Math.random() * GLYPHS.length) | 0] : null;
          if (g !== c.glyph) {
            c.glyph = g;
            c.el.textContent = g || c.ch;
          }
          c.jx = Math.random() < p * 0.4 ? (Math.random() - 0.5) * 10 * Math.min(1, k) * P.jitter * motion : 0;
          const tr = c.jx ? `translateX(${c.jx.toFixed(1)}px)` : '';
          if (c.el.style.transform !== tr) c.el.style.transform = tr;
        }
        if (c.glyph || c.jx) any = true;
      }
      if (w.glow > 0.01 && P.split > 0) {
        const o = (P.split * w.glow).toFixed(2);
        w.el.style.textShadow = `${o}px 0 rgba(255,40,100,${(0.7 * w.glow).toFixed(3)}), -${o}px 0 rgba(0,210,255,${(0.8 * w.glow).toFixed(3)})`;
        w.styled = true;
      } else if (w.styled) {
        w.el.style.textShadow = '';
        w.styled = false;
      }
      if (!any && !w.styled && f < 0.001 && w.hit === 0) unsplitChars(w);
    }

    return {
      step,
      reset,
      get busy() {
        return busy;
      },
    };
  })();

  /* ------------------------------------------------------------- drawing */

  // Made on first use, so visitors who never bring a phone never pay for it.
  let gfxReady = null;
  const gfx = {
    draw(g, time, dt) {
      if (!gfxReady) {
        if (fx < 0.002 && !parts.count) return;
        gfxReady = makeGfx();
        document.body.appendChild(gfxReady.canvas);
      }
      gfxReady.draw(g, time, dt);
    },
  };

  function makeGfx() {
    const canvas = document.createElement('canvas');
    canvas.className = 'rad-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    const gl = canvas.getContext('webgl2', { alpha: true, premultipliedAlpha: true, antialias: false, depth: false });
    if (!gl) return { canvas, draw() {} };

    function program(vs, fs, attrs) {
      const p = gl.createProgram();
      attrs.forEach((a, i) => gl.bindAttribLocation(p, i, a));
      for (const [type, src] of [
        [gl.VERTEX_SHADER, vs],
        [gl.FRAGMENT_SHADER, fs],
      ]) {
        const s = gl.createShader(type);
        gl.shaderSource(s, src);
        gl.compileShader(s);
        if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) console.error('[radiation]', gl.getShaderInfoLog(s));
        gl.attachShader(p, s);
      }
      gl.linkProgram(p);
      if (!gl.getProgramParameter(p, gl.LINK_STATUS)) console.error('[radiation]', gl.getProgramInfoLog(p));
      const u = {};
      const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
      for (let i = 0; i < n; i++) {
        const name = gl.getActiveUniform(p, i).name;
        u[name] = gl.getUniformLocation(p, name);
      }
      return { p, u };
    }

    const snow = program(VERT, FRAG, ['aPos']);
    const specks = program(SPECK_VERT, SPECK_FRAG, ['aXY', 'aData']);

    const snowVao = gl.createVertexArray();
    gl.bindVertexArray(snowVao);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    const speckVao = gl.createVertexArray();
    gl.bindVertexArray(speckVao);
    const speckBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, speckBuf);
    gl.bufferData(gl.ARRAY_BUFFER, parts.buf.byteLength, gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 16, 0);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 16, 8);
    gl.bindVertexArray(null);

    let scale = Math.min(devicePixelRatio || 1, 1.75);
    let dirty = false;
    let slow = 0;

    function resize() {
      const w = Math.round(innerWidth * scale);
      const h = Math.round(innerHeight * scale);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
    }

    function draw(g, time, dt) {
      // Drop the resolution if the phone cannot keep up.
      slow = slow * 0.95 + (dt > 0.024 ? 1 : 0) * 0.05;
      if (slow > 0.5 && scale > 1) {
        scale = 1;
        slow = 0;
      }
      resize();
      const dark = isDark() ? 1 : 0;
      const tint = rgb(P.tint);
      gl.disable(gl.SCISSOR_TEST);
      if (fx < 0.002 && !parts.count) {
        if (dirty) {
          gl.clearColor(0, 0, 0, 0);
          gl.clear(gl.COLOR_BUFFER_BIT);
          dirty = false;
        }
        return;
      }
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      dirty = true;
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      const s = canvas.width / innerWidth;

      // The snow, only around the source.
      const r = g.reach * 1.9 * Math.max(1, P.width);
      const x0 = clamp((g.P[0] - r) * s, 0, canvas.width);
      const x1 = clamp((g.P[0] + r) * s, 0, canvas.width);
      const y0 = clamp((g.P[1] - r) * s, 0, canvas.height);
      const y1 = clamp((g.P[1] + r) * s, 0, canvas.height);
      if (fx >= 0.002 && x1 > x0 && y1 > y0) {
        gl.enable(gl.SCISSOR_TEST);
        gl.scissor(x0, canvas.height - y1, x1 - x0, y1 - y0);
        const u = snow.u;
        gl.useProgram(snow.p);
        gl.uniform2f(u.uRes, canvas.width, canvas.height);
        gl.uniform1f(u.uDpr, s);
        gl.uniform2f(u.uP, g.P[0], g.P[1]);
        gl.uniform2f(u.uN, g.N[0], g.N[1]);
        gl.uniform2f(u.uA, g.A[0], g.A[1]);
        gl.uniform1f(u.uLevel, fx);
        gl.uniform1f(u.uTime, time);
        gl.uniform1f(u.uDark, dark);
        gl.uniform1f(u.uReach, g.reach);
        gl.uniform1f(u.uWidth, P.width);
        gl.uniform3f(u.uTint, tint[0], tint[1], tint[2]);
        gl.uniform1f(u.uOpacity, P.opacity);
        gl.uniform1f(u.uDensity, P.density);
        gl.uniform1f(u.uGrain, P.grain);
        gl.uniform1f(u.uFps, P.fps);
        gl.uniform1f(u.uChroma, P.chroma);
        gl.uniform1f(u.uFringe, P.fringe);
        gl.uniform1f(u.uTearChance, P.tearChance);
        gl.uniform1f(u.uTearShift, P.tearShift);
        gl.uniform1f(u.uBand, P.band);
        gl.uniform1f(u.uTearRate, P.tearRate);
        gl.uniform1f(u.uRoll, P.roll);
        gl.uniform1f(u.uRollSpeed, P.rollSpeed);
        gl.uniform1f(u.uTrack, P.track);
        gl.uniform1f(u.uRail, P.rail);
        gl.bindVertexArray(snowVao);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
        gl.disable(gl.SCISSOR_TEST);
      }

      if (parts.count) {
        gl.useProgram(specks.p);
        gl.uniform2f(specks.u.uRes, canvas.width, canvas.height);
        gl.uniform1f(specks.u.uDpr, s);
        gl.uniform1f(specks.u.uDark, dark);
        gl.uniform3f(specks.u.uTint, tint[0], tint[1], tint[2]);
        gl.blendFunc(gl.ONE, dark ? gl.ONE : gl.ONE_MINUS_SRC_ALPHA);
        gl.bindVertexArray(speckVao);
        gl.bindBuffer(gl.ARRAY_BUFFER, speckBuf);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, parts.buf, 0, parts.count * 4);
        gl.drawArrays(gl.POINTS, 0, parts.count);
      }
      gl.bindVertexArray(null);
    }

    return { canvas, draw };
  }

  /* ------------------------------------------------------------ the loop */

  let raf = 0;
  let last = 0;
  const t0 = clock();

  function wake() {
    if (!raf) {
      last = clock();
      raf = requestAnimationFrame(frame);
    }
  }

  function chooseInput(time) {
    const now = clock();
    // Holding a side in the lab wins over everything: it stays on while the
    // sliders are dragged.
    if (preview in HOLDS) return { s: HOLDS[preview], level: 1, ut: 280 };
    if (bridge.state === 'open' && now - bridge.frameAt < 0.6 && bridge.phone) {
      return { ...want, ...bridge.phone, s: bridge.phone.s ?? want.s };
    }
    const mouse = sim && now - simAt < 2.5;
    if (preview === 'demo') return mouse && sim.level > 0.02 ? sim : demo(time);
    if (mouse) return sim;
    return { s: want.s, level: 0, ut: 0 };
  }

  function frame() {
    raf = 0;
    const now = clock();
    const dt = clamp(now - last, 1 / 240, 1 / 20);
    last = now;
    const time = now - t0;
    Object.assign(want, chooseInput(time));
    follow(dt);
    fx = cur.level * P.strength;
    const g = geometry();
    text.step(g, time, dt);
    gfx.draw(g, time, dt);
    const busy = cur.level > 0.002 || want.level > 0.001 || text.busy || preview !== 'off' || (sim && now - simAt < 2.5) || bridge.state === 'open';
    if (busy) raf = requestAnimationFrame(frame);
  }

  /* ------------------------------------------------------------------ CSS */

  const css = `
.rad-canvas{position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:2147483000}
.rad-w{display:inline-block;white-space:nowrap}
.name .rad-w{color:var(--text-color);-webkit-text-fill-color:currentColor}
.rad-c{display:inline-block;white-space:pre;text-align:center}
.rad-lab,.rad-panel,.rad-card{--rad-fg:var(--text-color,#333);--rad-bg:var(--bg-color,#fff);color:var(--rad-fg);
  -webkit-backdrop-filter:blur(16px);backdrop-filter:blur(16px);
  box-shadow:0 0 0 1px color-mix(in srgb,var(--rad-fg) 10%,transparent),0 10px 30px rgba(0,0,0,.12)}
.rad-lab{position:fixed;left:50%;bottom:calc(16px + env(safe-area-inset-bottom));transform:translateX(-50%);z-index:2147483002;
  display:flex;align-items:center;gap:2px;padding:4px;border-radius:999px;max-width:calc(100vw - 24px);
  background:color-mix(in srgb,var(--rad-bg) 82%,transparent);font:500 13px/1 Inter,system-ui,sans-serif;-webkit-user-select:none;user-select:none}
.rad-lab button,.rad-panel button,.rad-card button{appearance:none;border:0;margin:0;font:inherit;color:inherit;cursor:pointer;white-space:nowrap;
  transition:background-color .2s ease}
.rad-lab button{background:transparent;padding:9px 11px;border-radius:999px}
.rad-lab button:hover{background:color-mix(in srgb,var(--rad-fg) 6%,transparent)}
.rad-lab button[aria-pressed="true"]{background:color-mix(in srgb,var(--rad-fg) 11%,transparent)}
.rad-lab .rad-sep{width:1px;height:18px;margin:0 3px;background:color-mix(in srgb,var(--rad-fg) 14%,transparent)}
.rad-lab .rad-num{opacity:.45;margin-right:5px}
.rad-lab .rad-led{display:inline-block;width:6px;height:6px;border-radius:50%;margin-right:6px;vertical-align:1px;background:color-mix(in srgb,var(--rad-fg) 30%,transparent)}
.rad-lab .rad-led[data-s="open"]{background:#2f6bff;box-shadow:0 0 6px #2f6bff}
.rad-lab .rad-led[data-s="connecting"]{background:#f5a524}
.rad-lab .rad-led[data-s="failed"]{background:#e5484d}
.rad-panel{position:fixed;right:16px;top:16px;z-index:2147483003;width:308px;max-height:calc(100vh - 100px);overflow:auto;overscroll-behavior:contain;
  padding:12px 14px 8px;border-radius:16px;box-sizing:border-box;background:color-mix(in srgb,var(--rad-bg) 92%,transparent);
  font:400 12px/1.3 Inter,system-ui,sans-serif;-webkit-user-select:none;user-select:none}
.rad-panel[hidden]{display:none}
.rad-panel-head{display:flex;align-items:center;gap:6px;margin-bottom:10px}
.rad-panel-head b{flex:1;font-weight:600;font-size:13px}
.rad-panel-head button{background:color-mix(in srgb,var(--rad-fg) 7%,transparent);padding:6px 10px;border-radius:999px;font-weight:500}
.rad-panel-head button:hover{background:color-mix(in srgb,var(--rad-fg) 12%,transparent)}
.rad-seg{display:flex;gap:2px;padding:2px;margin-bottom:6px;border-radius:999px;background:color-mix(in srgb,var(--rad-fg) 6%,transparent)}
.rad-seg button{flex:1;background:transparent;padding:6px 0;border-radius:999px;font-weight:500;min-width:0}
.rad-seg button[aria-pressed="true"]{background:var(--rad-bg);box-shadow:0 1px 3px rgba(0,0,0,.12)}
.rad-panel details{border-top:1px solid color-mix(in srgb,var(--rad-fg) 9%,transparent);padding:2px 0 6px}
.rad-panel summary{display:flex;justify-content:space-between;cursor:pointer;list-style:none;padding:8px 0 4px;font-weight:600}
.rad-panel summary::-webkit-details-marker{display:none}
.rad-panel summary::after{content:"+";opacity:.45;font-weight:400}
.rad-panel details[open] summary::after{content:"\\2013"}
.rad-prow{display:grid;grid-template-columns:98px 1fr 46px;align-items:center;gap:8px;padding:3px 0}
.rad-prow span{color:var(--text-secondary,#666)}
.rad-prow input[type="range"]{width:100%;margin:0;accent-color:#2f6bff}
.rad-prow input[type="color"]{width:100%;height:20px;margin:0;padding:0;border:0;background:none;cursor:pointer}
.rad-prow output{text-align:right;font-variant-numeric:tabular-nums}
.rad-card{position:fixed;left:50%;bottom:calc(68px + env(safe-area-inset-bottom));transform:translateX(-50%);z-index:2147483002;
  width:min(340px,calc(100vw - 24px));padding:16px;border-radius:18px;box-sizing:border-box;
  background:color-mix(in srgb,var(--rad-bg) 92%,transparent);font:400 13px/1.45 Inter,system-ui,sans-serif}
.rad-card[hidden]{display:none}
.rad-card h4{margin:0 0 4px;font-size:13px;font-weight:600}
.rad-card p{margin:0;color:var(--text-secondary,#666)}
.rad-card p+p{margin-top:8px}
.rad-card .rad-live{color:var(--rad-fg);font-variant-numeric:tabular-nums}
.rad-card .rad-bar{height:3px;border-radius:2px;margin:12px 0 2px;background:color-mix(in srgb,var(--rad-fg) 10%,transparent);overflow:hidden}
.rad-card .rad-bar i{display:block;height:100%;width:0;background:#2f6bff;transition:width .1s linear}
.rad-card .rad-row{display:flex;gap:6px;margin-top:12px;flex-wrap:wrap}
.rad-card button{font:500 13px/1 Inter,system-ui,sans-serif;padding:9px 12px;border-radius:999px;background:color-mix(in srgb,var(--rad-fg) 8%,transparent)}
.rad-card button.rad-primary{background:#2f6bff;color:#fff}
.rad-edge{position:fixed;z-index:2147483001;pointer-events:none;background:#2f6bff;box-shadow:0 0 14px 2px rgba(47,107,255,.7);border-radius:4px;
  animation:rad-pulse 1s ease-in-out infinite alternate}
.rad-edge[hidden]{display:none}
.rad-edge-corner{background:none;box-shadow:none;border:0 solid #2f6bff;border-radius:0;filter:drop-shadow(0 0 6px rgba(47,107,255,.8))}
.rad-edge-corner.rad-tl{border-left-width:5px;border-top-width:5px}
.rad-edge-corner.rad-tr{border-right-width:5px;border-top-width:5px}
@keyframes rad-pulse{from{opacity:.45}to{opacity:1}}
@media (max-width:600px){
  .rad-panel{left:12px;right:12px;top:auto;bottom:calc(66px + env(safe-area-inset-bottom));width:auto;max-height:52vh}
  .rad-lab .rad-num{display:none}
  .rad-lab button{padding:9px 9px}
}
`;

  /* -------------------------------------------------------------- the lab */

  const lab = (() => {
    if (!LAB) return { render() {}, live() {} };
    const el = document.createElement('div');
    el.className = 'rad-lab';
    const panel = document.createElement('div');
    panel.className = 'rad-panel';
    panel.hidden = !store.get('panel', false);
    const card = document.createElement('div');
    card.className = 'rad-card';
    card.hidden = true;
    const edge = document.createElement('div');
    edge.className = 'rad-edge';
    edge.hidden = true;
    let cardOpen = false;

    // The mouse over the controls is not the phone.
    for (const x of [el, panel, card]) {
      x.addEventListener('pointerenter', () => {
        overLab = true;
        if (sim) sim.level = 0;
      });
      x.addEventListener('pointerleave', () => (overLab = false));
    }

    function button(parent, label, onClick) {
      const b = document.createElement('button');
      b.type = 'button';
      b.innerHTML = label;
      b.addEventListener('click', onClick);
      parent.appendChild(b);
      return b;
    }

    // The bar: the two takes, then Tune, Demo and Phone.
    const takeButtons = Object.entries(TAKES).map(([id, t]) => [id, button(el, `<span class="rad-num">${id}</span>${t.name}`, () => setTake(id))]);
    const sep = document.createElement('span');
    sep.className = 'rad-sep';
    el.appendChild(sep);
    const tuneB = button(el, 'Tune', () => {
      panel.hidden = !panel.hidden;
      store.set('panel', !panel.hidden);
      render();
    });
    const demoB = button(el, 'Demo', () => setPreview(preview === 'demo' ? 'off' : 'demo'));
    const phoneB = button(el, '<span class="rad-led"></span>Phone', () => {
      cardOpen = !cardOpen;
      if (cardOpen && bridge.state !== 'open') bridge.connect();
      render();
    });

    // The panel: a heading with Copy, Reset and close, the preview, then a
    // slider for each setting, in groups.
    const head = document.createElement('div');
    head.className = 'rad-panel-head';
    const title = document.createElement('b');
    head.appendChild(title);
    const copyB = button(head, 'Copy', async () => {
      const json = JSON.stringify({ take, params: P }, null, 2);
      try {
        await navigator.clipboard.writeText(json);
        copyB.textContent = 'Copied';
      } catch {
        console.log('[radiation] settings\n' + json);
        copyB.textContent = 'In console';
      }
      setTimeout(() => (copyB.textContent = 'Copy'), 1400);
    });
    button(head, 'Reset', () => {
      P = base(take);
      save();
      render();
      wake();
    });
    button(head, '×', () => {
      panel.hidden = true;
      store.set('panel', false);
      render();
    }).setAttribute('aria-label', 'Close');
    panel.appendChild(head);

    const seg = document.createElement('div');
    seg.className = 'rad-seg';
    const PREVIEWS = [
      ['demo', 'Demo', 'Demo'],
      ['left', '←', 'Left edge'],
      ['topLeft', '↖', 'Top-left corner'],
      ['top', '↑', 'Top edge'],
      ['topRight', '↗', 'Top-right corner'],
      ['right', '→', 'Right edge'],
      ['off', 'Off', 'Off'],
    ];
    const previewButtons = PREVIEWS.map(([m, label, title]) => {
      const b = button(seg, label, () => setPreview(m));
      b.title = title;
      b.setAttribute('aria-label', title);
      return [m, b];
    });
    panel.appendChild(seg);

    const inputs = {};
    const OPEN = ['Effect', 'Snow'];
    let group = null;
    for (const [key, label, min, max, stepV, , g, unit] of PARAMS) {
      if (!group || group.dataset.g !== g) {
        group = document.createElement('details');
        group.dataset.g = g;
        group.open = OPEN.includes(g);
        group.innerHTML = `<summary>${g}</summary>`;
        panel.appendChild(group);
      }
      const row = document.createElement('label');
      row.className = 'rad-prow';
      const name = document.createElement('span');
      name.textContent = label;
      const input = document.createElement('input');
      const out = document.createElement('output');
      if (unit === 'color') {
        input.type = 'color';
      } else {
        input.type = 'range';
        input.min = String(min);
        input.max = String(max);
        input.step = String(stepV);
      }
      input.addEventListener('input', () => {
        P[key] = unit === 'color' ? input.value : Number(input.value);
        out.textContent = format(P[key], unit);
        save();
        wake();
      });
      row.append(name, input, out);
      group.appendChild(row);
      inputs[key] = { input, out, unit };
    }

    function format(v, unit) {
      if (unit === 'color') return '';
      if (unit === '%') return Math.round(v * 100) + '%';
      const n = Math.abs(v) >= 100 ? Math.round(v) : Math.abs(v) >= 10 ? +v.toFixed(1) : +v.toFixed(2);
      return n + (unit === '×' ? '×' : unit ? ' ' + unit : '');
    }

    function render() {
      for (const [id, b] of takeButtons) b.setAttribute('aria-pressed', String(take === id));
      tuneB.setAttribute('aria-pressed', String(!panel.hidden));
      demoB.setAttribute('aria-pressed', String(preview === 'demo'));
      phoneB.setAttribute('aria-pressed', String(cardOpen));
      phoneB.querySelector('.rad-led').dataset.s = bridge.state;
      title.textContent = `${take} ${TAKES[take].name}`;
      for (const [m, b] of previewButtons) b.setAttribute('aria-pressed', String(preview === m));
      for (const key in inputs) {
        const { input, out, unit } = inputs[key];
        input.value = String(P[key]);
        out.textContent = format(P[key], unit);
      }
      renderCard();
    }

    function renderCard() {
      card.hidden = !cardOpen && !learn.active;
      edge.hidden = true;
      if (card.hidden) return;
      if (learn.active) {
        const place = learn.place;
        if (!place) {
          card.innerHTML = '<h4>Learn the iPhone</h4><p>Keep the iPhone away for a moment.</p><div class="rad-bar"><i></i></div><div class="rad-row"><button data-a="cancel">Cancel</button></div>';
        } else {
          const got = learn.hold && learn.hold.held;
          const [key, where, skippable] = place;
          card.innerHTML = `<h4>Learn the iPhone · ${learn.step} of ${PLACES.length}</h4><p>${
            got ? 'Got it. Take the iPhone away.' : `Lay the iPhone flat ${where}, touching, and hold still.`
          }</p><div class="rad-bar"><i style="width:${Math.round((learn.hold ? learn.hold.progress : 0) * 100)}%"></i></div><div class="rad-row">${
            skippable ? '<button data-a="skip">Skip</button>' : ''
          }<button data-a="cancel">Cancel</button></div>`;
          placeEdge(key);
        }
      } else if (bridge.state === 'open') {
        const have = sides ? PLACES.filter((p) => sides[p[0]]).map((p) => p[0]) : [];
        const learned = have.map((k) => `${PLACE_NAMES[k]} ${Math.round(len(sides[k]))} µT`).join(' · ');
        const weak = have.filter((k) => len(sides[k]) < 25).map((k) => PLACE_NAMES[k]);
        card.innerHTML = `<h4>Magnet Bridge${bridge.device ? ' · ' + bridge.device : ''}</h4><p>${
          learned ? `Learned: ${learned}. Keep the iPhone turned the same way as when learned.` : 'No iPhone learned yet: a magnet works now, an iPhone needs learning once.'
        }</p>${
          weak.length
            ? `<p>${weak.join(' and ')} read${weak.length > 1 ? '' : 's'} under 25 µT, close to nothing, so ${weak.length > 1 ? 'they are' : 'it is'} easy to mistake for another place. Learn again with the iPhone touching there, or skip it.</p>`
            : ''
        }${learned ? `<p class="rad-live">${liveText()}</p>` : ''}<div class="rad-row"><button class="rad-primary" data-a="learn">${
          learned ? 'Learn again' : 'Learn the iPhone'
        }</button><button data-a="close">Close</button></div>`;
      } else if (bridge.state === 'connecting') {
        card.innerHTML = '<h4>Magnet Bridge</h4><p>Connecting…</p>';
      } else {
        card.innerHTML = `<h4>Magnet Bridge</h4><p>Not found. On an Android phone, open the Magnet Bridge app and start it, then try again. Without it, the mouse near an edge or the preview plays the iPhone.</p><div class="rad-row"><button class="rad-primary" data-a="retry">Try again</button><button data-a="close">Close</button></div>`;
      }
    }

    // A glowing mark where the iPhone goes: a bar on an edge, an L in a corner.
    function placeEdge(key) {
      edge.hidden = false;
      const w = innerWidth;
      const s = edge.style;
      edge.className = 'rad-edge';
      if (key === 'topLeft' || key === 'topRight') {
        edge.classList.add('rad-edge-corner', key === 'topLeft' ? 'rad-tl' : 'rad-tr');
        Object.assign(s, { left: key === 'topLeft' ? '0px' : w - 64 + 'px', top: '0px', width: '64px', height: '64px' });
      } else if (key === 'top') {
        Object.assign(s, { left: w / 2 - 70 + 'px', top: '0px', width: '140px', height: '5px' });
      } else {
        const y = (key === 'left' ? 1 - placeS('left') : placeS('right') - 2) * innerHeight;
        Object.assign(s, { left: key === 'left' ? '0px' : w - 5 + 'px', top: y - 70 + 'px', width: '5px', height: '140px' });
      }
    }

    card.addEventListener('click', (e) => {
      const a = e.target.closest('button') && e.target.closest('button').dataset.a;
      if (a === 'learn') learn.start();
      else if (a === 'skip') learn.skip();
      else if (a === 'cancel') learn.cancel();
      else if (a === 'retry') {
        bridge.state = 'idle';
        bridge.connect();
      } else if (a === 'close') cardOpen = false;
      renderCard();
    });

    addEventListener('keydown', (e) => {
      if (e.target && /input|textarea|select/i.test(e.target.tagName)) return;
      if (e.key === '1') setTake('4D');
      else if (e.key === '2') setTake('4E');
      else if (e.key === 'd' || e.key === 'D') demoB.click();
      else if (e.key === 't' || e.key === 'T') tuneB.click();
    });

    return {
      render,
      renderAll: render,
      live(text) {
        const el = card.querySelector('.rad-live');
        if (el && !card.hidden) el.textContent = text;
      },
      mount() {
        document.body.append(el, panel, card, edge);
        render();
      },
    };
  })();

  function setTake(id) {
    if (!TAKES[id] || id === take) return;
    take = id;
    P = load(id);
    store.set('take', id);
    if (lab.renderAll) lab.renderAll();
    wake();
  }

  function setPreview(m) {
    preview = m;
    store.set('preview', m);
    if (lab.renderAll) lab.renderAll();
    wake();
  }

  /* ---------------------------------------------------------------- start */

  function start() {
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
    document.body.append(glitch.svg);
    if (lab.mount) lab.mount();
    if (qs.has('bridge') || store.get('bridgeOk', false)) bridge.connect();
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && store.get('bridgeOk', false) && bridge.state !== 'open') bridge.connect();
    });
    window.__radiation = {
      setTake,
      setPreview,
      get take() {
        return take;
      },
      get params() {
        return { ...P };
      },
      set(key, value) {
        if (!(key in DEFAULTS)) return;
        P[key] = value;
        save();
        if (lab.renderAll) lab.renderAll();
        wake();
      },
      state: () => ({ want: { ...want }, cur: { ...cur }, fx, bridge: bridge.state, sides, preview, P: geometry().P, N: geometry().N }),
      // For checks: where a field would put the iPhone, with the learned places.
      match(delta) {
        return { ...locate(delta), live: liveText() };
      },
      // For checks: hold the source somewhere without a mouse.
      hold(side, along, level) {
        sim = { s: toS(side, along), level, ut: 30 + level * 250 };
        simAt = clock() + 1e6;
        wake();
      },
      release() {
        simAt = -1e9;
        wake();
      },
      reset() {
        text.reset();
        parts.clear();
        glitch.reset();
      },
    };
    wake();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
