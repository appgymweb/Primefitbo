import { json, revisarClave, rechazo } from "../lib/comun.mjs";

export default async (req) => {
  if (req.method !== "POST") return json({ error: "metodo" }, 405);
  const r = await revisarClave(req);
  return r === "ok" ? json({ ok: true }) : rechazo(r);
};

export const config = { path: "/api/login" };
