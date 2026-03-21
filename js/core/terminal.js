/* js/core/terminal.js
 * Manages the virtual screen: line buffer, scroll, cursor blink,
 * animated print queue, and DOM rendering.
 */

const Terminal = (() => {
  const COLS = 40;
  const ROWS = 25;

  let lines    = [];
  let typed    = '';
  let scrollY  = 0;
  let cursorOn = true;

  const $content = document.getElementById('screen-content');

  const virtualLines = () => lines.concat([typed]);
  const maxScroll    = () => Math.max(0, virtualLines().length - ROWS);
  const clampScroll  = () => { scrollY = Math.max(0, Math.min(scrollY, maxScroll())); };
  const pushLine     = s  => lines.push(s);
  const jumpToBottom = () => { scrollY = maxScroll(); render(); };

  /**
   * Re-renders the visible portion of the virtual line buffer into the DOM.
   * Appends the blinking cursor to the last (typed) line when cursorOn is true.
   */
  function render() {
    const v   = virtualLines();
    const cur = v.length - 1;
    clampScroll();

    let html = '';
    for (let row = 0; row < ROWS; row++) {
      const vi = scrollY + row;
      if (vi < v.length) {
        let chunk = esc(v[vi]);
        if (vi === cur) chunk += `<span class="cursor-char${cursorOn ? '' : ' cursor-char--hidden'}"> </span>`;
        html += chunk;
      }
      if (row < ROWS - 1) html += '\n';
    }
    $content.innerHTML = html;
  }

  /* Animated print queue.
   * Each item: { rows: string[], delay: number }.
   * Rows are pushed one at a time, `delay` ms apart. */
  const queue   = [];
  let   running = false;

  /**
   * Adds a batch of rows to the print queue and starts draining if idle.
   *
   * @param {string[]} rows
   * @param {number}   delay  ms between each row
   */
  function enqueue(rows, delay) {
    queue.push({ rows, delay });
    if (!running) drain();
  }

  /**
   * Processes the next item in the queue, one row at a time.
   * Calls itself recursively until the queue is empty.
   */
  function drain() {
    if (!queue.length) { running = false; return; }
    running = true;

    const { rows, delay } = queue.shift();
    let i = 0;

    function step() {
      if (i >= rows.length) { drain(); return; }
      pushLine(rows[i++]);
      jumpToBottom();
      setTimeout(step, delay);
    }

    step();
  }

  return {
    COLS,
    ROWS,

    /**
     * Instantly prints text (no animation). Each wrapped row is pushed
     * directly into the line buffer.
     *
     * @param {string}  text
     * @param {boolean} shouldWrap
     */
    print(text, shouldWrap = true) { wrap(text, shouldWrap).forEach(pushLine); },

    /**
     * Instantly prints a centered line.
     *
     * @param {string} text
     */
    center(text) { pushLine(center(String(text ?? ''))); },

    /** Pushes a blank line instantly. */
    br() { pushLine(''); },

    /**
     * Queues text for animated printing (one wrapped row per `delay` ms).
     *
     * @param {string|null} text
     * @param {number}      delay       ms between rows (default 32)
     * @param {boolean}     shouldWrap
     */
    aprint(text, delay = 32, shouldWrap = true) {
      enqueue(wrap(text == null ? '' : String(text), shouldWrap), delay);
    },

    /**
     * Queues a blank line for animated printing.
     *
     * @param {number} delay  ms (default 32)
     */
    abr(delay = 32) { enqueue([''], delay); },

    /**
     * Returns a Promise that resolves when the print queue is empty.
     *
     * @returns {Promise<void>}
     */
    flush() {
      return new Promise(resolve => {
        if (!running && !queue.length) { resolve(); return; }
        const interval = setInterval(() => {
          if (!running && !queue.length) { clearInterval(interval); resolve(); }
        }, 16);
      });
    },

    /**
     * Returns true while rows are still being animated.
     *
     * @returns {boolean}
     */
    isPrinting() { return running || queue.length > 0; },

    /**
     * Queues an error message for animated printing.
     *
     * @param {Error} e
     */
    async error(e) {
      enqueue(wrap('?ERROR: ' + String(e.message).slice(0, COLS - 8)), 32);
      await this.flush();
    },

    /** Clears the screen and resets all state. */
    clear() { lines = []; scrollY = 0; queue.length = 0; running = false; },

    /**
     * Updates the typed (input) line and re-renders.
     *
     * @param {string} t
     */
    setTyped(t) { typed = t; jumpToBottom(); },

    /** Commits the current typed line into the permanent buffer. */
    commit() { wrap(typed).forEach(pushLine); typed = ''; },

    /** Scrolls up by one row. */
    scrollUp()   { scrollY = Math.max(0, scrollY - 1); render(); },

    /** Scrolls down by one row. */
    scrollDown() { scrollY++; clampScroll(); render(); },

    /** Jumps to the last row. */
    toBottom()   { scrollY = maxScroll(); render(); },

    /** Toggles cursor visibility and re-renders. */
    blink()      { cursorOn = !cursorOn; render(); },
  };
})();
