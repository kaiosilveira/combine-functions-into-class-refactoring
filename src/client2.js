const { acquireReading } = require('./acquire-reading');
const { Reading } = require('./reading');
const { taxThreshold } = require('./tax-utils');

const rawReading = acquireReading();
const aReading = new Reading(rawReading);
const base = aReading.baseCharge;
const taxableCharge = Math.max(0, base - taxThreshold(aReading.year));

console.log(`base charge is ${base}`);
console.log(`taxable charge is ${taxableCharge}`);
