const { acquireReading } = require('./acquire-reading');
const { baseRate } = require('./tax-utils');

const aReading = acquireReading();
const basicChargeAmount = calculateBaseCharge(aReading);

console.log(`basic charge amount is ${basicChargeAmount}`);

function calculateBaseCharge(aReading) {
  return baseRate(aReading.month, aReading.year) * aReading.quantity;
}
