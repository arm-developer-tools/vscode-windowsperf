# Schemas Directory

This directory is used to manage and compile [`wperf` JSON schemas](https://gitlab.com/Linaro/WindowsPerf/windowsperf/-/tree/main/wperf-scripts/tests/schemas) into TypeScript types. Below you'll find the details about the directory structure, usage, and some conventions we follow.

## Directory Structure

- `in/`: This subdirectory is designated for storing JSON schemas. Any new schemas that need to be converted into TypeScript types should be placed here.
- `out/`: This is where the TypeScript types, generated from the JSON schemas in the `in/` directory, are stored.

## Compiling Schemas

To compile the JSON schemas into TypeScript types, run the following command:

```sh
npm run compile-schemas
```

This command processes all the schemas located in the `in/` directory and outputs the `d.ts` files in the `out/` directory.

## Updating Schemas

When updating or adding new schemas in the `in/` directory, ensure to include a `$comment` field within each schema file. This field should contain a direct link to the schema's source, providing a reference for where the schema was sourced and its version.

Example of a `$comment` field:

```json
{
  "$comment": "Source: https://gitlab.com/Linaro/WindowsPerf/28d635d9a1/schemas/wperf.sample.schema"
}
```
