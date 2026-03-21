/* js/input/desktop.js
 * Focus management for desktop devices (pointer: fine).
 * Depends on: grabFocus (defined in main.js).
 */

/**
 * Keeps the hidden input focused on desktop so keyboard events
 * are always captured, even after the user clicks elsewhere.
 *
 * @param {HTMLInputElement} $input
 */
function initDesktopInput($input) {
  $input.addEventListener('blur', () => setTimeout(grabFocus, 0));
  document.addEventListener('click', grabFocus);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) grabFocus();
  });
}
