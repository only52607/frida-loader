# frida-loader

A faster frida-compile to bundle and inject script

## Difference between frida-loader and frida-compile

They are both tools for building bundled scripts for frida, but frida-loader has a much faster compile speed with the help of [esbuild](https://github.com/evanw/esbuild).

In addition, frida-loader integrates with frida and supports direct injection of built scripts into the process. (No longer need Python)

## Feature

- Bundle script and inject to process with extremely speed
- Typescript support
- Watch for file changes and hot reload

## Usage

### Add to an existing project

1. Install
```
npm install frida-loader --save-dev
```

2. Add a build script to your package.json file like this, then change `PROCESS` to your process name and change `src/index.ts` to your entry script, see [Documentation](#Documentation) for more details
```
{
  "scripts": {
    "build": "frida-loader src/index.ts -U -n PROCESS"
  }
}
```

3. Make sure frida-server and target processes are running, then run
```
npm run launch
```

4. Modify yout script and save it, and you'll see the script quickly reloaded

> You can also try it on [example](https://github.com/only52607/frida-loader/tree/master/example)

# Documentation

```
Usage: loader-cli [options] <entry-file>

Options:
  -V, --version             output the version number
  -D, --device ID           connect to device with the given ID
  -U, --usb                 connect to USB device
  -R, --remote              connect to remote frida-server
  -f , --file <TARGET>      spawn FILE
  -F, --attach-frontmost    attach to frontmost application (default: false)
  -n, --attach-name <NAME>  attach to NAME
  -p, --attach-pid <PID>    attach to PID
  -m, --minify              minify output script
  --no-watch                do not watch for file changed
  --no-inject               do not inject to process
  -h, --help                display help for command
```