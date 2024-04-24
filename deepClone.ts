export function deepClone(obj: any) {
  if (
    typeof obj !== "object" ||
    obj === null ||
    obj instanceof Date ||
    obj instanceof ArrayBuffer ||
    obj instanceof FormData
  ) {
    return obj;
  } else {
    if (Array.isArray(obj)) {
      return obj.map(deepClone);
    } else {
      let obj2 = {};
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          obj2[key] = deepClone(obj[key]);
        }
      }
      return obj2;
    }
  }
}
