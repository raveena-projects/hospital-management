# Hospital Management (Medicine Inventory UI)

This project is a lightweight front-end web application for managing a clinic/hospital medicine inventory.

## What it does
- Simple login screen with mock in-memory credentials.
- Inventory dashboard with medicine statistics:
  - total medicines
  - total categories
  - low-stock count
- Medicine table with inline quantity updates.
- Add-medicine modal form with validation (name, price, quantity, expiry date, etc.).
- Delete confirmation modal for medicine removal.
- Toast-style notifications for success/warning/info events.

## Tech stack
- Plain HTML/CSS/JavaScript (no framework/build step).
- Local icon assets in the `icons/` folder.

## Notes
- Data is stored only in memory (reset on page refresh).
- Authentication is demo-only and not secure for production.
