const { Reading } = require('.');

describe('Reading', () => {
  it('should provide getters for quantity, customer, month and year', () => {
    const rawData = { customer: 'Ivan', quantity: 10, month: 5, year: 2017 };
    const reading = new Reading(rawData);

    expect(reading.customer).toEqual(rawData.customer);
    expect(reading.quantity).toEqual(rawData.quantity);
    expect(reading.month).toEqual(rawData.month);
    expect(reading.year).toEqual(rawData.year);
  });
});
