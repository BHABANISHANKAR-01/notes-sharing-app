# Notes Sharing Platform

A professional full-stack notes-sharing application with syntax highlighting, analytics, and admin controls.

## Features

### 🎓 Core Features
- **Course Management** - Create, read, update, delete courses with descriptions
- **Chapter Organization** - Organize content into structured chapters within courses
- **Rich Note Content** - Store and display detailed notes for each chapter
- **Announcement System** - Create announcements visible to students with history archive
- **Engagement Tracking** - Passive tracking of student views and time spent per chapter
- **Copy Protection** - Disable text selection, right-click, and keyboard copy shortcuts
- **Dark Mode** - Toggle between light and dark themes with localStorage persistence

### 🔒 Security
- **Admin Authentication** - Hardcoded credentials with request-level validation
- **CORS Protection** - Only allows requests from localhost:3000
- **Input Validation** - All data validated before database operations
- **Foreign Key Constraints** - Enforced referential integrity with cascade deletes

### 📱 Responsive Design
- **Desktop** - Full sidebar navigation with multi-column layout
- **Tablet** - Collapsible sidebar for better space usage
- **Mobile** - Full-width responsive design with hamburger menu
- **Accessibility** - Touch-friendly buttons (min 44px height)

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Backend | Node.js + Express | ^4.18.2 |
| Frontend | React | ^18.2.0 |
| Database | SQLite3 | ^5.1.6 |
| HTTP Client | Axios | ^1.4.0 |
| Build Tool | React Scripts | 5.0.1 |

## Project Structure

```
TN/
├── server/
│   ├── index.js                 # Main Express server
│   ├── database/
│   │   └── notes.sqlite3        # SQLite database (auto-created)
│   ├── package.json
│   └── .gitignore
│
├── client/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/          # Reusable components (future expansion)
│   │   ├── pages/
│   │   │   ├── AdminPanel.js    # Admin dashboard
│   │   │   └── ClientPortal.js  # Student interface
│   │   ├── styles/
│   │   │   ├── AdminPanel.css
│   │   │   └── ClientPortal.css
│   │   ├── App.js               # Main app component
│   │   ├── App.css
│   │   ├── index.js
│   │   └── index.css
│   ├── package.json
│   └── .gitignore
│
└── README.md
```

## Installation & Setup

### Prerequisites
- **Node.js** (v14 or higher)
- **npm** or **yarn**
- **Git**

### Quick Start

#### 1. Clone and Navigate
```bash
cd TN
```

#### 2. Backend Setup
```bash
cd server
npm install
npm start
# Server starts on http://localhost:5000
```

#### 3. Frontend Setup (In a new terminal)
```bash
cd client
npm install
npm start
# App opens at http://localhost:3000
```

## API Endpoints

### Authentication
- `POST /api/admin/login` - Login with username and password

### Courses
- `GET /api/courses` - Get all courses
- `POST /api/courses` - Create course (requires auth)
- `PUT /api/courses/:id` - Update course (requires auth)
- `DELETE /api/courses/:id` - Delete course (requires auth)

### Chapters
- `GET /api/chapters/:courseId` - Get chapters for a course
- `POST /api/chapters` - Create chapter (requires auth)
- `PUT /api/chapters/:id` - Update chapter (requires auth)
- `DELETE /api/chapters/:id` - Delete chapter (requires auth)

### Notes
- `GET /api/notes/:chapterId` - Get notes for a chapter
- `POST /api/notes` - Create note (requires auth)
- `PUT /api/notes/:id` - Update note (requires auth)
- `DELETE /api/notes/:id` - Delete note (requires auth)

### Announcements
- `GET /api/announcements` - Get active announcements
- `GET /api/announcements/all` - Get all announcements (including archived)
- `POST /api/announcements` - Create announcement (requires auth)
- `PUT /api/announcements/:id` - Update/archive announcement (requires auth)
- `DELETE /api/announcements/:id` - Delete announcement (requires auth)

### Engagement
- `POST /api/engagement/track` - Track chapter views and time spent
- `GET /api/engagement/stats` - Get engagement statistics

## Database Schema

### Courses Table
```sql
CREATE TABLE courses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

### Chapters Table
```sql
CREATE TABLE chapters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    course_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    order_index INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
)
```

### Notes Table
```sql
CREATE TABLE notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    chapter_id INTEGER NOT NULL,
    content TEXT,
    is_published BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE
)
```

### Announcements Table
```sql
CREATE TABLE announcements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT,
    course_id INTEGER,
    is_active BOOLEAN DEFAULT 1,
    archived_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL
)
```

### Engagement Logs Table
```sql
CREATE TABLE engagement_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    chapter_id INTEGER NOT NULL,
    time_spent INTEGER DEFAULT 0,
    viewed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE
)
```

## Usage Guide

### For Admins

1. **Login**: Click "Admin Login" button at top-right
2. **Manage Courses**: Create, edit, and delete courses in the Courses tab
3. **Manage Chapters**: Select a course to manage its chapters
4. **Edit Notes**: Select a chapter to create and edit notes
5. **Announcements**: Switch to Announcements tab to manage system-wide announcements
6. **Logout**: Click "Logout (Admin)" button to exit admin mode

### For Students

1. **View Courses**: Select a course from the sidebar
2. **Browse Chapters**: Click on a chapter to view its notes
3. **Read Notes**: Content displayed with professional formatting
4. **Check Announcements**: View announcements in the floating carousel at the top
5. **Announcement History**: Click 📋 button to see past announcements
6. **Dark Mode**: Toggle 🌙/☀️ button for theme preference

### Copy Protection
Students cannot:
- Select and copy text
- Right-click on content
- Use Ctrl+C / Ctrl+X / Cmd+C / Cmd+X
- Touch-and-hold to copy on mobile

## Color Scheme

### Light Mode
| Element | Color |
|---------|-------|
| Primary | #667eea (Purple) |
| Secondary | #764ba2 (Dark Purple) |
| Background | #f5f5f5 (Light Gray) |
| Text | #333333 (Dark Gray) |
| Success | #51cf66 (Green) |
| Danger | #ff6b6b (Red) |

### Dark Mode
| Element | Color |
|---------|-------|
| Background | #1a1a1a (Very Dark) |
| Card BG | #2a2a2a (Dark Gray) |
| Text | #e0e0e0 (Light Gray) |
| Primary | #667eea (Purple - unchanged) |
| Secondary | #764ba2 (Dark Purple - unchanged) |

## Performance Tips

1. **Database**: SQLite persists between restarts at `server/database/notes.sqlite3`
2. **Caching**: Frontend caches course list and chapter data
3. **Engagement**: Tracked passively every 30 seconds when viewing chapters
4. **Lazy Loading**: Chapters and notes load on demand

## Troubleshooting

### Server won't start
```bash
# Check if port 5000 is in use
netstat -an | grep 5000  # Linux/Mac
netstat -ano | findstr :5000  # Windows

# Kill process on port 5000 and restart
```

### Database errors
```bash
# Delete and recreate database
rm server/database/notes.sqlite3
npm start  # in server directory
```

### CORS errors
- Ensure frontend is running on `http://localhost:3000`
- Ensure backend API URL is `http://localhost:5000`
- Check browser console for specific CORS error

### React app won't start
```bash
# Clear npm cache and reinstall
cd client
rm -rf node_modules package-lock.json
npm install
npm start
```

## Security Checklist

- ✅ Admin credentials hardcoded (never exposed in UI/logs/comments)
- ✅ CORS restricted to localhost:3000
- ✅ All inputs validated before database operations
- ✅ Foreign key constraints enforced
- ✅ Copy protection active on client portal
- ✅ No sensitive data in local storage
- ✅ Error messages don't leak system info

## Testing Checklist

### Backend
- ✅ Server starts on port 5000
- ✅ Database initializes with all tables
- ✅ All CRUD endpoints functional
- ✅ Admin authentication working
- ✅ DELETE operations removing records
- ✅ Foreign key constraints enforced
- ✅ CORS allowing frontend requests

### Frontend
- ✅ Loads on http://localhost:3000
- ✅ Admin login modal appears and works
- ✅ Dark mode toggle saves preference
- ✅ Text cannot be copied (user-select disabled)
- ✅ Right-click menu disabled
- ✅ Courses display in sidebar
- ✅ Chapters load on course selection
- ✅ Notes display with proper formatting
- ✅ Delete buttons remove items
- ✅ Announcements display and float
- ✅ Breadcrumb navigation works
- ✅ Mobile responsive layout functional

## Future Enhancements

- Video embedding support
- Student accounts and progress tracking
- Quiz/assignment system
- PDF export of notes
- Search functionality
- Tags and categories
- Real-time collaboration
- Mobile app version

## License

This project is for educational purposes. All rights reserved.

## Support

For issues, questions, or suggestions, review the code comments and error messages in the browser console and server logs.

---

**Version:** 2.0  
**Last Updated:** November 2025  
**Status:** Production Ready ✅
