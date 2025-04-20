// memoizeHook.js
// A global cache for memoized values – you can reset or extend it as needed.
const globalMemoCache = {};

/**
 * A manual memoization hook.
 *
 * @param {string} key - A unique key for this memoization instance.
 * @param {Array} deps - An array of dependencies.
 * @param {Function} compute - A function that returns the computed value.
 *
 * @returns {*} The memoized computed value.
 */
export function useMemo(key, deps, compute) {
  // Retrieve any cached entry by key.
  const cachedEntry = globalMemoCache[key];

  // Check if we already have dependencies stored and they are equal to the current deps.
  if (cachedEntry && arrayEquals(cachedEntry.deps, deps)) {
    // Return the cached value without recomputing.
    return cachedEntry.value;
  }

  // Otherwise, compute the new value.
  const newValue = compute();
  // Store the new value and its dependency list in our global cache.
  globalMemoCache[key] = { deps: deps.slice(), value: newValue };
  return newValue;
}

/**
 * Helper function to compare two dependency arrays shallowly.
 *
 * @param {Array} arr1
 * @param {Array} arr2
 * @returns {boolean} True if both arrays are of equal length and each item is strictly equal.
 */
function arrayEquals(arr1, arr2) {
  if (!Array.isArray(arr1) || !Array.isArray(arr2)) return false;
  if (arr1.length !== arr2.length) return false;
  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) return false;
  }
  return true;
}
