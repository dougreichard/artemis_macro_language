# Persistence example
This example shows how to use the artemis log file to get data out for use in the building of the script.

- generate script 
 - use import to include the log file data
 - use a copy of the log data with your source
- run script in artemis using aml.exe
 - use --run (-r)
 - and --watch-log (-l)
 - and --artemis -a to point to the location of artemis
- script logs data marked
 - data starts with <<<START_AML_DATA>>>
 - build valid JSON or XML for the data
 - data ends with <<<END_AML_DATA>>>
- when the log file changes
 - aml will copy the log file to the source location
 - regenerate the script using the new values


