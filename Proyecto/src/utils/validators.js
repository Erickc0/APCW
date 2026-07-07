export function isRequired(value) {
  return value.trim() !== '';
}

export function hasMinLength(value, length) {
  return value.trim().length >= length;
}

export function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function isLettersOnly(value) {
  return /^[A-Za-zÁÉÍÓÚáéíóúñÑ ]+$/.test(value.trim());
}
