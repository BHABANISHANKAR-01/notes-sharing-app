import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import '../styles/ClientPortal.css';

const ClientPortal = () => {
  const [courses, setCourses] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [notes, setNotes] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [allAnnouncements, setAllAnnouncements] = useState([]);
  const [engagementStats, setEngagementStats] = useState([]);

  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [selectedNote, setSelectedNote] = useState(null);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showAnnouncementHistory, setShowAnnouncementHistory] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [activeAnnouncementIndex, setActiveAnnouncementIndex] = useState(0);

  const API_URL = 'http://localhost:5000/api';
  const engagementTimerRef = useRef(null);
  const timeStartRef = useRef(Date.now());

  // Disable copy protection
  useEffect(() => {
    const disableRightClick = (e) => e.preventDefault();
    const disableCopy = (e) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'x')) {
        e.preventDefault();
      }
    };
    const disableSelection = () => false;

    document.addEventListener('contextmenu', disableRightClick);
    document.addEventListener('keydown', disableCopy);
    document.addEventListener('selectstart', disableSelection);

    // Disable text selection CSS
    document.body.style.userSelect = 'none';
    document.body.style.webkitUserSelect = 'none';
    document.body.style.MozUserSelect = 'none';
    document.body.style.msUserSelect = 'none';

    return () => {
      document.removeEventListener('contextmenu', disableRightClick);
      document.removeEventListener('keydown', disableCopy);
      document.removeEventListener('selectstart', disableSelection);
    };
  }, []);

  // Fetch initial data
  useEffect(() => {
    fetchCourses();
    fetchAnnouncements();
  }, []);

  // Track engagement
  useEffect(() => {
    if (selectedChapter) {
      timeStartRef.current = Date.now();

      engagementTimerRef.current = setInterval(async () => {
        const timeSpent = Math.floor((Date.now() - timeStartRef.current) / 1000);
        try {
          await axios.post(`${API_URL}/engagement/track`, {
            chapter_id: selectedChapter,
            time_spent: timeSpent,
          });
        } catch (error) {
          console.error('Error tracking engagement:', error);
        }
      }, 30000); // Track every 30 seconds

      return () => {
        if (engagementTimerRef.current) {
          clearInterval(engagementTimerRef.current);
        }
      };
    }
  }, [selectedChapter]);

  // Fetch courses
  const fetchCourses = async () => {
    try {
      const response = await axios.get(`${API_URL}/courses`);
      setCourses(response.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  // Fetch chapters for selected course
  const fetchChapters = async (courseId) => {
    try {
      const response = await axios.get(`${API_URL}/chapters/${courseId}`);
      setChapters(response.data);
    } catch (error) {
      console.error('Error fetching chapters:', error);
    }
  };

  // Fetch notes for selected chapter
  const fetchNotes = async (chapterId) => {
    try {
      const response = await axios.get(`${API_URL}/notes/${chapterId}`);
      setNotes(response.data);
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  };

  // Fetch active announcements
  const fetchAnnouncements = async () => {
    try {
      const response = await axios.get(`${API_URL}/announcements`);
      setAnnouncements(response.data.slice(0, 3));

      const allResponse = await axios.get(`${API_URL}/announcements/all`);
      setAllAnnouncements(allResponse.data);
    } catch (error) {
      console.error('Error fetching announcements:', error);
    }
  };

  // Fetch engagement statistics
  const fetchEngagementStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/engagement/stats`);
      setEngagementStats(response.data);
    } catch (error) {
      console.error('Error fetching engagement stats:', error);
    }
  };

  // Render code blocks with syntax highlighting
  const renderNoteContent = (content) => {
    if (!content) return '';

    // Syntax highlighting color map
    const syntaxColors = {
      javascript: { keywords: ['const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'class', 'import', 'export', 'default', 'async', 'await', 'new', 'this', 'true', 'false', 'null', 'undefined'], comment: '#6A9955', string: '#CE9178', keyword: '#569CD6', number: '#B5CEA8', function: '#DCDCAA', operator: '#D4D4D4' },
      python: { keywords: ['def', 'class', 'if', 'else', 'elif', 'for', 'while', 'return', 'import', 'from', 'as', 'True', 'False', 'None', 'and', 'or', 'not', 'in', 'is', 'lambda', 'try', 'except', 'finally', 'with'], comment: '#6A9955', string: '#CE9178', keyword: '#569CD6', number: '#B5CEA8', function: '#DCDCAA', operator: '#D4D4D4' },
      jsx: { keywords: ['const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'class', 'import', 'export', 'default', 'async', 'await', 'new', 'this', 'true', 'false', 'null', 'undefined'], comment: '#6A9955', string: '#CE9178', keyword: '#569CD6', number: '#B5CEA8', function: '#DCDCAA', operator: '#D4D4D4' },
      html: { keywords: ['html', 'head', 'body', 'div', 'span', 'p', 'a', 'img', 'script', 'style', 'meta', 'link', 'title'], comment: '#6A9955', string: '#CE9178', keyword: '#D7BA7D', number: '#B5CEA8', function: '#DCDCAA', operator: '#D4D4D4' },
      css: { keywords: ['color', 'background', 'margin', 'padding', 'border', 'width', 'height', 'display', 'flex', 'grid', 'font', 'text', 'position', 'absolute', 'relative'], comment: '#6A9955', string: '#CE9178', keyword: '#569CD6', number: '#B5CEA8', function: '#DCDCAA', operator: '#D4D4D4' },
      sql: { keywords: ['SELECT', 'FROM', 'WHERE', 'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'DROP', 'ALTER', 'TABLE', 'DATABASE', 'JOIN', 'LEFT', 'RIGHT', 'INNER', 'OUTER', 'ON', 'AS', 'AND', 'OR', 'NOT', 'IN', 'LIKE'], comment: '#6A9955', string: '#CE9178', keyword: '#569CD6', number: '#B5CEA8', function: '#DCDCAA', operator: '#D4D4D4' }
    };

    const getLanguageColors = (lang) => syntaxColors[lang.toLowerCase()] || syntaxColors.javascript;

    const highlightCode = (code, language) => {
      const colors = getLanguageColors(language);
      let highlighted = code;
      
      // Highlight keywords
      colors.keywords?.forEach(keyword => {
        const regex = new RegExp(`\\b${keyword}\\b`, 'g');
        highlighted = highlighted.replace(regex, `<span style="color: ${colors.keyword}">${keyword}</span>`);
      });

      // Highlight strings (both single and double quotes)
      highlighted = highlighted.replace(/(['"`])([^'"` ]*?)\1/g, `<span style="color: ${colors.string}">$&</span>`);

      // Highlight comments
      highlighted = highlighted.replace(/(\/\/.*?$|\/\*[\s\S]*?\*\/)/gm, `<span style="color: ${colors.comment}">$&</span>`);

      // Highlight numbers
      highlighted = highlighted.replace(/\b(\d+\.?\d*)\b/g, `<span style="color: ${colors.number}">$1</span>`);

      return highlighted;
    };

    // Split by code blocks (```language ... ```)
    const parts = content.split(/```(\w*)\n([\s\S]*?)```/);
    
    return parts.map((part, index) => {
      if (index % 3 === 0) {
        // Regular text
        return (
          <p key={index} className="note-paragraph">
            {part}
          </p>
        );
      } else if (index % 3 === 1) {
        // Language identifier
        const language = part || 'text';
        const code = parts[index + 1];
        const highlighted = highlightCode(code, language);
        return (
          <div key={index} className="code-block">
            <div className="code-header">
              <span className="code-language">{language.toUpperCase()}</span>
              <button 
                className="copy-code-btn"
                onClick={() => navigator.clipboard.writeText(code)}
                title="Copy code"
              >
                📋 Copy
              </button>
            </div>
            <pre><code className={`language-${language}`} dangerouslySetInnerHTML={{ __html: highlighted }}></code></pre>
          </div>
        );
      }
      return null;
    }).filter(Boolean);
  };

  // Handle course click
  const handleCourseClick = (courseId) => {
    setSelectedCourse(courseId);
    fetchChapters(courseId);
    setSelectedChapter(null);
    setNotes([]);
  };

  // Handle chapter click
  const handleChapterClick = (chapterId) => {
    setSelectedChapter(chapterId);
    fetchNotes(chapterId);
  };

  // Get course name by ID
  const getCourseName = (courseId) => {
    const course = courses.find((c) => c.id === courseId);
    return course ? course.title : 'Course';
  };

  // Get chapter name by ID
  const getChapterName = (chapterId) => {
    const chapter = chapters.find((c) => c.id === chapterId);
    return chapter ? chapter.title : 'Chapter';
  };

  return (
    <div className="client-portal">
      {/* Floating Announcements */}
      {announcements.length > 0 && (
        <div className="floating-announcements">
          <div className="announcements-carousel">
            {announcements.map((ann, index) => (
              <div
                key={ann.id}
                className={`announcement-slide ${index === activeAnnouncementIndex ? 'active' : ''}`}
              >
                <strong>{ann.title}</strong>
                <p>{ann.content?.substring(0, 100)}...</p>
              </div>
            ))}
          </div>
          <div className="announcements-controls">
            <button
              onClick={() =>
                setActiveAnnouncementIndex((i) => (i - 1 + announcements.length) % announcements.length)
              }
            >
              ❮
            </button>
            <span>{activeAnnouncementIndex + 1}/{announcements.length}</span>
            <button
              onClick={() => setActiveAnnouncementIndex((i) => (i + 1) % announcements.length)}
            >
              ❯
            </button>
            <button
              className="history-btn"
              onClick={() => setShowAnnouncementHistory(true)}
              title="View announcement history"
            >
              📋
            </button>
            <button
              className="analytics-btn"
              onClick={() => {
                fetchEngagementStats();
                setShowAnalytics(true);
              }}
              title="View analytics"
            >
              📊
            </button>
          </div>
        </div>
      )}

      {/* Announcement History Modal */}
      {showAnnouncementHistory && (
        <div className="modal-overlay" onClick={() => setShowAnnouncementHistory(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Announcement History</h2>
              <button
                className="close-btn"
                onClick={() => setShowAnnouncementHistory(false)}
              >
                ×
              </button>
            </div>
            <div className="announcement-history-list">
              {allAnnouncements.map((ann) => (
                <div key={ann.id} className="history-item">
                  <h4>{ann.title}</h4>
                  <p>{ann.content}</p>
                  <small>
                    {new Date(ann.created_at).toLocaleDateString()} {new Date(ann.created_at).toLocaleTimeString()}
                  </small>
                  {ann.archived_at && (
                    <span className="badge archived">Archived</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Analytics Modal */}
      {showAnalytics && (
        <div className="modal-overlay" onClick={() => setShowAnalytics(false)}>
          <div className="modal-content analytics-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📊 Engagement Analytics</h2>
              <button
                className="close-btn"
                onClick={() => setShowAnalytics(false)}
              >
                ×
              </button>
            </div>
            <div className="analytics-content">
              {engagementStats.length > 0 ? (
                <div className="analytics-grid">
                  {engagementStats.map((stat) => {
                    const chapterName = chapters.find(c => c.id === stat.chapter_id)?.title || `Chapter ${stat.chapter_id}`;
                    return (
                      <div key={stat.chapter_id} className="analytics-card fade-in">
                        <h4>{chapterName}</h4>
                        <div className="stat-row">
                          <span>👁️ Total Views:</span>
                          <strong>{stat.total_views}</strong>
                        </div>
                        <div className="stat-row">
                          <span>⏱️ Avg Time:</span>
                          <strong>{Math.round(stat.avg_time_spent || 0)}s</strong>
                        </div>
                        <div className="stat-row">
                          <span>⏰ Max Time:</span>
                          <strong>{Math.round(stat.max_time_spent || 0)}s</strong>
                        </div>
                        <div className="progress-bar">
                          <div 
                            className="progress-fill" 
                            style={{width: `${Math.min((stat.total_views / Math.max(...engagementStats.map(s => s.total_views))) * 100, 100)}%`}}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="empty-analytics">
                  <p>No analytics data available yet.</p>
                  <p>Analytics will appear as students view chapters.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="portal-container">
        {/* Sidebar */}
        <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? '◀' : '▶'}
          </button>

          {sidebarOpen && (
            <nav className="sidebar-nav">
              <h3>📚 Courses</h3>
              <ul className="courses-list">
                {courses.map((course) => (
                  <li key={course.id}>
                    <button
                      className={`course-link ${selectedCourse === course.id ? 'active' : ''}`}
                      onClick={() => handleCourseClick(course.id)}
                    >
                      {course.title}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </aside>

        {/* Main Content */}
        <main className="portal-main">
          {/* Breadcrumb */}
          <div className="breadcrumb">
            <button onClick={() => {
              setSelectedCourse(null);
              setSelectedChapter(null);
              setNotes([]);
            }}>
              Home
            </button>
            {selectedCourse && (
              <>
                <span> / </span>
                <span>{getCourseName(selectedCourse)}</span>
              </>
            )}
            {selectedChapter && (
              <>
                <span> / </span>
                <span>{getChapterName(selectedChapter)}</span>
              </>
            )}
          </div>

          {/* Course View */}
          {selectedCourse && !selectedChapter && (
            <div className="course-view">
              <h1>{getCourseName(selectedCourse)}</h1>
              <div className="chapters-grid">
                {chapters.map((chapter) => (
                  <div
                    key={chapter.id}
                    className="chapter-card"
                    onClick={() => handleChapterClick(chapter.id)}
                  >
                    <h3>{chapter.title}</h3>
                    <p>Click to view notes</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Chapter View with Notes */}
          {selectedChapter && (
            <div className="chapter-view">
              <div className="chapter-header">
                <h1>{getChapterName(selectedChapter)}</h1>
                <p className="course-context">from {getCourseName(selectedCourse)}</p>
              </div>

              <div className="notes-container">
                {notes.length > 0 ? (
                  <div className="notes-content slide-in">
                    {notes.map((note, index) => (
                      <div key={note.id} className="note-section fade-in">
                        <div className="note-header">
                          <h3>📝 Note {index + 1}</h3>
                          <small>{new Date(note.created_at).toLocaleDateString()}</small>
                        </div>
                        <div className="note-body">
                          {renderNoteContent(note.content)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state fade-in">
                    <p>No notes available for this chapter yet.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Home View */}
          {!selectedCourse && (
            <div className="home-view">
              <h1>Welcome to Notes Sharing Platform</h1>
              <p>Select a course from the sidebar to get started.</p>
              <div className="quick-courses">
                {courses.map((course) => (
                  <div key={course.id} className="quick-course-card">
                    <h3>{course.title}</h3>
                    <p>{course.description}</p>
                    <button onClick={() => handleCourseClick(course.id)}>
                      View Course →
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ClientPortal;
