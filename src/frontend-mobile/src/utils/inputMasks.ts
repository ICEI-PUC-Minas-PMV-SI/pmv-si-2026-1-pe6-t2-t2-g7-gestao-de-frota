/** Mantém só dígitos (máx. opcional). */
export function onlyDigits(value: string, maxLength?: number) {
  const digits = value.replace(/\D/g, "");
  return maxLength != null ? digits.slice(0, maxLength) : digits;
}

/** Formata dígitos como DD/MM/AAAA enquanto o usuário digita. */
export function formatDateBrMask(digits: string) {
  const d = onlyDigits(digits, 8);
  if (d.length <= 2) return d;
  if (d.length <= 4) return `${d.slice(0, 2)}/${d.slice(2)}`;
  return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`;
}

/** Converte DD/MM/AAAA completo para ISO; retorna undefined se inválido ou incompleto. */
export function parseDateBrMaskToIso(display: string): string | undefined {
  const match = display.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return undefined;

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  const date = new Date(year, month - 1, day, 12, 0, 0, 0);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return undefined;
  }

  return date.toISOString();
}

/** ISO (ou YYYY-MM-DD) → DD/MM/AAAA para exibição. */
export function isoToDateBrMask(iso?: string | null) {
  if (!iso) return "";
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return "";

  const dd = String(parsed.getDate()).padStart(2, "0");
  const mm = String(parsed.getMonth() + 1).padStart(2, "0");
  const yyyy = parsed.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

export function todayDateBrMask() {
  return isoToDateBrMask(new Date().toISOString());
}

/** Formata centavos digitados como moeda BRL (ex.: 23123 → R$ 231,23). */
export function formatCurrencyBrMask(digits: string) {
  const d = onlyDigits(digits);
  if (!d) return "";

  const cents = Number.parseInt(d, 10);
  if (!Number.isFinite(cents)) return "";

  const amount = cents / 100;
  return amount.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** Número → máscara BRL para preencher o campo em edição. */
export function numberToCurrencyBrMask(value: number) {
  if (!Number.isFinite(value) || value < 0) return "";
  const cents = Math.round(value * 100);
  return formatCurrencyBrMask(String(cents));
}

/** Máscara BRL → número; undefined se vazio. */
export function parseCurrencyBrMaskToNumber(display: string): number | undefined {
  const digits = onlyDigits(display);
  if (!digits) return undefined;
  const cents = Number.parseInt(digits, 10);
  if (!Number.isFinite(cents)) return undefined;
  return cents / 100;
}
