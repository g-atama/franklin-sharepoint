/* eslint-disable no-unused-vars */
// eslint-disable-next-line import/no-unresolved
import { html, render } from 'https://esm.sh/htm/preact/standalone';
// eslint-disable-next-line import/no-cycle
import { sampleRUM } from './aem.js';

// Core Web Vitals RUM collection
sampleRUM('cwv');

// add more delayed functionality here
