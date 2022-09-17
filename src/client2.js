const { acquireReading } = require('./acquire-reading');
const { Reading } = require('./reading');

const rawReading = acquireReading();
const aReading = new Reading(rawReading);
const taxableCharge = aReading.taxableCharge;

console.log(`base charge is ${aReading.baseCharge}`);
console.log(`taxable charge is ${taxableCharge}`);
