const template = document.createElement('template');
template.innerHTML = `
<div id="arc-product-card">
  <img id="thumbnail" src="" alt="" />
  <div class="info">
    <h4 id="product-title"></h4>
    <pre id="handle"></pre>
  </div>
  <div class="controls">
  <button id="copy-static" title="Content will be pasted directly into Google Doc or Word">
        Copy As Static Content
      </button>
      <button
        title="Content reference can be copied into doc. Content will be fetched for user on page load"
      >
        Copy As Dynamic Content
      </button>
      <button id="copy-server"
        title="Content will be fetched before the page is rendered and automatically included on the page"
      >
        Copy Server Include
      </button>
      </div>
</div>
`;

const blockTemplate = document.createElement('template');
blockTemplate.innerHTML = `
<table border="1" style="width: 100%">
<tr><th style="background: pink;"></th></tr>
<tr><td></td></tr>
</table>
`;

// Create a class for the element
class ArcProductCard extends HTMLElement {
  thumbnail = '';

  title = '';

  handle = '';

  system = 'magento';

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(template.content.cloneNode(true));
    this.copyStaticElement.onclick = this.copyClipboard;
    this.copyServerElement.onclick = this.copyClipboardServer;
  }

  copyClipboard = async () => {
    const thing = document.createElement('div');
    thing.append(blockTemplate.content.cloneNode(true));
    thing.querySelectorAll('th')[0].textContent = `${this.system}-product (${this.handle})`;
    thing.querySelectorAll('td')[0].textContent = `${this.title}`;

    const clipboardData = [new ClipboardItem({
      'text/html': new Blob([thing.innerHTML], { type: 'text/html' }),
    })];

    navigator.clipboard.write(clipboardData);
  };

  copyClipboardServer = async () => {
    const thing = document.createElement('div');
    thing.append(blockTemplate.content.cloneNode(true));
    thing.querySelectorAll('th')[0].textContent = `${this.system}-product (${this.handle}, server)`;
    thing.querySelectorAll('td')[0].textContent = `${this.title}`;

    const clipboardData = [new ClipboardItem({
      'text/html': new Blob([thing.innerHTML], { type: 'text/html' }),
    })];

    navigator.clipboard.write(clipboardData);
  };

  static get observedAttributes() {
    return ['thumbnail', 'title', 'handle', 'system'];
  }

  get rootElement() {
    return this.shadowRoot.getElementById('arc-product-card');
  }

  get thumbnailElement() {
    return this.shadowRoot.getElementById('thumbnail');
  }

  get copyStaticElement() {
    return this.shadowRoot.getElementById('copy-static');
  }

  get copyServerElement() {
    return this.shadowRoot.getElementById('copy-server');
  }

  get titleElement() {
    return this.shadowRoot.getElementById('product-title');
  }

  get handleElement() {
    return this.shadowRoot.getElementById('handle');
  }

  get systemElement() {
    return this.shadowRoot.getElementById('system');
  }

  setValues(show) {
    if (show) {
      this.rootElement.classList.add('show');
    }
    this.thumbnailElement.setAttribute('src', this.thumbnail);
    if (this.title) {
      this.thumbnailElement.setAttribute('alt', this.title);
    }
    this.titleElement.innerHTML = this.title;
    this.handleElement.innerHTML = this.handle;
  }

  connectedCallback() {
    this.thumbnail = this.getAttribute('thumbnail') || '';
    this.title = this.getAttribute('title') || '';
    this.handle = this.getAttribute('handle') || '';
    this.system = this.getAttribute('system') || '';

    // Create some CSS to apply to the shadow dom
    const style = document.createElement('style');

    style.textContent = `
      #arc-product-card {    
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;                      
        opacity: 0;
        transition: opacity 175ms ease-in, visibility 0ms ease-in 250ms;
        gap: 10px;
        padding: 1rem;
        border-radius: .2rem;
      }

      #arc-product-card.show {        
        opacity: 1;
      }

      h4, pre {
        line-height: 1em;
        padding: 0;
        margin: 0;
      }

      .controls {
        justify-content: space-evenly;                
        display:flex;
        flex-direction: column;
        gap: 5px;
      }

      #arc-product-card img {
        object-fit: contain;
        width: 100%;
      }

      .info {        
        display: flex;
        flex-direction: column;
        gap: 5px;        
      }
    `;

    this.shadowRoot.appendChild(style);

    this.setValues();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    switch (name) {
      case 'thumbnail':
        this.thumbnail = newValue;
        this.setValues(true);
        break;

      case 'handle':
        this.handle = newValue;
        this.setValues(true);
        break;

      case 'system':
        this.system = newValue;
        this.setValues(true);
        break;

      case 'title':
        this.title = newValue;
        this.setValues(true);
        break;

      default:
        break;
    }
  }
}

customElements.define('arc-product-card', ArcProductCard);
