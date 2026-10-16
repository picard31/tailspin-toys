/**
 * A filter id read from the URL, or null when the value is not a plain
 * non-negative integer (empty, non-numeric, decimal, signed or too large).
 */
export function parseFilterId(value: string): number | null {
    if (!/^\d+$/.test(value)) {
        return null;
    }

    const id = Number(value);
    return Number.isSafeInteger(id) ? id : null;
}
