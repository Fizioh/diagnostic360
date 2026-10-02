import { mcq } from "./helpers";

export const gisQuestions = [
  mcq(
    "ld-gis-01",
    "gis",
    "GIS",
    "medium",
    "Map tile server latency spikes globally. Origin in EU; users in APAC. First CDN/architecture step?",
    [
      "Cache versioned tiles at the edge CDN with z/x/y keys and long immutable TTL per tileset release",
      "Render each pan zoom level synchronously on origin for every user so tiles are always freshly generated",
      "Store the active tile pyramid in browser sessionStorage only and skip network fetches after first load",
      "Disable zoom interactions client-side so users request fewer distinct tiles during map navigation",
    ],
    0,
    "Versioned static tiles are CDN-friendly.",
    ["tiles", "CDN", "latency"],
  ),
  mcq(
    "ld-gis-02",
    "gis",
    "GIS",
    "hard",
    "PostGIS query finds points within 5km of a moving vehicle updating every second. Need sub-second reads at scale.",
    [
      "Use ST_DWithin on geography with a GiST index, simplify geometries, and partition hot spatial regions",
      "Scan the full points table each second and filter distances in SQL without spatial indexes on geometry",
      "Persist latitude and longitude as unparsed strings and parse them in the app layer for every comparison",
      "Compute haversine distance in application code over all rows loaded into memory on each vehicle tick",
    ],
    0,
    "Indexed geography predicates avoid brute force distance scans.",
    ["PostGIS", "indexing", "geospatial queries"],
  ),
  mcq(
    "ld-gis-03",
    "gis",
    "GIS",
    "medium",
    "Client sends GeoJSON with invalid self-intersecting polygons for upload. Server validation approach?",
    [
      "Accept all geometries and rely on the frontend map library to repair topology before users submit",
      "Validate topology with ST_IsValid, reject or repair under explicit policy, and log invalid submissions",
      "Convert GeoJSON to WKT on ingest without checks so downstream services normalize geometry later",
      "Skip server validation entirely and trust client-side checks to keep upload latency consistently low",
    ],
    1,
    "Invalid geometry breaks downstream spatial ops; validate server-side.",
    ["GeoJSON", "validation", "topology"],
  ),
];
