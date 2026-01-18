## Setup
1. Create test project

    ```dotnet new nunit --name kaeltehilfe-test```
2. Move all files to \test and delete the now empty kaeltehilfe-test directory
3. Move to parent directory and add newly created project to solution

    ```dotnet sln add .\test\kaeltehilfe-test.csproj```
4. Add reference to project under test

    ```dotnet add reference ..\src\kaeltehilfe-backend.csproj```