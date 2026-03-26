export function decodeHtml(value = "") {
  return value
    .replace(/<!\[CDATA\[(.*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

export function stripTags(value = "") {
  return decodeHtml(value).replace(/<[^>]+>/g, "").trim();
}

function uniqueCategories(items = []) {
  const map = new Map();

  items.forEach((item) => {
    const id = String(item.typeId || "").trim();
    const name = stripTags(item.typeName || "");

    if (id && name && !map.has(id)) {
      map.set(id, { id, name });
    }
  });

  return [...map.values()].sort((a, b) => a.id.localeCompare(b.id, "zh-CN"));
}

function parseXmlAttributes(xml = "") {
  const match = xml.match(/<list\b([^>]*)>/i)?.[1] || "";
  const attrs = {};

  for (const item of match.matchAll(/(\w+)="(.*?)"/g)) {
    attrs[item[1]] = item[2];
  }

  return attrs;
}

function readXmlTag(block, tagName) {
  const regex = new RegExp(`<${tagName}>([\\s\\S]*?)<\\/${tagName}>`, "i");
  return decodeHtml((block.match(regex)?.[1] || "").trim());
}

function parseXmlPlayData(block = "") {
  const ddMatches = [...block.matchAll(/<dd\s+flag="(.*?)">([\s\S]*?)<\/dd>/gi)];

  if (ddMatches.length) {
    return {
      playFrom: ddMatches.map((item) => stripTags(item[1])).join("$$$"),
      playUrl: ddMatches.map((item) => decodeHtml(item[2].trim())).join("$$$"),
    };
  }

  return {
    playFrom: readXmlTag(block, "dt"),
    playUrl: "",
  };
}

export function splitPlaySources(playFrom = "", playUrl = "") {
  const fromList = playFrom.split("$$$").map((item) => item.trim()).filter(Boolean);
  const urlList = playUrl.split("$$$").map((item) => item.trim()).filter(Boolean);

  return urlList
    .map((group, index) => {
      const episodes = group
        .split("#")
        .map((item) => item.trim())
        .filter(Boolean)
        .map((item, episodeIndex) => {
          const [name, ...rest] = item.includes("$") ? item.split("$") : [`播放 ${episodeIndex + 1}`, item];
          const url = rest.join("$").trim();

          return {
            id: `${index}-${episodeIndex}-${url}`,
            name: stripTags(name || `播放 ${episodeIndex + 1}`),
            url,
          };
        })
        .filter((item) => item.url);

      return {
        id: `${index}-${fromList[index] || "默认线路"}`,
        name: stripTags(fromList[index] || `线路 ${index + 1}`),
        episodes,
      };
    })
    .filter((item) => item.episodes.length);
}

function normalizeVod(item = {}, fallbackTypeName = "未分类") {
  return {
    id: String(item.vod_id || item.id || ""),
    typeId: String(item.type_id || item.tid || ""),
    typeName: stripTags(item.type_name || item.type || fallbackTypeName),
    name: stripTags(item.vod_name || item.name || "未命名视频"),
    remarks: stripTags(item.vod_remarks || item.note || item.state || ""),
    pic: item.vod_pic || item.pic || "",
    year: String(item.vod_year || item.year || ""),
    area: stripTags(item.vod_area || item.area || ""),
    director: stripTags(item.vod_director || item.director || ""),
    actor: stripTags(item.vod_actor || item.actor || ""),
    content: stripTags(item.vod_content || item.content || item.des || ""),
    playFrom: item.vod_play_from || item.from || "",
    playUrl: item.vod_play_url || item.url || "",
  };
}

function parseJsonResponse(payload) {
  const data = typeof payload === "string" ? JSON.parse(payload) : payload;
  const list = Array.isArray(data.list) ? data.list : [];
  const videos = list.map((item) => normalizeVod(item, item.type_name || "未分类"));

  return {
    siteName: stripTags(data.msg || data.note || data.name || "JSON 源"),
    page: Number(data.page || 1),
    pageCount: Number(data.pagecount || 1),
    total: Number(data.total || list.length || 0),
    videos,
    categories: uniqueCategories(videos),
  };
}

function parseXmlResponse(payload) {
  const attrs = parseXmlAttributes(payload);
  const videoBlocks = [...payload.matchAll(/<video>([\s\S]*?)<\/video>/gi)];
  const videos = videoBlocks.map((match) => {
    const block = match[1];
    const playData = parseXmlPlayData(block);

    return normalizeVod(
      {
        vod_id: readXmlTag(block, "id"),
        type_id: readXmlTag(block, "tid"),
        type_name: readXmlTag(block, "type"),
        vod_name: readXmlTag(block, "name"),
        vod_pic: readXmlTag(block, "pic"),
        vod_remarks: readXmlTag(block, "note"),
        vod_year: readXmlTag(block, "year"),
        vod_area: readXmlTag(block, "area"),
        vod_director: readXmlTag(block, "director"),
        vod_actor: readXmlTag(block, "actor"),
        vod_content: readXmlTag(block, "des"),
        vod_play_from: playData.playFrom,
        vod_play_url: playData.playUrl,
      },
      readXmlTag(block, "type") || "未分类"
    );
  });

  return {
    siteName: stripTags(readXmlTag(payload, "note") || "XML 源"),
    page: Number(attrs.page || 1),
    pageCount: Number(attrs.pagecount || 1),
    total: Number(attrs.recordcount || videos.length || 0),
    videos,
    categories: uniqueCategories(videos),
  };
}

function parseSourcePayload(payload) {
  const text = typeof payload === "string" ? payload.trim() : "";

  if (!text) {
    throw new Error("源返回为空，无法解析。");
  }

  if (text.startsWith("{") || text.startsWith("[")) {
    return { format: "json", ...parseJsonResponse(text) };
  }

  if (text.startsWith("<")) {
    return { format: "xml", ...parseXmlResponse(text) };
  }

  throw new Error("暂不支持这种返回格式，请确认是苹果 CMS JSON/XML 采集源。");
}

export function buildApiUrl(sourceUrl, params = {}) {
  const url = new URL(sourceUrl);

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "" || value === "all") {
      url.searchParams.delete(key);
      return;
    }

    url.searchParams.set(key, String(value));
  });

  return url.toString();
}

export async function fetchCatalog(sourceUrl, filters) {
  const requestUrl = buildApiUrl(sourceUrl, {
    ac: "detail",
    pg: filters.page || 1,
    t: filters.typeId && filters.typeId !== "all" ? filters.typeId : "",
    wd: filters.keyword || "",
  });
  const response = await fetch(requestUrl);
  const payload = await response.text();
  return parseSourcePayload(payload);
}

export async function fetchVodDetail(sourceUrl, id) {
  const requestUrl = buildApiUrl(sourceUrl, { ac: "detail", ids: id });
  const response = await fetch(requestUrl);
  const payload = await response.text();
  const parsed = parseSourcePayload(payload);
  return parsed.videos[0] || null;
}
