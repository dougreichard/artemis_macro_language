# Creating Modular Artemis scripts

The AML (Artemis Macro language) is a tool for helping script writers organize and get reuse from their scripts.

AML has these major components:
- Modular code
- Templates 

## Install

Get the [Latest release](https://github.com/dougreichard/artemis_macro_language/releases)

it is a single executable file (aml.exe).
Place the file in a directory where you need to use it. Or place it in a folder then include that folder in your path.

To get help run

```
aml -h
```

Create a Macro script file and name it for your mission (e.g. MISS_HelloWorld_SOURCE.xml)

By adding the _SOURCE the tool will recognize as the source file for a mission (e.g. MISS_HelloWorld.xml)

Create the file MISS_HelloWorld_SOURCE.xml

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
This is your first script. 
It uses the macro tag [<value>](../tag-values.md) creates a macro value hello.

``` xml
<value hello="Hello, world"/>
```
That value is used later to fill in the text for the big message. Using the [<expand>](../tag-expand.md) to expand that value using a [template string](../template-strings.md). The ${hello} will be expanded to the value of hello =>  'Hello, World'

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
Notice it uses the mission name not the source.

If you want to explicitly specify is the mission name use --mission

If you want to explicitly specify is the source name use --source

```
aml --source MyTemplateFile.xml --mission MISS_OtherName.xml
```

If you include --run and --artemis (with the path you you artemis)
it will put the files in the mission directory and run artemis.

```
aml MISS_HelloWorld.xml --run --artemis C:\artemis
```

If you just want to install the built script into the artemis mission folder, and not run artemis.
Use -- install or -i for short.

```
aml MISS_HelloWorld.xml --install --artemis C:\artemis
```

You can also use aml to just run artemis. (Might be useful to run multiple copies of artemis)
just don't specify a mission or source.

```
aml --run --artemis C:\artemis
```

## But wait there's more
This may seem like we ADDED code to get our mission file.
The goal is to have LESS. 

Well this is just the beginning. You can look into other tags like repeat, template etc.
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

