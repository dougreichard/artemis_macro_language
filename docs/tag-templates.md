# Templates tag
Templates can be thought of as similar to functions in a programming language. They have a name, take a set of predefined paramters as inputs, and utilize them to determine the result. They can be used elsewhere, even in other files by importing the file that defines them.

The general format of tempates are as follows:

``` xml
    <templates>
        <template name="template_name">
            <params>
            
            </params>
            <!-- content with templates strings -->
        </template>
    </templates>
```

It's worth noting here that the `templates` tag must be directly within the `mission_data` tag. 

Templates are incredibly useful for reusability when you don't know what values will be used for various parameters. 
Say, for example, that you want to write a script that uses the multiple of two numbers. You would write something like the following:

``` xml
    <templates>
        <template name="multiply">
            <params>
                <param name="a"/>
                <param name="b"/>
            </params>
            <big-message title="${x * y}"/>
        </template>
    </templates>
```
In place of `<big-message title="${x * y}"/>` you would use whatever bit of scripting you need. This is the part of the template that is actually added to the resulting script. 
The `${x * y}` bit is a "Template string". It will do a calculation and the result will be placed in the final script. See https://dougreichard.github.io/artemis_macro_language/template-strings.html for more information on those, they are also super useful. 

So now we've defined a template. But how do we use it?

Within your source xml file, find the location where you want the output of the template. We will use an `expand` tag to tell AML to "expand" the result of the template into the mission script.
In this context, the `expand` tag will look like this:

``` xml
<expand _template="multiply"
    a="1"
    b="2"/>
```

First, we specify the name of the template (in this case, "template_name"), then the name and value of each parameter. For more details on using `expand`, see https://dougreichard.github.io/artemis_macro_language/tag-expand

So what does the mission script look like when we run AML.exe? 

It will look like this:

``` xml
<big-message title="2"/>
```

Now you might be thinking, why would I write twelve lines to get a measly one?
Well, oftentimes you would have several lines within the template instead of just one, and when you would be writing dozens of `big-message` tags (or their more complicated variants), that's when templates really show their worth. 

If you aren't sure whether you should be using a template, don't. If you find that you are doing multiple sections of scripting repeatedly, consider using a template to cut down on some typing.
