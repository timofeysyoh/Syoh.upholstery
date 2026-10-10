import { Component, computed, inject, input, output, signal } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { WorkshopLocation } from './workshop.data';

@Component({
  selector: 'app-workshop',
  templateUrl: './workshop.html',
  styleUrl: './workshop.scss',
})
export class Workshop {
  readonly location = input.required<WorkshopLocation>();
  readonly contactRequested = output<void>();

  protected readonly mapLoaded = signal(false);
  private readonly sanitizer = inject(DomSanitizer);

  protected readonly mapEmbedUrl = computed<SafeResourceUrl | null>(() => {
    const url = this.parseUrl(this.location().mapEmbedUrl);
    if (!url || url.origin !== 'https://www.google.com') return null;

    const isEmbedPath = url.pathname === '/maps/embed' || url.pathname.startsWith('/maps/embed/');
    const isAddressEmbed =
      (url.pathname === '/maps' || url.pathname === '/maps/') &&
      url.searchParams.get('output') === 'embed' &&
      Boolean(url.searchParams.get('q')?.trim());
    if (!isEmbedPath && !isAddressEmbed) return null;

    return this.sanitizer.bypassSecurityTrustResourceUrl(url.href);
  });

  protected readonly mapUrl = computed<string | null>(() => {
    const url = this.parseUrl(this.location().mapUrl);
    if (!url) return null;

    const isGoogleMaps =
      (url.origin === 'https://www.google.com' &&
        (url.pathname === '/maps' || url.pathname.startsWith('/maps/'))) ||
      url.origin === 'https://maps.google.com' ||
      url.origin === 'https://maps.app.goo.gl';

    return isGoogleMaps ? url.href : null;
  });

  private parseUrl(value: string | null): URL | null {
    if (!value) return null;

    try {
      const url = new URL(value);
      return url.protocol === 'https:' && !url.username && !url.password ? url : null;
    } catch {
      return null;
    }
  }
}
