const { acquireReading } = require('./acquire-reading');
const { baseRate, taxThreshold } = require('./tax-utils');

const aReading = acquireReading();
const base = baseRate(aReading.month, aReading.year) * aReading.quantity;
const taxableCharge = Math.max(0, base - taxThreshold(aReading.year));

console.log(`base charge is ${base}`);
console.log(`taxable charge is ${taxableCharge}`);
