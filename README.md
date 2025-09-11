# Commercials App

Real-time product display system that receives product labels via Kafka/Socket.IO and displays commercial information on fields tablets.

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Development](#development)
  - [Building for Production](#building-for-production)
- [Configuration](#configuration)
- [Architecture](#architecture)
  - [Data Flow](#data-flow)
  - [Custom Hooks](#custom-hooks)
  - [Socket Events](#socket-events)
- [Deployment](#deployment)

## Tech Stack

- **Frontend Framework**: React 19.1.0
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: Styled Components
- **Real-time Communication**: Socket.IO Client
- **Linting**: ESLint with TypeScript support
- **Deployment**: Firebase Hosting (via GitHub Actions)

## Project Structure

```
src/
├── hooks/
│   ├── useFieldId.ts          # Field/device identification (env var → localStorage → prompt)
│   ├── useProductPreloader.ts # Fetches products from backend, manages localStorage cache
│   └── useSocket.ts           # Socket.IO connection, handles Kafka events
├── interfaces/
│   └── Product.ts             # Product interface with pricing tiers
├── utils/
│   └── realogramsDiff.ts      # O(n) product list diffing algorithm
├── App.tsx                    # Main UI component with styled-components
├── index.css                  # Global styles
└── main.tsx                   # React entry point
```

## Getting Started

### Prerequisites

- Node.js (version 18 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Commercials-App
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

### Development

Start the development server:
```bash
npm start
```

The application will be available at `http://localhost:3000`.

### Building for Production

Build the application:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## Configuration

Environment variables (`.env`):

```bash
VITE_BACKEND_URL=''    # Backend API for product fetching
VITE_SOCKET_URL=''     # Socket.IO server for real-time events
VITE_FIELD_ID=''       # Optional: hardcode field ID (overrides localStorage/prompt)
```

## Architecture

### Data Flow

1. **Initialization**: `useFieldId` determines field name (env → localStorage → prompt)
2. **Product Loading**: `useProductPreloader` fetches products from `/commercials/productsByFieldName`
3. **Socket Connection**: `useSocket` connects to Socket.IO server using fieldId
4. **Real-time Updates**: Listens for Kafka events via Socket.IO channels
5. **Product Display**: Shows active product with pricing tiers (regular/discount/member)

### Custom Hooks

#### `useFieldId`
- Priority: `VITE_FIELD_ID` → localStorage → user prompt
- Manages field name and fieldId state
- Provides reset functionality for invalid fields

#### `useProductPreloader`
- Fetches products by field name from backend
- Manages localStorage caching with diff algorithm
- Handles field validation (404/400 → reset field)

#### `useSocket`
- Connects to Socket.IO with WebSocket transport
- Listens to two channels:
  - `productLabel/{fieldId}`: Receives `{BARCODE}_{INTERNAL_ID}` labels
  - `updateRealogram/{fieldId}`: Receives updated product lists
- Updates localStorage and active product state

### Socket Events

#### `productLabel/{fieldId}`
**Payload**: `string` (format: `{BARCODE}_{INTERNAL_ID}`)
**Action**: Finds product by barcode and sets as active

#### `updateRealogram/{fieldId}`
**Payload**: `Product[]` (new realogram)
**Action**: Diffs with current products, adds new ones to localStorage

### Product Interface

```typescript
interface Product {
  _id: string;
  name: string;
  barcode: string;
  price: number;
  discountPrice: number;
  memberPrice: number;
  description: string;
  imageBase64: string;
}
```

## Deployment

Automated via GitHub Actions:
- **PR**: Preview deployments
- **Master**: Production deployment to Firebase Hosting

Workflows: `.github/workflows/`

### Note

This client app is designed to run on a local device and is not meant to be deployed to a publicly accessible server. The Firebase deployment is for testing purposes only.
