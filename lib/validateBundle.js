const fs = require("fs");
const assert = require("assert");

module.exports = function validateBundle(bundle) {
  assert(typeof bundle.getPath === "function", new TypeError("Invalid bundle, getPath() method is missing"));

  try {
    const path = bundle.getPath();
    const stats = fs.statSync(path);
    const isDirectory = stats.isDirectory();
    assert(isDirectory, new TypeError("Invalid bundle, getPath() does not return a directory"));
  } catch (error) {
    throw new TypeError("Invalid bundle, getPath() does not return a directory");
  }

  return true;
};
