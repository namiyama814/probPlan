export const MAX_NAME_LENGTH = 100;

export function validateName(value, label) {
  const name = value.trim();

  if (!name) {
    return { error: `${label}を入力してください。` };
  }

  if (name.length > MAX_NAME_LENGTH) {
    return { error: `${label}は${MAX_NAME_LENGTH}文字以内で入力してください。` };
  }

  return { value: name };
}

export function clearFieldError(errorElement, inputs) {
  errorElement.textContent = "";
  inputs.forEach(input => input.removeAttribute("aria-invalid"));
}

export function showFieldError(errorElement, input, message) {
  errorElement.textContent = message;
  input.setAttribute("aria-invalid", "true");
  input.focus();
}
