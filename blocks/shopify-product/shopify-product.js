import {
  render, html,
} from 'preact';
import { ProductDetails } from 'atama-shopify';

function getHandleFromUrl() {
  const path = window.location.pathname;
  const result = path.match(/\/shopify-preact-fe\/([\w]+)$/);
  return result?.[1];
}

/**
 *
 * @param {HTMLDivElement} $block
 */
function getHandleFromClass($block) {
  return $block.classList[1];
}

function getHandleFromContent($block) {
  return $block.querySelectorAll('div > div > div')?.[0]?.textContent.trim().toLowerCase();
}

export default async function decorate($block) {
  $block.innerHTML = '<div></div>';

  const app = html`<${ProductDetails} handle=${getHandleFromUrl() || getHandleFromContent($block) || getHandleFromClass($block)} />`;

  render(app, $block);
}
