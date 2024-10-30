import { isObject } from '@vue/devtools-shared';

function escapeString(value: string) {
  return value.replace(/ /g, '&nbsp;').replace(/\n/g, '<span>\\n</span>');
}

export const rawTypeRE = /^\[object (\w+)\]$/;

export function formatInspectorStateValue(
  value,
  quotes = false,
  options?: {
    // Support more types if needed
    customClass?: Partial<Record<'string', string>>;
  },
) {
  const { customClass } = options ?? {};

  if (typeof value === 'string') {
    const typeMatch = value.match(rawTypeRE);
    if (typeMatch) {
      value = escapeString(typeMatch[1]);
    } else if (quotes) {
      value = `<span>"</span>${
        customClass?.string ? `<span class=${customClass.string}>${escapeString(value)}</span>` : escapeString(value)
      }<span>"</span>`;
    } else {
      value = customClass?.string
        ? `<span class="${customClass?.string ?? ''}">${escapeString(value)}</span>`
        : escapeString(value);
    }
  }

  if (isObject(value) || Array.isArray(value)) {
    return '';
  }

  return value;
}

export function toEdit(value: unknown) {
  return JSON.stringify(value);
}

export function toSubmit(value: string) {
  return JSON.parse(value);
}
