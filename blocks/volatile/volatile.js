/* eslint-disable no-console */
/* eslint-disable class-methods-use-this */
// Create a class for the element
class ArcVolatileCommerceData extends HTMLElement {
  connectedCallback() {
    // Create a shadow root
    const shadow = this.attachShadow({ mode: 'open' });

    // Create spans
    const wrapper = document.createElement('span');
    wrapper.setAttribute('class', 'wrapper');

    const priceInfo = document.createElement('p');
    priceInfo.setAttribute('class', 'price');
    const price = this.getAttribute('data-price');
    const currency = this.getAttribute('data-currency');
    priceInfo.textContent = `Price is ${currency}${price}`;

    const availabilityInfo = document.createElement('p');
    availabilityInfo.setAttribute('class', 'availability');
    const availability = this.getAttribute('data-available');
    availabilityInfo.textContent = `The product is ${availability === 'true' ? '' : 'not '}available`;

    // Create some CSS to apply to the shadow dom
    const style = document.createElement('style');

    style.textContent = `
     
    `;

    // Attach the created elements to the shadow dom
    shadow.appendChild(style);
    shadow.appendChild(wrapper);
    wrapper.appendChild(priceInfo);
    wrapper.appendChild(availabilityInfo);
  }

  attributeChangedCallback(name, oldValue, newValue) {
    console.log(
      `Attribute ${name} has changed from ${oldValue} to ${newValue}.`,
    );
  }
}

customElements.define('arc-volatile-data', ArcVolatileCommerceData);

export default async function decorate(block) {
  // eslint-disable-next-line no-undef
  const slug = window.location.pathname.split('/').at(-1);
  try {
    const result = await fetch(`/data/commerce/volatile/${slug}`);
    const volatileData = await result.json();

    console.log('volatileData', volatileData);

    const volatileDataDisplay = document.createElement('arc-volatile-data');
    // work
    volatileDataDisplay.setAttribute('data-price', volatileData.pricing.price);
    volatileDataDisplay.setAttribute('data-currency', volatileData.pricing.currency);
    volatileDataDisplay.setAttribute('data-available', volatileData.available);
    block.textContent = '';
    block.append(volatileDataDisplay);
  } catch (error) {
    console.log('could not fetch data', error);
  }
}
