const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

module.exports = {
  title: 'EKS Developers Workshop',
  tagline: 'Dinosaurs are cool',
  url: 'https://your-docusaurus-test-site.com',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',

  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl: 'https://github.com/aws-samples/eks-workshop-developers/website/',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }
    ],
  ],

  themeConfig: {
    navbar: {
      title: 'EKS Developers Workshop',
      logo: {
        alt: 'Amazon Web Services',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'doc',
          docId: 'intro/intro',
          position: 'left',
          label: 'Introduction',
        },
        {
          type: 'doc',
          docId: 'containers/containers',
          position: 'left',
          label: 'Containers',
        },
        {
          type: 'doc',
          docId: 'kubernetes/kubernetes',
          position: 'left',
          label: 'Kubernetes',
        },
        {
          type: 'doc',
          docId: 'eks/eks',
          position: 'left',
          label: 'EKS',
        },
        {
          href: 'https://github.com/aws-samples/eks-workshop-developers',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },      
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Community',
          items: [
            {
              label: 'Stack Overflow',
              href: 'https://stackoverflow.com/questions/tagged/docusaurus',
            },
            {
              label: 'Discord',
              href: 'https://discordapp.com/invite/docusaurus',
            },
            {
              label: 'Twitter',
              href: 'https://twitter.com/docusaurus',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/facebook/docusaurus',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} My Project, Inc. Built with Docusaurus.`,
    },
    prism: {
      theme: lightCodeTheme,
      darkTheme: darkCodeTheme,
    },
  }
};
