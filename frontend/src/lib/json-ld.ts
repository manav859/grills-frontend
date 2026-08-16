import { SITE_URL } from '@/lib/seo';
import type {
  EventItem,
  GlobalData,
  Hours,
  Location,
  MenuItem,
  MenuSection,
  PriceVariant,
  Weekday,
} from '@/types/api';

/*
 * JSON-LD builders — 08-PERFORMANCE-SEO-A11Y.md §4.5. Typed, side-effect-free
 * functions that return plain schema.org objects; the <JsonLd> component
 * serialises them. Every value comes from the payload — nothing is invented.
 * The Restaurant node is defined on `/` and `/contact`; Menu and Event nodes
 * reference it by @id, which schema.org resolves across pages.
 *
 * Known gaps, flagged not faked: the content model has no event announce-date,
 * so Offer.validFrom is omitted; a menu item with no schema-mapped dietary tag
 * yields an empty suitableForDiet, per the 08 mapping table.
 */

type JsonLd = Record<string, unknown>;

const SCHEMA = 'https://schema.org';
const RESTAURANT_ID = `${SITE_URL}/#restaurant`;

const DAY_URL: Record<Weekday, string> = {
  monday: `${SCHEMA}/Monday`,
  tuesday: `${SCHEMA}/Tuesday`,
  wednesday: `${SCHEMA}/Wednesday`,
  thursday: `${SCHEMA}/Thursday`,
  friday: `${SCHEMA}/Friday`,
  saturday: `${SCHEMA}/Saturday`,
  sunday: `${SCHEMA}/Sunday`,
};

// 08 §4.5 mapping table; slugs with no schema.org equivalent are omitted.
const DIET_URL: Record<string, string> = {
  vegetarian: `${SCHEMA}/VegetarianDiet`,
  vegan: `${SCHEMA}/VeganDiet`,
  'gluten-free': `${SCHEMA}/GlutenFreeDiet`,
};

function withContext(node: JsonLd): JsonLd {
  return { '@context': SCHEMA, ...node };
}

function graph(nodes: JsonLd[]): JsonLd {
  return { '@context': SCHEMA, '@graph': nodes };
}

function postalAddress(location: Location): JsonLd {
  return {
    '@type': 'PostalAddress',
    streetAddress: location.streetAddress,
    addressLocality: location.city,
    addressRegion: location.state,
    postalCode: location.postalCode,
    addressCountry: location.country,
  };
}

function geo(location: Location): JsonLd {
  return {
    '@type': 'GeoCoordinates',
    latitude: location.latitude,
    longitude: location.longitude,
  };
}

function openingHours(hours: Hours): JsonLd[] {
  const specs: JsonLd[] = [];
  const regular = hours.regular;

  // Collapse consecutive days sharing identical hours into one spec (08 §4.5).
  let i = 0;
  while (i < regular.length) {
    const day = regular[i];
    if (day === undefined) {
      i += 1;
      continue;
    }
    const key = day.isClosed ? 'closed' : `${day.opens}-${day.closes}`;
    const group = [day];
    let j = i + 1;
    while (j < regular.length) {
      const next = regular[j];
      if (next === undefined) {
        break;
      }
      const nextKey = next.isClosed ? 'closed' : `${next.opens}-${next.closes}`;
      if (nextKey !== key) {
        break;
      }
      group.push(next);
      j += 1;
    }
    specs.push({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: group.map((entry) => DAY_URL[entry.day]),
      opens: day.isClosed ? '00:00' : day.opens,
      closes: day.isClosed ? '00:00' : day.closes,
    });
    i = j;
  }

  // A closed exception is opens/closes 00:00 (08 §4.5).
  for (const exception of hours.exceptions) {
    specs.push({
      '@type': 'OpeningHoursSpecification',
      validFrom: exception.date,
      validThrough: exception.date,
      opens: exception.isClosed ? '00:00' : (exception.opens ?? '00:00'),
      closes: exception.isClosed ? '00:00' : (exception.closes ?? '00:00'),
    });
  }

  return specs;
}

/** Restaurant (extends LocalBusiness / FoodEstablishment). Bare node, no @context. */
function restaurantNode(global: GlobalData): JsonLd {
  const { site, location, hours, social, seoDefaults } = global;
  const sameAs =
    seoDefaults.sameAs.length > 0
      ? seoDefaults.sameAs
      : social.map((link) => link.url);

  return {
    '@type': 'Restaurant',
    '@id': RESTAURANT_ID,
    name: site.name,
    legalName: site.legalName,
    url: SITE_URL,
    telephone: location.phoneHref.replace('tel:', ''),
    ...(location.email !== undefined ? { email: location.email } : {}),
    priceRange: seoDefaults.priceRange,
    ...(seoDefaults.servesCuisine.length > 0
      ? { servesCuisine: seoDefaults.servesCuisine }
      : {}),
    acceptsReservations: 'False',
    currenciesAccepted: 'USD',
    ...(seoDefaults.ogImage !== undefined
      ? { image: [seoDefaults.ogImage.src] }
      : {}),
    ...(site.logo !== undefined ? { logo: site.logo.src } : {}),
    description: seoDefaults.description || site.description,
    address: postalAddress(location),
    geo: geo(location),
    hasMap: location.directionsUrl,
    ...(sameAs.length > 0 ? { sameAs } : {}),
    hasMenu: `${SITE_URL}/menu`,
    openingHoursSpecification: openingHours(hours),
  };
}

function websiteNode(global: GlobalData): JsonLd {
  return {
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    url: SITE_URL,
    name: global.site.name,
    description: global.site.description,
    publisher: { '@id': RESTAURANT_ID },
    inLanguage: 'en-US',
  };
}

function offerNode(variant: PriceVariant): JsonLd {
  return {
    '@type': 'Offer',
    ...(variant.label !== undefined ? { name: variant.label } : {}),
    price: variant.amount.toFixed(2),
    priceCurrency: 'USD',
    availability: `${SCHEMA}/InStock`,
  };
}

function menuItemNode(item: MenuItem): JsonLd {
  const diets = item.dietaryTags
    .map((tag) => DIET_URL[tag.slug])
    .filter((value): value is string => value !== undefined);

  return {
    '@type': 'MenuItem',
    name: item.name,
    ...(item.description !== undefined ? { description: item.description } : {}),
    ...(item.image !== undefined ? { image: item.image.src } : {}),
    offers: item.priceVariants.map(offerNode),
    suitableForDiet: diets,
  };
}

function menuSectionNode(section: MenuSection): JsonLd {
  return {
    '@type': 'MenuSection',
    name: section.title,
    ...(section.intro !== undefined ? { description: section.intro } : {}),
    hasMenuItem: section.items.map(menuItemNode),
    ...(section.children.length > 0
      ? { hasMenuSection: section.children.map(menuSectionNode) }
      : {}),
  };
}

function eventNode(global: GlobalData, event: EventItem): JsonLd {
  const url = `${SITE_URL}/events/${event.slug}`;
  const ticketed = event.isTicketed;

  return {
    '@type': 'Event',
    '@id': `${url}#event`,
    name: event.title,
    description: event.summary,
    url,
    startDate: event.startDateTime,
    endDate: event.endDateTime,
    eventStatus: `${SCHEMA}/EventScheduled`,
    eventAttendanceMode: `${SCHEMA}/OfflineEventAttendanceMode`,
    ...(event.image !== undefined ? { image: [event.image.src] } : {}),
    ...(event.eventType === 'live_music' && event.performerName !== undefined
      ? {
          performer: {
            '@type': 'MusicGroup',
            name: event.performerName,
            ...(event.performerUrl !== undefined
              ? { sameAs: event.performerUrl }
              : {}),
          },
        }
      : {}),
    organizer: { '@id': RESTAURANT_ID },
    location: {
      '@type': 'Place',
      name: global.site.name,
      address: postalAddress(global.location),
      geo: geo(global.location),
    },
    offers: {
      '@type': 'Offer',
      price:
        ticketed && event.coverCharge !== undefined
          ? event.coverCharge.toFixed(2)
          : '0',
      priceCurrency: 'USD',
      availability: `${SCHEMA}/InStock`,
      url: ticketed && event.ticketUrl !== undefined ? event.ticketUrl : url,
    },
    isAccessibleForFree: !ticketed,
  };
}

export function homeJsonLd(global: GlobalData): JsonLd {
  return graph([restaurantNode(global), websiteNode(global)]);
}

export function contactJsonLd(global: GlobalData): JsonLd {
  return withContext(restaurantNode(global));
}

export function menuJsonLd(
  global: GlobalData,
  sections: MenuSection[],
): JsonLd {
  return withContext({
    '@type': 'Menu',
    '@id': `${SITE_URL}/menu#menu`,
    name: `${global.site.name} Menu`,
    url: `${SITE_URL}/menu`,
    inLanguage: 'en-US',
    provider: { '@id': RESTAURANT_ID },
    hasMenuSection: sections.map(menuSectionNode),
  });
}

export function eventsJsonLd(
  global: GlobalData,
  events: EventItem[],
): JsonLd {
  return graph(events.map((event) => eventNode(global, event)));
}
