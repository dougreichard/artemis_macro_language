# Artemis Macro Language

*** WORK IN PROGRESS ***

An experiment in creating a pre-processor/macro language for Artemis Spaceship bridge simulator

http://artemiswiki.pbworks.com/w/page/51088806/Mission%20Scripting

- Modular - reuse and import content
- Allows for, structures and arrays
- avoid copy paste by using prototype (templates)
 - Value prototype
 - event prototypes 

## Addition XML tags for scripting

### import
Allows you to break up you script into easier to manage modules

``` xml
<imports>
    <import name="sub-file-one.xml" />
    <import name="sub-file-two.xml" />
</imports>
```




### values (macro values)
Values allow you to create MACRO values for use in expanding templates.

Macro values can be used to expand to text in the generated script
This can be used to:
- Reduce variables in the generated script (reducing memory)
- Used to generated multiple copies of similar code
 - less code you write
 - faster updates (fix problem once)

``` xml
<values>
  <value ship="Artemis" />
</values>
```

### Template string
Templates strings are used to expand into values

Template strings are marked with ${expression} where the expression is an expression using macro values.

For the example below if the value is "Artemis"

``` xml
<big_message title="Hello, ${ship}" subtitle1="by Unknown Author" subtitle2=""/>
```
Will result in the following in the generated script

``` xml
<big_message title="Hello, Artemis" subtitle1="by Unknown Author" subtitle2=""/>
```

### ranges
A range is a set of data that you can use to expand thing multiple time.

``` xml
<values>
  <range name="AllShips">
    <value ship="Artemis" sideValue="10" />
    <value ship="Intrepid" sideValue="11" />
    <value ship="Aegis" sideValue="4" />
    <value ship="Horatio" sideValue="5" />
    <value ship="Excalibur" sideValue="6" />
    <value ship="Hera" sideValue="7" />
    <value ship="Ceres" sideValue="8" />
    <value ship="Diana" sideValue="9" />
  </range>
</values>
```

### Repeat
repeat execute multiple times using a length or a range.

``` xml
<repeat range="AllShips">
  <incoming_comms_text from="The game" sideValue="${sideValue}" type="ALERT">Welcome to the game ${ship}</incoming_comms_text>
</repeat>
```

### template
Templates define a set of things to expand.



