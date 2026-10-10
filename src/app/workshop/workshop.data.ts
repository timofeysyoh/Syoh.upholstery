export interface WorkshopLocation {
  readonly city: string | null;
  readonly address: string | null;
  readonly hours: string;
  readonly mapEmbedUrl: string | null;
  readonly mapUrl: string | null;
}

// Replace the layout's temporary location with the real workshop address before publishing.
const city = 'Львів';
const address = 'вул. Промислова, 24';
const mapQuery = encodeURIComponent(`${address}, ${city}, Україна`);

export const WORKSHOP_LOCATION: WorkshopLocation = {
  city,
  address,
  hours: 'Будні, 8:00–17:00',
  mapEmbedUrl: `https://www.google.com/maps?q=${mapQuery}&output=embed`,
  mapUrl: `https://www.google.com/maps/dir/?api=1&destination=${mapQuery}`,
};
