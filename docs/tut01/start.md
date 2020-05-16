# Creating Modular Artemis scripts

The AML (Artemis Macro language) is a tool for helping scripters organize and get reuse from their scripts.

AML has these major components:
- Modular code
- Templates 

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

