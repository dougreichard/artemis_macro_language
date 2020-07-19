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



## Expand into the start tag
You can force the content of an expand to be appended to the start tag.
adding '_start' with any non-blank value will expand on the start.

``` xml
<expand _start="true">
  <big-message title="${plugins.MyPlugin.message}"/>
</expand>
```

# expanding templates
To expand a template supply the name of the template via the attribute _template.

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

# Indirect expansion templates
The attribute _template.can contain a template string.
This enables the creation of templates that indirectly use other templates.
This allows for the creation of more reusable code.

<expand _template="${additionalStuff}" />

``` xml
<templates>
  <template name="ChoiceOne">
    <big-message title="Hello"/>
  </template>
  <template name="ChoiceTwo">
    <big-message title="Goodbye"/>
  </template>

  <template name="UseChoices">
    <expand _template="${choice}" />
    <big-message title="That's all I have to say"/>
  </template>
</templates>

<expand _template="UseChoices"  choice="ChoiceOne" />
<expand _template="UseChoices"  choice="ChoiceTwo" />

``` 
Generates  

``` xml
    <big-message title="Hello"/>
    <big-message title="That's all I have to say"/>
    <big-message title="Goodbye"/>
    <big-message title="That's all I have to say"/>
```

## Optional

``` xml
  <template name="UseChoices">
    <expand _template="${choice}" _optional-"true" />
    <big-message title="That's all I have to say"/>
  </template>
``

<expand _template="UseChoices"  choice="ChoiceOne" />
<expand _template="UseChoices"  choice="" />

``` xml
    <big-message title="Hello"/>
    <big-message title="That's all I have to say"/>
    <big-message title="That's all I have to say"/>
```




## Expand data from from Javscript Plugin data

``` xml
<expand>
  <big-message title="${plugins.MyPlugin.message}"/>
</expand>
```
