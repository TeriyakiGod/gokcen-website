// One place to edit prices, hours and contact details.
// Placeholder values marked TODO until Gökçen confirms them.

export const business = {
  name: 'Gökçen',
  email: 'gokcenakdag51@gmail.com',
  phone: '+48 883 512 271',
  whatsapp: '+48883512271',
  instagram: 'https://www.instagram.com/gokcen.akdg/',
  location: {
    district: 'VII Dwór',
    city: 'Gdańsk',
    // Map pin: the Lewiatan shop on ul. Norblina — near home, never the exact address.
    lat: 54.3878,
    lng: 18.5708,
  },
  timezone: 'Europe/Warsaw',
  lessons: {
    // Working hours in Warsaw time, per weekday (0 = Sunday).
    hours: {
      1: [7, 18],
      2: [7, 18],
      3: [7, 18],
      4: [7, 18],
      5: [7, 18],
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
