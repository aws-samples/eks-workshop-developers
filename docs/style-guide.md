# Documentation Style Guide for Contributors
This guide provides the minimum writing style guidelines for contributors of the EKS Developers Workshop documentation.

## Labs
A lab exercise must have the following components.

```
# <Page Title>
## Objective
What will the user accomplish in the lab?

## Prerequisites
What must the user do before getting started with the lab?

## <#>. <Section Heading>

## Conclusion
What did users learn in the lab?
```

## Syntax
### H1 Headings for Page Titles
Always use &lt;Verb&gt;-ing for H1 page title headings.
- **Do**: Monitoring Kubernetes Resources Using the Dashboard

### H2 Headings for Sections
Always use a number &lt;#&gt; + &lt;Verb&gt;-ing for H2 section headings.
- **Do**: Logging into Amazon ECR

### H3 Headings for Sub-sections
Use &lt;Verb&gt; for H3 section headings as needed to distinguish large sections.
- **Do**: Create the Service Account

### Kubernetes API Object Names
Always use UpperCamelCase when referring to an API object.
- **Do**: Generate the Kubernetes ConfigMap

### Sample Output
Always show users what the sample output should be after running a command or deploying resources.
- **Do**: The expected output should look like this:

```
sample output
```

### File Names
Always use code style for file names.
- **Do**: Open the `.env` file.

### Commands
Always use a colon for descriptions that precede a command. And never include the command prompt as part of the command.
- **Do**: Push the tagged image to your Amazon ECR repository:

```
command
```

### External Links
Always provide the full page title and sufficient context of any hyperlinks that direct users outside the workshop.
- **Do**: To learn more, see [Amazon EKS security group requirements and considerations](https://docs.aws.amazon.com/eks/latest/userguide/sec-group-reqs.html) in EKS documentation.


