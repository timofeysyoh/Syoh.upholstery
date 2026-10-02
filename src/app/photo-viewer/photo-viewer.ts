import {
  Component,
  ElementRef,
  Injector,
  afterNextRender,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';

export interface ViewerPhoto {
  src: string;
  alt: string;
  title: string;
}

@Component({
  selector: 'app-photo-viewer',
  templateUrl: './photo-viewer.html',
  styleUrl: './photo-viewer.scss',
})
export class PhotoViewer {
  private readonly injector = inject(Injector);
  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('viewerDialog');
  private readonly stage = viewChild.required<ElementRef<HTMLElement>>('photoStage');
  private readonly canvas = viewChild.required<ElementRef<HTMLElement>>('photoCanvas');

  protected readonly photo = signal<ViewerPhoto | null>(null);
  protected readonly zoom = signal(1);
  protected readonly zoomPercent = computed(() => Math.round(this.zoom() * 100));
  protected readonly loading = signal(false);
  protected readonly failed = signal(false);
  protected readonly dragging = signal(false);

  private drag: {
    pointerId: number;
    x: number;
    y: number;
    scrollLeft: number;
    scrollTop: number;
  } | null = null;

  open(photo: ViewerPhoto): void {
    this.stopDrag();
    this.photo.set({ ...photo });
    this.zoom.set(1);
    this.loading.set(true);
    this.failed.set(false);

    const dialog = this.dialog().nativeElement;
    if (!dialog.open) dialog.showModal();

    afterNextRender(() => {
      const stage = this.stage().nativeElement;
      stage.scrollLeft = 0;
      stage.scrollTop = 0;
    }, { injector: this.injector });
  }

  protected close(): void {
    this.dialog().nativeElement.close();
  }

  protected onClosed(): void {
    // A previous close event can arrive after a rapid reopen.
    if (this.dialog().nativeElement.open) return;
    this.stopDrag();
    this.photo.set(null);
    this.zoom.set(1);
    this.loading.set(false);
    this.failed.set(false);
  }

  protected onLoaded(): void {
    this.loading.set(false);
  }

  protected onImageError(): void {
    this.loading.set(false);
    this.failed.set(true);
    this.zoom.set(1);
    this.stopDrag();
  }

  protected changeZoom(direction: -1 | 1): void {
    this.setZoom(this.zoom() + direction * 0.5);
  }

  protected resetZoom(): void {
    this.setZoom(1);
  }

  private setZoom(value: number): void {
    if (this.loading() || this.failed()) return;
    const nextZoom = Math.min(4, Math.max(1, value));
    if (nextZoom === this.zoom()) return;

    this.stopDrag();
    const stage = this.stage().nativeElement;
    const canvas = this.canvas().nativeElement;
    const centerX = (stage.scrollLeft + stage.clientWidth / 2) / canvas.clientWidth;
    const centerY = (stage.scrollTop + stage.clientHeight / 2) / canvas.clientHeight;
    this.zoom.set(nextZoom);

    afterNextRender(() => {
      if (!this.dialog().nativeElement.open) return;
      stage.scrollLeft = centerX * canvas.clientWidth - stage.clientWidth / 2;
      stage.scrollTop = centerY * canvas.clientHeight - stage.clientHeight / 2;
    }, { injector: this.injector });
  }

  protected startDrag(event: PointerEvent): void {
    if (event.pointerType !== 'mouse' || event.button !== 0 || this.zoom() <= 1) return;
    event.preventDefault();
    const stage = this.stage().nativeElement;
    stage.focus({ preventScroll: true });
    this.drag = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      scrollLeft: stage.scrollLeft,
      scrollTop: stage.scrollTop,
    };
    this.dragging.set(true);
    stage.setPointerCapture(event.pointerId);
  }

  protected moveDrag(event: PointerEvent): void {
    const drag = this.drag;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const stage = this.stage().nativeElement;
    stage.scrollLeft = drag.scrollLeft - (event.clientX - drag.x);
    stage.scrollTop = drag.scrollTop - (event.clientY - drag.y);
  }

  protected stopDrag(): void {
    const pointerId = this.drag?.pointerId;
    this.drag = null;
    this.dragging.set(false);
    if (pointerId !== undefined) {
      const stage = this.stage().nativeElement;
      if (stage.hasPointerCapture(pointerId)) stage.releasePointerCapture(pointerId);
    }
  }
}
