# The Ranges, Range and value tag

## Ranges
The range tag is defined under the mission_data [values](tag-values.md) tag
ranges define a set of data for use with [repeat tags](tag-repeat.md) and macro statements.




``` xml
<values>
    <range name="AllShips">
        . . .
    </range>
</values>

``` xml
<mission_data version="1.0">
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

    <range name="Eggs">
      <value egg="egg1" seconds="25" playerCount="0" x="50000" y="10" z="5000" />
      <value egg="egg2" seconds="30" playerCount="3.0" x="49000" y="3" z="49000" />
      <value egg="egg3" seconds="35" playerCount="4.0" x="51000" y="3" z="51000" />
      <value egg="egg4" seconds="35" playerCount="6.0" x="49000" y="3" z="5100" />
      <value egg="egg5" seconds="35" playerCount="7.0" x="51000" y="3" z="49000" />
    </range>
  </values>
</mission_data>
```