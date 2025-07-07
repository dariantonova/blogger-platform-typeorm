import { unixToDate } from '../date.util';

describe('unixToDate', () => {
  it('should covert unix timestamp to correct Date object', () => {
    const date = unixToDate(0);
    expect(date.toISOString()).toBe('1970-01-01T00:00:00.000Z');
  });

  it('should convert future unix timestamp correctly', () => {
    const futureUnix = 3502915200;
    const date = unixToDate(futureUnix);
    expect(date.toISOString()).toBe('2081-01-01T00:00:00.000Z');
  });

  it('should convert past unix timestamp correctly', () => {
    const pastUnix = 946684800;
    const date = unixToDate(pastUnix);
    expect(date.toISOString()).toBe('2000-01-01T00:00:00.000Z');
  });

  it('should handle negative unix timestamp', () => {
    const date = unixToDate(-1);
    expect(date.toISOString()).toBe('1969-12-31T23:59:59.000Z');
  });
});
