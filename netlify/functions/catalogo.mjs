import { tienda, json, revisarClave, rechazo } from "../lib/comun.mjs";

const MAX = 5 * 1024 * 1024;

function valido(d) {
  return d && typeof d === "object" && Array.isArray(d.productos) && Array.isArray(d.disciplinas) &&
    typeof d.whatsapp === "string" &&
    d.productos.every((p) => p && typeof p.id === "string" && typeof p.nombre === "string" && typeof p.precio === "number") &&
    d.disciplinas.every((x) => x && typeof x.id === "string" && typeof x.nombre === "string" && typeof x.precio === "number");
}

export default async (req) => {
  if (req.method === "GET") {
    const data = await tienda().get("catalogo", { type: "json" });
    return json({ data: data || null });
  }
  if (req.method === "PUT") {
    const r = await revisarClave(req);
    if (r !== "ok") return rechazo(r);
    const texto = await req.text();
    if (texto.length > MAX) return json({ error: "muy_grande" }, 413);
    let data;
    try { data = JSON.parse(texto); } catch { return json({ error: "formato" }, 400); }
    if (!valido(data)) return json({ error: "formato" }, 400);
    delete data.clave;
    await tienda().setJSON("catalogo", data);
    return json({ ok: true });
  }
  return json({ error: "metodo" }, 405);
};

export const config = { path: "/api/catalogo" };
