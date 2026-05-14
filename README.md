<div align="center">

<img src="public/chef_orange.png" alt="BSS Restaurant logo" width="96" height="96" />

# BSS Restaurant — Angular Dashboard

A modern, colorful restaurant management dashboard built with Angular 21, signals, ng-zorro, and a Geist-inspired design system.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://sharifdotg-bss-restaurant.vercel.app/)
[![Angular](https://img.shields.io/badge/Angular-21.2-DD0031?style=for-the-badge&logo=angular&logoColor=white)](https://angular.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-22c55e?style=for-the-badge)](#-license)

[Live Demo](https://sharifdotg-bss-restaurant.vercel.app/) ·
[Report Bug](https://github.com/SharifdotG/BSS-Restaurant-Angular/issues/new?labels=bug) ·
[Request Feature](https://github.com/SharifdotG/BSS-Restaurant-Angular/issues/new?labels=enhancement)

</div>

---

## ✨ Overview

**BSS Restaurant** is a full-featured restaurant management front-end that lets staff manage employees, dining tables, food items, orders, and expenses from a single, responsive dashboard. It is built as a signal-first Angular 21 application with standalone components, ng-zorro UI primitives, and a custom Geist-inspired design system warmed up with a candy-soft restaurant palette.

The interface ships with a polished light / dark mode, mobile-first layouts (with a hamburger drawer that replaces the bottom nav), and a Reports & Analytics page that renders sales, expenses, and revenue breakdowns using ngx-charts.

---

## 🚀 Features

- 📊 **Dashboard** — Today's orders, table occupancy, available seats, and total employees at a glance, paired with a mesh-gradient greeting band.
- 👥 **Employees** — Paginated list with avatar uploads, validation, edit/delete flows, and an inline 3-column name row in the add/edit modal.
- 🍽️ **Tables** — Create tables with capacity + photo, mark booking status, and assign multiple employees per table.
- 🍔 **Foods** — Menu management with image uploads, discount-type pricing (flat or percentage), and auto-calculated discounted prices.
- 🛒 **New Order** — Pick a table, browse the food grid (4 per row at desktop, 2 at mobile), and accumulate items in a shared cart drawer that groups by table.
- 📑 **Orders** — Card-based list with status chips (Pending / Confirmed / Preparing / Prepared to Serve / Served / Paid), per-card item preview, and an edit modal that also updates status.
- 💸 **Expenses** — Track categories, amounts, dates, and notes with quick edit/delete actions.
- 📈 **Reports & Analytics** — Monthly bar charts and a sales-vs-expenses pie chart powered by ngx-charts; legend repositions on mobile.
- 👤 **Profile** — Geist-style modal with mono-caps eyebrows and hairline-row metadata.
- 🌗 **Light / Dark mode** — Theme service with `localStorage` persistence, `prefers-color-scheme` detection, and gray-tinted dark surfaces (`#1f1f1f` canvas) for visibility.
- 📱 **Fully responsive** — Mobile hamburger drawer, paginations that wrap and stay centered, table lists that scroll horizontally only when needed, and a new-order grid that fills the viewport with the food cards.
- ♿ **Accessible by default** — Tooltips, ARIA labels, and keyboard-navigable controls throughout.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Angular 21](https://angular.dev/) (standalone components, signals, `@if`/`@for` control flow) |
| **Language** | [TypeScript 5.9](https://www.typescriptlang.org/) |
| **UI primitives** | [ng-zorro-antd](https://ng.ant.design/) (Modal, Table, Form, Upload, Drawer, Pagination, Tooltip, …) |
| **Layout** | [Bootstrap 5.3](https://getbootstrap.com/) (grid + utility classes) + [Tailwind CSS 3.4](https://tailwindcss.com/) |
| **Icons** | [Ant Design Icons](https://github.com/ant-design/ant-design-icons/tree/master/packages/icons-angular) |
| **Charts** | [@swimlane/ngx-charts](https://swimlane.gitbook.io/ngx-charts/) |
| **Infinite scroll** | [ngx-infinite-scroll](https://www.npmjs.com/package/ngx-infinite-scroll) |
| **HTTP** | Angular `HttpClient` with interceptor-based auth |
| **Design system** | Custom Geist-inspired token set (see [`DESIGN.md`](DESIGN.md)) |
| **Build** | Angular CLI 21 with `@angular/build` |
| **Tests** | [Vitest 4](https://vitest.dev/) |
| **Deploy** | [Vercel](https://vercel.com/) |

---

## 📸 Screenshots

> Replace the placeholders below with real screenshots once the app is running.
> Drop the files in `docs/screenshots/` and update the paths.

<table>
  <tr>
    <td align="center" width="50%">
      <strong>Dashboard</strong><br/>
      <em>Add caption here</em><br/><br/>
      <img src="docs/screenshots/dashboard.png" alt="Dashboard screenshot" width="100%" />
    </td>
    <td align="center" width="50%">
      <strong>Reports &amp; Analytics</strong><br/>
      <em>Add caption here</em><br/><br/>
      <img src="docs/screenshots/reports.png" alt="Reports & Analytics screenshot" width="100%" />
    </td>
  </tr>
  <tr>
    <td align="center" width="50%">
      <strong>Employees</strong><br/>
      <em>Add caption here</em><br/><br/>
      <img src="docs/screenshots/employees.png" alt="Employees screenshot" width="100%" />
    </td>
    <td align="center" width="50%">
      <strong>Tables</strong><br/>
      <em>Add caption here</em><br/><br/>
      <img src="docs/screenshots/tables.png" alt="Tables screenshot" width="100%" />
    </td>
  </tr>
  <tr>
    <td align="center" width="50%">
      <strong>Foods</strong><br/>
      <em>Add caption here</em><br/><br/>
      <img src="docs/screenshots/foods.png" alt="Foods screenshot" width="100%" />
    </td>
    <td align="center" width="50%">
      <strong>New Order</strong><br/>
      <em>Add caption here</em><br/><br/>
      <img src="docs/screenshots/new-order.png" alt="New Order screenshot" width="100%" />
    </td>
  </tr>
  <tr>
    <td align="center" width="50%">
      <strong>Orders</strong><br/>
      <em>Add caption here</em><br/><br/>
      <img src="docs/screenshots/orders.png" alt="Orders screenshot" width="100%" />
    </td>
    <td align="center" width="50%">
      <strong>Expenses</strong><br/>
      <em>Add caption here</em><br/><br/>
      <img src="docs/screenshots/expenses.png" alt="Expenses screenshot" width="100%" />
    </td>
  </tr>
  <tr>
    <td align="center" width="50%">
      <strong>Dark mode</strong><br/>
      <em>Add caption here</em><br/><br/>
      <img src="docs/screenshots/dark-mode.png" alt="Dark mode screenshot" width="100%" />
    </td>
    <td align="center" width="50%">
      <strong>Mobile layout</strong><br/>
      <em>Add caption here</em><br/><br/>
      <img src="docs/screenshots/mobile.png" alt="Mobile layout screenshot" width="50%" />
    </td>
  </tr>
</table>

---

## 🧰 Prerequisites

- **Node.js** `>= 20.11` ([download](https://nodejs.org/))
- **npm** `>= 11` (pinned in [`package.json`](package.json) via `packageManager`)
- A modern browser (Chrome / Edge / Firefox / Safari)

---

## ⚡ Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/SharifdotG/BSS-Restaurant-Angular.git
cd BSS-Restaurant-Angular

# 2. Install dependencies
npm install

# 3. Start the dev server
npm start
```

The app is served at **<http://localhost:4200>**. The dev server hot-reloads on file save.

> **API note:** The app currently points at the hosted demo backend (`https://bssrms.runasp.net`) via the `API_BASE_URL` token in [`src/app/app.config.ts`](src/app/app.config.ts). To point at a local backend, change the URL in that file.

---

## 📜 npm Scripts

| Script | Description |
|---|---|
| `npm start` | Start the Angular dev server at `http://localhost:4200`. |
| `npm run build` | Production build into `dist/`. |
| `npm run watch` | Development build in watch mode. |
| `npm test` | Run unit tests with Vitest. |

---

## 🗂️ Project Structure

```text
BSS-Restaurant-Angular/
├── public/                       # Static assets (logo, fonts, background images)
├── src/
│   ├── app/
│   │   ├── auth/                 # Login page + auth service + interceptor
│   │   ├── core/                 # Theme service and other singletons
│   │   ├── dashboard/            # Dashboard layout + Overview + Reports & Analytics
│   │   ├── employees/            # Employee list + add/edit modal + service
│   │   ├── expenses/             # Expense list + add/edit modal + service
│   │   ├── foods/                # Food list + add/edit modal + service
│   │   ├── new-order/            # New-order page + shared Cart drawer
│   │   ├── orders/               # Order list (cards) + edit-order modal
│   │   ├── tables/               # Table list + add/edit + assign-employee modal
│   │   ├── ui-components/        # Shared shell: Nav (sider, header, hamburger), Profile
│   │   ├── app.config.ts         # Providers, ng-zorro icons, API_BASE_URL token
│   │   └── app.routes.ts         # Lazy-loaded routes
│   ├── styles.css                # Design tokens + global ng-zorro overrides
│   └── main.ts
├── DESIGN.md                     # Geist-inspired design system spec
├── angular.json
├── package.json
├── tailwind.config.js
└── tsconfig.json
```

---

## 🎨 Design System

The visual language is documented in detail in [**DESIGN.md**](DESIGN.md). Highlights:

- **Brand orange primary** — `#ff6c1f` (with `hover`, `active`, `soft`, and `deep` ramps).
- **Soft blue canvas** — `#fbfcfe` / `#eef3fa` page surfaces, easy on the eyes.
- **Candy card tints** — `card-peach`, `card-mint`, `card-lemon`, `card-rose`, `card-sky`, `card-lavender`, `card-bubblegum`.
- **Gray dark mode** — `#1f1f1f` canvas (not pure black) for visibility.
- **Geist typography** — Aggressive negative tracking, sentence-case display, mono eyebrows.
- **Stacked-shadow elevation** — Five-step elevation ladder with inset hairline rings.
- **100 px CTA pills + 6 px nav radii** — Two pill scales coexist deliberately.

All tokens are exposed as CSS custom properties in [`src/styles.css`](src/styles.css) and mapped onto the ng-zorro `--ant-*` variables so the entire UI library inherits the brand.

---

## 🌗 Theming

The theme is controlled by a [`ThemeService`](src/app/core/theme.service.ts) that:

- Persists the selection in `localStorage` under `bss-theme`.
- Falls back to `prefers-color-scheme` on first visit.
- Sets a `data-theme="dark"` attribute on `<html>`, which switches the CSS variable set defined in `src/styles.css`.

Cycle the theme from the sun / moon button in the header.

---

## 📐 Mobile Behavior

- **Sidebar** → Replaced by a hamburger button on the right of the avatar that opens an ng-zorro dropdown with all routes.
- **Tables** → Horizontal scroll re-enabled on `< 992px` so columns never collapse; vertical scroll stays inside the table card.
- **Paginations** → Wrap onto multiple rows, items shrink to `30px`, total text moves above the controls.
- **New Order** → Foods grid fills the viewport; the search input stretches edge-to-edge to align with the cards below.
- **Orders** → Each order card caps its item list at three (more scrolls inside the card); the outer page is the only other scroll surface.

---

## 🤝 Contributing

Contributions are welcome! Please follow the steps below:

1. Fork the project on GitHub.
2. Create a feature branch: `git checkout -b feat/your-feature`.
3. Commit your changes: `git commit -m "feat: describe your change"`.
4. Push to the branch: `git push origin feat/your-feature`.
5. Open a Pull Request describing the change and a screenshot if it's a visual one.

For larger changes, please open an issue first to discuss what you'd like to change.

---

## 🐛 Troubleshooting

<details>
<summary><strong>Login fails or the API returns CORS errors</strong></summary>

The app talks to a hosted backend by default. If you're running against your own backend, update `apiBaseUrl` in [`src/app/app.config.ts`](src/app/app.config.ts) and make sure CORS is configured on the server side.
</details>

<details>
<summary><strong>Images don't appear in the lists</strong></summary>

Images are served from `${API_BASE_URL}/images/<entity>/`. If your backend stores them elsewhere, adjust the helper getters (e.g. `getFoodImage`, `getTableImage`) in the corresponding services.
</details>

<details>
<summary><strong>Build fails on Node version</strong></summary>

This project requires Node 20+ because Angular 21 dropped support for older runtimes. Run `node -v` and upgrade if needed (e.g. via [nvm](https://github.com/nvm-sh/nvm)).
</details>

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Angular](https://angular.dev/) — the framework that makes signal-first apps a joy to write.
- [ng-zorro-antd](https://ng.ant.design/) — the UI library powering most of the surface area.
- [ngx-charts](https://swimlane.gitbook.io/ngx-charts/) — Reports & Analytics charts.
- [Vercel](https://vercel.com/) — design language inspiration (see [`DESIGN.md`](DESIGN.md)) and hosting.
- [Ant Design Icons](https://github.com/ant-design/ant-design-icons) — the icon set.

---

<div align="center">

Made by **[Sharif Md. Yousuf](https://github.com/SharifdotG)**

</div>
