/**
 * A filter id read from the URL, shared by every filter family. A bad value is dropped rather than
 * reported, so that an old or broken URL still shows a page.
 *
 * @param value - One raw value of a filter's URL parameter.
 * @returns The id, or `null` when the value is not a plain non-negative integer (empty,
 *   non-numeric, decimal, signed or too large).
 */
export function parseFilterId(value: string): number | null {
    if (!/^\d+$/.test(value)) {
        return null;
    }

    const id = Number(value);
    return Number.isSafeInteger(id) ? id : null;
}
