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