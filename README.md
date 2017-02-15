# geo-resource-container

```
% mongo <db>
> db.createCollection('Feature');
> db.Feature.createIndex({"data.geometry" : "2dsphere"});
> db.Feature.createIndex({ "_layer": 1})
```
