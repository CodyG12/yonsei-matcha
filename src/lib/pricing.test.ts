import { describe, it, expect } from 'vitest';
import { formatPrice } from './pricing';

describe('formatPrice', () => {
  it('renders a single unlabeled variant as a plain dollar amount', () => {
    expect(formatPrice([{ label: '', price: 7.5 }])).toBe('$7.50');
  });

  it('joins two labeled variants with a slash', () => {
    expect(
      formatPrice([
        { label: 'Matcha', price: 8 },
        { label: 'Hojicha', price: 7.5 },
      ])
    ).toBe('Matcha $8.00 / Hojicha $7.50');
  });

  it('always shows two decimal places, even for whole dollar amounts', () => {
    expect(formatPrice([{ label: '', price: 7 }])).toBe('$7.00');
  });

  it('shows the label even for a single labeled variant', () => {
    expect(formatPrice([{ label: 'Jasmine Matcha Cloud', price: 7.5 }])).toBe(
      'Jasmine Matcha Cloud $7.50'
    );
  });

  it('throws on an empty variant list, since that means the menu data is malformed', () => {
    expect(() => formatPrice([])).toThrow(
      'formatPrice requires at least one price variant'
    );
  });
});
