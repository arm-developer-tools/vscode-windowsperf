# WindowsPerf

WindowsPerf is a Visual Studio Code extension that integrates the [WindowsPerf](https://gitlab.com/Linaro/WindowsPerf/windowsperf) Windows on Arm performance profiling tool. It provides you with a simple way of viewing the results of a run of the [wperf](https://gitlab.com/Linaro/WindowsPerf/windowsperf/-/blob/main/wperf/README.md?ref_type=heads) command line tool.

![WindowsPerf Sampling Results Explorer showing hotspot highlighting](docs/winperf.png)

You can use the WindowsPerf extension to optimize for performance on Windows on Arm. WindowsPerf uses a top-down performance analysis methodology that enables you to start with more general performance counters and then drill down into the microarchitecture to find lines in the code that correspond to events, run hotspot analysis, and view code disassembly.

## Before you begin

Before you start using the WindowsPerf extension, you must install the WindowsPerf command-line tool and the kernel driver. Follow the instructions in the [WindowsPerf Install Guide](https://learn.arm.com/install-guides/wperf/).

## Installation

The WindowsPerf extension is available as a `.vsix` file. To install it in Visual Studio Code, follow the instructions in [Install from a VSIX](https://code.visualstudio.com/docs/editor/extension-marketplace#_install-from-a-vsix).

## Usage

To use the WindowsPerf Sampling Results Explorer:

1. Run `wperf record --annotate --disassemble --json` from the command line to capture events in a JSON file.
2. In Visual Studio Code, click ![VS Code toggle panel icon](docs/toggle-panel.png) or select **View: Toggle WindowsPerf** in the Command Palette to open the **WindowsPerf** tab.
3. In the **WindowsPerf** tab, click **Open File**. Navigate to the location of your JSON file, select the file, and then click **Open**. The WindowsPerf tree view opens.
4. For each file in your code, the tree view shows the line where the issue is and the number of times that a particular counter was hit. Every event has an entry in the tree view. Click the arrows next to an entry to drill down into individual functions.
5. Click a line in the tree view to open that file. Lines of code with event hits are colour-coded to enable you to perform hotspot analysis.
6. Move your mouse over a highlighted line to see the disassembly view. The disassembly view shows you the number of hits for the specific event, the instructions for the function, and the performance metrics for each instruction.

![WindowsPerf code disassembly view](/docs/disassembly-view.png)

## Telemetry

This extension collects usage telemetry and sends it to Arm to help improve our products. An example of such data includes when a recording is started, containing what the arguments are, events listening for, and erroneous results, but not containing any file names or locations.

This extension respects the Visual Studio Code telemetry settings described in the [Visual Studio Code](https://code.visualstudio.com/docs/getstarted/telemetry#_disable-telemetry-reporting) documentation. Modify telemetry options in the settings menu.

## Additional information

-   Arm Community [blog post on performance analysis methodology](https://community.arm.com/arm-community-blogs/b/infrastructure-solutions-blog/posts/arm-neoverse-n1-performance-analysis-methodology), including links to a complete list of Performance Monitoring Unit (PMU) events
-   [WindowsPerf command-line tool documentation](https://gitlab.com/Linaro/WindowsPerf/windowsperf/-/blob/main/wperf/README.md?ref_type=heads)
