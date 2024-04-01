import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Tsynamo',
  tagline: 'Type-friendly DynamoDB query builder',
  favicon: 'img/favicon.ico',

  // Set the production url of your site here
  url: 'https://tsynamo.dev',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'woltsu', // Usually your GitHub org/user name.
  projectName: 'tsynamo', // Usually your repo name.
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  onDuplicateRoutes: "warn",

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },
  plugins: ['docusaurus-plugin-sass'],
  presets: [
    [
      'classic',
      {
        docs: {
          routeBasePath: '/',
          sidebarPath: './sidebars.ts',
          breadcrumbs: true,
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/woltsu/tsynamo/www/docs/',
        },
        blog: false,
        pages: false,
        theme: {
          customCss: './src/css/custom.scss',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    colorMode: {
      defaultMode: 'light',
      disableSwitch: false,
      respectPrefersColorScheme: false,
    },
    // Replace with your project's social card
    image: 'img/docusaurus-social-card.jpg',
    navbar: {
      title: 'Tsynamo',
      logo: {
        alt: 'The logo has the DynamoDB logo on the left and the Typescript logo on the right with a red heart in between',
        src: 'img/logo.png',
        href: "/"
      },
      items: [
        {
          label: 'Playground',
          to:"https://try.tsynamo.dev/"
        },
        {
          to: '/getting-started',
          label: 'Quickstart',
        },
        {
          to: 'docs',
          label: 'Docs',
          activeBaseRegex: 'docs(/?)$',
        },
        {
          href: 'https://github.com/woltsu/tsynamo',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
