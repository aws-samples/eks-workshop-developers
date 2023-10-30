const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');
const path = require('path');

module.exports = {
  title: 'EKS Developers Workshop',
  tagline: 'Dinosaurs are cool',
  url: 'https://your-docusaurus-test-site.com',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.png',
  organizationName: 'aws-samples',
  projectName: 'eks-workshop-developers',

  plugins: [
    // Redirect root to introduction page plugin
    function rootRedirectPlugin() {
      return {
        name: 'root-redirect-plugin',
        async postBuild({actions}) {
          actions.createRedirect({
            from: '/', // Base URL
            to: '/docs/introduction/', // Redirect to the introduction page
            isPermanent: true,
            redirectInBrowser: true,
          });
        },
      };
    },
  ],

  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl: 'https://github.com/aws-samples/eks-workshop-developers/tree/main/website',
          sidebarCollapsible: false,
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
          docId: 'introduction/index',
          position: 'left',
          label: 'Introduction',
        },
        {
          type: 'doc',
          docId: 'containers/index',
          position: 'left',
          label: 'Containers',
        },
        {
          type: 'doc',
          docId: 'kubernetes/index',
          position: 'left',
          label: 'Kubernetes',
        },
        {
          type: 'doc',
          docId: 'eks/index',
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
              label: 'GitHub',
              href: 'https://github.com/aws-samples/eks-workshop-developers',
            },
          ],
        },
        {
          title: 'Other',
          items: [
            {
              label: 'Site Terms',
              href: 'https://aws.amazon.com/terms/?nc1=f_pr',
            },
            {
              label: 'Privacy',
              href: 'https://aws.amazon.com/privacy/?nc1=f_pr',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()}, Amazon Web Services, Inc. or its affiliates. All rights reserved.`,
    },
    prism: {
      theme: lightCodeTheme,
      darkTheme: darkCodeTheme,
    },
  },
};
