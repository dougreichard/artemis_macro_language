# Personalization via command line

The example shows how to send data values via the command line.

See the command line in build.bat

using the --define command line argument you can send values that override or add values used in templates.

``` xml
..\..\build\aml MISS_AmlPersonalized.xml --define ship=Minnow captain=Skipper helm=Gilligan science="The Professor" weapons="Mary Ann" comms="Ginger" engineer="Lovey"
```

