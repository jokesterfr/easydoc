# Installation

## Dependencies

### NodeJS

	sudo apt-get install nodejs

### Pandoc

Pandoc releases before 1.10 do not support parameters such as `--toc-depth`, which is clearly necessary in our case. 
So if your distribution provides an old version, please check-out the installation from the sources.

#### From binary

Pandoc project provide installers for Mac OSX and Windows, please download and install them from here :

	http://code.google.com/p/pandoc/downloads/list

If you use Linux, you may ask your package manager to install it for you:

	sudo apt-get install pandoc

#### From the sources

	sudo apt-get install haskell-platform
	cabal install
