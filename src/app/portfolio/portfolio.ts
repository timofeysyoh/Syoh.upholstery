import { Component, computed, signal, viewChild } from '@angular/core';
import { PhotoViewer } from '../photo-viewer/photo-viewer';
import { WORK_PHOTOS, type WorkCategory } from './portfolio.data';

type WorkFilter = 'all' | WorkCategory;

interface GallerySlide {
  id: string;
  category: WorkCategory;
  title: string;
  vehicle: string | null;
  description: string;
  src: string | null;
  alt: string;
  preview: string;
  accent: string;
}

const CATEGORIES = [
  {
    id: 'interiors',
    label: 'Повні салони',
    preview: '/project-placeholders/interiors.svg',
    accent: '#62c5ff',
  },
  {
    id: 'steering',
    label: 'Керма',
    preview: '/project-placeholders/steering.svg',
    accent: '#d099ff',
  },
  {
    id: 'handles',
    label: 'Ручки',
    preview: '/project-placeholders/handles.svg',
    accent: '#69ebd2',
  },
  { id: 'seats', label: 'Сидіння', preview: '/project-placeholders/seats.svg', accent: '#ffd080' },
  {
    id: 'panels',
    label: 'Дверні карти та деталі',
    preview: '/project-placeholders/panels.svg',
    accent: '#aab8c7',
  },
] as const;

@Component({
  selector: 'app-portfolio',
  imports: [PhotoViewer],
  templateUrl: './portfolio.html',
  styleUrl: './portfolio.scss',
})
export class Portfolio {
  private readonly photoViewer = viewChild.required(PhotoViewer);
  protected readonly filters = [{ id: 'all' as const, label: 'Усі роботи' }, ...CATEGORIES];
  protected readonly selectedCategory = signal<WorkFilter>('all');
  protected readonly selectedVehicle = signal('all');
  protected readonly slideIndex = signal(0);
  protected readonly failedImages = signal<ReadonlySet<string>>(new Set());

  private swipeStart: { x: number; y: number; pointerId: number } | null = null;
  private suppressPhotoClick = false;

  protected readonly categoryPhotos = computed(() => {
    const category = this.selectedCategory();
    return WORK_PHOTOS.filter((photo) => category === 'all' || photo.category === category);
  });

  protected readonly vehicles = computed(() =>
    [...new Set(this.categoryPhotos().map((photo) => photo.vehicle))]
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b, 'uk')),
  );

  protected readonly filteredPhotos = computed(() => {
    const vehicle = this.selectedVehicle();
    return this.categoryPhotos().filter((photo) => vehicle === 'all' || photo.vehicle === vehicle);
  });

  protected readonly slides = computed<readonly GallerySlide[]>(() => {
    const photos = this.filteredPhotos();
    if (photos.length) {
      return photos.map((photo) => {
        const category = this.categoryDetails(photo.category);
        return {
          ...photo,
          description: photo.description ?? '',
          preview: category.preview,
          accent: category.accent,
        };
      });
    }

    const selected = this.selectedCategory();
    return CATEGORIES.filter((category) => selected === 'all' || category.id === selected).map(
      (category) => ({
        id: `placeholder-${category.id}`,
        category: category.id,
        title: category.label,
        vehicle: null,
        description: '',
        src: null,
        alt: '',
        preview: category.preview,
        accent: category.accent,
      }),
    );
  });

  protected readonly currentSlide = computed(
    () => this.slides()[this.slideIndex()] ?? this.slides()[0]!,
  );

  protected readonly canOpenPhoto = computed(() => {
    const slide = this.currentSlide();
    return !!slide.src && !this.failedImages().has(slide.id);
  });

  protected readonly galleryStatus = computed(() => {
    const slide = this.currentSlide();
    return `${this.slideIndex() + 1} з ${this.slides().length}. ${slide.title}.${
      slide.src ? '' : ' Фото незабаром.'
    }`;
  });

  protected categoryLabel(id: WorkCategory): string {
    return this.categoryDetails(id).label;
  }

  protected categoryAccent(id: WorkFilter): string {
    return id === 'all' ? '#d4dbe1' : this.categoryDetails(id).accent;
  }

  protected selectCategory(category: WorkFilter): void {
    if (category === this.selectedCategory()) return;
    this.selectedCategory.set(category);
    this.selectedVehicle.set('all');
    this.slideIndex.set(0);
    this.swipeStart = null;
  }

  protected selectCategoryFromEvent(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    const category = this.filters.find((filter) => filter.id === value);
    if (category) this.selectCategory(category.id);
  }

  protected selectVehicle(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    if (value !== 'all' && !this.vehicles().includes(value)) return;
    this.selectedVehicle.set(value);
    this.slideIndex.set(0);
    this.swipeStart = null;
  }

  protected selectSlide(index: number): void {
    if (index >= 0 && index < this.slides().length) this.slideIndex.set(index);
  }

  protected moveSlide(direction: -1 | 1): void {
    const count = this.slides().length;
    if (count < 2) return;
    this.slideIndex.update((index) => (index + direction + count) % count);
  }

  protected onGalleryKeydown(event: KeyboardEvent): void {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    switch (event.key) {
      case 'Enter':
      case ' ':
        if (this.canOpenPhoto()) {
          event.preventDefault();
          if (!event.repeat) this.openCurrentPhoto();
        }
        break;
      case 'ArrowLeft':
        event.preventDefault();
        this.moveSlide(-1);
        break;
      case 'ArrowRight':
        event.preventDefault();
        this.moveSlide(1);
        break;
      case 'Home':
        event.preventDefault();
        this.selectSlide(0);
        break;
      case 'End':
        event.preventDefault();
        this.selectSlide(this.slides().length - 1);
        break;
    }
  }

  protected onPointerDown(event: PointerEvent): void {
    if (!event.isPrimary || event.button !== 0) return;
    this.suppressPhotoClick = false;
    this.swipeStart = { x: event.clientX, y: event.clientY, pointerId: event.pointerId };
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
  }

  protected onPointerMove(event: PointerEvent): void {
    const start = this.swipeStart;
    if (!start || start.pointerId !== event.pointerId) return;
    if (Math.abs(event.clientX - start.x) > 8 || Math.abs(event.clientY - start.y) > 8) {
      this.suppressPhotoClick = true;
    }
  }

  protected onPointerUp(event: PointerEvent): void {
    const start = this.swipeStart;
    this.swipeStart = null;
    if (!start || start.pointerId !== event.pointerId) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (Math.abs(dx) > 8 || Math.abs(dy) > 8) this.suppressPhotoClick = true;
    if (Math.abs(dx) >= 48 && Math.abs(dx) > Math.abs(dy) * 1.2) {
      this.moveSlide(dx < 0 ? 1 : -1);
    }
  }

  protected cancelSwipe(): void {
    this.swipeStart = null;
  }

  protected onPhotoClick(event: MouseEvent): void {
    if (this.suppressPhotoClick && event.detail !== 0) {
      this.suppressPhotoClick = false;
      return;
    }
    this.openCurrentPhoto();
  }

  private openCurrentPhoto(): void {
    const slide = this.currentSlide();
    if (!slide.src || this.failedImages().has(slide.id)) return;
    this.photoViewer().open({ src: slide.src, alt: slide.alt, title: slide.title });
  }

  protected onImageError(id: string): void {
    this.failedImages.update((current) => new Set([...current, id]));
  }

  private categoryDetails(id: WorkCategory) {
    return CATEGORIES.find((category) => category.id === id) ?? CATEGORIES[0];
  }
}
