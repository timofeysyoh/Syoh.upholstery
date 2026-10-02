import { Component, computed, HostListener, signal } from '@angular/core';
import { PRICING_ITEMS, type PricingCategory, type PricingItem, type PricingServiceType } from './pricing.data';

type CategoryFilter = 'all' | PricingCategory;
type ServiceTypeFilter = 'all' | PricingServiceType;
type PriceSortOrder = 'default' | 'price-asc' | 'price-desc';

function matchesCategory(item: PricingItem, category: CategoryFilter): boolean {
  return category === 'all'
    || item.category === category
    || (item.relatedCategories?.includes(category) ?? false);
}

function matchesServiceType(item: PricingItem, serviceType: ServiceTypeFilter): boolean {
  return serviceType === 'all' || item.serviceType === serviceType;
}

function minimumPrice(item: PricingItem): number | null {
  if (!item.priceOptions?.length) return item.price;

  const prices = item.priceOptions
    .map((option) => option.price)
    .filter((price): price is number => price !== null);
  return prices.length ? Math.min(...prices) : null;
}

function normalizeSearch(value: string): string {
  return value
    .normalize('NFKC')
    .toLocaleLowerCase('uk-UA')
    .replace(/['’‘ʼ`]/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();
}

@Component({
  selector: 'app-pricing',
  templateUrl: './pricing.html',
  styleUrl: './pricing.scss',
})
export class Pricing {
  protected readonly items = PRICING_ITEMS.filter((item) => !item.hidden);
  private readonly allCategories: readonly { id: CategoryFilter; label: string }[] = [
    { id: 'all', label: 'Усі елементи' },
    { id: 'interiors', label: 'Салон' },
    { id: 'seats', label: 'Сидіння' },
    { id: 'steering', label: 'Кермо' },
    { id: 'airbag', label: 'Кришка Airbag' },
    { id: 'handles', label: 'Ручки та чохли' },
    { id: 'panels', label: 'Дверні карти' },
    { id: 'headliner', label: 'Стеля' },
    { id: 'dashboard', label: 'Панель приладів' },
    { id: 'furniture', label: 'Меблі' },
    { id: 'items', label: 'Інші предмети' },
  ];
  private readonly availableCategories = this.allCategories.filter(
    (category) => category.id === 'all' || this.items.some((item) => matchesCategory(item, category.id)),
  );
  private readonly allServiceTypes: readonly { id: ServiceTypeFilter; label: string }[] = [
    { id: 'all', label: 'Усі види робіт' },
    { id: 'Перетяжка', label: 'Перетяжка' },
    { id: 'Відновлення', label: 'Відновлення' },
    { id: 'Зміна форми', label: 'Зміна форми' },
    { id: 'Пошиття', label: 'Пошиття' },
    { id: 'Оздоблення', label: 'Оздоблення' },
    { id: 'Демонтаж', label: 'Демонтаж' },
  ];
  private readonly availableServiceTypes = this.allServiceTypes.filter(
    (serviceType) => serviceType.id === 'all'
      || this.items.some((item) => matchesServiceType(item, serviceType.id)),
  );
  protected readonly query = signal('');
  protected readonly selectedCategory = signal<CategoryFilter>('all');
  protected readonly selectedServiceType = signal<ServiceTypeFilter>('all');
  protected readonly sortOrder = signal<PriceSortOrder>('default');
  protected readonly openPriceInfoId = signal<string | null>(null);
  private pinnedPriceInfoId: string | null = null;
  private readonly searchedItems = computed(() => {
    const tokens = normalizeSearch(this.query()).split(' ').filter(Boolean);
    return this.items.filter((item) => this.matchesSearch(item, tokens));
  });
  protected readonly categories = computed(() => {
    const serviceType = this.selectedServiceType();
    const items = this.searchedItems().filter((item) => matchesServiceType(item, serviceType));
    return this.availableCategories.map((category) => ({
      ...category,
      count: items.filter((item) => matchesCategory(item, category.id)).length,
    }));
  });
  protected readonly serviceTypes = computed(() => {
    const category = this.selectedCategory();
    const items = this.searchedItems().filter((item) => matchesCategory(item, category));
    return this.availableServiceTypes.map((serviceType) => ({
      ...serviceType,
      count: items.filter((item) => matchesServiceType(item, serviceType.id)).length,
    }));
  });
  protected readonly filtersActive = computed(
    () => this.query().trim().length > 0
      || this.selectedCategory() !== 'all'
      || this.selectedServiceType() !== 'all'
      || this.sortOrder() !== 'default',
  );
  protected readonly filteredItems = computed(() => {
    const category = this.selectedCategory();
    const serviceType = this.selectedServiceType();
    const sortOrder = this.sortOrder();
    const results = this.searchedItems().filter(
      (item) => matchesCategory(item, category) && matchesServiceType(item, serviceType),
    );

    if (sortOrder === 'default') return results;

    return results.sort((first, second) => {
      const firstPrice = minimumPrice(first);
      const secondPrice = minimumPrice(second);
      if (firstPrice === null) return secondPrice === null ? 0 : 1;
      if (secondPrice === null) return -1;
      return sortOrder === 'price-asc'
        ? firstPrice - secondPrice
        : secondPrice - firstPrice;
    });
  });
  private readonly priceFormatter = new Intl.NumberFormat('uk-UA', {
    maximumFractionDigits: 0,
  });

  private matchesSearch(item: PricingItem, tokens: readonly string[]): boolean {
    if (!tokens.length) return true;

    const categoryLabels = this.allCategories
      .filter((category) => category.id !== 'all' && matchesCategory(item, category.id))
      .map((category) => category.label)
      .join(' ');
    const aliases = [
      matchesCategory(item, 'steering') ? 'руль руля рулі рулем' : '',
      item.category === 'airbag' ? 'ейрбег аірбег' : '',
      item.serviceType === 'Відновлення' ? 'ремонт реставрація' : '',
    ].join(' ');
    const searchableText = normalizeSearch([
      item.title,
      item.description,
      item.serviceType,
      categoryLabels,
      aliases,
      item.price ?? '',
      item.priceUnit ?? '',
      ...(item.searchTerms ?? []),
      ...(item.priceOptions ?? []).map((option) => `${option.label} ${option.price ?? ''}`),
      ...(item.priceBreakdown ?? []).map((option) => `${option.label} ${option.price ?? ''}`),
      item.priceNote ?? '',
      item.serviceNote ?? '',
    ].join(' '));
    return tokens.every((token) => searchableText.includes(token));
  }

  protected setQuery(value: string): void {
    this.closePriceInfo();
    this.query.set(value);
  }

  protected selectCategory(id: string): void {
    this.closePriceInfo();
    const category = this.availableCategories.find((option) => option.id === id);
    if (category) this.selectedCategory.set(category.id);
  }

  protected selectServiceType(value: string): void {
    this.closePriceInfo();
    const serviceType = this.availableServiceTypes.find((option) => option.id === value);
    if (serviceType) this.selectedServiceType.set(serviceType.id);
  }

  protected setSortOrder(value: string): void {
    this.closePriceInfo();
    if (value === 'default' || value === 'price-asc' || value === 'price-desc') {
      this.sortOrder.set(value);
    }
  }

  protected resetFilters(): void {
    this.closePriceInfo();
    this.query.set('');
    this.selectedCategory.set('all');
    this.selectedServiceType.set('all');
    this.sortOrder.set('default');
  }

  protected showPriceInfo(id: string): void {
    if (this.openPriceInfoId() !== id) this.pinnedPriceInfoId = null;
    this.openPriceInfoId.set(id);
  }

  protected showPriceInfoOnHover(id: string, event: PointerEvent): void {
    if (event.pointerType === 'mouse' || event.pointerType === 'pen') {
      this.showPriceInfo(id);
    }
  }

  protected togglePriceInfo(id: string): void {
    if (this.pinnedPriceInfoId === id) {
      this.closePriceInfo();
    } else {
      this.pinnedPriceInfoId = id;
      this.openPriceInfoId.set(id);
    }
  }

  protected hidePriceInfoOnLeave(id: string, event: PointerEvent): void {
    const container = event.currentTarget as HTMLElement;
    if (this.pinnedPriceInfoId === id || container.contains(container.ownerDocument.activeElement)) return;
    if (this.openPriceInfoId() === id) this.closePriceInfo();
  }

  protected hidePriceInfoOnBlur(id: string, event: FocusEvent): void {
    const container = event.currentTarget as HTMLElement;
    if (container.contains(event.relatedTarget as Node | null)) return;
    if (this.openPriceInfoId() === id) this.closePriceInfo();
  }

  @HostListener('document:keydown.escape', ['$event'])
  protected dismissPriceInfo(event: Event): void {
    if (this.openPriceInfoId() === null) return;
    event.preventDefault();
    event.stopPropagation();
    this.closePriceInfo();
  }

  @HostListener('document:pointerdown', ['$event'])
  protected dismissPriceInfoOutside(event: PointerEvent): void {
    if (this.openPriceInfoId() === null) return;
    if (!(event.target instanceof Element) || !event.target.closest('.price-info')) {
      this.closePriceInfo();
    }
  }

  private closePriceInfo(): void {
    this.pinnedPriceInfoId = null;
    this.openPriceInfoId.set(null);
  }

  protected formatPrice(price: number | null): string {
    return price === null ? 'За запитом' : `${this.priceFormatter.format(price)} грн`;
  }
}
