import { expect, test } from 'bun:test';
import { recipe } from '../features/recipes.ts';
test('Arjit runner proof covers read-only lanes and refuses the unported writer proof', () => {
  expect(recipe('runner', 'claude').map(item => item.id)).toEqual(['route-1']);
  expect(recipe('runner', 'codex').map(item => item.id)).toEqual(['route-1']);
  expect(() => recipe('linked-worktree-writer', 'codex')).toThrow('missing-recipe:arjit-shared-git-contract');
});
