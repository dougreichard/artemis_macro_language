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

/**
 * Commandline options
 */
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
    alias: 'd',
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
    description: 'Copy the generate mission to the artemis directory'
  },
  {
    name: 'artemis',
    alias: 'a',
    type: String,
    group: "artemis",
    description: "the path to the folder containing artemis.exe. Required for run or install"
  },
]


/**
 * This is for the help output
 */
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

let artemisDir = options._all.artemis
if (!artemisDir) {
  artemisDir = process.env['ARTEMIS_HOME']
  options._all.artemis = artemisDir
}




/**
 * Spawns artemis
 */
async function runArtemis() {
  if (!options._all.run) return
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
  if (options._all.run) {
    options._all.run = false
  }
}

/**
 * Copy a file (used to copy the mission log file)
 * @param {string} missionLog The Log file in the artemis directory
 * @param {string} localLog The local copy 
 */
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
/**
 * Watches the log file and regenerates when it changes adding an END_AML_DATA
 * @param {string} missionLog The filename in the mission directory
 * @param {string} localLog Te filename of the local log file
 * @param {string} file The mission filename
 */
async function watch(missionLog, localLog, file) {
  // if Running in artemis watch mission log
  fs.watchFile(missionLog, async (curr, prev) => {
    console.log('Log changed')
    if (await copyLog(missionLog, localLog)) {
      processMission(file)
    }
  })
  // Avoid rewatching
  options.script['watch-log'] = false
}
/**
 * Generate the mission file
 * @param {string} file the mission file
 */
async function processMission(file) {
  try {
    let base = path.basename(file, ".xml")
    let src = path.resolve(base + "_SOURCE.xml")
    if (options._all.source) {
      src = options._all.source
    }
    console.log(`Building ${base} for ${src}`)
    let mission = await MissionFile.fromFile(src)
    if (mission.model) {
      let values
       if (options && options._all ) {
         values = options._all.define
       }
      await mission.processFile(mission, values)
      if (!mission.hasErrors()) {
        let xml = mission.toXML()
        await fs.promises.writeFile(path.resolve(file), xml, "utf8")
        if (artemisDir && options._all.install) {
          let missionDir = path.join(artemisDir, "dat", "missions", base)
          let missionFile = path.resolve(missionDir, file)

          console.log('Mission Dir: ' + missionDir)
          await fs.promises.mkdir(missionDir, { recursive: true })
          await fs.promises.writeFile(missionFile, xml, "utf8")

          if (options._all['watch-log']) {
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
/**
 * Process the commandline options
 */
async function main() {
  if (options._all.help) {
    const usage = commandLineUsage(sections)
    console.log(usage)
    return
  }
  if (options&& options._all && options._all.define) {
    let defs = options._all.define
    let values = {}
    //console.log(`${options._all.define}`)
    for(let i=0,l=defs.length;i<l;i++) {
      let eq = defs[i].search("=")
      
      if (eq >= 0) {
        let key = defs[i].substring(0,eq)
        let value = defs[i].substring(eq+1)
        values[key] = value
        //console.log(`${key} = ${value}`)
      }
    }
    options._all.define = values
  }
  try {
    let json = await fs.promises.readFile("aml.json", "utf8")
    if (json) {
      let values = JSON.parse(json)
      if (values) {
        Object.assign(options._all, values)
        artemisDir = options._all.artemis
      }
    }
  } catch (e) {

  }

  if (options._all.run) {
    options._all.install = true
  }

  if (options._all.mission) {
    processMission(options._all.mission)
  } else if (options._all.run) {
    runArtemis()
  }
  if (artemisDir) {
    console.log(`Artemis Dir: ${artemisDir}`)
  } else {
    console.log(`use --artemis or SET environment variable ARTEMIS_HOME to run and sync with artemis directory`)
  }
  //console.log(JSON.stringify(options, null, 2))
}
main()