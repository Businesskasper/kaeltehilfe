## User Flows
### Volunteer
- Volunteer starts shift
-> Enters area
-> Meets and greets client
-> Offers goods
-> Distributes goods
-> Takes notes on location, client, good and quantity
-> Volunteer increases quantity or hands out other goods on same client

Main entry point is overview of distributions with easy correction of quantity, redistribution on existing clients and new distributions.

### Admin
- Plans shifts
- Manages volunteers
- Manages goods and stocks
- Generates reports

## UI Designs
https://www.figma.com/design/LWGow8Pth9Oqw62XdO51Lk/Kaeltebus-Erfasser

## Styleguides
https://styleguide.drk.de/deutsches-rotes-kreuz/basiselemente/farben

https://styleguide.drk.de/deutsches-rotes-kreuz/digital/webseite#c1321

## Auth
A shift is connected to a vehicle and a tablet. Volunteers aren't necessarily fit for managing users and logins. Admin has no time to manage resources and logins for volunteers.
Idea: The shifts device can be authenticated using a client certificate
-> No user management necessary
-> Client certificate can easily be revoked
-> Submitted data is automatically connected to the shift

An Admin has extended permissions and should be authenticated by user. Only a handful of users are admins.
-> User login necessary

Implication: Client certificate authentication happens on the web server, long before any routes or middlewares are hit. Therefore two instances of the application must be deployed.