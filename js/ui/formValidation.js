// 作成・編集モーダルで共通利用する入力検証とエラー表示のヘルパー。
import { MAX_NAME_LENGTH } from "../validation.js";

export { MAX_NAME_LENGTH };

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

export function shouldSubmitByEnter(event) {
  // 日本語IMEの変換確定Enterは key が Enter でも作成操作ではないため無視する。
  return event.key === "Enter" && !event.isComposing && event.keyCode !== 229;
}
