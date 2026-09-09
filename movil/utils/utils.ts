
export const EXPECTED_API_RESPONSE = 'API DB de Wires & Ladders';
export const EXPECTED_SOCKET_RESPONSE = 'API Socket.IO de Wires & Ladders';

function getHour(ahora: Date = new Date()) {
  //const ahora = new Date();
  const horas = ahora.getHours().toString().padStart(2, '0');
  const minutos = ahora.getMinutes().toString().padStart(2, '0');
  const segundos = ahora.getSeconds().toString().padStart(2, '0');
  const milisegundos = ahora.getMilliseconds().toString().padStart(3, '0');
  return `${horas}:${minutos}:${segundos}:${milisegundos}`;
}

export async function isUrlActive(url: string, options?: { timeoutMs?: number; expectedText?: string }): Promise<{ active: boolean; status?: number; response?: string; error?: string }> {
  const timeoutMs = options?.timeoutMs ?? 3000;
  const expectedText = options?.expectedText;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { method: 'GET', signal: controller.signal });
    clearTimeout(timer);
    let body: string | undefined;
    try { body = await res.text(); } catch { /* ignore */ }
    if (expectedText && body && !body.includes(expectedText)) {
      return { active: false, status: res.status, response: body, error: `Respuesta no contiene "${expectedText}" (${body})` };
    }
    return { active: true, status: res.status, response: body };
  } catch (e: any) {
    clearTimeout(timer);
    if (e?.name === 'AbortError') return { active: false, error: `Timeout después de ${timeoutMs}ms` };
    return { active: false, error: e?.message || String(e) };
  }
}

export { getHour }
