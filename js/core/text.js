/* js/core/text.js
 * Pure text utilities: HTML escaping, padding, centering, word-wrap.
 * No side effects; depends only on Terminal.COLS.
 */

/**
 * Escapes HTML special characters in a string.
 *
 * @param   {string} s
 * @returns {string}
 */
const esc = s =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g,  '&lt;')
    .replace(/>/g,  '&gt;');

/**
 * Left-pads a string with `n` spaces.
 *
 * @param   {string} s
 * @param   {number} n
 * @returns {string}
 */
const padLeft = (s, n) => ' '.repeat(Math.max(0, n)) + s;

/**
 * Centers a string within Terminal.COLS columns.
 *
 * @param   {string} s
 * @returns {string}
 */
const center = s => padLeft(s, Math.floor((Terminal.COLS - s.length) / 2));

/**
 * Splits `text` into rows each at most Terminal.COLS characters wide.
 * Long words are hard-broken; short words wrap naturally.
 *
 * @param   {string|null} text
 * @param   {boolean}     shouldWrap  false → truncate to one row instead
 * @returns {string[]}
 */
function wrap(text, shouldWrap = true) {
  const str = text == null ? '' : String(text);
  if (!str.length) return [''];
  if (!shouldWrap)  return [str.slice(0, Terminal.COLS)];

  const result = [];
  const words  = str.split(' ');
  let   line   = '';

  for (let i = 0; i < words.length; i++) {
    let word = words[i];

    /* Hard-break any word that exceeds the column width. */
    while (word.length > Terminal.COLS) {
      const room = Terminal.COLS - line.length;
      if (room > 0) {
        line += word.slice(0, room);
        word  = word.slice(room);
      }
      result.push(line);
      line = '';
    }

    /* Preserve spacing without double-spacing. */
    if (!word) {
      if (i > 0 && line.length < Terminal.COLS) line += ' ';
      continue;
    }

    const candidate = line ? `${line} ${word}` : word;

    if (candidate.length <= Terminal.COLS) {
      line = candidate;
    } else {
      result.push(line);
      line = word;
    }
  }

  result.push(line);
  return result;
}
