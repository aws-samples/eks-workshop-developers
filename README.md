## EKS Developers Workshop

TODO: Fill this README out!

## Quickstart
This quickstart shows contributors how to set up and run documentation locally.

### Prerequisites
- [Node.js](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) (version 14.x or higher)
- [npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) (version 6.x or higher)

### Setup
1. [Fork](https://help.github.com/articles/fork-a-repo/) the **eks-workshop-developers** repository.
2. Clone the forked repository:
```bash
git clone https://github.com/your-gh-user-name/eks-workshop-developers.git
cd eks-workshop-developers/website
```

3. Run the following command to install the required dependencies.
```bash
npm install
```

4. Generate the static files for the documentation site:
```bash
npm run build
```
This command will create a `/build` directory.

5. To view the documentation site locally, run:
```bash
npm run serve
```
This will start a local development server. You will be redirected to documentation in your browser.

## Security

See [CONTRIBUTING](CONTRIBUTING.md#security-issue-notifications) for more information.

## License

This project is licensed under the Apache-2.0 License.

