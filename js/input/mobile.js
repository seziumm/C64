/* js/input/mobile.js
 * Touch input handling for mobile devices (pointer: coarse).
 * Depends on: Terminal, grabFocus (defined in main.js).
 */

/**
 * Attaches touch event listeners to `$input` for swipe-to-scroll
 * and iOS keyboard management.
 *
 * @param {HTMLInputElement} $input
 */
function initMobileInput($input) {
  const ROW_HEIGHT = 16;

  let touchStartY  = null;
  let scrolledRows = 0;

  /* Block scroll and pull-to-refresh on the document,
   * but not on $input so the browser still registers taps. */
  document.addEventListener('touchstart', e => {
    if (e.target !== $input) e.preventDefault();
  }, { passive: false });

  document.addEventListener('touchmove', e => {
    e.preventDefault();
  }, { passive: false });

  $input.addEventListener('touchstart', e => {
    touchStartY  = e.touches[0].clientY;
    scrolledRows = 0;
  });

  $input.addEventListener('touchmove', e => {
    if (touchStartY === null) return;
    const delta      = touchStartY - e.touches[0].clientY;
    const targetRows = Math.round(delta / ROW_HEIGHT);
    const diff       = targetRows - scrolledRows;
    for (let i = 0; i < Math.abs(diff); i++)
      diff > 0 ? Terminal.scrollDown() : Terminal.scrollUp();
    scrolledRows = targetRows;
  });

  $input.addEventListener('touchend', () => {
    touchStartY  = null;
    scrolledRows = 0;
    /* Calling focus() inside touchend (an active user gesture)
     * reopens the keyboard correctly on iOS Safari. */
    grabFocus();
  });
}
