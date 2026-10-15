import { afterEach, expect, test } from 'bun:test';
import { mkdtemp, readFile, realpath, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { recipe, type Fixture } from '../features/recipes.ts';
import { command, sha256 } from './io.ts';
import type { SessionRecord } from './types.ts';
const roots: string[] = [];
afterEach(async () => { for (const root of roots.splice(0)) await rm(root, { recursive: true, force: true }); });
test('Codex Reflect refuses the unshipped Eric transcript resolver', () => {
  expect(() => recipe('skill-invocation:reflect', 'codex')).toThrow('missing-recipe:codex/arjit-reflect-transcript');
});
for (const available of [true, false]) {
  test(`Claude Reflect verifies the actual opener and fallback (${available})`, async () => {
    const dir = await realpath(await mkdtemp(join(tmpdir(), 'pstack-reflect-'))); roots.push(dir);
    const workspace = resolve(import.meta.dir, '../../../..');
    const fixture: Fixture = { harness: 'claude', dir, workspace, location: join(workspace, 'plugins/pstack'), configHome: dir, run: command };
    const item = recipe('skill-invocation:reflect', 'claude')[available ? 0 : 1]!;
    await item.prepare!(fixture);
    const path = join(dir, 'transcript-home/projects/fixture/known.jsonl');
    const opener = JSON.parse((await readFile(path, 'utf8')).split('\n')[1]!);
    const text: string = opener.message.content[0].text;
    const report = available
      ? { status: 'resolved', path, opening_user_message: { line: 2, characters: text.length, sha256: sha256(text), uuid: opener.uuid } }
      : { status: 'unresolved', reason: 'opening_message_mismatch', fallback: 'session_digest', uuid: opener.uuid };
    await writeFile(join(dir, 'result.json'), JSON.stringify(report));
    if (!available) await writeFile(join(dir, 'digest.md'), 'Only the requested disposable session is summarized.');
    const record: SessionRecord = { harness: 'claude', exitCode: 0, started: Date.now() - 1000, skills: ['pstack:reflect'], commands: [], tools: [], context: [] };
    expect((await item.assert(record, fixture)).assertions).toContain(available ? 'opening-verified' : 'digest-fallback');
    await writeFile(join(dir, 'result.json'), JSON.stringify({ ...report, uuid: 'fabricated' }));
    await expect(item.assert(record, fixture)).rejects.toThrow();
    await expect(item.assert({ ...record, skills: [] }, fixture)).rejects.toThrow('skill-not-loaded');
  });
}
