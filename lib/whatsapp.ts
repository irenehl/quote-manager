// Local eight-digit Salvadoran numbers use +503; international numbers keep their code.
export function whatsappLink(phone: string, message: string): string | null {
  const value = phone.trim();
  if (!/^(?:\+|00)?[\d\s().-]+$/.test(value)) return null;
  let digits = value.replace(/\D/g, "");
  const international = value.startsWith("+") || value.startsWith("00");
  if (value.startsWith("00")) digits = digits.slice(2);
  if (!international && /^[267]\d{7}$/.test(digits)) digits = `503${digits}`;
  if (!/^[1-9]\d{9,14}$/.test(digits)) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
