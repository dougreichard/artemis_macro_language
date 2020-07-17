# expand
Expand tag will expand its child elements or a previously defined template.


``` xml
<expand>
  <big-message title="${someValue}"/>
</expand>
```

If **someValue** = "Hello, world"

``` xml
<big-message title="Hello, world"/>
```

## Expand data from from arguments

``` xml
<expand messsage="Hello, World">
  <big-message title="message"/>
</expand>
```


## Expand data from from Javscript Plugin data

``` xml
<expand>
  <big-message title="${plugins.MyPlugin.message}"/>
</expand>
```



You can supply the parameters for the template

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