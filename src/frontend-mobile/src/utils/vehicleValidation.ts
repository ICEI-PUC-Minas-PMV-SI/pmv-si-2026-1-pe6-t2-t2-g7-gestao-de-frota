/** Mensagens alinhadas a `vehicle.validation.ts` no backend. */
export const VEHICLE_MESSAGES = {
  placa:
    "Placa deve seguir o padrão Mercosul: 3 letras, 1 número, 1 letra, 2 números (ex: AAA1A23).",
  ano: "Ano deve ser um número de 4 dígitos válido (entre 1900 e ano atual).",
  required: "Preencha todos os campos obrigatórios com valores válidos.",
  fotoUrl: "Informe uma URL válida para a foto do veículo.",
  tanque: "Tanque deve ser maior que 0 litros.",
  consumo: "Consumo médio deve ser maior que 0 km/L.",
} as const;

const PLACA_MERCOSUL_REGEX = /^[A-Za-z]{3}[0-9]{1}[A-Za-z]{1}[0-9]{2}$/;

export function validatePlacaMercosul(placa: string): string | null {
  if (!placa || !PLACA_MERCOSUL_REGEX.test(placa.trim())) {
    return VEHICLE_MESSAGES.placa;
  }
  return null;
}

export function validateAnoQuatroDigitos(ano: number): string | null {
  const currentYear = new Date().getFullYear();
  if (
    typeof ano !== "number" ||
    Number.isNaN(ano) ||
    ano < 1900 ||
    ano > currentYear + 1
  ) {
    return VEHICLE_MESSAGES.ano;
  }
  return null;
}

function isValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export type VehicleFormPayload = {
  marca: string;
  modelo: string;
  ano: number;
  placa: string;
  fotoUrl: string;
  tamanhoTanque: number;
  consumoMedio: number;
};

/** Retorna a primeira mensagem de validação ou `null` se válido. */
export function validateVehicleForm(payload: VehicleFormPayload): string | null {
  if (
    !payload.marca ||
    !payload.modelo ||
    !payload.placa ||
    !Number.isFinite(payload.ano) ||
    !Number.isFinite(payload.tamanhoTanque) ||
    !Number.isFinite(payload.consumoMedio)
  ) {
    return VEHICLE_MESSAGES.required;
  }

  const placaError = validatePlacaMercosul(payload.placa);
  if (placaError) return placaError;

  const anoError = validateAnoQuatroDigitos(payload.ano);
  if (anoError) return anoError;

  if (!payload.fotoUrl || !isValidHttpUrl(payload.fotoUrl)) {
    return VEHICLE_MESSAGES.fotoUrl;
  }

  if (payload.tamanhoTanque < 1) {
    return VEHICLE_MESSAGES.tanque;
  }

  if (payload.consumoMedio < 0.1) {
    return VEHICLE_MESSAGES.consumo;
  }

  return null;
}
