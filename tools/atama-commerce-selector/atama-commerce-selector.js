function debounce(fn, delay) {
  let timer = null;
  // eslint-disable-next-line func-names
  return function (...rest) {
    const context = this; const
      args = rest;
    clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(context, args);
    }, delay);
  };
}

const SHOPIFY_ENDPOINT = 'https://mock.shop/api';

async function fetchResults(term) {
  const result = await fetch(SHOPIFY_ENDPOINT, {
    method: 'POST',

    headers: {
      'Content-Type': 'application/json',
    },

    body: JSON.stringify({
      // eslint-disable-next-line no-use-before-define
      query: PRODUCT_SEARCH,
      variables: {
        term,
      },
    }),
  });
  const productResult = await result.json();
  const cardsContainer = document.getElementById('cards');
  cardsContainer.textContent = '';
  productResult?.data?.products?.edges?.forEach((product) => {
    const card = document.createElement('arc-product-card');
    cardsContainer.append(card);
    card.setAttribute('title', product.node.title);
    card.setAttribute('handle', product.node.handle);
    card.setAttribute('thumbnail', product?.node?.images?.edges?.[0]?.node?.url);
  });
}

async function init() {
  const search = document.getElementById('catalog-search');
  search.onkeyup = debounce((event) => {
    fetchResults(event.target.value);
  }, 500);
}

init();

const PRODUCT_SEARCH = `#graphql
    query ProductSearch(    
    $term: String!    
  ) {
    products(first: 10, query: $term) {
      edges {
        node {
          title
          handle
          description
          id
          images(first: 1) {
          edges {
            node {
              url
            }
          }
        }
        }
      }
    }
  }
`;

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
