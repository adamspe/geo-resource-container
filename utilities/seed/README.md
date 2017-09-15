# Seed

Used to process a number of Shapefiles into NdJson for import into a server.

## Requirements

Currently is only suitable for execution on a Unix system and requires that `ogr2ogr` be installed as well as `mapshaper` (`npm install -g mapshaper`).

The `generate` command will search an input directory for `*.shp` (Shapefile zips must already be expanded out), extract titles from their metadata, translate them to `GeoJSON` using `ogr2ogr` (also will translate to WGS84) and then run `mapshaper` to simplify the results.

Currently simplification runs for all layers, not perhaps only those requiring it (TODO).

Then for each Layer (Shapefile) the feature properties will be gathered and a Name format string prompted for for each.  The results will be written to `layers.json` in the output directory.
