export const validateEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const validatePassword = (password: string): boolean => {
  return password.length >= 6; // Firebase pide mínimo 6 caracteres
};

export const validateLogin = (email: string, password: string): string | null => {
  if (!email || !password) return 'Todos los campos son obligatorios';
  if (!validateEmail(email)) return 'Correo electrónico inválido';
  if (!validatePassword(password)) return 'La contraseña debe tener al menos 6 caracteres';
  return null;
};

export const validateRegister = (
  email: string,
  password: string,
  confirmPassword: string
): string | null => {
  const errorLogin = validateLogin(email, password);
  if (errorLogin) return errorLogin;
  if (password !== confirmPassword) return 'Las contraseñas no coinciden';
  return null;
};