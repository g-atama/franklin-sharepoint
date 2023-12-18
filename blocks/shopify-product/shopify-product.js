import {
  render, html,
} from 'preact';
import { ProductDetails } from 'atama-shopify';

export default async function decorate($block) {
  $block.innerHTML = '<div></div>';

  const app = html`<${ProductDetails} sku=${'abcdef'} />`;

  render(app, $block);
}
