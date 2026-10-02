export type WorkCategory = 'interiors' | 'steering' | 'handles' | 'seats' | 'panels';

export interface WorkPhoto {
  id: string;
  category: WorkCategory;
  vehicle: string;
  title: string;
  src: string;
  alt: string;
  description?: string;
}

// Add one entry per workshop photo. Store images in public/projects/ and use
// '/projects/filename.webp' for src. Reuse the same vehicle name for cabin and
// component photos of the same car so the vehicle filter groups them together.
// Keep this empty until real workshop photographs are supplied.
export const WORK_PHOTOS: readonly WorkPhoto[] = [];
