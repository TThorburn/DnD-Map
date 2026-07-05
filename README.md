# DND Fog of War Website

A small local fog-of-war app for a DND table with separate DM and player screens.

## Run

1. Install Node.js from https://nodejs.org
2. Open this folder in Command Prompt or PowerShell.
3. Run:

```bash
npm install
npm start
```

DM screen:

```text
http://localhost:3000/dm.html
```

Player/TV screen:

```text
http://localhost:3000/player.html
```

## Use

Upload a JPG or PNG map from the DM page. Each uploaded image becomes a saved map. Use the Saved maps dropdown to switch between maps during the session.

Each map keeps its own image, grid size, rows, columns, and fog state. The app saves this permanently in:

```text
data/maps.json
public/uploads/
```

Keep those folders with the project if you move it to another computer. The uploaded image files live in `public/uploads/`; the fog/grid/map list data lives in `data/maps.json`.

The DM view shows fogged squares with red outlines and a faint overlay so you can still read the map underneath. The player view blocks fogged areas completely.

Left-click or drag to paint with the selected brush. Reveal removes fog. Hide puts it back.

## Fog groups

Use **Group select** on the DM page to paint a set of squares that belong together, such as a room, corridor, or deck section. Enter a name and press **Save selected group**. The group is saved into `data/maps.json` with that map.

After that, select the group from **Saved fog groups** and press **Reveal group** or **Hide group** to toggle the whole area at once.

## Fog effect

The player view now uses a textured grey fog pattern instead of a flat grey block. It still hides the map fully underneath.


V5 update:
- Fog colour changed from grey/black to a blue map-background style.
- Player fog remains fully opaque, so hidden areas cannot be faintly seen.
- DM fog is blue-tinted and semi-transparent, so the DM can still read the map while seeing what is hidden.
