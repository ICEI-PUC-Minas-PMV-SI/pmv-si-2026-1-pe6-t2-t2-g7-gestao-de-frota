export function formatCurrency(value: number | undefined) {
  if (typeof value !== "number") return "—";
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function formatRelative(date: string) {
  const d = new Date(date).getTime();
  const diff = Date.now() - d;
  const minutes = Math.round(diff / 60000);
  if (minutes < 1) return "agora";
  if (minutes < 60) return `${minutes} min atrás`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h atrás`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days} d atrás`;
  return new Date(date).toLocaleDateString("pt-BR");
}

export function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}
