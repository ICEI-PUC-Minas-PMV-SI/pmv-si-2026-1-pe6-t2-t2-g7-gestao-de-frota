/** Mesma imagem padrão usada no frontend web (vehicles/page.client.tsx). */
export const FALLBACK_VEHICLE_IMAGE =
  "https://images.unsplash.com/photo-1485463618014-fdf5a38de5f2?auto=format&fit=crop&w=1200&q=60";

export function resolveVehiclePhotoUri(fotoUrl?: string | null): string {
  const url = fotoUrl?.trim();
  if (url && /^https?:\/\//i.test(url)) return url;
  return FALLBACK_VEHICLE_IMAGE;
}
