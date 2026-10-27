import { tienda, json, revisarClave, rechazo } from "../lib/comun.mjs";

const TIPOS = ["image/webp", "image/jpeg", "image/png"];
const MAX = 4 * 1024 * 1024;

export default async (req, context) => {
  const id = context.params && context.params.id;
  if (req.method === "GET" && id) {
    if (!/^[a-z0-9-]{6,40}$/.test(id)) return new Response("No encontrada", { status: 404 });
    const r = await tienda().getWithMetadata("fotos/" + id, { type: "arrayBuffer" });
    if (!r) return new Response("No encontrada", { status: 404 });
    return new Response(r.data, {
      headers: { "content-type": (r.metadata && r.metadata.tipo) || "image/jpeg", "cache-control": "public, max-age=31536000, immutable" },
    });
  }
  if (req.method === "POST" && !id) {
    const c = await revisarClave(req);
    if (c !== "ok") return rechazo(c);
    const tipo = (req.headers.get("content-type") || "").split(";")[0].trim();
    if (!TIPOS.includes(tipo)) return json({ error: "tipo" }, 415);
    const datos = await req.arrayBuffer();
    if (!datos.byteLength || datos.byteLength > MAX) return json({ error: "tamano" }, 413);
    const nuevo = Date.now().toString(36) + "-" + crypto.randomUUID().slice(0, 8);
    await tienda().set("fotos/" + nuevo, datos, { metadata: { tipo } });
    return json({ url: "/api/foto/" + nuevo });
  }
  return json({ error: "metodo" }, 405);
};

export const config = { path: ["/api/foto", "/api/foto/:id"] };
