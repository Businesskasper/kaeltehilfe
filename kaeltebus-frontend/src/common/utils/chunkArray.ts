/**
 * Splits an array into chunks of the specified batch size.
 *
 * @param array - The array to be split into chunks.
 * @param batchSize - The size of each chunk.
 * @returns An array containing chunks of the original array, where each chunk has a maximum size of batchSize.
 *
 * @example
 * const array = [1, 2, 3, 4, 5, 6, 7];
 * const batchSize = 2;
 * const result = chunkArray(array, batchSize);
 * // result: [[1, 2], [3, 4], [5, 6], [7]]
 *
 * @example
 * const emptyArray = [];
 * const batchSize = 2;
 * const result = chunkArray(emptyArray, batchSize);
 * // result: []
 */
export function chunkArray<T>(array: T[], batchSize: number) {
  const chunks = [];
  for (let i = 0; i < array.length; i += batchSize) {
    chunks.push(array.slice(i, i + batchSize));
  }
  return chunks;
}
