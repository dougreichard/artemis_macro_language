# Values, value and struct tags
Values let you define data for use while **generating** scripts

This can help avoid adding in game variables just for holding values.
This can save memory within the running game.
It can also help when you want to change a value and avoid finding the value everywhere to change it.

Set the value once, use it in mulitple places.


``` XML
<mission_data version="1.0">
  <values>
    <value CONST_TIMER_SECONDS="30"/>
  </values>
  <start>
    <expand>
      <set_timer name="MyTimer" value="${CONST_TIMER_SECONDS}"/>
    </expand>
  </start>
</mission_data>
```

``` XML
<mission_data version="1.0">
  <values>
    <value TIMER_SECONDS="30"/>
  </values>
  <start>
    <expand>
      <set_timer name="MyTimer" value="${CONST_TIMER_SECONDS}"/>
    </expand>
  </start>
</mission_data>
```