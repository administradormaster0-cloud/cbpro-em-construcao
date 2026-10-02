import {clock,stableRandom,isHydration} from './db.mjs';
const SEARCH_URL = "https://proclubs.ea.com/api/fc/allTimeLeaderboard/search";
const PLATFORMS = ["common-gen5", "common-gen4", "nx"];

function asList(data) {
  if (Array.isArray(data)) return data;
  if (!data || typeof data !== "object") return [];
  if (data.clubId != null || data.clubid != null || data.clubName || data.name) return [data];
  if (Array.isArray(data.clubInfo)) return data.clubInfo;
  if (data.clubInfo && typeof data.clubInfo === "object") return Array.isArray(data.clubInfo) ? data.clubInfo : Object.values(data.clubInfo);
  const values = Object.values(data).filter(value => value && typeof value === "object");
  return values.length ? values : [];
}

function memberNames(value) {
  const list = Array.isArray(value) ? value : value && typeof value === "object" ? Object.values(value) : [];
  return list.map(item => typeof item === "string" ? item : item?.name || item?.personaName || item?.proName || "").map(name => String(name).trim()).filter(Boolean).slice(0, 3);
}

export function normalizeClubs(data, platform) {
  const clubs = [];
  for (const raw of asList(data)) {
    const info = raw.clubInfo && typeof raw.clubInfo === "object" ? raw.clubInfo : raw;
    const clubId = Number(info.clubId ?? info.clubid ?? raw.clubId ?? raw.clubid);
    const clubName = String(info.clubName ?? info.name ?? info.clubname ?? raw.clubName ?? raw.name ?? "").trim();
    if (!Number.isSafeInteger(clubId) || clubId <= 0 || !clubName) continue;
    clubs.push({clubId, clubName, platform: String(info.platform || raw.platform || platform), members: memberNames(info.members ?? raw.members)});
  }
  return clubs;
}

export async function searchEaClubs(name, options = {}) {
  const query = String(name ?? "").trim();
  if (query.length < 2 || query.length > 40) return {results: []};
  const fetcher = options.fetch || fetch;
  const results = [];
  const seen = new Set();
  let forbidden = 0;
  let failed = 0;
  let succeeded = 0;
  for (const platform of PLATFORMS) {
    const url = new URL(SEARCH_URL);
    url.searchParams.set("platform", platform);
    url.searchParams.set("clubName", query);
    let response;
    try {
      response = await fetcher(url, {
        headers: {
          accept: "application/json",
          "accept-language": "en-US,en;q=0.9",
          "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
          referer: "https://www.ea.com/",
          origin: "https://www.ea.com"
        },
        signal: AbortSignal.timeout(12000)
      });
    } catch {
      failed++;
      continue;
    }
    if (response.status === 403) { forbidden++; continue; }
    if (!response.ok) { failed++; continue; }
    const text = await response.text();
    if (!text.trim() || text.trim().startsWith("<")) { forbidden++; continue; }
    let data;
    try { data = JSON.parse(text); } catch { failed++; continue; }
    succeeded++;
    for (const club of normalizeClubs(data, platform)) {
      const key = club.platform + ":" + club.clubId;
      if (seen.has(key)) continue;
      seen.add(key);
      results.push(club);
      if (results.length >= 30) return {results};
    }
  }
  if (!results.length && forbidden === PLATFORMS.length) {
    throw Object.assign(new Error("EA_HTTP_403"), {status: 403, provider_status: 403, provider_code: "EA_HTTP_403"});
  }
  if (!results.length && succeeded === 0) {
    throw Object.assign(new Error("A consulta pública de clubes da EA está indisponível."), {status: 503});
  }
  return {results};
}
