# Creating Modular Artemis scripts

The AML (Artemis Macro language) is a tool for helping scripters organize and get reuse from their scripts.

AML has these major components:
- Modular code
- Templates 

## Install

Get the [Latest release](https://github.com/dougreichard/artemis_macro_language/releases)

it is a single EXE.

To get help run

```
aml -h
```

Create a Macro script file and name it for you mission if you name it like you mission but add _SOURCE the tool will recognize this.

Create a File MISS_HelloWorld_SOURCE.xml

``` xml
<mission_data version="1.0">
  <values>
    <value hello="Hello, world"/>
  </values>
    <start>
        <create type="player" player_slot="" x="50000" y="0" z="50000" name="Artemis"/>
        <set_difficulty_level value="5"/>
        <expand>
            <big_message title="${hello}" subtitle1="" subtitle2=""/>
        </expand>
    </start>
</mission_data>
```
This is you first script. It creates a macro value hello.

``` xml
<value hello="Hello, world"/>
```
That value is used later to fill in the text for the big message.

``` xml
<expand>
    <big_message title="${hello}" subtitle1="" subtitle2=""/>
</expand>
```

Now run the tool with the name of your expected mission. (MISS_HelloWorld.xml)
It will use the file (MISS_HelloWorld_SOURCE.xml) and build (MISS_HelloWorld.xml)

```
aml MISS_HelloWorld.xml
```


If you include --run and --artemis (with the path you you artemis)
it will put the files in the mission directory and run artemis.

```
aml MISS_HelloWorld.xml --run -artemis C:\artemis
```

## But wait there's more
This may seem like we ADDED code to get our mission file.
The goal is to have LESS. 

Well this is just the beginning. You can look into other tags like <repeat>, <template> etc.
These are the things that will really help reduce the amount of cut and paste you'll need.


## Modular code
Modular code lets you break up into separate files and you can merge them into one.
Having separate files allow you to have smaller more focused files to work with.

A new tag is used to bring files together. 

``` xml
<import name="TheNameOfTheFile"/>
```

Imports are grouped together under a tag.
And all files have a root tag of mission_data


``` xml
<!-- File: MISS_ExampleImport_SOURCE.xml -->
<mission_data>
    <imports>
        <import name="PartOne.xml"> />
        <import name="PartTwo.xml"> />
    </imports>
</mission_data>
```

