/** `sortedValues` must already be sorted ascending. Linear interpolation between ranks. */
export function percentile(sortedValues: number[], p: number): number {
  if (sortedValues.length === 0) {
    throw new Error("percentile: cannot compute a percentile of an empty array");
  }
  if (sortedValues.length === 1) {
    return sortedValues[0];
  }

  const rank = (p / 100) * (sortedValues.length - 1);
  const lowerIndex = Math.floor(rank);
  const upperIndex = Math.ceil(rank);

  if (lowerIndex === upperIndex) {
    return sortedValues[lowerIndex];
  }

  const weight = rank - lowerIndex;
  return sortedValues[lowerIndex] * (1 - weight) + sortedValues[upperIndex] * weight;
}
