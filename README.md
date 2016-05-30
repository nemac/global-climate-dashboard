Global Climate Dashboard
========================

This repository contains the source code for the Global Climate Dashboard that
appears on the home page of [climate.gov](climate.gov).

To run your own local copy, after cloning the respository you must run
the command

```
git submodule update --init --recursive
```

to download the project dependencies.  After that, you can simply point your
browser at the file `index.html` to view the dashboard.

The `build` subdirectory contains a copy of the application code and all 
its required dependencies and assets, packaged in a self-contained form.
To deploy the dashboard to a server, simply copy the contents of the `build`
directory to a directory on the server.

To rebuild everything in the `build` subdirectory after updating the code
or data, [Apache Ant](ant.apache.org) is required.  After installing Ant,
the command `ant build` will regenerate everything in the `build` directory.
