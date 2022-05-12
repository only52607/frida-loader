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

1. Install
```
npm install frida-loader --save-dev
```

2. Build script and attach process

```
frida-loader src/index.ts -U -n XXXX
```

3. Modify yout script and save it, and you'll see the script quickly compiled and reloaded


# Documentation

```



```