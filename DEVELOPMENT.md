# Development

## Prerequisites

-   Install VS Code.
-   Install Node JS (check the version of `@types/vscode` in [package.json](./package.json) for recommended version).
-   In order to install dependencies, you must have npm configured to access the Arm-Debug registry for packages that are scoped with @arm-debug. Add the following to your global .npmrc file:
    ```
    @arm-debug:registry=https://npm.pkg.github.com
    //npm.pkg.github.com/:_authToken=ghp_mytoken
    ```
    Replace `ghp_mytoken` with a GitHub token with the packages:read scope and SSO enabled for the Arm-Debug organisation.

## Running in Development Mode

1. Install the dependencies and build the extension:
    ```bash
    npm install
    ```
2. Watch for changes to source files:
    ```bash
    npm run watch
    ```
3. Open the repository in VS Code and run the "Run Extension" launch configuration (F5).

### Windows-on-Arm

Follow the instructions in the [WindowsPerf Install Guide](https://learn.arm.com/install-guides/wperf/). Notes:

-   Using --disassemble requires LLVM (scroll to the bottom of [wperf README.md](https://gitlab.com/Linaro/WindowsPerf/windowsperf/-/tree/main/wperf) to learn more).
-   If running wperf.exe errors "because publisher is unknown", right click the wperf.exe and in the properties set it to "open even if you don't trust the publisher".
-   You may see error message "CoCreateInstance failed for DIA" in case DIA SDK is not installed or registered as a COM service. (wperf's BUILD.md outlines how to register it)

Either add wperf to the PATH, or configure the `windowsPerf.wperfPath` setting. Set this to the absolute path to wperf in the extension development host, or add this to the [settings.json](./test-workspace/.vscode/settings.json):

```json
{
    "windowsPerf.wperfPath": "/path/to/repo/root/test-workspace/wperf.exe"
}
```

### Other Platforms

If you are not running on a Windows-on-Arm machine, you can use the [wperf](./test-workspace/wperf.js) script to simulate a real WindowsPerf installation. Configure the `windowsPerf.wperfPath` setting to the absolute path to wperf.js in the extension development host, or add this to the [settings.json](./test-workspace/.vscode/settings.json):

```json
{
    "windowsPerf.wperfPath": "/path/to/repo/root/test-workspace/wperf.js"
}
```
