# Authoring Guide for Contributors
This guide provides instructions for setting up and running [Docusaurus](https://docusaurus.io/) for contributors to the EKS Developers Workshop documentation. It includes steps to create a fork, manage branches, and best practices for contributing.

### Prerequisites
- [Node.js](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) (version 16.x or higher)
- [npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) (version 8.x or higher)

### Setup
Before you can start contributing to the documentation, you need to set up Docusaurus locally. 
1. [Fork](https://help.github.com/articles/fork-a-repo/) the **eks-workshop-developers** repository.
2. Clone the forked repository:
```bash
git clone https://github.com/your-gh-user-name/eks-workshop-developers.git
cd eks-workshop-developers/website
```

1. Run the following command to install the required dependencies.
```bash
npm install
```

1. Generate the static files for the documentation site:
```bash
npm run build
```
This command will create a `/build` directory.

1. To view the documentation site locally, run:
```bash
npm run serve
```
This will start a local development server. You will be redirected to documentation in your browser. Most changes are reflected live without having to restart the server.

## Contributing
When you're ready to contribute to the documentation, follow these steps:

### Create a Feature Branch
From your forked repository, create a new branch for your feature or fix:
```bash
git checkout -b feature/your-feature-name
```
Replace `your-feature-name` with a descriptive name for your feature.

### Make Your Changes
- Make changes to the content or documentation as needed.
- Add or update markdown files within the docs directory.
- Follow [Markdown Syntax](https://www.markdownguide.org/basic-syntax/) and [Docusaurus Syntax](https://docusaurus.io/docs) to format your documentation.


### Test Your Changes
- Ensure your changes are working as expected.
- Run the development server to preview the changes.


### Commit Your Changes
Stage your changes and commit them with a meaningful message:
```bash
git add .
git commit -m "Add a meaningful description of your changes"
```

### Push to GitHub
Push your feature branch to your forked repository:
```bash
git push origin feature/your-feature-name
```

### Create a Pull Request
- Go to your forked repository on GitHub and click "Pull request" to open a new pull request against our repository.

## Best Practices
- **Keep Documentation Clear**: Write clear, concise, and well-organized documentation.
- **Branch Naming**: Use descriptive branch names like feature/add-install-guide or fix/typo-in-docs.
- **Commit Messages**: Write meaningful commit messages that describe what the commit accomplishes.
- **Pull Request Descriptions**: In your pull request, include a detailed description of your changes and link to any relevant issues.
- **Stay Updated**: Regularly pull the latest changes from the upstream repository to keep your fork up-to-date.
- **Respect Guidelines**: Adhere to any contribution guidelines provided by the project maintainers.
## Getting Help
If you have any questions or need assistance, don't hesitate to ask for help by opening an issue on the GitHub repository. The community and maintainers are here to help!

Thank you for contributing to the EKS Developers Workshop documentation!
