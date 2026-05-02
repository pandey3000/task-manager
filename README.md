# Team Task Manager

A full-stack team task management web app where admins create projects, add team members, assign tasks, and track progress. Members can view their assigned work and update task status.

## Features

- Signup and login with JWT authentication
- Admin and member role-based access control
- Project and team management
- Task creation, assignment, due dates, and status tracking
- Dashboard stats for projects, tasks, completed work, and overdue work
- REST API with MongoDB relationships
- Railway-ready deployment setup

## Tech Stack

- Frontend: React, Vite, CSS
- Backend: Node.js, Express
- Database: MongoDB Atlas
- Auth: JWT, bcrypt
- Deployment: Railway

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create backend environment file:

```bash
copy server\.env.example server\.env
```

3. Add your MongoDB Atlas connection string and JWT secret in `server/.env`:

```env
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/team_task_manager
JWT_SECRET=your_long_random_secret
CLIENT_URL=http://localhost:5173
```

4. Start the app:

```bash
npm run dev
```

Frontend: `http://localhost:5173`

Backend: `http://localhost:5000`

## Roles

Admin:

- Create projects
- Add members to projects
- Create and assign tasks
- View all projects and tasks
- Delete projects and tasks

Member:

- View assigned projects
- View assigned tasks
- Update task status
- Track personal dashboard stats

## Create Admin Account

Public signup creates member accounts only. Create the first admin from the terminal:

```bash
npm run seed:admin -w server -- "Admin User" admin@test.com admin123
```

Then login with that admin email and password.

## API Routes

Auth:

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/auth/users`

Projects:

- `GET /api/projects`
- `POST /api/projects`
- `PUT /api/projects/:id`
- `DELETE /api/projects/:id`

Tasks:

- `GET /api/tasks`
- `POST /api/tasks`
- `PUT /api/tasks/:id`
- `DELETE /api/tasks/:id`

Dashboard:

- `GET /api/dashboard`

## Railway Deployment

1. Push this project to GitHub.
2. Create a new Railway project from the GitHub repo.
3. Add these environment variables in Railway:

```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/team_task_manager
JWT_SECRET=your_long_random_secret
NODE_ENV=production
```

4. Railway will run:

```bash
npm install
npm run build
npm start
```

5. Open the generated Railway URL and test signup, project creation, task assignment, and member status updates.

## Demo Video Flow

1. Signup as an admin.
2. Signup as a member in another browser or after logout.
3. Login as admin and create a project.
4. Add the member to the project.
5. Create and assign a task.
6. Login as member and update task status.
7. Show dashboard changes and overdue/task counts.
