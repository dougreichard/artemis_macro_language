# repeat tag
The repeat tag will repeat the content within it using a range for values

``` xml
 <start>
    <repeat _length="5" >
        <set_variable name="egg${_index}" value="1.0"/>
        <set_timer name="egg${_index}}_Timer" seconds="${25+_index*5}"/>
    </repeat>
  </start>
```

``` xml
<start>
  <set_variable name="egg0" value="1.0"/>
  <set_timer name="egg0_Timer" seconds="25"/>
  <set_variable name="egg1" value="1.0"/>
  <set_timer name="egg1_Timer" seconds="30"/>
  <set_variable name="egg2" value="1.0"/>
  <set_timer name="egg2_Timer" seconds="35"/>
  <set_variable name="egg3" value="1.0"/>
  <set_timer name="egg3_Timer" seconds="40"/>
  <set_variable name="egg4" value="1.0"/>
  <set_timer name="egg4_Timer" seconds="45"/>
</start>
```


When paired with this data defined in a range

```xml
<range name="Eggs">
    <value egg="egg1" seconds="25" playerCount="0" x="50000" y="10" z="5000" />
    <value egg="egg2" seconds="30" playerCount="3.0" x="49000" y="3" z="49000" />
    <value egg="egg3" seconds="35" playerCount="4.0" x="51000" y="3" z="51000" />
    <value egg="egg4" seconds="35" playerCount="6.0" x="49000" y="3" z="5100" />
    <value egg="egg5" seconds="35" playerCount="7.0" x="51000" y="3" z="49000" />
</range>
```

Will produce the following

```xml
 <start>
    <set_variable name="egg1" value="1.0"/>
    <set_timer name="egg1_Timer" seconds="25"/>
    <set_variable name="egg2" value="1.0"/>
    <set_timer name="egg2_Timer" seconds="30"/>    
    <set_variable name="egg3" value="1.0"/>
    <set_timer name="egg3_Timer" seconds="35"/>
    <set_variable name="egg4" value="1.0"/>
    <set_timer name="egg4_Timer" seconds="35"/>
    <set_variable name="egg5" value="1.0"/>
    <set_timer name="egg5_Timer" seconds="35"/>
</start>
```

# nested repeat
Repeats can also contain tested repeats allowing complex expanding of content

The following expands The Capture Object For each egg, then for each ship.
If Eggs has 5 eggs, and Ships has 8 ships, this is expanded 40 times pair each egg with each ship.

``` xml
<repeat _range="Eggs" _as="egg">
    <repeat _range="Ships" _as="ship">
      <expand _template="CaptureObject"
        ship="${ship.ship}"
        object="${egg.egg}"
        target="${ship.ship} Station"
        objectText="Egg"
        captureDistance="100"
        dropDistance="1000"
        cargoHold="${ship.ship}_Cargo"
        scoreVariable="${ship.ship}_Score"
        scoringEnabledVariable="Scoring_Allowed" />
    </repeat>
  </repeat>
```
# conditional skiping 
You can use the attribute _skip to specify a condition to skip items.

The following example skips odd numbers

``` xml
 <start>
    <repeat _length="5" _skip="_.int(_index)%2">
        <set_variable name="even_number_${_index}" value="1.0"/>
    </repeat>
  </start>
```
