# Imports tag


The imports tag contains a set of import tags.
The imports tag is a child of the mission_data tag

``` xml
    <imports>
        <import name="sub-file-one.xml" />
        <import name="sub-file-two.xml" create="CreateEventName" destroy="DestroyEventName" />
    </imports>
```

## import tag

The import tag specifies a name of a file to import.
The file's path is relative to the file importing it.

### Experimental WIP: Create and Destory Events
You can convert the imported file's start block into an event by supplying the event attribute.

This is useful to create maps using a tool and then using that file to add new Map content via an event.
A timer and variable of the same name will be created to manage triggering

``` xml
<start>
    <set_variable name="CreateEventName"  value="2.0" />
</start>
<event name="CreateEventName">
    <if_timer_finished name="CreateEventName"/>
    <if_variable name="CreateEventName" comparator="EQUALS" value="0.0" />

    <set_variable name="CreateEventName"  value="1.0" />
</event>
```

Trigger the content with:

``` xml
    <set_timer name="CreateEventName" second="1" />
    <set_variable name="CreateEventName" value="0.0" />
```



Destroy attribute will convert creates in start block's creates into destroy the objects.

``` xml
<start>
    <set_variable name="DestroyEventName"  value="2.0" />
</start>
<event name="DestroyEventName">
    <if_timer_finished name="DestroyEventName"/>
    <if_variable name="DestroyEventName" comparator="EQUALS" value="0.0" />

    <set_variable name="DestroyEventName"  value="1.0" />
</event>
```
Trigger the content with:

``` xml
    <set_timer name="DestroyEventName" second="1" />
    <set_variable name="DestroyEventName" value="0.0" />
```

``` xml
<mission_data version="1.0">
    <imports>
        <import name="TheArena-terrain.xml" />
        <import name="TheArena-ancient-one.xml" />
        <import name="TheArena-anomalies-template.xml" />
        <import name="TheArena-checkin-buttons-template.xml" />
        <import name="TheArena-declare-winner-template.xml" />
        <import name="TheArena-drones-template.xml" />
        <import name="TheArena-game.xml" />
        <import name="TheArena-hacking-tempate.xml" />
        <import name="TheArena-penalties-template.xml" />
        <import name="TheArena-players.xml" />
        <import name="TheArena-ships-template.xml" />
        <import name="TheArena-stations-template.xml" />
        <import name="TheArena-wreck-template.xml" />
    </imports>
</mission> 
```
