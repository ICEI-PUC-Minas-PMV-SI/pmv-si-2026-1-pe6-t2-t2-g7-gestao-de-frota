export type LatLngTuple = [number, number];

export async function fetchDrivingPath(
  points: LatLngTuple[],
): Promise<LatLngTuple[] | null> {
  if (points.length < 2) return null;
  const path = points.map(([lat, lng]) => `${lng},${lat}`).join(";");
  const url = `https://router.project-osrm.org/route/v1/driving/${path}?overview=full&geometries=geojson`;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = (await res.json()) as {
      code?: string;
      routes?: { geometry: { coordinates: [number, number][] } }[];
    };
    if (data.code !== "Ok" || !data.routes?.[0]?.geometry?.coordinates) {
      return null;
    }
    return data.routes[0].geometry.coordinates.map(
      ([lng, lat]) => [lat, lng] as LatLngTuple,
    );
  } catch {
    return null;
  }
}

/** Interpola pontos entre paradas quando o OSRM não está disponível. */
export function densifyStops(
  stops: LatLngTuple[],
  segmentsPerLeg = 16,
): LatLngTuple[] {
  if (stops.length < 2) return [...stops];
  const out: LatLngTuple[] = [];
  for (let i = 0; i < stops.length - 1; i++) {
    const [lat0, lng0] = stops[i]!;
    const [lat1, lng1] = stops[i + 1]!;
    for (let s = 0; s < segmentsPerLeg; s++) {
      const t = s / segmentsPerLeg;
      out.push([lat0 + (lat1 - lat0) * t, lng0 + (lng1 - lng0) * t]);
    }
  }
  out.push(stops[stops.length - 1]!);
  return out;
}

export function tupleToMapPoint([lat, lng]: LatLngTuple) {
  return { latitude: lat, longitude: lng };
}

export function mapPointsToTuples(
  points: { latitude: number; longitude: number }[],
): LatLngTuple[] {
  return points.map((p) => [p.latitude, p.longitude]);
}
