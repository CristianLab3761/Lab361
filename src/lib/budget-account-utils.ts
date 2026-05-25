export function normalizeBudgetAccount(value: string) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

export function getBudgetAccountNames(cuentas: any[]) {
  const seen = new Set<string>();

  return cuentas
    .map((item) => String((item as any)['Cuentas Presupuesto'] || (item as any).name || ''))
    .filter(Boolean)
    .filter((name) => {
      const normalized = normalizeBudgetAccount(name);
      if (!normalized || seen.has(normalized)) {
        return false;
      }

      seen.add(normalized);
      return true;
    });
}

function extractAccountNames(cuentas: string[] | any[]) {
  if (cuentas.length === 0) {
    return [];
  }

  if (typeof cuentas[0] === 'string') {
    return Array.from(new Set(cuentas as string[]));
  }

  return getBudgetAccountNames(cuentas as any[]);
}

function levenshtein(a: string, b: string) {
  const matrix = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));

  for (let i = 0; i <= a.length; i += 1) {
    matrix[i][0] = i;
  }

  for (let j = 0; j <= b.length; j += 1) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  return matrix[a.length][b.length];
}

export function isValidBudgetAccount(value: string, cuentas: string[] | any[]) {
  if (!value) {
    return true;
  }

  const normalizedValue = normalizeBudgetAccount(value);
  const names = extractAccountNames(cuentas);
  return names.some((name) => normalizeBudgetAccount(name) === normalizedValue);
}

export function rankBudgetAccounts(value: string, cuentas: string[] | any[]) {
  const query = normalizeBudgetAccount(value);
  const names = extractAccountNames(cuentas);

  if (!query) {
    return names.slice(0, 10);
  }

  const scored = names
    .map((name) => {
      const normalized = normalizeBudgetAccount(name);
      const startsWith = normalized.startsWith(query) ? 1 : 0;
      const contains = normalized.includes(query) ? 1 : 0;
      const prefixWord = normalized.split(' ').some((word) => word.startsWith(query) || query.startsWith(word));
      const similarity = 1 - levenshtein(normalized, query) / Math.max(1, Math.max(normalized.length, query.length));
      const score =
        (normalized === query ? 1.3 : 0) +
        startsWith * 1.1 +
        (prefixWord ? 0.9 : 0) +
        contains * 0.75 +
        similarity * 0.5;

      return { name, score };
    })
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
    .slice(0, 12);

  return scored.map((item) => item.name);
}
