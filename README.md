# LENDRA1 — Frontend

Marketing and vault interface for LENDRA1, a USD1-based credit protocol that deploys capital into short-term credit facilities supporting global remittance flows.

Built with React 19, Vite, TypeScript, and Tailwind CSS v4. Connects to an ERC-4626 vault on Arbitrum One via viem.

---

## Stack

- **React 19** + **React Router v7** — SPA with two routes (`/` and `/vault`)
- **Vite 6** — build tooling and dev server
- **Tailwind CSS v4** — utility-first styling via `@tailwindcss/vite`
- **viem** — read-only Arbitrum One client for on-chain vault data
- **GSAP + Lenis** — scroll animations and smooth scrolling
- **Motion + OGL + Three.js** — visual effects and 3D elements
- **Lottie React** — animated preloaders

---

## Routes

| Path | Description |
|---|---|
| `/` | Marketing homepage — hero, how it works, yield source, vault overview |
| `/vault` | Live vault interface — deposit, redeem, on-chain NAV data |

---

## Getting Started

**Prerequisites:** Node.js 18+

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy the example env file and fill in your values:
   ```bash
   cp .env.example .env
   ```

3. Start the dev server:
   ```bash
   npm run dev
   ```

The app runs at `http://localhost:5174`.

---

## Environment Variables

| Variable | Description |
|---|---|
| `VITE_VAULT_PROXY` | ERC-4626 vault proxy contract address |
| `VITE_USDC_ADDRESS` | USDC token contract address |
| `VITE_CHAIN_ID` | Chain ID (default: `42161` for Arbitrum One) |
| `VITE_RPC_URL` | Arbitrum One RPC endpoint |

All variables must be prefixed with `VITE_` to be exposed to the browser at build time.

---

## Deployment (Vercel)

The project includes a `vercel.json` that rewrites all paths to `index.html` for client-side routing.

1. Connect the repository to a Vercel project
2. Set the four environment variables above in **Project Settings → Environment Variables**
3. Deploy — Vercel will run `npm run build` and serve the `dist/` output

Build command: `vite build`
Output directory: `dist`

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server on port 5174 |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | TypeScript type check (`tsc --noEmit`) |
| `npm run clean` | Delete `dist/` |
