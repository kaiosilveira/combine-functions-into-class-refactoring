const RATES_BY_MONTH_AND_YEAR = {
  '1/2017': 0.2,
  '2/2017': 0.2,
  '3/2017': 0.2,
  '4/2017': 0.2,
  '5/2017': 0.2,
  '6/2017': 0.2,
  '7/2017': 0.2,
  '8/2017': 0.2,
  '9/2017': 0.2,
  '10/2017': 0.2,
  '11/2017': 0.2,
  '12/2017': 0.2,
};

const THRESHOLDS_BY_YEAR = {
  2017: 0.5,
};

function baseRate(month, year) {
  return RATES_BY_MONTH_AND_YEAR[`${month}/${year}`];
}

function taxThreshold(year) {
  return THRESHOLDS_BY_YEAR[year];
}

function taxableChargeFn(aReading) {
  return Math.max(0, aReading.baseCharge - taxThreshold(aReading.year));
}

module.exports = {
  baseRate,
  taxThreshold,
  taxableChargeFn,
  RATES_BY_MONTH_AND_YEAR,
  THRESHOLDS_BY_YEAR,
};
