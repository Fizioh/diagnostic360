import { mcq } from "./helpers";

export const gisQuestions = [
  mcq(
    "ld-gis-01",
    "gis",
    "GIS",
    "medium",
    "Map tile server latency spikes globally. Origin in EU; users in APAC. First CDN/architecture step?",
    [
      "Cache tiles at edge CDN with cache keys for z/x/y and immutable long TTL for versioned tilesets",
      "Render every tile on each pan server-side synchronously",
      "Store tiles in sessionStorage only",
      "Disable zoom",
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
      "ST_DWithin with geography type and GiST index on geom; simplify geometry; partition hot regions",
      "Full table scan each second",
      "Store lat/lon as strings",
      "Use haversine in application on all rows",
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
      "Accept all geometry; fix in frontend only",
      "Validate topology (ST_IsValid), reject or repair with explicit policy, log invalid submissions",
      "Convert to WKT without checks",
      "Disable validation for performance",
    ],
    1,
    "Invalid geometry breaks downstream spatial ops; validate server-side.",
    ["GeoJSON", "validation", "topology"],
  ),
];
