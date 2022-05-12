import * as esbuild from "esbuild"
import { getUsbDevice, TargetProcess } from "frida"
import type { Script } from "frida"
import { readFile } from "fs/promises"
import path from "path"
import { createInterface } from "readline"

interface LoadOptions {
    entryFile: string,
    outputFile: string,
    targetProcess: TargetProcess,
    minify: boolean,
    watch: boolean
}

export async function load(loadOptions: LoadOptions) {
    const device = await getUsbDevice({ timeout: 1000 })
    console.log(`found device ${device.name}`)
    console.log("attaching...")
    const session = await device.attach(loadOptions.targetProcess)
    process.stdout.clearLine(0);
    process.stdout.cursorTo(0);
    const identity = `[${device.name}: ${loadOptions.targetProcess}]`
    const outputFile = path.join(loadOptions.outputFile)
    let script: Script
    async function reloadScript() {
        if (script) await script.unload()
        const file = await readFile(outputFile)
        script = await session.createScript(file.toString())
        await script.load()
    }
    console.log(`${identity} building script to ${loadOptions.outputFile}`)
    const buildResult = await esbuild.build({
        entryPoints: [loadOptions.entryFile],
        outfile: loadOptions.outputFile,
        sourcemap: "inline",
        bundle: true,
        minify: loadOptions.minify ?? false,
        watch: loadOptions.watch ?? true ? {
            async onRebuild(error, result) {
                if (error) {
                    console.log(`${identity} rebuild script failed`)
                    throw error
                } else {
                    console.log(`${identity} rebuild script finished`)
                }
                await reloadScript()
                console.log(`${identity} reload script finished`)
            },
        } : undefined,
    })
    console.log(`${identity} build script finished, watching for changes...`)
    await reloadScript()
    console.log(`${identity} load script finished`)
    createInterface({
        input: process.stdin,
        output: process.stdout
    }).on("close", () => {
        session.detach()
        process.exit()
    })
}