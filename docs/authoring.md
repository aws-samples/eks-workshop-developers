# Authoring Guide for Contributors
This guide provides instructions for setting up and running Docusaurus for contributors to the EKS Developers Workshop documentation. It includes steps to create a fork, manage branches, and best practices for contributing.

## Setting Up Docusaurus
Before you can start contributing to the documentation, you need to set up Docusaurus locally. Follow these steps:

### Prerequisites
- Install [Node.js](https://nodejs.org/) (version >= 14.0.0).
- Install [Yarn](https://yarnpkg.com/) (optional but recommended).


### Fork the Repository
1. Go to the [eks-workshop-developers](https://github.com/aws-samples/eks-workshop-developers) repository on GitHub.
2. Click on the "Fork" button in the upper right corner to create a copy of the repository in your GitHub account.


### Clone Your Fork
Clone your forked repository to your local machine:
```bash
git clone https://github.com/YOUR-USERNAME/eks-workshop-developers.git
cd eks-workshop-developers
```
Replace `YOUR-USERNAME` with your actual GitHub username.

### Install Dependencies
Navigate to the website directory and install the required dependencies:
```bash
cd website
npm install
```
Or if you're using Yarn:
```bash
yarn install
```

### Run Docusaurus Locally
Start the development server:
```bash
npm start
```
Or with Yarn:
```bash
yarn start
```
These commands start a local development server and open up a browser window. Most changes are reflected live without having to restart the server.

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