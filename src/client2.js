const { acquireReading } = require('./acquire-reading');
const { Reading } = require('./reading');
const { taxableChargeFn } = require('./tax-utils');

const rawReading = acquireReading();
const aReading = new Reading(rawReading);
const taxableCharge = taxableChargeFn(aReading);

console.log(`base charge is ${aReading.baseCharge}`);
console.log(`taxable charge is ${taxableCharge}`);
