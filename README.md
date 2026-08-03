# JobTrack Local

JobTrack is a private, local-first desktop workspace for managing a complete job search. Applications remain on the user's computer in an embedded SQLite database. No account, subscription, cloud database or paid API is required.

## Included

- Daily overview with evidence-based metrics
- Application list and drag-and-drop pipeline
- Fast create/edit flow and duplicate URL protection
- Search, stages, sources, locations and work modes
- Local document-vault foundation
- Insights calculated from real outcomes
- Chrome/Edge job-listing capture extension
- Embedded SQLite with WAL mode and indexes

## Privacy

The desktop app creates `jobtrack.db` in the operating system's private application-data directory. The browser extension talks only to a loopback service at `127.0.0.1`; it does not send job-search data to an external server.

## Structure

```text
src/                 React interface and storage adapter
src-tauri/           Rust desktop shell and SQLite service
extension/           Manifest V3 browser extension
```

## Interface preview

```bash
npm install
npm run dev
```

The browser preview uses local browser storage and sample applications.

## Desktop application

After installing the standard Tauri prerequisites for the operating system:

```bash
npm run tauri dev
```

Users never need to install or configure SQL separately.

## Browser extension

1. Open `chrome://extensions`.
2. Enable **Developer mode**.
3. Select **Load unpacked**.
4. Choose the `extension` directory.
5. Keep JobTrack open while saving a listing.

The extension extracts common fields from LinkedIn, Indeed, Glassdoor and Kariyer.net, with a manual fallback for other job sites.

## Delivery status

This release completes the product foundation, application management, dashboard, pipeline, local persistence, evidence-based insights and first browser-capture workflow. Documents and interview management have prepared product foundations for the next release.
