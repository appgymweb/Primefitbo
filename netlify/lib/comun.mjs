import { getStore } from "@netlify/blobs";
import { createHash, timingSafeEqual } from "node:crypto";

export const tienda = () => getStore({ name: "primefit", consistency: "strong" });

export const json = (data, status = 200, extra = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...extra },
  });

function claveConfigurada() {
  const v = (globalThis.Netlify && Netlify.env && Netlify.env.get("ADMIN_PASSWORD")) || process.env.ADMIN_PASSWORD || "";
  return String(v);
}

/* Devuelve "ok", "sin_clave" (no hay ADMIN_PASSWORD en Netlify) o "incorrecta". */
export async function revisarClave(req) {
  const real = claveConfigurada();
  if (!real) return "sin_clave";
  let dada = req.headers.get("x-admin-clave") || "";
  try { dada = decodeURIComponent(dada); } catch { /* se usa tal cual */ }
  const a = createHash("sha256").update(dada).digest();
  const b = createHash("sha256").update(real).digest();
  if (timingSafeEqual(a, b)) return "ok";
  await new Promise((r) => setTimeout(r, 900)); // frena intentos repetidos
  return "incorrecta";
}

export function rechazo(resultado) {
  return resultado === "sin_clave"
    ? json({ error: "sin_clave" }, 503)
    : json({ error: "incorrecta" }, 401);
}
