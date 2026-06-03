export function getAuthErrorMessage(code: string): string {
  const messages: Record<string, string> = {
    "auth/user-not-found": "Usuário não encontrado.",
    "auth/wrong-password": "Senha incorreta.",
    "auth/invalid-credential": "E-mail ou senha incorretos.",
    "auth/invalid-email": "E-mail inválido.",
    "auth/user-disabled": "Usuário desativado.",
    "auth/email-already-in-use": "Este e-mail já está em uso.",
    "auth/weak-password": "A senha deve ter no mínimo 6 caracteres.",
    "auth/too-many-requests": "Muitas tentativas. Tente novamente mais tarde.",
    "auth/popup-closed-by-user": "Login com Google cancelado.",
    "auth/invalid-api-key":
      "Chave de API do Firebase rejeitada. Verifique EXPO_PUBLIC_FIREBASE_* no .env e reinicie com npx expo start -c.",
  };
  return messages[code] ?? "Ocorreu um erro. Tente novamente.";
}
