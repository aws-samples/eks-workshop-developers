# Docusaurus Maintenance Guide
This guide outlines the procedures for updating and maintaining the package dependencies for the EKS Developers Workshop website, which is built with [Docusaurus](https://docusaurus.io/).

## Updating Packages
To keep the project secure and up-to-date, follow these best practices:

### Regular Updates
- Use `npm outdated` to check for available updates for your packages.
- Update the packages in `package.json` using `npm update`.
- For major updates or specific versions, modify `package.json` directly.


### Handling Vulnerabilities
When notified of vulnerabilities:
1. Run `npm audit` to list vulnerabilities and assess their impact.
2. Use `npm audit fix` to automatically resolve compatible updates to vulnerable packages.
3. If automatic fixes fail, consider manual resolution or updating individual packages directly.


### Troubleshooting
If there are unresolved issues after running `npm audit fix`, you may need to manually clean up:
```bash
rm -rf node_modules package-lock.json
npm install
```
This removes the `node_modules` directory and the `package-lock.json` file, forcing a clean slate for your dependencies.

Docusaurus also provides a clear command to remove caches and build artifacts:
```bash
npm run clear
```
Output from the clear command should indicate the successful removal of cache and build directories:
```bash
[SUCCESS] Removed the Webpack persistent cache folder at "/path/to/your/project/node_modules/.cache".
[SUCCESS] Removed the build output folder at "/path/to/your/project/build".
[SUCCESS] Removed the generated folder at "/path/to/your/project/.docusaurus".
```
Sometimes after upgrading package versions in `package.json`, you’ll get an error. Run the following command to clean the cache:
```bash
npm cache clean --force
```

Sometimes you’ll get a dependency error for a package that isn’t listed in `package.json`. This is due to a peer dependency conflict, which is a transitive dependency (a dependency of a dependency) in our project. You can identify which package is requiring the dependency by running the following command, replacing `<package-causing-dependency-conflict>` with the package name:
```bash
npm ls <package-causing-dependency-conflict>
```

For example:
```bash
npm ls @microlink/react-json-view
```
Example:
```bash
website@0.0.0 /Users/leahtuck/docs/eks-workshop-developers/website
└─┬ @docusaurus/preset-classic@3.0.0
  └─┬ @docusaurus/plugin-debug@3.0.0
    └── @microlink/react-json-view@1.23.0
```

## Best Practices
- **Monitor Repositories**: Keep an eye on the [Docusaurus GitHub repository](https://github.com/facebook/docusaurus) for updates, especially regarding security patches and vulnerabilities.
- **Test Before Deployment**: Always test the website locally after updating dependencies to ensure that everything functions correctly.
- **Use Version Control**: Commit changes to package.json and package-lock.json after updates and document the reasons for significant updates or version pinning.
- **Stay Informed**: Subscribe to security bulletins and maintain a proactive stance on dependency management.
