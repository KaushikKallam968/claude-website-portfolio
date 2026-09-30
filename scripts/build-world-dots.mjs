// Builds public/data/world-dots.bin: a hexagonal grid of dots over land (Natural Earth 1:50m via world-atlas),
// evenly spaced in the Equal Earth projection centred on 150°E (the Pacific, so the Journey's one date-line
// crossing sits mid-map). Stored as Int16 pairs of longitude and latitude in hundredths of a degree.
// Run: node scripts/build-world-dots.mjs [targetCount]
import { readFileSync, writeFileSync } from 'node:fs';
import { geoEqualEarth, geoContains, geoBounds } from 'd3-geo';
import { feature } from 'topojson-client';

const target = Number(process.argv[2] ?? 16000);
const topo = JSON.parse(readFileSync(new URL('../node_modules/world-atlas/land-50m.json', import.meta.url)));
const land = feature(topo, topo.objects.land);
const polygons = land.features.flatMap((f) =>
  f.geometry.type === 'MultiPolygon'
    ? f.geometry.coordinates.map((c) => ({ type: 'Feature', geometry: { type: 'Polygon', coordinates: c } }))
    : [{ type: 'Feature', geometry: f.geometry }],
);
const indexed = polygons.map((p) => ({ p, b: geoBounds(p) }));
const inBounds = ([lon, lat], [[x0, y0], [x1, y1]]) =>
  lat >= y0 && lat <= y1 && (x0 <= x1 ? lon >= x0 && lon <= x1 : lon >= x0 || lon <= x1);
const onLand = (pt) => indexed.some(({ p, b }) => inBounds(pt, b) && geoContains(p, pt));

const W = 2000, H = 1000;
const projection = geoEqualEarth().rotate([-150, 0]).fitSize([W, H], { type: 'Sphere' });

function sample(spacing) {
  const out = [];
  const dy = spacing * Math.sqrt(3) / 2;
  for (let row = 0, y = dy / 2; y < H; row++, y += dy) {
    for (let x = (row % 2 ? spacing / 2 : 0) + spacing / 4; x < W; x += spacing) {
      const ll = projection.invert([x, y]);
      if (!ll || !Number.isFinite(ll[0])) continue;
      const [px, py] = projection(ll);
      if (Math.abs(px - x) > 0.5 || Math.abs(py - y) > 0.5) continue; // outside the sphere
      if (ll[1] < -57) continue; // leave Antarctica out: it is not on the Journey and dominates the frame
      if (onLand(ll)) out.push(ll);
    }
  }
  return out;
}

// Land is roughly a quarter of the frame; start from that estimate and correct once.
let spacing = Math.sqrt((W * H * 0.2) / target);
let dots = sample(spacing);
spacing *= Math.sqrt(dots.length / target);
dots = sample(spacing);

const buf = new Int16Array(dots.length * 2);
dots.forEach(([lon, lat], i) => {
  buf[i * 2] = Math.round(lon * 100);
  buf[i * 2 + 1] = Math.round(lat * 100);
});
writeFileSync(new URL('../public/data/world-dots.bin', import.meta.url), Buffer.from(buf.buffer));
console.log(`${dots.length} dots, spacing ${spacing.toFixed(2)} of ${W}`);
