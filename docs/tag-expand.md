# expand
Expand tag will expand a previously defined template.

You must supply the parameters for the template

``` xml
 <templates>
        <template name="">
            <params>
                <param name="name">         
            </params>
            
        </template>
    </templates>
```


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