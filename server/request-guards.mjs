export function allowOrigin(originHeader, hostHeader) {
  if (!originHeader) return true;
  let origin;
  try { origin = new URL(originHeader); } catch { return false; }
  if (origin.protocol !== "http:" && origin.protocol !== "https:") return false;
  let expected;
  try { expected = new URL(`http://${hostHeader || "localhost"}`); } catch { return false; }
  if (origin.host === expected.host) return true;
  const local = host => host === "localhost" || host === "127.0.0.1" || host === "[::1]";
  return local(origin.hostname) && local(expected.hostname);
}

export function withQuery(payload, searchParams) {
  const query = {};
  for (const [key, value] of searchParams || []) query[key] = value;
  if (Array.isArray(payload) || Buffer.isBuffer(payload) || !payload || typeof payload !== "object") {
    return Object.keys(query).length ? query : payload ?? {};
  }
  const body = { ...payload };
  for (const [key, value] of Object.entries(query)) if (body[key] === undefined) body[key] = value;
  return body;
}
