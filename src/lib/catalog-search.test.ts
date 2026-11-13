import { describe, it, expect, beforeEach } from 'vitest';
import { createTestDatabase } from '../../db/test-helpers';
import { categories, publishers, games } from '../../db/schema';
import type { Database } from './db';
import { getCatalog } from './games';
import { hasActiveFilters } from './catalog-filters';

interface SeededCatalog {
    strategyId: number;
    puzzleId: number;
}

const ALL_TITLES = [
    '50% Off Heroes',
    '500 Puzzles',
    'Back\\Slash Arena',
    'Server Siege',
    'Snake Case Quest',
    'Snake_Case Quest',
    'Virtual Server Simulator',
];

/**
 * Titles are inserted in reverse order to prove that sorting is applied. "50% Off Heroes",
 * "Snake_Case Quest" and "Back\Slash Arena" hold the `LIKE` wildcards and escape character: left
 * unescaped in a search, they would match other titles too.
 */
async function seedCatalog(db: Database): Promise<SeededCatalog> {
    const [strategy] = await db
        .insert(categories)
        .values({ name: 'Strategy', description: 'cat' })
        .returning({ id: categories.id });
    const [puzzle] = await db
        .insert(categories)
        .values({ name: 'Puzzle', description: 'cat' })
        .returning({ id: categories.id });
    const [publisher] = await db
        .insert(publishers)
        .values({ name: 'Pub One', description: 'pub' })
        .returning({ id: publishers.id });

    const titles: [string, number][] = [
        ['Virtual Server Simulator', strategy.id],
        ['Snake_Case Quest', puzzle.id],
        ['Snake Case Quest', puzzle.id],
        ['Server Siege', puzzle.id],
        ['Back\\Slash Arena', strategy.id],
        ['500 Puzzles', puzzle.id],
        ['50% Off Heroes', strategy.id],
    ];
    for (const [title, categoryId] of titles) {
        await db.insert(games).values({
            title,
            description: `Description of ${title}`,
            starRating: 4,
            categoryId,
            publisherId: publisher.id,
        });
    }

    return { strategyId: strategy.id, puzzleId: puzzle.id };
}

function params(query: string): URLSearchParams {
    return new URLSearchParams(query);
}

describe('catalog searched by title', () => {
    let db: Database;
    let seeded: SeededCatalog;

    beforeEach(async () => {
        db = await createTestDatabase();
        seeded = await seedCatalog(db);
    });

    it('returns the games whose title contains the search, ordered by title', async () => {
        const catalog = await getCatalog(db, params('search=server'));
        expect(catalog.games.map((g) => g.title)).toEqual(['Server Siege', 'Virtual Server Simulator']);
        expect(catalog.search).toBe('server');
    });

    it('finds the search anywhere in the title', async () => {
        const catalog = await getCatalog(db, params('search=ulat'));
        expect(catalog.games.map((g) => g.title)).toEqual(['Virtual Server Simulator']);
    });

    it.each([
        ['upper case', 'SERVER'],
        ['mixed case', 'sErVeR'],
    ])('ignores the case of a search in %s', async (_label, search) => {
        const catalog = await getCatalog(db, params(`search=${search}`));
        expect(catalog.games.map((g) => g.title)).toEqual(['Server Siege', 'Virtual Server Simulator']);
        expect(catalog.search).toBe(search);
    });

    it('searches several words as one phrase', async () => {
        const catalog = await getCatalog(db, params('search=server+sim'));
        expect(catalog.games.map((g) => g.title)).toEqual(['Virtual Server Simulator']);
        expect(catalog.search).toBe('server sim');
    });

    it('does not find the words of a phrase in another order', async () => {
        const catalog = await getCatalog(db, params('search=simulator+server'));
        expect(catalog.games).toEqual([]);
    });

    it('does not find the words of a phrase apart from each other', async () => {
        const catalog = await getCatalog(db, params('search=snake+quest'));
        expect(catalog.games).toEqual([]);
    });

    it.each([
        ['"%"', 'search=50%25', '50%', ['50% Off Heroes']],
        ['"_"', 'search=e_c', 'e_c', ['Snake_Case Quest']],
        ['a lone "_"', 'search=_', '_', ['Snake_Case Quest']],
        ['the escape character', 'search=%5Cs', '\\s', ['Back\\Slash Arena']],
    ])('takes %s literally', async (_label, query, search, titles) => {
        const catalog = await getCatalog(db, params(query));
        expect(catalog.games.map((g) => g.title)).toEqual(titles);
        expect(catalog.search).toBe(search);
    });

    it('keeps only the games of the chosen category whose title contains the search', async () => {
        const catalog = await getCatalog(db, params(`search=server&category=${seeded.strategyId}`));
        expect(catalog.games.map((g) => g.title)).toEqual(['Virtual Server Simulator']);
        expect(catalog.filters.categoryIds).toEqual([seeded.strategyId]);
        expect(catalog.search).toBe('server');
    });

    it('returns no games when the search and the category match no game together', async () => {
        const catalog = await getCatalog(db, params(`search=heroes&category=${seeded.puzzleId}`));
        expect(catalog.games).toEqual([]);
        expect(catalog.total).toBe(ALL_TITLES.length);
    });

    it('returns no games for a search that no title contains', async () => {
        const catalog = await getCatalog(db, params('search=repo'));
        expect(catalog.games).toEqual([]);
        expect(catalog.search).toBe('repo');
    });

    it('counts the whole catalog in total, even when searched', async () => {
        const catalog = await getCatalog(db, params('search=siege'));
        expect(catalog.games.map((g) => g.title)).toEqual(['Server Siege']);
        expect(catalog.total).toBe(ALL_TITLES.length);
    });

    it('does not count the search as a filter', async () => {
        const catalog = await getCatalog(db, params('search=server'));
        expect(catalog.filters.categoryIds).toEqual([]);
        expect(hasActiveFilters(catalog.filters)).toBe(false);
    });

    it.each([
        ['no search parameter', ''],
        ['an empty value', 'search='],
        ['a value of encoded spaces', 'search=%20%20'],
        ['a value of form-encoded spaces', 'search=+++'],
        ['a value of tabs and line breaks', 'search=%09%0A'],
    ])('returns the whole catalog, without search, for %s', async (_label, query) => {
        const catalog = await getCatalog(db, params(query));
        expect(catalog.games.map((g) => g.title)).toEqual(ALL_TITLES);
        expect(catalog.total).toBe(ALL_TITLES.length);
        expect(catalog.search).toBeNull();
    });

    it('drops the spaces around the search', async () => {
        const catalog = await getCatalog(db, params('search=++server+sim++'));
        expect(catalog.games.map((g) => g.title)).toEqual(['Virtual Server Simulator']);
        expect(catalog.search).toBe('server sim');
    });

    it('keeps only the first search value', async () => {
        const catalog = await getCatalog(db, params('search=siege&search=quest'));
        expect(catalog.games.map((g) => g.title)).toEqual(['Server Siege']);
        expect(catalog.search).toBe('siege');
    });

    it('keeps only the first search value, even when it is blank', async () => {
        const catalog = await getCatalog(db, params('search=+&search=quest'));
        expect(catalog.games.map((g) => g.title)).toEqual(ALL_TITLES);
        expect(catalog.search).toBeNull();
    });

    it('accepts a long search without error', async () => {
        const search = 'server '.repeat(1000).trim();
        const catalog = await getCatalog(db, params(new URLSearchParams({ search }).toString()));
        expect(catalog.games).toEqual([]);
        expect(catalog.search).toBe(search);
    });
});

describe('links that clear the search or the filters', () => {
    let db: Database;
    let seeded: SeededCatalog;

    beforeEach(async () => {
        db = await createTestDatabase();
        seeded = await seedCatalog(db);
    });

    it('drops every search value from the clear search link', async () => {
        const catalog = await getCatalog(db, params(`search=siege&category=${seeded.strategyId}&search=quest`));
        expect(catalog.clearSearchHref).toBe(`/?category=${seeded.strategyId}`);
    });

    it('keeps the chosen categories in the clear search link', async () => {
        const catalog = await getCatalog(
            db,
            params(`category=${seeded.strategyId}&search=server&category=${seeded.puzzleId}`),
        );
        expect(catalog.clearSearchHref).toBe(`/?category=${seeded.strategyId}&category=${seeded.puzzleId}`);
    });

    it('keeps the parameters of other features in the clear search link, untouched', async () => {
        const catalog = await getCatalog(db, params('search=server&sortProperty=rating&sortDirection=desc'));
        expect(catalog.clearSearchHref).toBe('/?sortProperty=rating&sortDirection=desc');
    });

    it('drops the empty parameters from the clear search link', async () => {
        const catalog = await getCatalog(db, params(`search=server&category=&category=${seeded.strategyId}&publisher=`));
        expect(catalog.clearSearchHref).toBe(`/?category=${seeded.strategyId}`);
    });

    it.each([
        ['only a search', 'search=server'],
        ['a search and empty parameters', 'search=siege&category=&search=quest'],
    ])('points the clear search link to the home page when nothing is left of %s', async (_label, query) => {
        const catalog = await getCatalog(db, params(query));
        expect(catalog.clearSearchHref).toBe('/');
    });

    it.each([
        ['no search parameter', ''],
        ['a blank search', 'search=++'],
    ])('points the clear filters link to the home page with %s', async (_label, query) => {
        const searchParams = params(query);
        searchParams.append('category', String(seeded.strategyId));
        const catalog = await getCatalog(db, searchParams);
        expect(catalog.clearFiltersHref).toBe('/');
    });

    it.each([
        ['a space', 'search=server+sim', '/?search=server+sim'],
        ['an ampersand', 'search=R%26D', '/?search=R%26D'],
        ['spaces around it, then a second value', 'search=++server+sim++&search=quest', '/?search=server+sim'],
    ])('keeps the search kept, encoded, in the clear filters link: a search with %s', async (_label, query, href) => {
        const searchParams = params(query);
        searchParams.append('category', String(seeded.strategyId));
        const catalog = await getCatalog(db, searchParams);
        expect(catalog.clearFiltersHref).toBe(href);
    });
});

describe('catalog searched without games', () => {
    it('returns no games and a total of zero when the catalog is empty', async () => {
        const db = await createTestDatabase();
        const catalog = await getCatalog(db, params('search=server'));
        expect(catalog.games).toEqual([]);
        expect(catalog.total).toBe(0);
        expect(catalog.search).toBe('server');
    });
});
