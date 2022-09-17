const { acquireReading } = require('./acquire-reading');
const { Reading } = require('./reading');
const { taxThreshold } = require('./tax-utils');

const rawReading = acquireReading();
const aReading = new Reading(rawReading);
const taxableCharge = Math.max(0, aReading.baseCharge - taxThreshold(aReading.year));

console.log(`base charge is ${aReading.baseCharge}`);
console.log(`taxable charge is ${taxableCharge}`);
