/**
 * Merge translations module - extracted functions
 */

const fs = require('fs');
const path = require('path');

const messagesDir = path.join(__dirname, '..', 'messages');
const templatePath = path.join(messagesDir, 'template.json');
const viPath = path.join(messagesDir, 'vi.json');
const enPath = path.join(messagesDir, 'en.json');

/**
 * Deeply merge two objects
 */
function deepMerge(target, source) {
  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key]) &&
          typeof target[key] === 'object' && target[key] !== null && !Array.isArray(target[key])) {
        target[key] = deepMerge(target[key], source[key]);
      } else {
        target[key] = source[key];
      }
    }
  }
  return target;
}

/**
 * Recursively find missing keys
 */
function findMissingKeys(targetObj, templateObj) {
  const missing = {};
  for (const key in templateObj) {
    if (templateObj.hasOwnProperty(key)) {
      if (typeof templateObj[key] === 'object' && templateObj[key] !== null && !Array.isArray(templateObj[key])) {
        if (!targetObj.hasOwnProperty(key) || typeof targetObj[key] !== 'object' || targetObj[key] === null) {
          missing[key] = templateObj[key];
        } else {
          const nestedMissing = findMissingKeys(targetObj[key], templateObj[key]);
          if (Object.keys(nestedMissing).length > 0) {
            missing[key] = nestedMissing;
          }
        }
      } else {
        if (!targetObj.hasOwnProperty(key)) {
          missing[key] = templateObj[key];
        }
      }
    }
  }
  return missing;
}

module.exports = { deepMerge, findMissingKeys };



