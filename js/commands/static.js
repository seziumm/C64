/* js/commands/static.js
 * Commands whose content is hardcoded and requires no data fetching.
 * Depends on: Shell, Terminal.
 */

/**
 * Registers a command that prints a fixed list of lines.
 * An empty string in `lines` prints a blank row.
 *
 * @param {string}   name
 * @param {string}   desc
 * @param {string[]} lines
 */
function staticCommand(name, desc, lines) {
  Shell.register(name, desc, async () => {
    for (const line of lines)
      await Terminal.aprint(line === '' ? null : line);
    await Terminal.flush();
  });
}

staticCommand('ABOUT', 'WHO I AM', [
  '10 REM *** SEZIUM ***', '',
  'LOW-LEVEL DEV & HARDWARE ENTHUSIAST.', '',
  'LOCATION : ITALY',
  'STATUS   : OPEN TO WORK',
  'REMOTE   : YES',
]);

staticCommand('CONTACT', 'HOW TO REACH ME', [
  '400 REM *** CONTACT ***', '',
  'GITHUB   GITHUB.COM/SEZIUMM',
  'EMAIL    SEZIUMWORK@GMAIL.COM',
]);
