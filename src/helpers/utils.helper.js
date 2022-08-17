module.exports = class Utils {
  static takeDiff(a, b, ignoreKeys = {}, diff = {}) {
    for (const key in a) {
      if (typeof a[key] === "object" && Array.isArray(a[key])) {
        if (a[key] && b[key]) {
          if (typeof a[key] === "object" && Array.isArray(a[key])) {
            diff[key] = Object.values(
              Utils.takeDiff(a[key], b[key], ignoreKeys, diff[key])
            );
          } else if (typeof a[key] === "object" && !Array.isArray(a[key])) {
            diff[key] = Utils.takeDiff(a[key], b[key], ignoreKeys, diff[key]);
          }
          if (diff[key] && !Object.values(diff[key]).length) {
            delete diff[key];
          }
        } else {
          diff[key] = a[key];
        }
      } else if (typeof a[key] === "object" && !Array.isArray(a[key])) {
        if (a[key] && b[key]) {
          diff[key] = Utils.takeDiff(a[key], b[key], ignoreKeys, diff[key]);
          if (!Object.values(diff[key]).length) {
            delete diff[key];
          }
        } else {
          diff[key] = a[key];
        }
      } else {
        if ((a[key] && !b[key]) || a[key] !== b[key] || ignoreKeys[key]) {
          diff[key] = a[key];
        }
      }
    }
    return diff;
  }
};
