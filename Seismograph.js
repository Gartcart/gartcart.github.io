/**
 *
 * I see you looking through my source code!!!
 *
 */
export default class Seismograph {
  #canvas;
  #ctx;
  #resizeObserver;
  #pointerMoveHandler;
  #animationFrameId;
  #channels = [];
  #state = {
    width: 0,
    height: 0,
    dpr: 1,
    rowHeight: 0,
    amplitude: 0,
    col: 0,
    acc: 0,
    sub: 0,
    mx: 0,
    my: 0,
    prevPos: null,
    lastTime: 0
  };
  
  #config = {
    step: 1 / 120,
    stepsPerSample: 2,
    pxPerSample: 2,
    gridPx: 40,
    markEvery: 5,
    fullScale: 4000,
    speedLimit: 8000,
    rowFill: 0.4,
    maxDpr: 2,
    maxFrame: 0.1,
    colors: { 
      paper: "#000", 
      grid: "#191a1e", 
      mark: "#2b2d35", 
      base: "#3c3f4a" 
    }
  };

  /**
   * @param {string|HTMLCanvasElement} target - The canvas element or its ID.
   */
  constructor(target) {
    this.#canvas = typeof target === 'string' 
      ? document.getElementById(target) 
      : target;

    if (!this.#canvas || !(this.#canvas instanceof HTMLCanvasElement)) {
      throw new Error('Seismograph requires a valid HTMLCanvasElement or ID.');
    }

    this.#ctx = this.#canvas.getContext("2d");
    this.#initChannels();
    this.#bindEvents();
    this.#resize();
    
    this.#resizeObserver = new ResizeObserver(() => this.#resize());
    this.#resizeObserver.observe(this.#canvas.parentElement || document.body);
    
    this.#loop(performance.now());
  }

  #initChannels() {
    const definitions = [
      { hz: 5.0, damp: 0.09, ink: "#f4f4f0", weight: 1.4, drive: m => m.speed },
      { hz: 3.4, damp: 0.07, ink: "#b6bac4", weight: 1.0, drive: m => m.vx },
      { hz: 3.4, damp: 0.07, ink: "#b6bac4", weight: 1.0, drive: m => m.vy }
    ];
    
    this.#channels = definitions.map(c => {
      const w = 2 * Math.PI * c.hz;
      return {
        ...c,
        w,
        w2: w * w,
        gain: (w * w) / this.#config.fullScale,
        pos: 0, 
        vel: 0, 
        y: 0, 
        py: null
      };
    });
  }

  #bindEvents() {
    this.#pointerMoveHandler = this.#handlePointerMove.bind(this);
    window.addEventListener("pointermove", this.#pointerMoveHandler, { passive: true });
  }

  #handlePointerMove(e) {
    const { mx, my, prevPos } = this.#state;
    this.#state.mx = mx + (e.movementX ?? (prevPos ? e.clientX - prevPos.x : 0));
    this.#state.my = my + (e.movementY ?? (prevPos ? e.clientY - prevPos.y : 0));
    this.#state.prevPos = { x: e.clientX, y: e.clientY };
  }

  #resize() {
    const s = this.#state;
    const c = this.#config;
    
    s.dpr = Math.min(c.maxDpr, Math.round(window.devicePixelRatio) || 1);
    s.width = this.#canvas.clientWidth || window.innerWidth;
    s.height = this.#canvas.clientHeight || window.innerHeight;
    
    this.#canvas.width = s.width * s.dpr;
    this.#canvas.height = s.height * s.dpr;
    s.rowHeight = s.height / this.#channels.length;
    s.amplitude = s.rowHeight * c.rowFill;
    
    this.#ctx.setTransform(s.dpr, 0, 0, s.dpr, 0, 0);
    this.#ctx.fillStyle = c.colors.paper;
    this.#ctx.fillRect(0, 0, s.width, s.height);
    
    this.#channels.forEach((ch, i) => {
      ch.y = Math.round(s.rowHeight * (i + 0.5));
      ch.py = null;
    });
  }

  #render() {
    const s = this.#state;
    const c = this.#config;
    
    this.#ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.#ctx.globalCompositeOperation = "copy";
    this.#ctx.drawImage(this.#canvas, -c.pxPerSample * s.dpr, 0);
    this.#ctx.globalCompositeOperation = "source-over";
    this.#ctx.setTransform(s.dpr, 0, 0, s.dpr, 0, 0);

    const x = s.width - c.pxPerSample;
    
    this.#ctx.fillStyle = c.colors.paper;
    this.#ctx.fillRect(x, 0, c.pxPerSample, s.height);

    this.#ctx.fillStyle = c.colors.grid;
    for (let y = 0; y < s.height; y += c.gridPx) {
      this.#ctx.fillRect(x, y, c.pxPerSample, 1);
    }

    const tick = ++s.col / (c.gridPx / c.pxPerSample);
    if (Number.isInteger(tick)) {
      this.#ctx.fillStyle = tick % c.markEvery ? c.colors.grid : c.colors.mark;
      this.#ctx.fillRect(s.width - 1, 0, 1, s.height);
    }

    this.#ctx.fillStyle = c.colors.base;
    for (const ch of this.#channels) {
      this.#ctx.fillRect(x, ch.y, c.pxPerSample, 1);
      const y = ch.y - Math.tanh(ch.pos) * s.amplitude;
      this.#ctx.strokeStyle = ch.ink;
      this.#ctx.lineWidth = ch.weight;
      this.#ctx.beginPath();
      this.#ctx.moveTo(x, ch.py ?? y);
      this.#ctx.lineTo(s.width, y);
      this.#ctx.stroke();
      ch.py = y;
    }
  }

  #loop(timestamp) {
    const s = this.#state;
    const c = this.#config;
    
    const dt = Math.min((timestamp - s.lastTime) / 1000, c.maxFrame);
    s.lastTime = timestamp;
    
    const vx = s.mx / dt;
    const vy = s.my / dt;
    const speed = Math.hypot(vx, vy);
    const clamp = Math.min(1, c.speedLimit / (speed || 1));
    const motion = { vx: vx * clamp, vy: vy * clamp, speed: speed * clamp };
    
    s.mx = s.my = 0;

    for (s.acc += dt; s.acc >= c.step; s.acc -= c.step) {
      for (const ch of this.#channels) {
        ch.vel += (ch.drive(motion) * ch.gain - ch.w2 * ch.pos - 2 * ch.damp * ch.w * ch.vel) * c.step;
        ch.pos += ch.vel * c.step;
      }
      if (++s.sub % c.stepsPerSample === 0) {
        this.#render();
      }
    }
    
    this.#animationFrameId = requestAnimationFrame((t) => this.#loop(t));
  }

  /**
   * Cleans up event listeners and animation frames to prevent memory leaks. AI tools were used for this section, since I didn't feel the need to code these few lines from scratch.
   */
  destroy() {
    if (this.#animationFrameId) {
      cancelAnimationFrame(this.#animationFrameId);
    }
    window.removeEventListener("pointermove", this.#pointerMoveHandler);
    if (this.#resizeObserver) {
      this.#resizeObserver.disconnect();
    }
  }
}
