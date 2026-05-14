import type { FeriadosData } from "../types/market-data";

// Conjunto de datas de feriados nacionais — string "YYYY-MM-DD"
export function buildFeriadosSet(feriados: FeriadosData): Set<string> {
  return new Set(feriados.feriados.map((f) => f.date));
}

export function isWeekend(date: Date): boolean {
  const d = date.getDay();
  return d === 0 || d === 6;
}

export function isFeriado(date: Date, feriadosSet: Set<string>): boolean {
  return feriadosSet.has(toISO(date));
}

export function isDiaUtil(date: Date, feriadosSet: Set<string>): boolean {
  return !isWeekend(date) && !isFeriado(date, feriadosSet);
}

// Retorna "YYYY-MM-DD" sem conversão de timezone
export function toISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// Cria um Date em meia-noite local — evita problemas de UTC vs local
export function fromISO(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

// Avança 1 dia
export function addDays(date: Date, n: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

// Último dia útil anterior ou igual à data (retrocede se necessário)
export function ultimoDiaUtil(date: Date, feriadosSet: Set<string>): Date {
  let d = new Date(date);
  while (!isDiaUtil(d, feriadosSet)) {
    d = addDays(d, -1);
  }
  return d;
}

// Conta dias úteis no intervalo [inicio, fim) — exclui fim
export function contarDiasUteis(
  inicio: Date,
  fim: Date,
  feriadosSet: Set<string>
): number {
  let count = 0;
  let d = new Date(inicio);
  while (d < fim) {
    if (isDiaUtil(d, feriadosSet)) count++;
    d = addDays(d, 1);
  }
  return count;
}

// Busca binária por data ISO numa array ordenada crescente por "date"
export function buscaPorData<T extends { date: string }>(
  arr: T[],
  iso: string
): T | null {
  let lo = 0;
  let hi = arr.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >>> 1;
    if (arr[mid].date === iso) return arr[mid];
    if (arr[mid].date < iso) lo = mid + 1;
    else hi = mid - 1;
  }
  return null;
}

// Retorna o registro mais próximo anterior ou igual à data ISO
export function buscaAnteriorOuIgual<T extends { date: string }>(
  arr: T[],
  iso: string
): T | null {
  let resultado: T | null = null;
  let lo = 0;
  let hi = arr.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >>> 1;
    if (arr[mid].date <= iso) {
      resultado = arr[mid];
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  return resultado;
}
