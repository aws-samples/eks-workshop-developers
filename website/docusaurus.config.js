/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */
const lightCodeTheme = require('prism-react-renderer').themes.github;
const darkCodeTheme = require('prism-react-renderer').themes.dracula;
const path = require('path');

// Cloudflare Web Analytics beacon token, provided via environment variable
// (set CF_BEACON_TOKEN in the Amplify build environment). The beacon is only
// injected when the token is present, so no token is hardcoded in source.
const cfBeaconToken = process.env.CF_BEACON_TOKEN;

module.exports = {
  scripts: cfBeaconToken
    ? [
        {
          src: 'https://static.cloudflareinsights.com/beacon.min.js',
          defer: true,
          'data-cf-beacon': JSON.stringify({ token: cfBeaconToken }),
        },
      ]
    : [],
  title: 'EKS Developers Workshop',
  tagline: 'Dinosaurs are cool',
  url: 'https://your-docusaurus-test-site.com',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.png',
  organizationName: 'aws-samples',
  projectName: 'eks-workshop-developers',

  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl: 'https://github.com/aws-samples/eks-workshop-developers/tree/main/website',
          sidebarCollapsible: true,
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
          docId: 'python/index',
          position: 'left',
          label: 'Python',
        },
        {
          type: 'doc',
          docId: 'java/index',
          position: 'left',
          label: 'Java',
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
