const ONLY_ARR_ACCESSORS_REGEX = /[^\[\]\d]+/g;
const ALL_BUT_ARR_ACCESSORS_REGEX = /\[\d+\]/g;

export const getExpressionAttributeNameFrom = (path: string) => {
  return path
    .split(".")
    .map((nestedAttribute) => {
      return `#${nestedAttribute}`;
    })
    .join(".");
};

export const getAttributeNameFrom = (path: string) => {
  return path
    .replaceAll(ALL_BUT_ARR_ACCESSORS_REGEX, "")
    .split(".")
    .map((attributeName) => {
      return [`#${attributeName}`, attributeName];
    });
};

export function mergeObjectIntoMap<K extends string, V>(
  map: Map<K, V>,
  obj: Record<K, V>
) {
  for (const key in obj) {
    map.set(key, obj[key]);
  }
}
