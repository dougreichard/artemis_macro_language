# repeat tag
The repeat tag will repeat the content within it using a range for values

``` xml
 <start>
    <repeat range="Eggs">
        <set_variable name="${egg}" value="1.0"/>
        <set_timer name="${egg}_Timer" seconds="${seconds}"/>
    </repeat>
  </start>
```

When paired with this data defined in a range

```xml
<range name="Eggs">
    <item egg="egg1" seconds="25" playerCount="0" x="50000" y="10" z="5000" />
    <item egg="egg2" seconds="30" playerCount="3.0" x="49000" y="3" z="49000" />
    <item egg="egg3" seconds="35" playerCount="4.0" x="51000" y="3" z="51000" />
    <item egg="egg4" seconds="35" playerCount="6.0" x="49000" y="3" z="5100" />
    <item egg="egg5" seconds="35" playerCount="7.0" x="51000" y="3" z="49000" />
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
<repeat range="Eggs" as="egg">
    <repeat range="Ships" as="ship">
      <expand template="CaptureObject"
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


