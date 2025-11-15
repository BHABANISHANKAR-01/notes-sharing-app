const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Admin credentials from environment variables
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'trainerMaster2025';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Code4NotesOnly';

// Middleware
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Database initialization
const dbDir = path.join(__dirname, 'database');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'notes.sqlite3');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Database connection error:', err.message);
  } else {
    console.log('Connected to SQLite database');
    initializeDatabase();
  }
});

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON');

// Database initialization function
function initializeDatabase() {
  db.serialize(() => {
    // Create tables if they don't exist
    db.run(`
      CREATE TABLE IF NOT EXISTS courses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) console.error('Error creating courses table:', err.message);
    });

    db.run(`
      CREATE TABLE IF NOT EXISTS chapters (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        course_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        order_index INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
      )
    `, (err) => {
      if (err) console.error('Error creating chapters table:', err.message);
    });

    db.run(`
      CREATE TABLE IF NOT EXISTS notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        chapter_id INTEGER NOT NULL,
        content TEXT,
        is_published BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE
      )
    `, (err) => {
      if (err) console.error('Error creating notes table:', err.message);
    });

    db.run(`
      CREATE TABLE IF NOT EXISTS announcements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        content TEXT,
        course_id INTEGER,
        is_active BOOLEAN DEFAULT 1,
        archived_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL
      )
    `, (err) => {
      if (err) console.error('Error creating announcements table:', err.message);
    });

    db.run(`
      CREATE TABLE IF NOT EXISTS engagement_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        chapter_id INTEGER NOT NULL,
        time_spent INTEGER DEFAULT 0,
        viewed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE
      )
    `, (err) => {
      if (err) console.error('Error creating engagement_logs table:', err.message);
    });

    console.log('Database tables initialized');
  });
}

// Authentication middleware
function authenticateAdmin(req, res, next) {
  const { username, password } = req.body;
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
}

// ======================== AUTHENTICATION ========================

// Admin login endpoint
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    res.json({ success: true, message: 'Login successful' });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// ======================== COURSES ========================

// Get all courses
app.get('/api/courses', (req, res) => {
  db.all('SELECT * FROM courses ORDER BY created_at DESC', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows || []);
    }
  });
});

// Create course
app.post('/api/courses', authenticateAdmin, (req, res) => {
  const { title, description } = req.body;
  if (!title || title.trim() === '') {
    return res.status(400).json({ error: 'Title is required' });
  }
  db.run(
    'INSERT INTO courses (title, description) VALUES (?, ?)',
    [title, description || ''],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({ id: this.lastID, title, description });
      }
    }
  );
});

// Update course
app.put('/api/courses/:id', authenticateAdmin, (req, res) => {
  const { title, description } = req.body;
  const { id } = req.params;
  if (!title || title.trim() === '') {
    return res.status(400).json({ error: 'Title is required' });
  }
  db.run(
    'UPDATE courses SET title = ?, description = ? WHERE id = ?',
    [title, description || '', id],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else if (this.changes === 0) {
        res.status(404).json({ error: 'Course not found' });
      } else {
        res.json({ id, title, description });
      }
    }
  );
});

// Delete course
app.delete('/api/courses/:id', authenticateAdmin, (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM courses WHERE id = ?', [id], function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (this.changes === 0) {
      res.status(404).json({ error: 'Course not found' });
    } else {
      res.json({ success: true, message: 'Course deleted' });
    }
  });
});

// ======================== CHAPTERS ========================

// Get chapters for a course
app.get('/api/chapters/:courseId', (req, res) => {
  const { courseId } = req.params;
  db.all(
    'SELECT * FROM chapters WHERE course_id = ? ORDER BY order_index ASC',
    [courseId],
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json(rows || []);
      }
    }
  );
});

// Create chapter
app.post('/api/chapters', authenticateAdmin, (req, res) => {
  const { course_id, title, order_index } = req.body;
  if (!title || title.trim() === '') {
    return res.status(400).json({ error: 'Title is required' });
  }
  if (!course_id) {
    return res.status(400).json({ error: 'Course ID is required' });
  }
  db.run(
    'INSERT INTO chapters (course_id, title, order_index) VALUES (?, ?, ?)',
    [course_id, title, order_index || 0],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({ id: this.lastID, course_id, title, order_index });
      }
    }
  );
});

// Update chapter
app.put('/api/chapters/:id', authenticateAdmin, (req, res) => {
  const { title, order_index } = req.body;
  const { id } = req.params;
  if (!title || title.trim() === '') {
    return res.status(400).json({ error: 'Title is required' });
  }
  db.run(
    'UPDATE chapters SET title = ?, order_index = ? WHERE id = ?',
    [title, order_index || 0, id],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else if (this.changes === 0) {
        res.status(404).json({ error: 'Chapter not found' });
      } else {
        res.json({ id, title, order_index });
      }
    }
  );
});

// Delete chapter
app.delete('/api/chapters/:id', authenticateAdmin, (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM chapters WHERE id = ?', [id], function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (this.changes === 0) {
      res.status(404).json({ error: 'Chapter not found' });
    } else {
      res.json({ success: true, message: 'Chapter deleted' });
    }
  });
});

// ======================== NOTES ========================

// Get notes for a chapter
app.get('/api/notes/:chapterId', (req, res) => {
  const { chapterId } = req.params;
  db.all('SELECT * FROM notes WHERE chapter_id = ?', [chapterId], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows || []);
    }
  });
});

// Create note
app.post('/api/notes', authenticateAdmin, (req, res) => {
  const { chapter_id, content, is_published } = req.body;
  if (!chapter_id) {
    return res.status(400).json({ error: 'Chapter ID is required' });
  }
  db.run(
    'INSERT INTO notes (chapter_id, content, is_published) VALUES (?, ?, ?)',
    [chapter_id, content || '', is_published !== false ? 1 : 0],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({ id: this.lastID, chapter_id, content, is_published });
      }
    }
  );
});

// Update note
app.put('/api/notes/:id', authenticateAdmin, (req, res) => {
  const { content, is_published } = req.body;
  const { id } = req.params;
  db.run(
    'UPDATE notes SET content = ?, is_published = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [content || '', is_published !== false ? 1 : 0, id],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else if (this.changes === 0) {
        res.status(404).json({ error: 'Note not found' });
      } else {
        res.json({ id, content, is_published });
      }
    }
  );
});

// Delete note
app.delete('/api/notes/:id', authenticateAdmin, (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM notes WHERE id = ?', [id], function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (this.changes === 0) {
      res.status(404).json({ error: 'Note not found' });
    } else {
      res.json({ success: true, message: 'Note deleted' });
    }
  });
});

// ======================== ANNOUNCEMENTS ========================

// Get active announcements
app.get('/api/announcements', (req, res) => {
  db.all(
    'SELECT * FROM announcements WHERE is_active = 1 AND archived_at IS NULL ORDER BY created_at DESC',
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json(rows || []);
      }
    }
  );
});

// Get all announcements (including archived)
app.get('/api/announcements/all', (req, res) => {
  db.all('SELECT * FROM announcements ORDER BY created_at DESC', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows || []);
    }
  });
});

// Create announcement
app.post('/api/announcements', authenticateAdmin, (req, res) => {
  const { title, content, course_id, is_active } = req.body;
  if (!title || title.trim() === '') {
    return res.status(400).json({ error: 'Title is required' });
  }
  db.run(
    'INSERT INTO announcements (title, content, course_id, is_active) VALUES (?, ?, ?, ?)',
    [title, content || '', course_id || null, is_active !== false ? 1 : 0],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({ id: this.lastID, title, content, course_id, is_active });
      }
    }
  );
});

// Update/archive announcement
app.put('/api/announcements/:id', authenticateAdmin, (req, res) => {
  const { title, content, is_active, archived_at } = req.body;
  const { id } = req.params;
  db.run(
    'UPDATE announcements SET title = ?, content = ?, is_active = ?, archived_at = ? WHERE id = ?',
    [title || '', content || '', is_active !== false ? 1 : 0, archived_at || null, id],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else if (this.changes === 0) {
        res.status(404).json({ error: 'Announcement not found' });
      } else {
        res.json({ id, title, content, is_active });
      }
    }
  );
});

// Delete announcement
app.delete('/api/announcements/:id', authenticateAdmin, (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM announcements WHERE id = ?', [id], function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (this.changes === 0) {
      res.status(404).json({ error: 'Announcement not found' });
    } else {
      res.json({ success: true, message: 'Announcement deleted' });
    }
  });
});

// ======================== ENGAGEMENT TRACKING ========================

// Track chapter view and time spent
app.post('/api/engagement/track', (req, res) => {
  const { chapter_id, time_spent } = req.body;
  if (!chapter_id) {
    return res.status(400).json({ error: 'Chapter ID is required' });
  }
  db.run(
    'INSERT INTO engagement_logs (chapter_id, time_spent) VALUES (?, ?)',
    [chapter_id, time_spent || 0],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({ success: true, id: this.lastID });
      }
    }
  );
});

// Get engagement statistics by chapter
app.get('/api/engagement/stats', (req, res) => {
  db.all(
    `SELECT 
      chapter_id, 
      COUNT(*) as total_views, 
      AVG(time_spent) as avg_time_spent,
      MAX(time_spent) as max_time_spent
     FROM engagement_logs 
     GROUP BY chapter_id
     ORDER BY total_views DESC`,
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json(rows || []);
      }
    }
  );
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
