import { APIGatewayProxyEventV2, Context } from "aws-lambda";

const fetchShopifyProduct = async (handle: string | undefined) => {
  const result = await fetch("https://mock.shop/api", {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      // eslint-disable-next-line no-use-before-define
      query: PRODUCT_QUERY,
      variables: {
        handle: handle || "men-crewneck",
        selectedOptions: [],
        language: "EN",
        country: "US",
      },
    }),
  });
  const productResult = await result.json();
  return productResult?.data?.product;
};

export const handler = async (
  // eslint-disable-next-line no-unused-vars
  event: APIGatewayProxyEventV2,
  // eslint-disable-next-line no-unused-vars
  context: Context
): Promise<any> => {
  const current = new Date();

  // todo: this would be pulled from environment variables likely
  const aemOrigin = "https://main--aftest--k-atama.hlx.live";

  const result = await fetch(`${aemOrigin}${event.rawPath}`);
  const htmlResult = await result.text();
  console.log(htmlResult);

  const pattern2 = new RegExp(
    /<div\s+class="shopify-product ([a-z0-9A-Z-]+) server">/g
  );
  const match2 = htmlResult.matchAll(pattern2);
  console.log(JSON.stringify(match2));

  const toFetch = [];

  for (const amatch of match2) {
    console.log("amatch", JSON.stringify(amatch));
    toFetch.push(amatch[1]);
  }

  console.log(toFetch);

  const promises = toFetch.map((handle) => fetchShopifyProduct(handle));

  const productData = await Promise.all(promises);

  console.log("PD", productData);

  const pattern: RegExp =
    /<div\s+class="shopify-product [a-z0-9A-Z-]+ server">/g;
  // const match: RegExpMatchArray | null = htmlResult.match(pattern);
  // console.log(JSON.stringify(match));

  let count = 0;
  let newHTML = htmlResult.replaceAll(pattern, () => {
    const productDataInline = `<div class="shopify-product-s ${productData[count].handle} server block">
      <div class="product-details">
      <h2>${productData[count].title}</h2>
      <img src="${productData[count].variants.nodes[0].image.url}" alt="${productData[count].title}" />
      <p>${productData[count].description}</p>
      </div>`;

    count++;
    return productDataInline;
  });

  return newHTML;
};

const PRODUCT_VARIANT_FRAGMENT = `#graphql
  fragment ProductVariant on ProductVariant {
    availableForSale
    compareAtPrice {
      amount
      currencyCode
    }
    id
    image {
      __typename
      id
      url
      altText
      width
      height
    }
    price {
      amount
      currencyCode
    }
    product {
      title
      handle
    }
    selectedOptions {
      name
      value
    }
    sku
    title
    unitPrice {
      amount
      currencyCode
    }
  }
`;

const PRODUCT_FRAGMENT = `#graphql
  fragment Product on Product {
    id
    title
    vendor
    handle
    descriptionHtml
    description
    options {
      name
      values
    }
    selectedVariant: variantBySelectedOptions(selectedOptions: $selectedOptions) {
      ...ProductVariant
    }
    variants(first: 1) {
      nodes {
        ...ProductVariant
      }
    }
    seo {
      description
      title
    }
  }
  ${PRODUCT_VARIANT_FRAGMENT}
`;

const PRODUCT_QUERY = `#graphql
  query Product(
    $country: CountryCode
    $handle: String!
    $language: LanguageCode
    $selectedOptions: [SelectedOptionInput!]!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      ...Product
    }
  }
  ${PRODUCT_FRAGMENT}
`;

const PRODUCT_VARIANTS_FRAGMENT = `#graphql
  fragment ProductVariants on Product {
    variants(first: 250) {
      nodes {
        ...ProductVariant
      }
    }
  }
  ${PRODUCT_VARIANT_FRAGMENT}
`;

const VARIANTS_QUERY = `#graphql
  ${PRODUCT_VARIANTS_FRAGMENT}
  query ProductVariants(
    $country: CountryCode
    $language: LanguageCode
    $handle: String!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      ...ProductVariants
    }
  }
`;
