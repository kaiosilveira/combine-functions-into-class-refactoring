const { baseRate, RATES_BY_MONTH_AND_YEAR, taxThreshold, THRESHOLDS_BY_YEAR } = require('.');

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
});
