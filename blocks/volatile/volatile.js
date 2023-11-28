/* eslint-disable no-console */
/* eslint-disable class-methods-use-this */

const template = document.createElement('template');
template.innerHTML = `
<div id="volatile">
  <div id="pricing"><span id="price"></span><span id="currency"></span></div>
  <div id="availability" ></div>
</div>
`;

// Create a class for the element
class ArcVolatileCommerceData extends HTMLElement {
  price = '';

  currency = '';

  available = false;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(template.content.cloneNode(true));
  }

  static get observedAttributes() {
    return ['price', 'currency', 'available'];
  }

  get priceElement() {
    return this.shadowRoot.getElementById('price');
  }

  get volatileElement() {
    return this.shadowRoot.getElementById('volatile');
  }

  get currencyElement() {
    return this.shadowRoot.getElementById('currency');
  }

  get availabilityElement() {
    return this.shadowRoot.getElementById('availability');
  }

  setValues(show) {
    if (show) {
      this.volatileElement.classList.add('show');
    }
    this.priceElement.innerHTML = this.price;
    this.availabilityElement.innerHTML = this.available ? 'Available' : 'Not available';
    this.currencyElement.innerHTML = this.currency;
  }

  connectedCallback() {
    this.price = this.getAttribute('price') || '...';
    this.currency = this.getAttribute('currency') || '...';
    this.available = this.getAttribute('available') || false;

    // Create some CSS to apply to the shadow dom
    const style = document.createElement('style');

    style.textContent = `
      #volatile {
        opacity: 0;
        transition: opacity 175ms ease-in, visibility 0ms ease-in 250ms;
      }

      #volatile.show {
        visibility: visible;
        opacity: 1;
      }
    `;

    this.shadowRoot.appendChild(style);

    this.setValues();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    switch (name) {
      case 'available':
        this.available = newValue;
        this.setValues(true);
        break;

      case 'price':
        this.price = newValue;
        this.setValues(true);
        break;

      case 'currency':
        this.currency = newValue;
        this.setValues(true);
        break;

      default:
        break;
    }
  }
}

customElements.define('arc-volatile-data', ArcVolatileCommerceData);

async function loadPrice(volatileDataDisplay) {
  // eslint-disable-next-line no-undef
  const slug = window.location.pathname.split('/').at(-1);
  const result = await fetch(`/_data/commerce/volatile/${slug}`);
  const volatileData = await result.json();

  // await new Promise((resolve) => setTimeout(resolve, 3000)).then(() => console.log('OK'));

  // const volatileData = {
  //   pricing: {
  //     price: '123',
  //     currency: 'asdf',

  //   },
  //   available: true,
  // };

  // console.log('volatileData', volatileData);

  // work
  volatileDataDisplay.setAttribute('price', volatileData.pricing.price);
  volatileDataDisplay.setAttribute('currency', volatileData.pricing.currency);
  volatileDataDisplay.setAttribute('available', volatileData.available);
}

export default async function decorate(block) {
  const volatileDataDisplay = document.createElement('arc-volatile-data');
  block.textContent = '';
  block.append(volatileDataDisplay);
  loadPrice(volatileDataDisplay);
}
