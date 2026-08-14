// The stories render plain markup against the real stylesheet — the same CSS
// the site ships. Nothing is re-implemented for Storybook, so a component
// cannot drift from its documentation.
import '../src/styles/main.css';
import { spriteMarkup } from '../src/icons/sprite.js';

// Inject the sprite once so <use href="#i-..."> resolves in every story.
if (typeof document !== 'undefined' && !document.getElementById('sb-sprite')) {
  const host = document.createElement('div');
  host.id = 'sb-sprite';
  host.innerHTML = spriteMarkup;
  document.body.appendChild(host);
}

/** @type {import('@storybook/html-vite').Preview} */
export default {
  globalTypes: {
    theme: {
      description: 'Colour scheme',
      defaultValue: 'light',
      toolbar: {
        title: 'Theme',
        icon: 'circlehollow',
        items: [
          { value: 'light', icon: 'sun', title: 'Light' },
          { value: 'dark', icon: 'moon', title: 'Dark' },
        ],
        dynamicTitle: true,
      },
    },
  },

  decorators: [
    (story, context) => {
      // Drive the real attribute the site uses, so dark mode is exercised
      // exactly as it is in production rather than approximated.
      document.documentElement.setAttribute('data-theme', context.globals.theme);
      document.body.style.background = 'var(--paper)';
      document.body.style.color = 'var(--ink)';
      document.body.style.padding = '24px';

      const wrap = document.createElement('div');
      const result = story();
      if (typeof result === 'string') wrap.innerHTML = result;
      else wrap.appendChild(result);
      return wrap;
    },
  ],

  parameters: {
    layout: 'fullscreen',
    controls: { expanded: true },
  },
};
