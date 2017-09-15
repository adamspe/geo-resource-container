# geo-resource-container

```
% mongo <db>
> db.createCollection('Feature');
> db.Feature.createIndex({"data.geometry" : "2dsphere"});
> db.Feature.createIndex({ "_layer": 1})
```

## Notes

```
// find files that are layer sources that don't have a corresponding layer to
// clean them up

// just files that are layer sources
match = {
  $match: { 'metadata.type': 'layerSource' }
}
// join with existing layers
lookup = {
  $lookup: {
    from: "Layer",
    as: "layer",
    localField: "_id",
    foreignField: "_sourceFile"
  }
}
// select just those where layer.length === 0
??

db.fs.files.aggregate([match,lookup]).pretty()
```

```
db.Feature.find({$and: [{ "data.geometry": { $geoIntersects: { $geometry: { type: "Polygon", coordinates: [ [ [ -132.6879524375, 63.87365463864679 ], [ -132.6879524375, 6.695317114700074 ], [ -65.62740556250003, 6.695317114700074 ], [ -65.62740556250003, 63.87365463864679 ], [ -132.6879524375, 63.87365463864679 ] ] ], crs: { type: "name", properties: { name: "urn:x-mongodb:crs:strictwinding:EPSG:4326" } } } } } }, {_layer: new ObjectId('58a1ced10b88c108c19df3cf')}]},{_id:1})


db.Feature.find({ "data.geometry": { $geoIntersects: { $geometry: { type: "Polygon", coordinates: [ [ [ -102.0003914023438, 47.8412887401344 ], [ -102.0003914023438, 44.90113336157483 ], [ -95.01857987890628, 44.90113336157483 ], [ -95.01857987890628, 47.8412887401344 ], [ -102.0003914023438, 47.8412887401344 ] ] ], crs: { type: "name", properties: { name: "urn:x-mongodb:crs:strictwinding:EPSG:4326" } } } } }, _layer: ObjectId('58a1ced10b88c108c19df3cf'), _id: { $nin: [ ObjectId('58a1ced10b88c108c19df3d3'), ObjectId('58a1ced20b88c108c19df3e5'), ObjectId('58a1ced20b88c108c19df402'), ObjectId('58a1ced20b88c108c19df407'), ObjectId('58a1ced20b88c108c19df3ec'), ObjectId('58a1ced20b88c108c19df3e4'), ObjectId('58a1ced10b88c108c19df3d8') ] } })
```
