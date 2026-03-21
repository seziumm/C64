/* js/main.js
 * Entry point: boot sequence, shared keyboard handling, cursor blink.
 * Device-specific input is delegated to js/input/mobile.js and js/input/desktop.js.
 * Depends on: Terminal, Shell, initMobileInput, initDesktopInput.
 */

const BOOT_LINES = [
  '**** COMMODORE 64 BASIC V2 ****',
  '',
  '64K RAM SYSTEM  38911 BASIC BYTES FREE',
  '',
];

const $input = document.getElementById('input');

let buffer = '';

/**
 * Syncs `val` to the internal buffer, the DOM input, and the terminal
 * typed line simultaneously.
 *
 * @param {string} val
 */
function setBuffer(val) {
  buffer = val;
  $input.value = val;
  $input.setSelectionRange(val.length, val.length);
  Terminal.setTyped(val);
}

/**
 * Restores focus to the hidden input and moves the caret to the end.
 * Exposed to global scope so input modules can call it.
 */
function grabFocus() {
  $input.focus({ preventScroll: true });
  $input.setSelectionRange(buffer.length, buffer.length);
}

$input.addEventListener('keydown', e => {
  switch (e.key) {
    case 'ArrowUp':    e.preventDefault(); Terminal.scrollUp();   return;
    case 'ArrowDown':  e.preventDefault(); Terminal.scrollDown(); return;
    case 'ArrowLeft':
    case 'ArrowRight': e.preventDefault();                        return;
  }

  /* Drop keypresses while the terminal is still animating. */
  if (Terminal.isPrinting()) { e.preventDefault(); return; }

  switch (e.key) {
    case 'Enter':
      e.preventDefault();
      Terminal.commit();
      Shell.exec(buffer);
      setBuffer('');
      break;

    case 'Backspace':
      e.preventDefault();
      setBuffer(buffer.slice(0, -1));
      break;
  }
});

$input.addEventListener('input', () => {
  /* Uppercase only; strip non-printable characters. */
  const val = $input.value.toUpperCase().replace(/[^\x20-\x7E]/g, '');
  setBuffer(val);
  Terminal.toBottom();
});

setInterval(() => Terminal.blink(), 333);

/**
 * Runs the startup animation and then executes the HELP command.
 */
function boot() {
  let i = 0;

  (function printNextLine() {
    if (i < BOOT_LINES.length) {
      const line = BOOT_LINES[i++];
      line === '' ? Terminal.br() : Terminal.center(line);
      Terminal.toBottom();
      setTimeout(printNextLine, 90);
    } else {
      Shell.exec('HELP');
      grabFocus();
    }
  })();
}

const isMobile = () => window.matchMedia('(pointer: coarse)').matches;
isMobile() ? initMobileInput($input) : initDesktopInput($input);
boot();
