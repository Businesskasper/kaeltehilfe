## Setup
1. Create test project

    ```dotnet new nunit --name kaeltebus-test```
2. Move all files to \test and delete the now empty kaeltebus-test directory
3. Move to parent directory and add newly created project to solution

    ```dotnet sln add .\test\kaeltebus-test.csproj```
4. Add reference to project under test

    ```dotnet add reference ..\src\kaeltebus-backend.csproj```