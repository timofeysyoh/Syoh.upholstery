export type PricingCategory = 'interiors' | 'seats' | 'steering' | 'airbag' | 'handles' | 'panels' | 'headliner' | 'dashboard' | 'furniture' | 'items';

export type PricingServiceType = 'Перетяжка' | 'Відновлення' | 'Зміна форми' | 'Пошиття' | 'Оздоблення' | 'Демонтаж';

export interface PricingOption {
  readonly id: string;
  readonly label: string;
  readonly price: number | null;
  readonly from?: boolean;
}

export interface PricingItem {
  readonly id: string;
  readonly category: PricingCategory;
  readonly relatedCategories?: readonly PricingCategory[];
  readonly serviceType: PricingServiceType;
  readonly hidden?: boolean;
  readonly title: string;
  readonly description: string;
  readonly price: number | null;
  readonly priceFrom?: boolean;
  readonly priceUnit?: string;
  readonly priceOptions?: readonly PricingOption[];
  readonly priceOptionsInInfo?: boolean;
  readonly priceOptionsTitle?: string;
  readonly priceBreakdown?: readonly PricingOption[];
  readonly priceNote?: string;
  readonly serviceNote?: string;
  readonly searchTerms?: readonly string[];
  readonly image: string;
  readonly imageAlt: string;
}

// Demonstration amounts only; replace these values when the workshop confirms its price list.
export const PRICING_ITEMS: readonly PricingItem[] = [
  {
    id: 'full-interior',
    category: 'interiors',
    serviceType: 'Перетяжка',
    title: 'Повна перетяжка салону',
    description: 'Перетягнемо салон за вашими побажаннями, відтворимо оригінальний вигляд або створимо авторське оформлення СЬОХ / Syoh.',
    price: 25000,
    serviceNote: 'За вашим бажанням оновимо також стелю, покриття підлоги та килимки. Перелік робіт і вартість узгодимо індивідуально.',
    image: '/project-placeholders/interiors.svg',
    imageAlt: 'Схематична ілюстрація автомобільного салону',
  },
  {
    id: 'leather-covering-by-area',
    category: 'items',
    serviceType: 'Оздоблення',
    title: 'Обшивка за площею',
    description: 'Обшивка речей шкірою або алькантарою за вашим задумом — не лише для авто. Надішліть фото та розміри предмета: обговоримо можливість і варіанти виконання.',
    price: 1800,
    priceFrom: true,
    priceOptionsInInfo: true,
    priceOptionsTitle: 'Матеріал · ціна за 1 м²',
    priceOptions: [
      { id: 'leather', label: 'Шкіра', price: 1800 },
      { id: 'alcantara', label: 'Алькантара', price: 2200 },
    ],
    searchTerms: ['метр', 'метри', 'квадратний', 'площа', 'шкіра', 'меблі', 'диван', 'стілець', 'книга', 'обкладинка', 'алькантара', 'alcantara', 'тканина'],
    image: '/project-placeholders/leather-area.svg',
    imageAlt: 'Схематична ілюстрація шкіряної обшивки розміром один на один метр',
  },
  {
    id: 'furniture-upholstery',
    category: 'furniture',
    serviceType: 'Перетяжка',
    hidden: true,
    title: 'Перетяжка диванів і крісел',
    description: 'Оновлення оббивки диванів і крісел із підбором шкіри до вашого інтер’єру.',
    price: 8500,
    priceUnit: 'за один виріб',
    searchTerms: ['диван', 'дивани', 'крісло', 'крісла', 'меблі'],
    image: '/project-placeholders/furniture.svg',
    imageAlt: 'Схематична ілюстрація дивана зі шкіряною оббивкою',
  },
  {
    id: 'chair-upholstery',
    category: 'furniture',
    serviceType: 'Перетяжка',
    hidden: true,
    title: 'Перетяжка стільців',
    description: 'Шкіряна обшивка сидінь і спинок. Працюємо як з окремим стільцем, так і з комплектом.',
    price: 1200,
    priceUnit: 'за один стілець',
    searchTerms: ['стілець', 'стільці', 'меблі'],
    image: '/project-placeholders/chair.svg',
    imageAlt: 'Схематична ілюстрація стільця з обшитими сидінням і спинкою',
  },
  {
    id: 'leather-book-covers',
    category: 'items',
    serviceType: 'Оздоблення',
    hidden: true,
    title: 'Шкіряні обкладинки',
    description: 'Оздоблення обкладинок книг і блокнотів шкірою за їхнім розміром та вашим задумом.',
    price: 700,
    priceUnit: 'за одну обкладинку',
    searchTerms: ['книга', 'книги', 'книжка', 'блокнот', 'обкладинка'],
    image: '/project-placeholders/book-cover.svg',
    imageAlt: 'Схематична ілюстрація книги у шкіряній обкладинці з декоративним швом',
  },
  {
    id: 'seat-upholstery',
    category: 'seats',
    serviceType: 'Перетяжка',
    title: 'Перетяжка сидінь',
    description: 'Перетягнемо все сидіння або замінимо лише пошкоджений елемент оббивки за оригінальним кроєм, з підбором кольору й фактури до решти сидіння.',
    price: 5000,
    priceFrom: true,
    priceUnit: 'за одне сидіння повністю',
    priceOptionsInInfo: true,
    priceOptions: [
      { id: 'original-panel', label: 'Один елемент оббивки', price: 1000, from: true },
      { id: 'full-seat', label: 'Одне сидіння повністю', price: 5000, from: true },
    ],
    serviceNote: 'Елемент — частина оббивки між заводськими швами. Вартість залежить від розміру сидіння, площі елемента та матеріалу.',
    image: '/project-placeholders/seats.svg',
    imageAlt: 'Схематична ілюстрація оббивки автомобільного сидіння',
  },
  {
    id: 'seat-restoration',
    category: 'seats',
    serviceType: 'Відновлення',
    title: 'Відновлення сидінь',
    description: 'Відновлення поролону, форми та пошкоджених ділянок сидінь.',
    price: 2000,
    image: '/project-placeholders/seat-foam.svg',
    imageAlt: 'Ілюстрація поролонової основи автомобільного сидіння без оббивки',
  },
  {
    id: 'steering-upholstery',
    category: 'steering',
    serviceType: 'Перетяжка',
    title: 'Перетяжка керма',
    description: 'Перетягнемо кермо за вашими побажаннями або відтворимо оригінальну оббивку — з підбором матеріалу, кольору та шва.',
    price: 1800,
    image: '/project-placeholders/steering.svg',
    imageAlt: 'Схематична ілюстрація оббивки автомобільного керма',
  },
  {
    id: 'steering-airbag-cover',
    category: 'airbag',
    relatedCategories: ['steering'],
    serviceType: 'Оздоблення',
    title: 'Оздоблення кришки подушки керма (Airbag)',
    description: 'Оздоблення зовнішньої кришки подушки керма в оригінальному стилі або за вашим задумом. Можливість виконання та матеріал узгодимо після огляду деталі.',
    price: 1200,
    serviceNote: 'Послуга стосується зовнішньої кришки й не включає ремонт або відновлення механізму подушки безпеки.',
    searchTerms: ['подушка', 'подушка безпеки', 'airbag', 'кришка', 'накладка', 'руль'],
    image: '/project-placeholders/steering-airbag-cover.svg',
    imageAlt: 'Схематична ілюстрація зовнішньої кришки подушки безпеки керма',
  },
  {
    id: 'steering-repair',
    category: 'steering',
    serviceType: 'Відновлення',
    title: 'Ремонт керма',
    description: 'Усунення прокручування обода та відновлення пошкоджень.',
    price: 1000,
    image: '/project-placeholders/steering-repair.svg',
    imageAlt: 'Ілюстрація керма з відкритою ділянкою основи обода для відновлення',
  },
  {
    id: 'steering-anatomy',
    category: 'steering',
    serviceType: 'Зміна форми',
    title: 'Зміна анатомії керма',
    description: 'Змінюємо форму, товщину та хват керма за вашими побажаннями: додаємо до основи хвилі під пальці, напливи та формуємо нижню частину.',
    price: 3500,
    priceUnit: 'за весь комплекс',
    priceBreakdown: [
      { id: 'lower-section', label: 'Форма нижньої частини', price: 1500 },
      { id: 'finger-waves', label: 'Хвилі під пальці', price: 1000 },
      { id: 'grip-bulges', label: 'Напливи для хвату', price: 1000 },
    ],
    image: '/project-placeholders/steering-anatomy.svg',
    imageAlt: 'Анатомічне кермо з напливами для хвату, хвилями під пальці та пласкою нижньою частиною',
  },
  {
    id: 'handle-upholstery',
    category: 'handles',
    serviceType: 'Перетяжка',
    title: 'Перетяжка ручок',
    description: 'Перетягнемо ручки за вашими побажаннями або відтворимо оригінальну оббивку — з підбором матеріалу, кольору та шва.',
    price: 700,
    image: '/project-placeholders/handles.svg',
    imageAlt: 'Схематична ілюстрація ручки в автомобільному інтер’єрі',
  },
  {
    id: 'gear-shift-boot',
    category: 'handles',
    serviceType: 'Пошиття',
    title: 'Чохол важеля перемикання передач',
    description: 'Пошиємо шкіряний чохол важеля за вашими побажаннями або за оригінальним зразком — з підбором матеріалу, кольору та шва.',
    price: 900,
    searchTerms: ['чохол', 'чохли', 'ручка', 'важіль', 'кпп', 'коробка передач', 'куліса', 'пильник'],
    image: '/project-placeholders/gear-shift-boot.svg',
    imageAlt: 'Схематична ілюстрація шкіряного чохла важеля перемикання передач',
  },
  {
    id: 'door-panel-upholstery',
    category: 'panels',
    serviceType: 'Перетяжка',
    title: 'Перетяжка дверних карт',
    description: 'Перетягнемо дверні карти та декоративні вставки за вашими побажаннями або відтворимо оригінальне оформлення — з підбором матеріалу, кольору та шва.',
    price: 2500,
    image: '/project-placeholders/panels.svg',
    imageAlt: 'Схематична ілюстрація автомобільної дверної карти',
  },
  {
    id: 'headliner-upholstery',
    category: 'headliner',
    serviceType: 'Перетяжка',
    title: 'Перетяжка стелі салону',
    description: 'Оновимо оббивку стелі салону за вашими побажаннями або відтворимо оригінальний вигляд — з підбором матеріалу та кольору.',
    price: 3000,
    priceFrom: true,
    serviceNote: 'Вартість перетяжки залежить від довжини стелі салону. Остаточну ціну узгодимо після замірів.',
    searchTerms: ['стеля', 'стелі', 'потолок', 'дах', 'оббивка', 'обшивка', 'довжина'],
    image: '/project-placeholders/headliner.svg',
    imageAlt: 'Схематична ілюстрація оббивки стелі автомобільного салону',
  },
  {
    id: 'interior-disassembly',
    category: 'interiors',
    relatedCategories: ['seats', 'steering', 'handles', 'panels', 'headliner', 'dashboard'],
    serviceType: 'Демонтаж',
    title: 'Демонтаж елементів салону',
    description: 'Знімати деталі самостійно не потрібно. Залиште авто на стоянці майстерні — демонтаж виконаємо ми.',
    price: 200,
    priceFrom: true,
    priceUnit: 'залежно від обраної деталі',
    priceOptionsInInfo: true,
    priceOptions: [
      { id: 'seat', label: 'Сидіння', price: 400 },
      { id: 'steering-wheel', label: 'Кермо', price: 500 },
      { id: 'gear-handle', label: 'Ручка КПП з чохлом', price: 200 },
      { id: 'door-panel', label: 'Дверна карта', price: 300 },
      { id: 'headliner', label: 'Стеля салону', price: 1500 },
      { id: 'dashboard', label: 'Панель приладів', price: 2500 },
    ],
    serviceNote: 'Для кожного типу деталі діє фіксована ціна за зняття одного елемента, незалежно від моделі автомобіля.',
    searchTerms: ['демонтаж', 'зняття', 'зняти', 'руль', 'деталь', 'карта', 'сидіння', 'ручка', 'чохол', 'кпп', 'стеля', 'потолок', 'панель', 'торпедо'],
    image: '/project-placeholders/interior-disassembly.svg',
    imageAlt: 'Інструменти для демонтажу салону: пластикові лопатки, знімач кліпс і тріскачка',
  },
];
