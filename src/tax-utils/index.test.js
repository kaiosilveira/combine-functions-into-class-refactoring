const {
  baseRate,
  RATES_BY_MONTH_AND_YEAR,
  taxThreshold,
  THRESHOLDS_BY_YEAR,
  taxableChargeFn,
} = require('.');

describe('tax-utils', () => {
  describe('baseRate', () => {
    it('should return the correct base rate', () => {
      expect(baseRate(5, 2017)).toEqual(RATES_BY_MONTH_AND_YEAR['5/2017']);
    });
  });

  describe('taxThreshold', () => {
    it('should return the correct tax threshold', () => {
      expect(taxThreshold(2017)).toEqual(THRESHOLDS_BY_YEAR[2017]);
    });
  });

  describe('taxableChargeFn', () => {
    it('should return zero if result is negative', () => {
      expect(taxableChargeFn({ baseCharge: 0, year: 2017 })).toEqual(0);
    });

    it('should calculate the correct taxable charge', () => {
      expect(taxableChargeFn({ baseCharge: 1, year: 2017 })).toEqual(0.5);
    });
  });
});
