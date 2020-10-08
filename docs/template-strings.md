# Template strings

Template strings are expanded using javascript template strings.

[javascript template strings](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals)

## Using template strings
Templates can be used in any XML attribute value.

Template strings create string by expanding the the expressions within it.

Expressions are place withing ${}

Expressions can be value names and can include calculations.

``` js
"This ${ship} has ${health * 4} health"
```

If the value ship="Artemis" and health = 5

```
"This Artemis has 20 health"
```

Internally the system uses Javascript Template literals. But most values in the system as strings so adding two value together is likely concatenating string.

You can specify that a value should be treated as an integer, or float using included helper functions.
There are functions to convert to the strings to number
_.int() _.float() 

For example: 
``` js
"This ${ship} has ${_.int(health) * 4} health"
```

there is also _.map() to convert

``` xml
<value x="${_.map.x(2.3)}" y="0.0" z="${_.map.z('B.25')}" navpoint="NAV_01" /> 
```

This makes it somewhat easier to had code coordinates on the map.

## Extending by importing javascript
Additional javascript functions can be added by adding an import to a javascript file.

``` xml
<imports>
  <import name="myplugin.js" />
</imports>
```

The javascript needs to expose 


``` js
exports.MyPlugin = {
    message: "Hello, Javascript"
}
```

The data can then be access in templates scripts.

``` xml
<expand>
  <big-message title="inline ${plugins.MyPlugin.message}"/>
</expand>
```

For a more complete example see:



[AML Source XML](https://github.com/dougreichard/artemis_macro_language/blob/master/test/fragments/xml/script-simple-fragment.xml)

[Javascript plugins example](https://github.com/dougreichard/artemis_macro_language/blob/master/test/fragments/xml/script-simple-fragment.js)

[Expected results](https://github.com/dougreichard/artemis_macro_language/blob/master/test/fragments/xml/expected/script-simple-fragment.xml)
