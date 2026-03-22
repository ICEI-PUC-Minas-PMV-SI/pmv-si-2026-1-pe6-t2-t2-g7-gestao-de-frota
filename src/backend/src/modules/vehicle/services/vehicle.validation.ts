import { BadRequestException } from '@nestjs/common';

const PLACA_MERCOSUL_REGEX = /^[A-Za-z]{3}[0-9]{1}[A-Za-z]{1}[0-9]{2}$/;

export function validatePlacaMercosul(placa: string): void {
  if (!placa || !PLACA_MERCOSUL_REGEX.test(placa.trim())) {
    throw new BadRequestException(
      'Placa deve seguir o padrão Mercosul: 3 letras, 1 número, 1 letra, 2 números (ex: AAA1A23).',
    );
  }
}

export function validateAnoQuatroDigitos(ano: number): void {
  const currentYear = new Date().getFullYear();
  if (
    typeof ano !== 'number' ||
    Number.isNaN(ano) ||
    ano < 1900 ||
    ano > currentYear + 1
  ) {
    throw new BadRequestException(
      'Ano deve ser um número de 4 dígitos válido (entre 1900 e ano atual).',
    );
  }
}
