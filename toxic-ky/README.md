# Toxic Sites in Kentucky

This project contains a Jupyter Notebook that will load [TRI](https://www.epa.gov/toxics-release-inventory-tri-program) data and find facilities that within a certain distance to populated places specific to the United States and export a json file of those facilites. This can be modified for your individual needs within the notebook.

This project also contains a web map that showcases these facilities for the state of Kentucky and provides some additional info about the TRI Program and more info about the map. I encourage you to take a look at the Toxic Sites in KY map!

In order to run the Jupyter Notebook, you will need the following libraries installed:

- jupyter
- pandas
- geopandas
- matplotlib

If you are using an Anaconda environment, you can use the following to create an environment with everything you need:

`conda create --name 'env_name' jupyter pandas geopandas matplotlib -y && conda activate 'env_name'`
