/* eslint-disable no-unused-vars */
export enum SupportedCurrency {
  USD = "USD",
  JPY = "JPY",
}
export enum SupportedRegion {
  NORTH_AMERICA = "NORTH_AMERICA",
  JAPAN = "JAPAN",
}
export type Pricing = {
  price: Price;
};
export type Price = {
  price: number;
  currency: SupportedCurrency;
};
