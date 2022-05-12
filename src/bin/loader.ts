#!/usr/bin/env node
import { program } from "commander"
import { load } from "../builder"

program
    .version("1.0.0")
    .argument("<entry-file>")

    .option("-D, --device ID", "connect to device with the given ID")
    .option("-U, --usb", "connect to USB device")
    .option("-R, --remote", "connect to remote frida-server")
    .option("-H, --host <HOST>", "connect to remote frida-server on HOST")

    .option("-F, --attach-frontmost", "attach to frontmost application")
    .option("-n, --attach-name <NAME>", "attach to NAME")
    .option("-p, --attach-pid <PID>", "attach to PID")

    .option("-m, --minify", "minify output script", false)
    .option("-o, --output", "", "./dist/_agent.js")
    .option("-w, --watch", "watch for file changed", true)

    .action((entryFile: string) => {
        const options = program.opts()
        load({
            entryFile: entryFile,
            outputFile: options.output,
            targetProcess: options.attachPid ?? options.attachName,
            minify: options.minify,
            watch: options.watch
        })
    })
    
program.parse(process.argv)