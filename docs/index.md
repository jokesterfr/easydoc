# Welcome to Easydoc !

## What's the deal ?

Easydoc is a tiny web server that publish your documentation written in 
[markdown](http://daringfireball.net/projects/markdown/ "markdown official website").


It provides you a file index for browsing, and a full-text search.

It's very basic, and very easy to use and customize.

## Installation

1. You'll need the appropriate [NodeJs](http://nodejs.org/#download) installation on your system.
2. Download the [latest version](https://github.com/feugy/easydoc/zipball/master) of easydoc and unzip it
3. From the command line, build it with: `npm install -g`
4. Also from the command line, run it: `easydoc`

## How can I use it ?

Once the server is running, simply drops your documentation files written in 
markdown and with the 'md' extension in the _docs_ folder.
Let's say your file is named _myfile.md_, with a browser, 
go to [http://localhost/myfile.md](http://localhost/myfile.md).

That's it !


## How do I customize the look&feel ?

You can find all the client-side files in the _./public_ directory:

- _./public/style_. contain the css files, for rendering customizations
- _./public/tpl_. contain the templates
- _./public/build_. contain aggregated/minified stuff, for performance

Templates are using the [handlebars](http://handlebarsjs.com/) templating language, it is based on [mustache](http://mustache.github.com/) syntax, very easy to use.
They are pre-compiled at run time by the server, into one single _templates.js_ file. [Pre-compiling](handlebarsjs.com/precompilation.html) handlebars template make it easier for the browser to process parsing. _handlerbars.runtime.js_ is a subset of the handlebars library, a lower file to download...

Fot rendering customizations, feel free to customize the _style/style.css_ file.


## I need to customize the root folder !

When launching the server, you can specify your root folder. 

Here is the command line documentation of the server:

    Usage: ./easydoc [options]
    
    Options:
    
        -h, --help            output usage information
        -V, --version         output the version number
        -r, --root [docs]     Absolute or relative path to the root folder containing static and markdown files.
        -t, --title label     Title of the site as printed in the tab or title bar of the browser.
        -p, --port [80]       Local port of the created Http server.
        -h, --host [0.0.0.0]  Hostname of the created Http server.
        --no-cache            Disable mustache template caching (for dev purposes)
        
``` python
from clement import *
class toto:
    self.toto(a):
        return a
```

## Well this is great, but isn't that feugy's work?

I actually forked it to break limitations, and enhance markdown parsing ;)

My [easydoc fork](https://github.com/jokesterfr/easydoc) add some features to feugy's work:

- Display the docs file tree
- Dynamic table of contents
- Markdown parsed with pandoc
- Templating engine switched from mustache to handlebars
- Support of pre-compiled templates
- Autonomous _./public_ folder for client-side application
- Supporting of subfolders, _index.md_ should be the default file to look at
- Editing a markdown file auto-magically updates the client (if document is browsed)

## Are their limitations ?

Yes, plenty !

- Async get erros not handled
- File deletion not supported
- Ugly file tree 
- File tree to update on file system changes
- Markdown files must have the .md extension
- Impossible to display raw markdown
- No editing form
- Search functionnality has not been checked again
- Tests are fucked up
- I'm not satisfied of express routes naming I chose

---

Have fun !