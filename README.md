# Artemis Macro Language

*** WORK IN PROGRESS ***

An experiment in creating a pre-processor/macro language for Artemis Spaceship bridge simulator

The language leverage yaml for syntax but build beyond that semantically


- Modular - reuse and import content
- Allows for, structures and arrays
- avoid copy paste by using prototype (templates)
 - Value prototype
 - event prototypes 

``` yaml
event_prototypes:
  # TowObject: 
  #     Event for towing an object
  # inputs:
  #     ship: Name of the ship
  #     object: Object to capture
  #     sideValue: Number for ship to use in text message etc.
  TowObject:
    name: ${ship} Tow ${object}
    conditions:
      - if_variable:
          name: ${object}
          comparator: "EQUALS"
          value: ${sideValue}
      - if_exists: ${ship}
    # note assumes object has no space in the name for mesh, minor rewrite in not 
    relative_positions:
      - name2: ${object}
        distance: ${distance}
        angle: ${angle}
        name1: ${ship}

events:
  - _prototype: TowObject
    ship: Viper
    object: Rat
    sideValue: 10
    distance: 100
    angle: 180
```

can be used to generate the follow XML

``` xml
<event name="Viper Tow Rat">
    <if_variable name="Rat" comparator="EQUALS" value="10"/>
    <if_exists name="Viper"/>
    <set_relative_position name2="Rat" distance="100" angle="180" name1="Viper"/>
</event>
```
