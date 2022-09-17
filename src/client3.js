const { Reading } = require('./reading');
const { acquireReading } = require('./acquire-reading');

const rawReading = acquireReading();
const aReading = new Reading(rawReading);
const basicChargeAmount = aReading.baseCharge;

console.log(`basic charge amount is ${basicChargeAmount}`);
