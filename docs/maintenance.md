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


### Manual Cleanup
If there are unresolved issues after running `npm audit fix`, you may need to manually clean up:
```bash
rm -rf node_modules package-lock.json
npm install
```
This removes the node_modules directory and the package-lock.json file, forcing a clean slate for your dependencies.

## Docusaurus Specific Commands
Docusaurus provides a clear command to remove caches and build artifacts:
```bash
npm run clear
```
Output from the clear command should indicate the successful removal of cache and build directories:
```bash
[SUCCESS] Removed the Webpack persistent cache folder at "/path/to/your/project/node_modules/.cache".
[SUCCESS] Removed the build output folder at "/path/to/your/project/build".
[SUCCESS] Removed the generated folder at "/path/to/your/project/.docusaurus".
```

## Best Practices
- **Monitor Repositories**: Keep an eye on the [Docusaurus GitHub repository](https://github.com/facebook/docusaurus) for updates, especially regarding security patches and vulnerabilities.
- **Test Before Deployment**: Always test the website locally after updating dependencies to ensure that everything functions correctly.
- **Use Version Control**: Commit changes to package.json and package-lock.json after updates and document the reasons for significant updates or version pinning.
- **Stay Informed**: Subscribe to security bulletins and maintain a proactive stance on dependency management.