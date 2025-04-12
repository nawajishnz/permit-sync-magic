# Permitsy - Visa Application Platform

Permitsy is a modern web application designed to streamline the visa application process for travelers. With a clean, intuitive interface, it allows users to apply for tourist visas, track their applications, and receive support throughout the process.

## Features

- **Country-specific Visa Information**: Detailed information about visa requirements, processing times, and entry conditions for various countries.
- **Online Application Process**: Complete visa applications online with a step-by-step guided process.
- **Document Management**: Upload and manage required documents for visa applications.
- **Application Tracking**: Track the status of visa applications in real-time.
- **User Dashboard**: Personalized dashboard for managing multiple applications and travel documents.
- **Admin Portal**: Administrative interface for managing visa applications, approvals, and customer support.

## Technologies Used

- **Frontend**: React, TypeScript, Tailwind CSS, Shadcn UI
- **Build Tools**: Vite
- **Backend**: Supabase (PostgreSQL, Authentication, Storage)
- **State Management**: React Context API
- **Routing**: React Router
- **Form Handling**: React Hook Form
- **Animations**: Framer Motion

## Getting Started

### Prerequisites

- Node.js (v16.0.0 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/nawajishmaeen/Permitsy.git
   cd Permitsy
   ```

2. Install dependencies:
   ```
   npm install
   # or
   yarn install
   ```

3. Start the development server:
   ```
   npm run dev
   # or
   yarn dev
   ```

4. Build for production:
   ```
   npm run build
   # or
   yarn build
   ```

## Project Structure

```
src/
  ├── components/       # Reusable UI components
  ├── pages/            # Page components for routing
  ├── hooks/            # Custom React hooks
  ├── models/           # Data models and types
  ├── integrations/     # External service integrations
  ├── lib/              # Utility functions and helpers
  ├── assets/           # Static assets like images
  ├── styles/           # Global styles
  └── App.tsx           # Main application component
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Shadcn UI for the beautiful component library
- Lucide Icons for the icon set
- All contributors to this project
