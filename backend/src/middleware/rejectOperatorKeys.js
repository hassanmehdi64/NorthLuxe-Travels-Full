/**
 * Rejects request bodies containing MongoDB operator keys ("$set", "$inc", "$where"…)
 * or prototype-pollution keys at any depth. Mongoose would otherwise apply operators
 * passed inside an update object (e.g. {"$set":{"role":"Admin"}}).
 */
const FORBIDDEN_KEYS = new Set(["__proto__", "constructor", "prototype"]);
const MAX_DEPTH = 32;

export const findForbiddenKey = (value, depth = 0) => {
  if (depth > MAX_DEPTH || value === null || typeof value !== "object") return null;
  for (const key of Object.keys(value)) {
    if (key.startsWith("$") || FORBIDDEN_KEYS.has(key)) return key;
    const nested = findForbiddenKey(value[key], depth + 1);
    if (nested) return nested;
  }
  return null;
};

export const rejectOperatorKeys = (req, res, next) => {
  const key = findForbiddenKey(req.body);
  if (key) {
    return res.status(400).json({ message: `Invalid field name in request: "${key}"` });
  }
  next();
};
