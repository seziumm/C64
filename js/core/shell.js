/* js/core/shell.js
 * Command registry and one-shot middleware pipeline.
 *
 * Flow: exec(raw)
 *   1. Check middleware stack (intercepts, e.g. "waiting for a number")
 *   2. Look up registered commands by name
 *   3. Fall back to syntax error
 *
 * A command handler returns:
 *   true       → shell stays open; handler manages the next input turn
 *   false|void → shell prints READY. and resets the prompt
 */

const Shell = (() => {
  const commands   = {};
  const middleware = [];

  /**
   * Prints the READY prompt and resets the input field.
   */
  function ready() {
    Terminal.print('READY.');
    Terminal.setTyped('');
    document.getElementById('input').value = '';
  }

  /**
   * Registers a named command.
   *
   * @param {string}   name
   * @param {string}   desc  shown in HELP
   * @param {Function} run   async (cmd: string) => boolean
   */
  function register(name, desc, run) {
    commands[name.toUpperCase()] = { desc, run };
  }

  /**
   * Pushes a one-shot middleware intercept onto the stack.
   * The next input that satisfies `test` is routed to `run`
   * and the intercept is then removed.
   *
   * @param {Function} test  (cmd: string) => boolean
   * @param {Function} run   async (cmd: string) => boolean
   */
  function use(test, run) {
    middleware.push({ test, run });
  }

  /**
   * Executes a raw string as a shell command.
   *
   * @param {string} raw
   */
  async function exec(raw) {
    const cmd = raw.trim();
    const key = cmd.toUpperCase();

    if (!key) { ready(); return; }

    /* Try middleware intercepts first. */
    for (let i = 0; i < middleware.length; i++) {
      if (!middleware[i].test(cmd)) continue;
      const intercept = middleware.splice(i, 1)[0];
      const keepOpen  = await intercept.run(cmd);
      if (!keepOpen) ready();
      return;
    }

    /* Look up registered commands. */
    const entry = commands[key];
    if (entry) {
      const keepOpen = await entry.run(cmd);
      if (!keepOpen) ready();
    } else {
      await Terminal.aprint('?SYNTAX ERROR');
      await Terminal.flush();
      ready();
    }
  }

  /* Built-in commands. */

  register('HELP', 'THIS MESSAGE', async () => {
    await Terminal.aprint('AVAILABLE COMMANDS:');
    for (const [name, { desc }] of Object.entries(commands))
      await Terminal.aprint(`  ${name.padEnd(10)}${desc}`);
    await Terminal.flush();
  });

  register('CLEAR', 'CLEAR SCREEN', () => {
    Terminal.clear();
    Terminal.toBottom();
  });

  return { exec, register, use };
})();
