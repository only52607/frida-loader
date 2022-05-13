import * as esbuild from "esbuild"
import { Device, DeviceType, getDevice, getLocalDevice, getRemoteDevice, getUsbDevice, Message, Session, TargetProcess } from "frida"
import type { Script } from "frida"
import { createInterface } from "readline"
import { WatchMode } from "esbuild"

export type DeviceId = string
export type DeviceSelector = DeviceType | DeviceId

export interface LoadOptions {
    entryFile: string,
    minify: boolean,
    noInject: boolean,
    noWatch: boolean,
    device?: DeviceSelector,
    targetProcess?: TargetProcess,
    spawnFile?: string
}

function waitingForDetach(session: Session) {
    createInterface({
        input: process.stdin,
        output: process.stdout
    }).on("close", () => {
        console.log("detaching session...")
        session.detach()
        console.log("process exit")
        process.exit()
    })
}

async function findDevice(deviceSelector: DeviceSelector) {
    const timeout = 1000
    switch(deviceSelector) {
        case "local": 
            return await getLocalDevice()
        case "remote": 
            return await getRemoteDevice()
        case "usb": 
            return await getUsbDevice({ timeout })
        default:
            return await getDevice(deviceSelector, { timeout })
    }
}

async function createScript(session: Session, code: string) {
    const script = await session.createScript(code)
    script.message.connect((message: any) => {
        switch(message.type) {
            case "error":
                console.error(`\x1b[31m ${message.stack} \x1b[0m`)
                break
            default:
            console.log(message)
        }
    })
    return script
}

export async function load(loadOptions: LoadOptions) {
    let onRebuild: WatchMode["onRebuild"]
    console.log(`initially building script...`)
    const buildResult = await esbuild.build({
        entryPoints: [loadOptions.entryFile],
        sourcemap: "inline",
        bundle: true,
        write: false,
        minify: loadOptions.minify,
        watch: !(loadOptions.noWatch) ? {
            onRebuild(error, result) {
                if (onRebuild) onRebuild(error, result)
            }
        }: undefined,
    })
    console.log(`build script finished`)
    if (loadOptions.noInject) process.exit()
    const deviceSelector = loadOptions.device
    if (!deviceSelector) throw Error("No device specified")
    const device: Device = await findDevice(deviceSelector)
    console.log(`found device ${device.name}`)
    const spawnFile = loadOptions.spawnFile
    let targetProcess: TargetProcess | undefined
    if (spawnFile) {
        console.log(`spawn ${spawnFile}...`)
        targetProcess = await device.spawn(spawnFile)
    } else {
        targetProcess = loadOptions.targetProcess
    }
    if (!targetProcess) throw Error("No process specified")
    console.log(`attaching ${targetProcess}...`)
    const session = await device.attach(targetProcess)
    const identity = `[${device.name}: ${loadOptions.targetProcess}]`
    console.log(`${identity} process attached, loading script`)
    let script: Script = await createScript(session, buildResult!!.outputFiles[0]?.text)
    await script.load()
    console.log(`${identity} initial load script finished, waiting for changes...`)
    onRebuild = async (error, result) => {
        if (error) {
            console.log(`${identity} rebuild script failed`)
            return 
        }
        console.log(`${identity} rebuild script finished, reloading...`)
        script.unload()
        script = await createScript(session, result!!.outputFiles!![0].text)
        await script.load()
        console.log(`${identity} reload script finished`)
    }
    waitingForDetach(session)
}