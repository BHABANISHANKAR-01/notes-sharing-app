import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/AdminPanel.css';

const AdminPanel = ({ adminPassword }) => {
  const [courses, setCourses] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [notes, setNotes] = useState([]);
  const [announcements, setAnnouncements] = useState([]);

  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [selectedNote, setSelectedNote] = useState(null);

  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [newCourseDesc, setNewCourseDesc] = useState('');
  const [newChapterTitle, setNewChapterTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [newAnnouncementTitle, setNewAnnouncementTitle] = useState('');
  const [newAnnouncementContent, setNewAnnouncementContent] = useState('');

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('courses');

  const API_URL = 'http://localhost:5000/api';

  // Helper function to get auth headers
  const getAuthPayload = () => ({
    username: 'trainerMaster2025',
    password: adminPassword,
  });

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

  // Fetch announcements
  const fetchAnnouncements = async () => {
    try {
      const response = await axios.get(`${API_URL}/announcements/all`);
      setAnnouncements(response.data);
    } catch (error) {
      console.error('Error fetching announcements:', error);
    }
  };

  // Initialize
  useEffect(() => {
    fetchCourses();
    fetchAnnouncements();
  }, []);

  // ================ COURSES ================

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    if (!newCourseTitle.trim()) {
      setMessage('Course title is required');
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${API_URL}/courses`, {
        ...getAuthPayload(),
        title: newCourseTitle,
        description: newCourseDesc,
      });
      setMessage('Course created successfully');
      setNewCourseTitle('');
      setNewCourseDesc('');
      fetchCourses();
    } catch (error) {
      setMessage('Error creating course: ' + error.response?.data?.error || error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      setLoading(true);
      try {
        await axios.delete(`${API_URL}/courses/${courseId}`, {
          data: getAuthPayload(),
        });
        setMessage('Course deleted successfully');
        fetchCourses();
        setSelectedCourse(null);
        setChapters([]);
      } catch (error) {
        setMessage('Error deleting course: ' + error.response?.data?.error || error.message);
      } finally {
        setLoading(false);
      }
    }
  };

  // ================ CHAPTERS ================

  const handleCreateChapter = async (e) => {
    e.preventDefault();
    if (!selectedCourse) {
      setMessage('Please select a course first');
      return;
    }
    if (!newChapterTitle.trim()) {
      setMessage('Chapter title is required');
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${API_URL}/chapters`, {
        ...getAuthPayload(),
        course_id: selectedCourse,
        title: newChapterTitle,
      });
      setMessage('Chapter created successfully');
      setNewChapterTitle('');
      fetchChapters(selectedCourse);
    } catch (error) {
      setMessage('Error creating chapter: ' + error.response?.data?.error || error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteChapter = async (chapterId) => {
    if (window.confirm('Are you sure you want to delete this chapter?')) {
      setLoading(true);
      try {
        await axios.delete(`${API_URL}/chapters/${chapterId}`, {
          data: getAuthPayload(),
        });
        setMessage('Chapter deleted successfully');
        fetchChapters(selectedCourse);
        setSelectedChapter(null);
        setNotes([]);
      } catch (error) {
        setMessage('Error deleting chapter: ' + error.response?.data?.error || error.message);
      } finally {
        setLoading(false);
      }
    }
  };

  // ================ NOTES ================

  const handleCreateNote = async (e) => {
    e.preventDefault();
    if (!selectedChapter) {
      setMessage('Please select a chapter first');
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${API_URL}/notes`, {
        ...getAuthPayload(),
        chapter_id: selectedChapter,
        content: noteContent,
        is_published: true,
      });
      setMessage('Note created successfully');
      setNoteContent('');
      fetchNotes(selectedChapter);
    } catch (error) {
      setMessage('Error creating note: ' + error.response?.data?.error || error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateNote = async (e) => {
    e.preventDefault();
    if (!selectedNote) {
      setMessage('Please select a note first');
      return;
    }
    setLoading(true);
    try {
      await axios.put(`${API_URL}/notes/${selectedNote}`, {
        ...getAuthPayload(),
        content: noteContent,
        is_published: true,
      });
      setMessage('Note updated successfully');
      fetchNotes(selectedChapter);
    } catch (error) {
      setMessage('Error updating note: ' + error.response?.data?.error || error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      setLoading(true);
      try {
        await axios.delete(`${API_URL}/notes/${noteId}`, {
          data: getAuthPayload(),
        });
        setMessage('Note deleted successfully');
        fetchNotes(selectedChapter);
        setSelectedNote(null);
        setNoteContent('');
      } catch (error) {
        setMessage('Error deleting note: ' + error.response?.data?.error || error.message);
      } finally {
        setLoading(false);
      }
    }
  };

  // ================ ANNOUNCEMENTS ================

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    if (!newAnnouncementTitle.trim()) {
      setMessage('Announcement title is required');
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${API_URL}/announcements`, {
        ...getAuthPayload(),
        title: newAnnouncementTitle,
        content: newAnnouncementContent,
        course_id: null,
        is_active: true,
      });
      setMessage('Announcement created successfully');
      setNewAnnouncementTitle('');
      setNewAnnouncementContent('');
      fetchAnnouncements();
    } catch (error) {
      setMessage('Error creating announcement: ' + error.response?.data?.error || error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAnnouncement = async (announcementId) => {
    if (window.confirm('Are you sure you want to delete this announcement?')) {
      setLoading(true);
      try {
        await axios.delete(`${API_URL}/announcements/${announcementId}`, {
          data: getAuthPayload(),
        });
        setMessage('Announcement deleted successfully');
        fetchAnnouncements();
      } catch (error) {
        setMessage('Error deleting announcement: ' + error.response?.data?.error || error.message);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="admin-panel">
      <div className="admin-tabs">
        <button
          className={`tab-btn ${activeTab === 'courses' ? 'active' : ''}`}
          onClick={() => setActiveTab('courses')}
        >
          📚 Courses
        </button>
        <button
          className={`tab-btn ${activeTab === 'announcements' ? 'active' : ''}`}
          onClick={() => setActiveTab('announcements')}
        >
          📢 Announcements
        </button>
      </div>

      {message && (
        <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
          {message}
          <button onClick={() => setMessage('')}>×</button>
        </div>
      )}

      {/* Courses Tab */}
      {activeTab === 'courses' && (
        <div className="admin-section">
          <div className="admin-row">
            {/* Left: Courses List */}
            <div className="admin-column">
              <h2>Courses</h2>
              <form onSubmit={handleCreateCourse} className="form-group">
                <input
                  type="text"
                  placeholder="Course Title"
                  value={newCourseTitle}
                  onChange={(e) => setNewCourseTitle(e.target.value)}
                />
                <textarea
                  placeholder="Course Description"
                  value={newCourseDesc}
                  onChange={(e) => setNewCourseDesc(e.target.value)}
                  rows="3"
                />
                <button type="submit" disabled={loading}>
                  {loading ? 'Creating...' : 'Add Course'}
                </button>
              </form>

              <div className="items-list">
                {courses.map((course) => (
                  <div
                    key={course.id}
                    className={`item ${selectedCourse === course.id ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedCourse(course.id);
                      fetchChapters(course.id);
                      setSelectedChapter(null);
                      setNotes([]);
                    }}
                  >
                    <div className="item-header">
                      <h4>{course.title}</h4>
                      <button
                        className="delete-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCourse(course.id);
                        }}
                      >
                        🗑️
                      </button>
                    </div>
                    {course.description && <p className="item-desc">{course.description}</p>}
                  </div>
                ))}
              </div>
            </div>

            {/* Middle: Chapters */}
            {selectedCourse && (
              <div className="admin-column">
                <h2>Chapters</h2>
                <form onSubmit={handleCreateChapter} className="form-group">
                  <input
                    type="text"
                    placeholder="Chapter Title"
                    value={newChapterTitle}
                    onChange={(e) => setNewChapterTitle(e.target.value)}
                  />
                  <button type="submit" disabled={loading}>
                    {loading ? 'Creating...' : 'Add Chapter'}
                  </button>
                </form>

                <div className="items-list">
                  {chapters.map((chapter) => (
                    <div
                      key={chapter.id}
                      className={`item ${selectedChapter === chapter.id ? 'active' : ''}`}
                      onClick={() => {
                        setSelectedChapter(chapter.id);
                        fetchNotes(chapter.id);
                      }}
                    >
                      <div className="item-header">
                        <h4>{chapter.title}</h4>
                        <button
                          className="delete-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteChapter(chapter.id);
                          }}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Right: Notes Editor */}
            {selectedChapter && (
              <div className="admin-column">
                <h2>Notes</h2>
                <form onSubmit={selectedNote ? handleUpdateNote : handleCreateNote} className="form-group">
                  <textarea
                    placeholder="Note content..."
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    rows="8"
                  />
                  <div className="form-buttons">
                    <button type="submit" disabled={loading}>
                      {loading ? 'Saving...' : selectedNote ? 'Update Note' : 'Create Note'}
                    </button>
                    {selectedNote && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedNote(null);
                          setNoteContent('');
                        }}
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </form>

                <div className="items-list">
                  {notes.map((note, index) => (
                    <div
                      key={note.id}
                      className={`item ${selectedNote === note.id ? 'active' : ''}`}
                      onClick={() => {
                        setSelectedNote(note.id);
                        setNoteContent(note.content);
                      }}
                    >
                      <div className="item-header">
                        <h4>Note {index + 1}</h4>
                        <button
                          className="delete-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteNote(note.id);
                          }}
                        >
                          🗑️
                        </button>
                      </div>
                      <p className="note-preview">{note.content?.substring(0, 100)}...</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Announcements Tab */}
      {activeTab === 'announcements' && (
        <div className="admin-section">
          <div className="announcements-container">
            <div className="announcements-form">
              <h2>Create Announcement</h2>
              <form onSubmit={handleCreateAnnouncement} className="form-group">
                <input
                  type="text"
                  placeholder="Announcement Title"
                  value={newAnnouncementTitle}
                  onChange={(e) => setNewAnnouncementTitle(e.target.value)}
                />
                <textarea
                  placeholder="Announcement Content"
                  value={newAnnouncementContent}
                  onChange={(e) => setNewAnnouncementContent(e.target.value)}
                  rows="4"
                />
                <button type="submit" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Announcement'}
                </button>
              </form>
            </div>

            <div className="announcements-list">
              <h2>All Announcements</h2>
              <div className="items-list">
                {announcements.map((announcement) => (
                  <div key={announcement.id} className="item">
                    <div className="item-header">
                      <div>
                        <h4>{announcement.title}</h4>
                        <span className={`badge ${announcement.is_active ? 'active' : 'archived'}`}>
                          {announcement.is_active ? 'Active' : 'Archived'}
                        </span>
                      </div>
                      <button
                        className="delete-btn"
                        onClick={() => handleDeleteAnnouncement(announcement.id)}
                      >
                        🗑️
                      </button>
                    </div>
                    <p className="item-desc">{announcement.content}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
