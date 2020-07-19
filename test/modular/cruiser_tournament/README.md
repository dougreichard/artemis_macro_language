# Translation of Cruiser Tournament
This is an example of taking an existing script and converting it to leverage the Artemis Macro Language.

The script was written by Mike Substelny.
Converted by Doug Reichard for Mike.

# Cruiser Tournament:

 A TSN Cruiser has 48 minutes to vanquish as many enemies as possible.
 For a full crew of 6 in Artemis 2.7.1.
 Your Comms Officer should take notes or print out the Communications Cheat Sheet in the mission folder.

 # What changed

 The mission was broken into Sections representing aspects of the mission.

 Common code for 'Tonnage'. A majority of the original script was managing The Surrender and Destruction of ships. The File Cruiser_Tournament_template.xml defines these common templates.

There is a points systems that is also repeated a a lot.
A Look up table for the points was created: Cruiser_Tournament_points.xml.

The points from the look up table are used by the tonnage templates. But they can be overriden by specifying weight or surrender values. (Only the Pirates do this Cruiser_Tournament_Pirates.xml)

# Major points for reusable stuff

## Cruiser_Tournament_Points.xml
This creates a look up table based on race, and hull aspects for what tonnage points are scored. The templates in Cruiser_Tournament_template.xml uses these points as default weight and surrender points. But the templates allow for them to be overriden or you can add addition 'race' and 'hull' names for special ships.

## Cruiser_Tournament_template.xml
This file has reusable templates for surrender, destroying and calculating tonnage.
Some common template for spawning skaraan and other ships are found here as well.


# Basic game elements
These files have basic game management.

## MISS_Cruiser_Tournament_SOURCE.xml 
This is the main file used to import the others.

## Cruiser_Tournament_MAP.xml
Contains the initial map. This could be edited using the map editor by itself.

## Cruiser_Tournament_GAME.xml
Logic for managing the start and end of the game.

## Cruiser_Tournament_Stations.xml
Contains aspect for the stations including some comms messaging events.

## Cruiser_Tournament_Anomalies.xml
The mission has you collecting certain anomalies. This file spawns those.

## Cruiser_Tournament_Mayday.xml
Contains comms interaction to receive some helpful items at a point cost.

# Friendly ships

## Cruiser_Tournament_Cargo.xml
Spawns cargo ships if managed properly can get some help.

## Cruiser_Tournament_Destroyers.xml
Ships to Help getting the bad guys.

# Basic enemies
These files manage initial enemies.
It is possible these could have been made into one file, but left it as one for each race.

- Cruiser_Tournament_Kraliens.xml
- Cruiser_Tournament_Torgoth.xml
- Cruiser_Tournament_Pirates.xml
- Cruiser_Tournament_Skaraan.xml

# Whales and Hunters
There is a bonus for keep whales alive the problem is there are hunters about.
This sub narative is in the file:
- Cruiser_Tournament_Hunters.xml
- Cruiser_Tournament_Whales.xml

# Game stages/Periods
Every 8 minutes a new wave of enemies is spawns.
This file manages the timing aspects and spawning of those enemies.

- Cruiser_Tournament_Periods.xml

# Bonus fleets
When certain objectives occur more fodder is spawned.
This file manages to see if the objectives are reached and spawns special enemies based on that.

- Cruiser_Tournament_BonusFleets.xml


