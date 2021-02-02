# Documentation For Minerva Quest Forex Investigation

*Hello Quest Reader!* If you're here, you're probably here to poke around the data and code for this interactive project. Awesome, here's a guide to help you find whatever you need.

## Data
All of the data is located in the *data* folder, which includes pre-processed and processed datasets.

## Notebooks
This folder contains the main notebook that was used to process raw data into the data that was used in the visualisations, as well as an ancillary example notebook for checking the conversion methdology. 

## Replication
Want to make something similar based on this interactive? Here are the steps to follow to get this interactive running locally.

1. Make sure you have `idyll` installed (`npm i -g idyll`).
2. Clone this repo and run `npm install`.
3. Run `idyll --no-ssr`.
4. Edit *index.idyll*, *styles.css*, etc. to make changes and do cool web development stuff!
5. Run `idyll build`. The output will appear in the top-level `build` folder. To change the output location, change the `output` option in `package.json`.
6. Make sure your post has been built, then deploy the docs folder via any static hosting service.

-  You can install custom dependencies by running `npm install <package-name> --save`. Note that any collaborators will also need download the package locally by running `npm install` after pulling the changes.
