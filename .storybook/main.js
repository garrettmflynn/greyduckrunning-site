/** @type {import('@storybook/html-vite').StorybookConfig} */
export default {
  stories: ['../src/stories/**/*.mdx', '../src/stories/**/*.stories.js'],
  addons: ['@storybook/addon-docs'],
  framework: { name: '@storybook/html-vite', options: {} },
  staticDirs: ['../public'],
};
