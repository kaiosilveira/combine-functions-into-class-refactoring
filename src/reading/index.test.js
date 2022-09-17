jest.mock('../tax-utils');

const { Reading } = require('.');
const TaxUtils = require('../tax-utils');

describe('Reading', () => {
  it('should provide getters for quantity, customer, month and year', () => {
    const rawData = { customer: 'Ivan', quantity: 10, month: 5, year: 2017 };
    const reading = new Reading(rawData);

    expect(reading.customer).toEqual(rawData.customer);
    expect(reading.quantity).toEqual(rawData.quantity);
    expect(reading.month).toEqual(rawData.month);
    expect(reading.year).toEqual(rawData.year);
  });

  describe('calculateBaseCharge', () => {
    it('should calculate the base charge for a given reading', () => {
      const mockedBaseRate = 1;
      const rawData = { customer: 'Ivan', quantity: 10, month: 5, year: 2017 };

      jest.spyOn(TaxUtils, 'baseRate').mockReturnValue(mockedBaseRate);
      const reading = new Reading(rawData);

      expect(reading.baseCharge).toEqual(mockedBaseRate * reading.quantity);
    });
  });

  describe('taxableCharge', () => {
    it('should calculate the correct taxable charge', () => {
      jest.spyOn(TaxUtils, 'taxableChargeFn').mockReturnValue(0.5);

      const rawData = { customer: 'Ivan', quantity: 10, month: 5, year: 2017 };
      const reading = new Reading(rawData);

      expect(reading.taxableCharge).toEqual(0.5);
    });
  });
});
