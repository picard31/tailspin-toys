/**
 * These interfaces describe the shape returned by the Drizzle data-access
 * helpers in `src/lib/` and consumed by Astro pages/components.
 */

/** Represents a game publisher (summary form used in listings). */
export interface Publisher {
    id: number;
    name: string;
}

/** Represents a game category (summary form used in listings). */
export interface Category {
    id: number;
    name: string;
}

/** Represents a game with its related category and publisher. */
export interface Game {
    id: number;
    title: string;
    description: string;
    publisher: Publisher | null;
    category: Category | null;
    starRating: number | null;
}

/** A publisher as shown on a game's page and on its own page: its `description` is null when there is nothing to show. */
export interface PublisherDetails extends Publisher {
    description: string | null;
}

/** A category as shown on a game's page: its `description` is null when there is nothing to show. */
export interface CategoryDetails extends Category {
    description: string | null;
}

/** A game as shown on its own page (`src/lib/game-details.ts`): its category and publisher carry their descriptions. */
export interface GameDetails extends Omit<Game, 'publisher' | 'category'> {
    publisher: PublisherDetails | null;
    category: CategoryDetails | null;
}
