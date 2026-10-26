// One place to edit prices, hours and contact details.
// Placeholder values marked TODO until Gökçen confirms them.

export const business = {
  name: 'Gökçen',
  // TODO: real contact details
  email: 'hello@example.com',
  whatsapp: '+48000000000',
  instagram: 'https://instagram.com/',
  location: {
    district: 'VII Dwór',
    city: 'Gdańsk',
    // District centre only — never the exact address.
    lat: 54.4105,
    lng: 18.5745,
  },
  timezone: 'Europe/Warsaw',
  lessons: {
    // Working hours in Warsaw time, per weekday (0 = Sunday).
    hours: {
      1: [9, 20],
      2: [9, 20],
      3: [9, 20],
      4: [9, 20],
      5: [9, 18],
      6: [10, 14],
    } as Record<number, [number, number]>,
    slotMinutes: 60,
    // TODO: real prices
    prices: [
      { key: 'trial', amount: 0, minutes: 30 },
      { key: 'single', amount: 100, minutes: 60 },
      { key: 'pack', amount: 450, minutes: 60, count: 5 },
    ],
  },
  petSitting: {
    // TODO: real prices
    prices: [
      { key: 'day', amount: 80 },
      { key: 'night', amount: 120 },
      { key: 'walk', amount: 40 },
    ],
  },
  currency: 'PLN',
} as const;

export type Business = typeof business;
