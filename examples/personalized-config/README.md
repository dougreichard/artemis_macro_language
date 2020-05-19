# Personalization via command line

The example show how to send data values via the command line.config file aml.json

all you need to do is call aml it will look in the file aml.json for command line arguments.

Example aml.json

``` json
{
    "mission": "MISS_AmlPersonalized.xml",
    "define": {
            "ship":"Minnow",
             "captain":"Skipper",
             "helm": "Gilligan",
            "science":"The Professor",
            "weapons": "Mary Ann",
            "comms":"Ginger",
            "engineer":"Lovey"
    }
}
```

