const { acquireReading } = require('./acquire-reading');
const { Reading } = require('./reading');

const rawReading = acquireReading();
const aReading = new Reading(rawReading);
const baseCharge = aReading.baseCharge;

console.log(`base charge is ${baseCharge}`);
