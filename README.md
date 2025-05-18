# Excalidraw Project

## Overview

Excalidraw is a collaborative whiteboard application designed for real-time drawing and diagramming. It allows users to create, edit, and share structured diagrams such as flowcharts, relationship charts, and more. The application is built with modern web technologies and provides a seamless experience for teams to collaborate visually.

## Features

- **Real-Time Collaboration**: Multiple users can draw and interact on the same canvas simultaneously using WebSockets.
- **Drawing Tools**: Includes tools for creating rectangles, circles, lines, freehand drawings, and adding text.
- **Room Management**: Users can create and join rooms to collaborate with specific groups.
- **Authentication**: Secure user authentication for managing access and permissions.
- **Database Integration**: Persistent storage of user data, rooms, and chat messages using PostgreSQL.
- **Responsive Design**: Optimized for use on desktops, tablets, and mobile devices.
- **Undo/Redo Functionality**: Easily revert or reapply changes on the canvas.
- **Customizable Layouts**: Automatically adjusts diagram layouts to ensure clarity and avoid overlapping elements.

## Tech Stack

### Frontend
- **React**: A JavaScript library for building user interfaces.
- **Next.js**: A React framework for server-side rendering and static site generation.
- **TypeScript**: A superset of JavaScript that adds static typing.
- **Tailwind CSS**: A utility-first CSS framework for styling.
- **WebSocket**: Enables real-time, bidirectional communication between the client and server.

### Backend
- **Express.js**: A Node.js framework for building RESTful APIs.
- **Prisma**: An ORM for managing PostgreSQL database interactions.
- **PostgreSQL**: A relational database for storing user, room, and chat data.

### DevOps
- **Docker**: Containerized deployment for consistent development and production environments.
- **TurboRepo**: Monorepo management for efficient builds and dependency sharing.

## Getting Started

Follow these steps to set up and run the project locally.

### Prerequisites
- Install [Node.js](https://nodejs.org/) (version 18 or higher).
- Install [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/).
- Install [npm](https://www.npmjs.com/) (version 6 or higher).

### Installation

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/your-username/excalidraw.git
   cd excalidraw
   ```

2. **Start the Application**:
   Use Docker Compose to build and start all services:
   ```bash
   docker-compose up --build
   ```

3. **Access the Application**:
   - Frontend: Open [http://localhost:3000](http://localhost:3000) in your browser.
   - Backend API: Accessible at [http://localhost:8000](http://localhost:8000).
   - WebSocket Server: Runs on [http://localhost:8001](http://localhost:8001).

### Stopping the Application
To stop the running containers, use:
```bash
docker-compose down
```

## Project Structure

```
excalidraw/
├── apps/
│   ├── excalidraw-frontend/   # Frontend application
│   ├── http-server/           # Backend API server
│   ├── ws-server/             # WebSocket server
├── packages/
│   ├── db/                    # Database schema and Prisma client
│   ├── common/                # Shared utilities and types
│   ├── typescript-config/     # TypeScript configuration
├── Docker/                    # Dockerfiles for services
├── prisma/                    # Prisma migrations and schema
├── turbo.json                 # TurboRepo configuration
├── docker-compose.yml         # Docker Compose configuration
└── README.md                  # Project documentation
```

## Contributing

Contributions are welcome! To contribute:
1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Make your changes and commit them with descriptive messages.
4. Submit a pull request for review.

## License

This project is licensed under the [MIT License](LICENSE).