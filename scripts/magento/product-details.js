import {
  html, useState, useEffect,
} from 'preact';

export default function ProductDetails(props) {
  const [product, setProduct] = useState(null);

  useEffect(async () => {
    const result = await fetch('https://magento.dev.atama.land/graphql', {
      method: 'POST',

      headers: {
        'Content-Type': 'application/json',
      },

      body: JSON.stringify({
        // eslint-disable-next-line no-use-before-define
        query: MAGENTO_PRODUCT_QUERY,
        variables: {
          handle: props.handle || 'atama-men-s-t-shirt',
        },
      }),
    });
    const productResult = await result.json();
    setProduct(productResult?.data?.products?.items?.[0]);
  }, []);

  return html`<div class="product-details">        
    ${product && html`    
    <h2>${product.name}</h2>
    <img src="${product?.image?.url}" alt="${product.name}" />
    <p>${product.description}</p>
    `}    
    </div>`;
}

const MAGENTO_PRODUCT_QUERY = `#graphql
query Products($handle: String!)
{
    products(filter: {
        url_key: {
            eq: $handle
        }
    }) {
        items {
            name
            url_key
            description {
                html
            }
            sku
            stock_status            
            image {
                url
            }
        }
    }
}

`;
