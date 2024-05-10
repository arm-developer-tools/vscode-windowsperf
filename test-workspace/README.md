# Test workspace

WindowsPerf is a Windows only tool. This workspace allows to demo and test the extension's functionality on other platforms.

## How to use this?

### Rendering templates

A set of pre-recorded runs has been stored in `wperf-output/templates/` directory. Those templates have been generated on a Windows host and contain paths that need to be rewritten to correctly resolve to files on your filesystem.

To _render_ templates to the `wperf-output/rendered/` directory, run:

```sh
npm run prepare-test-workspace
```

### Template pre-requisites

Some templates require additional steps to be completely demoable. Usually, this will require cloning additional files into `test-workspace/`.

- `cpython-sample-output.json`

      git clone --depth 1 https://github.com/python/cpython

### Generating templates

This generally comprises of the following steps:

1. Run `wperf.exe record` and collect the JSON output. Flags such as `--json` and `--output` are helpful.
1. In the JSON output, replace the common filename prefix with `${WORKSPACE}` - this is going to
   become `<absolute-path-to>/test-workspace/` when templates are rendered.

   ```
   C:\\Users\\barmuc01\\Documents\\Dev\\windowsperf\\wperf-scripts\\tests\\cpython\\Objects\\longobject.c
   ```

   Should become:

   ```
   ${WORKSPACE}\\cpython\\Objects\\longobject.c
   ```

   ⚠️ This assumes that `cpython` will be cloned to `test-workspace/` as a pre-requisite.

1. Put the JSON file in `wperf-output/templates`.
1. Add pre-requisites if any to [section above](#template-pre-requisites).
