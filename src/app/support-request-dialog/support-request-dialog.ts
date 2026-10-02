import { Component, ElementRef, signal, viewChild } from '@angular/core';

@Component({
  selector: 'app-support-request-dialog',
  templateUrl: './support-request-dialog.html',
  styleUrl: './support-request-dialog.scss',
})
export class SupportRequestDialog {
  protected readonly messageLength = signal(0);

  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('requestDialog');
  private opener: HTMLElement | null = null;

  open(): void {
    const dialog = this.dialog().nativeElement;
    if (dialog.open) return;

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

  protected preventSubmission(event: Event): void {
    // No delivery destination has been configured; never navigate or imply a successful send.
    event.preventDefault();
  }
}
