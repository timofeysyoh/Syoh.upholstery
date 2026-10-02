import { NgTemplateOutlet } from '@angular/common';
import { Component, ElementRef, OnDestroy, input, signal, viewChild } from '@angular/core';

@Component({
  selector: 'app-contact-dialog',
  imports: [NgTemplateOutlet],
  templateUrl: './contact-dialog.html',
  styleUrl: './contact-dialog.scss',
})
export class ContactDialog implements OnDestroy {
  readonly instagramUrl = input<string | null>(null);
  readonly telegramUrl = input<string | null>(null);
  protected readonly isWorkingTime = signal(false);

  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('contactDialog');
  private readonly workingTimeFormatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Kyiv',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  });
  private workingTimeInterval: ReturnType<typeof setInterval> | undefined;

  open(): void {
    const dialog = this.dialog().nativeElement;
    if (!dialog.open) dialog.showModal();
    this.updateWorkingTime();
    if (this.workingTimeInterval === undefined) {
      this.workingTimeInterval = setInterval(() => this.updateWorkingTime(), 60_000);
    }
  }

  protected close(): void {
    this.onClosed();
    this.dialog().nativeElement.close();
  }

  protected onClosed(): void {
    if (this.workingTimeInterval !== undefined) {
      clearInterval(this.workingTimeInterval);
      this.workingTimeInterval = undefined;
    }
  }

  ngOnDestroy(): void {
    this.onClosed();
  }

  private updateWorkingTime(): void {
    const parts = this.workingTimeFormatter.formatToParts(new Date());
    const weekday = parts.find((part) => part.type === 'weekday')?.value;
    const hour = Number(parts.find((part) => part.type === 'hour')?.value);
    const minute = Number(parts.find((part) => part.type === 'minute')?.value);
    const minutesSinceMidnight = hour * 60 + minute;
    const isWeekday = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].includes(weekday ?? '');

    this.isWorkingTime.set(
      isWeekday && minutesSinceMidnight >= 8 * 60 && minutesSinceMidnight < 17 * 60,
    );
  }
}
