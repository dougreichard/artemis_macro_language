const { MissionFile } = require('./lib/mission-file.js')
const fs = require("fs")
const path = require("path")
const commandLineArgs = require('command-line-args')
const commandLineUsage = require('command-line-usage')
const chalk = require('chalk')
const child_process = require('child_process')


// Nice generator: http://patorjk.com/software/taag/#p=display&h=0&v=0&f=Letters&t=Artemis%0A%0A
let gg =
  `
AAAAAA         tt                       iii       
AA   AA rrrrr  tt      eee  mm mm mmmm       sss  
AA   AA rrr  r tttt  ee   e mmm  mm  mm iii s     
AAAAAAA rr     tt    eeeee  mmm  mm  mm iii  sss  
AA   AA rr      tttt  eeeee mmm  mm  mm iii     s 
AA   AA         **************************   sss  
AA   AA       ***                         ****    
AA   AA      **                              ***  
`


let header = chalk.bgBlue.white(gg) // chalklet.generate(text, colorOptions);
const optionDefinitions = [
  {
    name: 'help',
    alias: 'h',
    type: Boolean,
    group: "main",
    description: 'Print this usage guide.'
  },
  {
    name: 'mission',
    type: String,
    defaultOption: true,
    group: "main",
    description: 'The the name of the mission file to produce.'
  },

  {
    name: 'source',
    type: String,
    group: "main",
    description: 'The the name of the main source mission file to defaults to the mission file with _SOURCE.\nFor Mission: MISS_MyMission.xml\nDefault source: MISS_MyMission_SOURCE.xml'
  },
  {
    name: 'watch-log',
    alias: 'l',
    type: Boolean,
    group: "script"
  },
  {
    name: 'watch-source',
    alias: 'w',
    type: Boolean,
    group: "script"
  },
  {
    name: 'define',
    type: String,
    multiple: true,
    group: "script",
    description: 'Values to define e.g. --define DEBUG=0 ...'
  },
  {
    name: 'run',
    alias: 'r',
    type: Boolean,
    group: "artemis",
    description: 'Upon success compilation\n\t 1) Copy to mission directory copy-mission implied \n\t 2) Start artemis'
  },
  {
    name: 'install',
    alias: 'i',
    type: Boolean,
    group: "artemis",
    desciption: 'Copy the generate mission to the artemis directory'
  },
  {
    name: 'artemis',
    alias: 'a',
    type: String,
    group: "artemis",
    description: "the path to the folder containing artemis.exe. Required for run or install"
  },
]



const sections = [
  {
    //header: 'Artemis: Macro Language',
    content: header,
  },
  {
    header: 'Artemis: Macro Language',
    content: 'Tools to make Artemis scripting easier'
  },

  {
    header: 'Main options',
    optionList: optionDefinitions,
    group: ['main', 'script']
  },
  ,
  {
    header: 'Artemis options',
    content: 'Options related to working with the game folder',
    optionList: optionDefinitions,
    group: ['artemis']
  },
]

const options = commandLineArgs(optionDefinitions)

let artemisDir = options.artemis.artemis
if (!artemisDir) {
  artemisDir = process.env['ARTEMIS_HOME']
}

if (artemisDir) {
  console.log(`Using Artemis in folder ${artemisDir}`)
} else {
  console.log(`use --artemis or SET environment variable ARTEMIS_HOME to run and sync with artemis directory`)
}



async function runArtemis() {
  if (!options.artemis.run) return
  if (!artemisDir) return

  let artemis = path.join(artemisDir, 'Artemis.exe')
  console.log(`Running ${artemis}`)
  let game = child_process.spawn(artemis,
    {
      cwd: artemisDir,
      detached: true,
      stdio: 'ignore'
    })

  game.unref()
  // Only run once
  if (options.artemis.run) {
    options.artemis.run = false
  }
}

async function copyLog(missionLog, localLog) {
  try {
    let l = await fs.promises.readFile(missionLog, "utf8")
    if (l.search("<<<END_AML_DATA>>>")) {
      await fs.promises.writeFile(localLog, l, "utf8")
      console.log('AML DATA Found rebuilding')
      return true
    }
  } catch (e) {

  }
  return false
}

async function watch(missionLog, localLog, file) {
  // if Running in artemis watch mission log
  fs.watchFile(missionLog, async (curr, prev) => {
    console.log('Log changed')
    if (await copyLog(missionLog, localLog)) {
      main(file)
    }
  })
  // Avoid rewatching
  options.script['watch-log'] = false

}

async function main(file) {
  try {
    let base = path.basename(file, ".xml")
    let src = path.resolve(base + "_SOURCE.xml")
    if (options.main.source) {
      src = options.main.source
    }
    console.log(`Building ${base} for ${src}`)
    let mission = await MissionFile.fromFile(src)
    if (mission.model) {
      await mission.processFile(mission)
      if (!mission.hasErrors()) {
        let xml = mission.toXML()
        await fs.promises.writeFile(path.resolve(file), xml, "utf8")
        if (artemisDir && options.artemis.install) {
          let missionDir = path.join(artemisDir, "dat", "missions", base)
          let missionFile = path.resolve(missionDir, file)

          console.log('MissDir' + missionDir)
          await fs.promises.mkdir(missionDir, { recursive: true })
          await fs.promises.writeFile(missionFile, xml, "utf8")

          if (options.script['watch-log']) {
            let missionLog = path.resolve(missionDir, base + "_LOG.txt")
            let localLog = path.resolve(base + "_LOG.txt")
            watch(missionLog, localLog, file)
          }
        }
      } else {
        mission.dumpAllErrors()
      }
    }
    if (mission.hasErrors()) {
      mission.dumpAllErrors()
    }
    runArtemis()

  } catch (e) {
    console.log(e.message)
  }
}

if (options.artemis.run) {
  options.artemis.install = true
}

if (options.main.help) {
  const usage = commandLineUsage(sections)
  console.log(usage)
} else if (options.main.mission) {
  main(options.main.mission)
} else if (options.artemis.run) {
  runArtemis()
}
//console.log(JSON.stringify(options,null, 2))
