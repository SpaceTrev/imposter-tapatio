/**
 * Normalizes a phone number to international format for WhatsApp
 * Supports US (+1) and Mexican (+52) numbers
 * @param {string} phone - Phone number in various formats
 * @returns {string} - Normalized phone number with country code
 */
export function normalizePhoneNumber(phone) {
  if (!phone) return "";
  
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, "");
  
  // If already has country code
  if (digits.startsWith("1") && digits.length === 11) {
    // US number with +1
    return `1${digits.slice(1)}`;
  }
  if (digits.startsWith("52") && digits.length === 12) {
    // Mexican number with +52
    return digits;
  }
  
  // If 10 digits, could be US or Mexican
  if (digits.length === 10) {
    // Default to Mexican +52 (since UI is Spanish)
    return `52${digits}`;
  }
  
  // If starts with 52 or 1, might be missing digits
  if (digits.startsWith("52") && digits.length === 11) {
    // Mexican without one digit - could be typo
    return digits;
  }
  if (digits.startsWith("1") && digits.length === 10) {
    // Could be incomplete US number
    return digits;
  }
  
  // Return as-is if format is unclear
  return digits;
}

/**
 * Formats a phone number for display
 * @param {string} phone - Raw phone input
 * @returns {string} - Formatted phone number
 */
export function formatPhoneDisplay(phone) {
  if (!phone) return "";
  
  const digits = phone.replace(/\D/g, "");
  
  // US format: +1 (555) 123-4567
  if (digits.startsWith("1") && digits.length === 11) {
    return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  
  // Mexican format: +52 33 1234 5678
  if (digits.startsWith("52") && digits.length === 12) {
    return `+52 ${digits.slice(2, 4)} ${digits.slice(4, 8)} ${digits.slice(8)}`;
  }
  
  // 10 digit number (assumed Mexican)
  if (digits.length === 10) {
    return `+52 ${digits.slice(0, 2)} ${digits.slice(2, 6)} ${digits.slice(6)}`;
  }
  
  // Return with + if it looks like it has country code
  if (digits.length >= 11) {
    return `+${digits}`;
  }
  
  return phone;
}

export function buildRoleMessage({ playerName, word, isImposter, hint, useImposterWord }) {
  if (isImposter) {
    const lines = [
      `Hey ${playerName},`,
      "",
      "Eres el puto imposter cabron/a",
    ];
    
    if (useImposterWord) {
      lines.push("", `Tu palabra: "${word}"`);
    }
    
    if (hint) {
      lines.push("", `Hint: '${hint}'`);
    }
    
    lines.push("", "No le enseñes este mensaje a nadie.");
    
    return lines.join("\n");
  } else {
    return [
      `Hey ${playerName},`,
      "",
      "No eres el imposter!",
      "",
      `La palabra secreta: "${word}"`,
      "",
      "No le enseñes este mensaje a nadie.",
    ].join("\n");
  }
}

export function openWhatsApp(phone, text) {
  if (!phone) {
    alert("Este jugador no tiene número guardado.");
    return;
  }
  const normalized = normalizePhoneNumber(phone);
  const url = `https://wa.me/${encodeURIComponent(normalized)}?text=${encodeURIComponent(
    text
  )}`;
  window.open(url, "_blank");
}
