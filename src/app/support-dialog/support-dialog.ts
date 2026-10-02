import { Component, ElementRef, output, signal, viewChild } from '@angular/core';

@Component({
  selector: 'app-support-dialog',
  templateUrl: './support-dialog.html',
  styleUrl: './support-dialog.scss',
})
export class SupportDialog {
  readonly requestFormRequested = output<void>();

  protected readonly expandedQuestion = signal<string | null>(null);
  protected readonly questions = [
    {
      id: 'order',
      question: 'Як замовити роботу?',
      answer:
        'Напишіть нашому менеджеру в Instagram або Telegram та розкажіть, яку річ хочете відремонтувати або обшити шкірою. Ми уточнимо деталі, обговоримо ваші побажання та разом підберемо варіант виконання.',
    },
    {
      id: 'price',
      question: 'Як дізнатися вартість?',
      answer:
        'Вартість залежить від обсягу роботи, стану деталей і вибраного оформлення. Надішліть менеджеру фото та побажання — він зорієнтує щодо можливих варіантів і вартості.',
    },
    {
      id: 'design',
      question: 'Чи можна змінити дизайн салону або форму керма?',
      answer:
        'Можна обговорити відтворення оригінального дизайну або індивідуальне оформлення салону. Для керма також доступна зміна форми, товщини та хвату.',
    },
    {
      id: 'materials',
      question: 'Чи можна поєднувати різні види шкіри, фактури та кольори?',
      answer:
        'Так, можна поєднувати різні види шкіри, фактури та кольори в одному виробі. Підберемо матеріали й поєднання відповідно до ваших побажань.',
    },
    {
      id: 'timing',
      question: 'Скільки часу займає робота?',
      answer:
        'Тривалість залежить від обсягу та складності робіт. Уточніть терміни у менеджера під час обговорення вашого проєкту.',
    },
    {
      id: 'hours',
      question: 'Коли можна звернутися до менеджера?',
      answer:
        'Робочий графік: будні з 8.00 до 17.00 за київським часом. Залишити повідомлення в Instagram можна у зручний для вас час.',
    },
  ] as const;

  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('supportDialog');

  open(): void {
    const dialog = this.dialog().nativeElement;
    if (!dialog.open) dialog.showModal();
  }

  protected close(): void {
    this.dialog().nativeElement.close();
  }

  protected toggleQuestion(id: string): void {
    this.expandedQuestion.update((current) => (current === id ? null : id));
  }
}
