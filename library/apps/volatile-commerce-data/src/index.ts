import { APIGatewayProxyEventV2, Context } from "aws-lambda";
import { Price, SupportedCurrency, SupportedRegion } from "./types";

export const handler = async (
  // eslint-disable-next-line no-unused-vars
  event: APIGatewayProxyEventV2,
  // eslint-disable-next-line no-unused-vars
  context: Context
): Promise<{
  updatedAtEpoch: number;
  pricing: Price;
  available: boolean;
  debug: string;
}> => {
  const current = new Date();

  // todo: in a real implementation an identifier would likely be pulled from the event and
  //        used to lookup data from a commerce system.

  // this is just to generate some changes in pricing so something looks like it's changing
  const randomModifier = (originalPrice: number, stepSize: number): number => {
    return (
      Math.round(
        ((Math.ceil(Math.random() * 2) === 1 ? -1 : 1) *
          (Math.ceil(Math.random() * 20) * stepSize) +
          originalPrice) *
          100
      ) / 100
    );
  };

  // We are going to simulate pricing that is region specific, with independent currency display
  // e.g. a person may be in the NA USA region and have a product price be set for this region, but
  // may still desire to have their pricing specified in JPY for whatever reason.
  const priceLookupTable: Record<
    SupportedRegion,
    Record<SupportedCurrency, { price: number; currency: SupportedCurrency }>
  > = {
    [SupportedRegion.NORTH_AMERICA]: {
      [SupportedCurrency.USD]: {
        price: randomModifier(9.99, 0.05),
        currency: SupportedCurrency.USD,
      },
      [SupportedCurrency.JPY]: {
        price: randomModifier(1488, 5),
        currency: SupportedCurrency.JPY,
      },
    },
    [SupportedRegion.JAPAN]: {
      [SupportedCurrency.USD]: {
        price: randomModifier(11.74, 0.05),
        currency: SupportedCurrency.USD,
      },
      [SupportedCurrency.JPY]: {
        price: randomModifier(1750, 5),
        currency: SupportedCurrency.JPY,
      },
    },
  };

  // todo: note that we would need to make sure these headers were taken into account for cache policy
  const region =
    event.headers["x-accept-region"] === "japan"
      ? SupportedRegion.JAPAN
      : SupportedRegion.NORTH_AMERICA;
  const currency =
    event.headers["x-accept-currency"] === "jpy"
      ? SupportedCurrency.JPY
      : SupportedCurrency.USD;

  return {
    updatedAtEpoch: current.getTime(),
    pricing: {
      ...priceLookupTable[region][currency],
    },
    available: Math.random() < 0.8 ? true : false,
    debug: JSON.stringify(event.headers),
  };
};
