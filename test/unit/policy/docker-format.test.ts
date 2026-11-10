import { afterEach, describe, expect, it } from 'vitest';
import { classifyCommand } from '../../../src/policy/classifier.js';
import { createHarness, type Harness } from '../tools/harness.js';

const reported = "docker ps -a --no-trunc --filter label=com.docker.compose.project=mergepilot-3mdspq --format '{{.ID}} {{.Image}} {{.Names}} {{.Status}}'";
const accepted = [
  reported,
  `docker ps --format "{{.ID}} {{.Status}}"`,
  "docker ps --format '{{.ID}}' -a --no-trunc",
  "docker ps --filter status=running --format '{{.Names}}' --quiet",
];
const rejected = [
  `${reported}; echo x`, `${reported} && echo x`, `${reported} | cat`,
  `${reported} > /tmp/output`, `${reported}\nwhoami`.replace('\\n', '\n'),
  `docker ps --format '{{.ID}} $(touch /tmp/not-run)'`,
  'docker ps --format "{{.ID}} `touch /tmp/not-run`"',
  "docker ps --format '{{.ID}}' --filter 'label=$(touch /tmp/not-run)'",
  "docker ps --format '{{.ID}}' --filter label=ok;whoami",
  "docker ps --format '{{.ID}}' --filter label=%COMSPEC%",
  "docker ps --format '{{.ID}}' --filter label=!var!",
  "docker ps --format '{{.ID}}' --filter label=*.conf",
  "docker ps --format '{{.ID}}' --filter label=ok\\whoami",
  "docker ps --format {{.ID}}",
  "docker ps --format '{{.ID}}",
  "docker ps --format '{{.ID}}' --format '{{.Names}}'",
  "docker ps --format '{{json .}}'",
  "docker ps --format '{{.ID}}' --unknown value",
  "docker ps --format '{{.ID}}' extra-operand",
  "docker exec container echo '{{.ID}}'",
  "docker logs --format '{{.ID}}'",
  "echo '{{.ID}}'",
];
let h: Harness | undefined;
afterEach(async () => { await h?.close(); h = undefined; });

describe('bounded Docker ps field formatting', () => {
  it.each(accepted)('classifies the fully recognized read as read-only: %s', command => {
    expect(classifyCommand(command).class).toBe('read-only');
  });
  it.each(rejected)('does not grant read-only to unrecognized syntax: %s', command => {
    expect(classifyCommand(command).class).not.toBe('read-only');
  });
  it('passes the exact reported command to the fake SSH executor once', async () => {
    h = await createHarness();
    const result = await h.client.callTool({ name: 'read-command', arguments: { command: reported } });
    expect(result.isError).toBeFalsy();
    expect(h.execCalls.map(call => call.command)).toEqual([reported]);
  });
  it('refuses shell syntax without any fake upstream execution', async () => {
    h = await createHarness();
    const result = await h.client.callTool({ name: 'read-command', arguments: { command: `${reported}; echo x` } });
    expect(result.isError).toBe(true);
    expect(h.execCalls).toHaveLength(0);
  });
});
