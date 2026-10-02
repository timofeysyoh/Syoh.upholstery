import { Component, output } from '@angular/core';

@Component({
  selector: 'app-hero-actions',
  templateUrl: './hero-actions.html',
  styleUrl: './hero-actions.scss',
})
export class HeroActions {
  readonly galleryRequested = output<void>();
  readonly contactRequested = output<void>();
  readonly supportRequested = output<void>();
}
