import {
  render, html,
} from 'preact';
import { ProductDetails } from 'atama-shopify';

export function getHandleFromUrl() {
  const path = window.location.pathname;
  const result = path.match(/\/shopify-preact-fe\/([\w]+)$/);
  return result?.[1];
}

export default async function decorate($block) {
  $block.innerHTML = '<div></div>';

  const app = html`<${ProductDetails} handle=${getHandleFromUrl()} />`;

  render(app, $block);
}
