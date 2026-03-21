/* js/commands/dynamic.js
 * Commands that fetch data from Supabase at runtime.
 * Depends on: Shell, Terminal, DB.
 */

/**
 * Registers a command that displays a numbered list and waits for the
 * user to select one item by number to read in full.
 *
 * @param {string}   name
 * @param {string}   desc
 * @param {object}   opts
 * @param {string}   opts.header        first line printed (e.g. '100 REM …')
 * @param {Function} opts.fetch         async () => item[]
 * @param {Function} opts.renderRow     (n: number, item: object) => string
 * @param {string}   opts.prompt        prompt shown after the list
 * @param {Function} opts.renderDetail  async (item: object) => void
 */
function pickerCommand(name, desc, { header, fetch, renderRow, prompt, renderDetail }) {
  Shell.register(name, desc, async () => {
    let items;
    try {
      items = await fetch();
    } catch (e) {
      await Terminal.error(e);
      return false;
    }

    await Terminal.aprint(header);
    await Terminal.aprint('');

    if (!items.length) {
      await Terminal.aprint('NO ITEMS YET.');
      await Terminal.flush();
      return false;
    }

    for (let i = 0; i < items.length; i++)
      for (const line of renderRow(i + 1, items[i]).split('\n'))
        await Terminal.aprint(line);

    await Terminal.aprint('');
    await Terminal.aprint(prompt);
    await Terminal.flush();
    Terminal.toBottom();

    Shell.use(() => true, async cmd => {
      const n = parseInt(cmd, 10);

      if (isNaN(n) || n < 1 || n > items.length) {
        await Terminal.aprint('?INVALID NUMBER');
        await Terminal.flush();
        return false;
      }

      await Terminal.aprint('');
      await renderDetail(items[n - 1]);
      await Terminal.flush();
      return false;
    });

    /* Keep the shell open — waiting for picker input. */
    return true;
  });
}

pickerCommand('PROJECTS', 'MY PROJECTS', {
  header: '100 REM *** PROJECTS ***',
  fetch:  () => DB.getProjects(),
  renderRow: (n, p) => `${n}. ${p.title.toUpperCase()}`,
  prompt: 'READ PROJECT (ENTER NUMBER):',
  renderDetail: async p => {
    await Terminal.aprint(p.title.toUpperCase());
    await Terminal.aprint('');
    for (const line of p.description.split('\n'))
      await Terminal.aprint(line.toUpperCase());
    if (p.link) {
      await Terminal.aprint('');
      await Terminal.aprint(`LINK: ${p.link.toUpperCase()}`);
    }
  },
});

pickerCommand('BLOG', 'READ THE BLOG', {
  header: "500 REM *** SEZIUM'S BLOG ***",
  fetch:  () => DB.getPosts(),
  renderRow: (n, p) => `${n}. ${p.title.toUpperCase()}\n   ${p.date}`,
  prompt: 'READ POST (ENTER NUMBER):',
  renderDetail: async p => {
    try {
      await Terminal.aprint(p.title.toUpperCase());
      await Terminal.aprint('');
      await Terminal.aprint(p.date);
      await Terminal.aprint('');
      for (const line of p.body.split('\n'))
        await Terminal.aprint(line.toUpperCase());
      await Terminal.aprint('');
    } catch (e) {
      await Terminal.error(e);
    }
  },
});
