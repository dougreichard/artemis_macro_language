# Artemis Scripting Macro Language

The Artemis Scripting Macro Language enhances the existing XML to enable:

- Produces a Single XML from multiple parts
 - creating separate XML files into easier to manage modules
 - Merge multiple XML files into a single XML for use in the game

- Makes managing game script content easier
  - Have maps separate from code
  - Have maps separate from code
  - have separate files per quest in mission
  - create resuable modules for use in multiple missions

## Getting started

- [Quick start tutorial](tut01/start.md)


## Additional tags

- [imports](tag-imports.md) Merges another file into mission. Merge starts tags into a single tag.
- [values](tag-values.md) Create a data to use with while **generating** scripts (not when running)
- [templates](tag-templates) Create a template of common code resuse multiple times.
- [expand](tag-expand) Expands a template using supplied data
- [ranges](tag-ranges.md) Create a list of data to use with a repeat tag
- [repeat](tag-repeat.md) Creates multiple copies of something varying using data from a range

