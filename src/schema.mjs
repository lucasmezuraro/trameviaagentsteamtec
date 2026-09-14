// Shared structural primitives. They identify shape only; they authorize nothing
// and they do not authenticate whoever produced the value.
import { createHash } from 'node:crypto';

export const fail = (message) => { throw new Error(message); };
export const object = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
export const nonempty = (value) => typeof value === 'string' && value.trim().length > 0;
export const integer = (value, max) => Number.isSafeInteger(value) && value >= 1 && value <= max;
export const unique = (items) => new Set(items).size === items.length;

export function keys(value, expected, label) {
  if (!object(value) || Object.keys(value).sort().join(',') !== [...expected].sort().join(','))
    fail(label + ': campos ausentes ou desconhecidos');
}
export function list(value, label, { empty = false } = {}) {
  if (!Array.isArray(value) || (!empty && !value.length) || !value.every(nonempty) || !unique(value))
    fail(label + ': lista inválida ou duplicada');
}
function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical);
  if (object(value)) return Object.fromEntries(Object.keys(value).sort().map(k => [k, canonical(value[k])]));
  return value;
}
export const digest = (value) => createHash('sha256').update(JSON.stringify(canonical(value))).digest('hex');
