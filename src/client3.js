const { Reading } = require('./reading');
const { acquireReading } = require('./acquire-reading');
const { baseRate } = require('./tax-utils');

const rawReading = acquireReading();
const aReading = new Reading(rawReading);
const basicChargeAmount = calculateBaseCharge(aReading);

console.log(`basic charge amount is ${basicChargeAmount}`);

function calculateBaseCharge(aReading) {
  return baseRate(aReading.month, aReading.year) * aReading.quantity;
}
