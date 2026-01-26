## Migrations
```
dotnet ef migrations add InitialMigration -o Application/Infrastructure/Database/Migrations
dotnet ef database update
```
## Requirements
#### Admin 
   -> Manages Goods<br>
   -> Generates and analyzes Reports<br>
#### Einsatzkraft
   --> Manages Goods<br>
   -> Distributes Goods<br>
   -> Manages Clients<br>

## Thoughts on DB models
Possible strategies to seperate domain models from database models:
1. Directly map into DB model from Infrastructure and use ef repository
   - Good: Easy models
   - Bad: Infrastructure leaks into application logic
2. Build a repository which internally maps domain models to db models
   - Good: Clear separation
   - Bad: Would have to build a repository around Entity Framework (which already is a repository). Would also lose much flexibility of Entity Framework.
3. Only define domain models and add DB model properties on DbContext ModelBuilder.
   - Good: Clear separation between domain models and database logic
   - Bad: Complex code if we need database model properties
4. Leak database logic into domain models and define properties there
   - Good: Easy code
   - Bad: Leak database logic into domain models


## Working with spatial data
1. Install SQLITE3 cli with spatialite module
http://www.gaia-gis.it/gaia-sins/windows-bin-amd64/mod_spatialite-5.1.0-win-amd64.7z

2. Open the database
´´´
sqlite3 c:\Git\kaeltehilfe\kaeltehilfe-backend\src\KaeltehilfeDatabase.db
´´´

3. Load the spatialite module and verify
```
.load mod_spatialite
Select spatialite_version()
```

4. Query spatial data
```
Select X(GeoLocation) as Long, X(GeoLocation) as Lat from Distributions;
or
Select AsText(GeoLocation) from Distributions;
```