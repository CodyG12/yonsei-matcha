export interface PriceVariant {
  label: string;
  price: number;
}

export function formatPrice(variants: PriceVariant[]): string {
  if (variants.length === 0) {
    throw new Error('formatPrice requires at least one price variant');
  }

  if (variants.length === 1 && variants[0].label === '') {
    return formatDollar(variants[0].price);
  }

  return variants
    .map((variant) => `${variant.label} ${formatDollar(variant.price)}`.trim())
    .join(' / ');
}

function formatDollar(amount: number): string {
  return `$${amount.toFixed(2)}`;
}
