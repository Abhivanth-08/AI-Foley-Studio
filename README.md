# AI Foley Studio

## Description

AI Foley Studio is a modern web application frontend for AI-powered footstep detection and audio generation for video content. This React-based application provides an intuitive interface for uploading videos, processing them with advanced AI models, and generating synchronized audio effects.

## Features

- **Video Upload & Processing**: Upload videos for AI-powered analysis
- **Real-time Status Tracking**: Monitor processing status with live updates
- **Footstep Detection Visualization**: View detected footsteps with frame-by-frame analysis
- **Audio Generation**: Automatic generation and synchronization of footstep audio
- **Export Capabilities**: Download annotated videos and export results as CSV/JSON
- **Modern UI/UX**: Built with shadcn/ui components for a premium user experience
- **Responsive Design**: Works seamlessly across desktop and mobile devices
- **Dark Mode Support**: Built-in theme switching capabilities

## Technologies Used

- **React 18** - Modern React with hooks
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and development server
- **shadcn/ui** - High-quality UI component library
- **Radix UI** - Accessible component primitives
- **TailwindCSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **TanStack Query** - Data fetching and caching
- **Recharts** - Data visualization
- **Lucide React** - Beautiful icon library

## Getting Started

### Prerequisites

- Node.js 16+ or Bun runtime
- npm or bun package manager

### Installation

```bash
# Install dependencies
npm install
# or
bun install
```

### Development

```bash
# Start development server
npm run dev
# or
bun run dev
```

The application will be available at `http://localhost:5173`

### Build

```bash
# Production build
npm run build

# Development build
npm run build:dev
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
├── components/     # Reusable UI components
├── pages/          # Page components
├── lib/            # Utility functions
└── App.tsx         # Main application component
```

## Features in Detail

### Video Processing Pipeline
1. Upload video files through the intuitive interface
2. Submit for processing with AI models (YOLO + MediaPipe)
3. Track processing status in real-time
4. View results with annotated frames
5. Download processed video with synchronized audio

### Export Options
- **CSV Export**: Detailed footstep data with timestamps
- **JSON Export**: Complete analysis results
- **Video Download**: Annotated video with audio overlay

## License

This project is licensed under the terms specified in the LICENSE file.
