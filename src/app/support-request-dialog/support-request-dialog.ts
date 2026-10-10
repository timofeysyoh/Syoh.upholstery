import { afterNextRender, Component, ElementRef, inject, Injector, input, output, signal, viewChild } from '@angular/core';

export interface SupportRequestPayload {
  readonly fullName: string;
  readonly purpose: string;
  readonly email: string;
  readonly phone: string;
  readonly message: string;
  readonly informationConfirmed: boolean;
}

// The delivery adapter must resolve with accepted: true only after server confirmation.
export type SupportRequestSender = (
  request: SupportRequestPayload,
) => Promise<{ readonly accepted: boolean }>;

@Component({
  selector: 'app-support-request-dialog',
  templateUrl: './support-request-dialog.html',
  styleUrl: './support-request-dialog.scss',
})
export class SupportRequestDialog {
  readonly requestSender = input<SupportRequestSender | null>(null);
  readonly contactRequested = output<void>();
  protected readonly messageLength = signal(0);
  protected readonly submissionState = signal<'form' | 'sending' | 'sent'>('form');
  protected readonly submissionNotice = signal<string | null>(null);

  private readonly injector = inject(Injector);
  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('requestDialog');
  private readonly successTitle = viewChild<ElementRef<HTMLHeadingElement>>('successTitle');
  private opener: HTMLElement | null = null;

  open(): void {
    const dialog = this.dialog().nativeElement;
    if (dialog.open) return;

    if (this.submissionState() === 'sent') this.submissionState.set('form');
    this.opener = dialog.ownerDocument.activeElement as HTMLElement | null;
    dialog.showModal();
  }

  protected close(): void {
    this.dialog().nativeElement.close();
  }

  protected onBackdropClick(event: MouseEvent): void {
    if (event.target === this.dialog().nativeElement) this.close();
  }

  protected onClosed(): void {
    if (this.opener?.isConnected) this.opener.focus({ preventScroll: true });
    this.opener = null;
  }

  protected updateMessageLength(value: string): void {
    this.messageLength.set(value.length);
  }

  protected openManager(): void {
    // Opening another modal must not restore focus behind it when this one closes.
    this.opener = null;
    this.close();
    this.contactRequested.emit();
  }

  protected async submitRequest(event: Event): Promise<void> {
    event.preventDefault();
    if (this.submissionState() !== 'form') return;

    const form = event.target as HTMLFormElement;
    if (!form.reportValidity()) return;

    this.submissionNotice.set(null);
    const sender = this.requestSender();
    if (!sender) {
      this.submissionNotice.set('Надсилання через форму поки недоступне.');
      return;
    }

    const data = new FormData(form);
    const request: SupportRequestPayload = {
      fullName: String(data.get('fullName') ?? '').trim(),
      purpose: String(data.get('purpose') ?? ''),
      email: String(data.get('email') ?? '').trim(),
      phone: String(data.get('phone') ?? '').trim(),
      message: String(data.get('message') ?? '').trim(),
      informationConfirmed: data.get('informationConfirmed') === 'on',
    };

    if (!request.fullName || !request.message) {
      this.submissionNotice.set('Заповніть ім’я та повідомлення — ці поля не можуть містити лише пробіли.');
      return;
    }

    this.submissionState.set('sending');
    try {
      const result = await sender(request);
      if (result?.accepted !== true) throw new Error('Request was not accepted');

      form.reset();
      this.messageLength.set(0);
      this.submissionState.set('sent');
      afterNextRender(() => {
        if (this.dialog().nativeElement.open) {
          this.successTitle()?.nativeElement.focus({ preventScroll: true });
        }
      }, { injector: this.injector });
    } catch {
      this.submissionState.set('form');
      this.submissionNotice.set('Не вдалося надіслати повідомлення. Спробуйте ще раз.');
    }
  }
}
