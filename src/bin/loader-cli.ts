#!/usr/bin/env node

import { program } from "commander"
import { DeviceSelector, load } from "../loader"

program
    .version(require("../../package.json").version)
    .argument("<entry-file>")

    .option("-D, --device ID", "connect to device with the given ID")
    .option("-U, --usb", "connect to USB device")
    .option("-R, --remote", "connect to remote frida-server")
    
    .option("-f , --file <TARGET>", "spawn FILE")
    .option("-F, --attach-frontmost", "attach to frontmost application")
    .option("-n, --attach-name <NAME>", "attach to NAME")
    .option("-p, --attach-pid <PID>", "attach to PID")

    .option("-m, --minify", "minify output script")
    .option("--no-watch", "do not watch for file changed", false)
    .option("--no-inject", "do not inject to process", false)

    .action((entryFile: string) => {
        const options = program.opts()
        let device: DeviceSelector = "local"
        if (options.remote) {
            device = "remote"
        } else if (options.usb) {
            device = "usb"
        }
        load({
            entryFile: entryFile,
            targetProcess: options.attachPid ?? options.attachName,
            minify: options.minify,
            noInject: options.noInject,
            noWatch: options.noWatch,
            device,
            spawnFile: options.file
        })
    })
    
program.parse(process.argv)