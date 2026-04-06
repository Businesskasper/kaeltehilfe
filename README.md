# kaeltehilfe

**kaeltehilfe** is an open-source web application for planning and documenting goods distribution during winter frost protection initiatives (*Kältehilfe*) for people in need.

It is built for two groups of users: **admins** who plan shifts, manage volunteers, and analyse distribution data — and **operators** who work shifts on tablet devices and record distributions in the field.

The application is self-contained, runs entirely on a single VPS, and has no dependency on external paid services. Map views use OpenStreetMap/Leaflet. Address lookup uses a self-hosted PostGIS database populated from freely available OSM data. Authentication is handled by a bundled Keycloak instance, including X.509 client certificate login for operator tablets.

---

## Features

- Shift planning with volunteer assignment and staffing validation
- Tablet-friendly operator UI for recording distributions on the go
- X.509 client certificate authentication for operator devices — no shared passwords
- Certificate issuance and revocation by admin users, directly in the app
- Map-based location picking with automatic address resolution (self-hosted, no API keys)
- Distribution analytics and CSV export
- Fully self-hosted — ships as a single `docker-compose.yml`

---

## Want to use this for your organisation?

If you run a Kältehilfe or similar initiative and would like to use this application, feel free to reach out. The application is designed to be self-hosted and can be set up for your organisation.

Contact: **LukaT.Weis@gmail.com**

---

## Contributing

Contributions are welcome. If you have found a bug, want to suggest a feature, or would like to contribute code, please open an issue or a pull request.

If you are planning a larger change, opening an issue first to discuss the approach is appreciated.

---

## Documentation

| Document | Description |
|----------|-------------|
| [Architecture](./docs/architecture.md) | System architecture (arc42) |
| [Develop](./docs/develop.md) | Local development setup |
| [Build](./docs/build.md) | Building Docker images |
| [Deploy](./docs/deploy.md) | Production deployment |

---

## License

This project is licensed under the [PolyForm Noncommercial License 1.0.0](./LICENSE).

You are free to use, modify, and self-host this software for non-commercial purposes. Use by charitable organisations, educational institutions, and government bodies is explicitly permitted. Commercial use requires a separate agreement — contact LukaT.Weis@gmail.com.

Map data © [OpenStreetMap contributors](https://www.openstreetmap.org/copyright).
