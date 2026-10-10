import { Component, ElementRef, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ContactDialog } from './contact-dialog/contact-dialog';
import { HeroActions } from './hero-actions/hero-actions';
import { Portfolio } from './portfolio/portfolio';
import { Pricing } from './pricing/pricing';
import { SupportDialog } from './support-dialog/support-dialog';
import { SupportRequestDialog } from './support-request-dialog/support-request-dialog';
import { Workshop } from './workshop/workshop';
import { WORKSHOP_LOCATION } from './workshop/workshop.data';

@Component({
  selector: 'app-home',
  imports: [RouterLink, ContactDialog, HeroActions, Portfolio, Pricing, SupportDialog, SupportRequestDialog, Workshop],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class Home {
  protected readonly workshopLocation = WORKSHOP_LOCATION;
  protected readonly managerInstagramUrl: string | null = 'https://www.instagram.com/syoh.upholstery/';
  protected readonly managerTelegramUrl: string | null = null;
  private readonly contactDialog = viewChild.required(ContactDialog);
  private readonly supportDialog = viewChild.required(SupportDialog);
  private readonly supportRequestDialog = viewChild.required(SupportRequestDialog);
  private readonly galleryDialog = viewChild.required<ElementRef<HTMLDialogElement>>('galleryDialog');

  protected openContact(): void {
    this.contactDialog().open();
  }

  protected openSupport(): void {
    this.supportDialog().open();
  }

  protected openSupportRequest(): void {
    this.supportRequestDialog().open();
  }

  protected openGallery(): void {
    const dialog = this.galleryDialog().nativeElement;
    if (!dialog.open) dialog.showModal();
  }

  protected closeGallery(): void {
    this.galleryDialog().nativeElement.close();
  }
}
