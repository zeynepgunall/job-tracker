const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const DATA_FILE = path.join(__dirname, 'data', 'applications.json');
const USERS_FILE = path.join(__dirname, 'data', 'users.json');

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Authentication Middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}

// Ensure data directory exists
async function ensureDataDirectory() {
  const dataDir = path.dirname(DATA_FILE);
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

// User management functions
async function readUsers() {
  try {
    await ensureDataDirectory();
    const data = await fs.readFile(USERS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

async function writeUsers(users) {
  await ensureDataDirectory();
  await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
}

async function getUserApplications(userId) {
  try {
    await ensureDataDirectory();
    const userDataFile = path.join(__dirname, 'data', `applications_${userId}.json`);
    const data = await fs.readFile(userDataFile, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

async function writeUserApplications(userId, applications) {
  await ensureDataDirectory();
  const userDataFile = path.join(__dirname, 'data', `applications_${userId}.json`);
  await fs.writeFile(userDataFile, JSON.stringify(applications, null, 2), 'utf8');
}

// Read applications from file (legacy, kept for compatibility)
async function readApplications() {
  try {
    await ensureDataDirectory();
    const data = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

// Write applications to file (legacy, kept for compatibility)
async function writeApplications(applications) {
  await ensureDataDirectory();
  await fs.writeFile(DATA_FILE, JSON.stringify(applications, null, 2), 'utf8');
}

// Helper function to generate UUID
function generateId() {
  return require('uuid').v4();
}

// Helper function to get current timestamp
function getCurrentTimestamp() {
  return new Date().toISOString();
}

// Allowed status values
const ALLOWED_STATUSES = ['Applied', 'Interview', 'Offer', 'Rejected', 'Accepted'];

// Validation function
function validateApplication(data, isUpdate = false) {
  const errors = [];
  
  // Company validation
  if (!data.company || typeof data.company !== 'string') {
    errors.push('Company is required and must be a string');
  } else {
    const trimmedCompany = data.company.trim();
    if (trimmedCompany.length === 0) {
      errors.push('Company cannot be empty');
    }
  }
  
  // Position validation
  if (!data.position || typeof data.position !== 'string') {
    errors.push('Position is required and must be a string');
  } else {
    const trimmedPosition = data.position.trim();
    if (trimmedPosition.length === 0) {
      errors.push('Position cannot be empty');
    }
  }
  
  // Status validation
  if (data.status !== undefined && data.status !== null) {
    if (typeof data.status !== 'string') {
      errors.push('Status must be a string');
    } else if (!ALLOWED_STATUSES.includes(data.status)) {
      errors.push(`Status must be one of: ${ALLOWED_STATUSES.join(', ')}`);
    }
  }
  
  // Date validation (YYYY-MM-DD format)
  if (data.dateApplied !== undefined && data.dateApplied !== null) {
    if (typeof data.dateApplied !== 'string') {
      errors.push('Date applied must be a string');
    } else {
      // Check YYYY-MM-DD format
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(data.dateApplied)) {
        errors.push('Date applied must be in YYYY-MM-DD format');
      } else {
        // Validate that it's a valid date
        const date = new Date(data.dateApplied);
        if (isNaN(date.getTime())) {
          errors.push('Date applied must be a valid date');
        } else {
          // Check if the date string matches the parsed date (prevents invalid dates like 2024-13-45)
          const [year, month, day] = data.dateApplied.split('-').map(Number);
          const parsedDate = new Date(year, month - 1, day);
          if (parsedDate.getFullYear() !== year || 
              parsedDate.getMonth() !== month - 1 || 
              parsedDate.getDate() !== day) {
            errors.push('Date applied must be a valid date');
          }
        }
      }
    }
  }
  
  // Follow-up date validation (YYYY-MM-DD format, optional)
  if (data.followUpDate !== undefined && data.followUpDate !== null) {
    if (typeof data.followUpDate !== 'string') {
      errors.push('Follow-up date must be a string');
    } else if (data.followUpDate.trim() !== '') {
      // Check YYYY-MM-DD format
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(data.followUpDate)) {
        errors.push('Follow-up date must be in YYYY-MM-DD format');
      } else {
        // Validate that it's a valid date
        const date = new Date(data.followUpDate);
        if (isNaN(date.getTime())) {
          errors.push('Follow-up date must be a valid date');
        } else {
          // Check if the date string matches the parsed date
          const [year, month, day] = data.followUpDate.split('-').map(Number);
          const parsedDate = new Date(year, month - 1, day);
          if (parsedDate.getFullYear() !== year || 
              parsedDate.getMonth() !== month - 1 || 
              parsedDate.getDate() !== day) {
            errors.push('Follow-up date must be a valid date');
          }
        }
      }
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors
  };
}

// ==================== AUTHENTICATION ROUTES ====================

// POST register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email and password are required' });
    }

    if (username.trim().length < 3) {
      return res.status(400).json({ error: 'Username must be at least 3 characters' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    const users = await readUsers();

    // Check if user already exists
    if (users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = {
      id: generateId(),
      username: username.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      createdAt: getCurrentTimestamp()
    };

    users.push(newUser);
    await writeUsers(users);

    // Generate token
    const token = jwt.sign(
      { userId: newUser.id, username: newUser.username },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token: token,
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to register user', message: error.message });
  }
});

// POST login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validation
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const users = await readUsers();

    // Find user by username or email
    const user = users.find(
      u => u.username.toLowerCase() === username.toLowerCase() ||
           u.email.toLowerCase() === username.toLowerCase()
    );

    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token: token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to login', message: error.message });
  }
});

// GET current user (verify token)
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const users = await readUsers();
    const user = users.find(u => u.id === req.user.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user.id,
      username: user.username,
      email: user.email
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get user', message: error.message });
  }
});

// ==================== API ROUTES (PROTECTED) ====================

// GET all applications
app.get('/api/applications', authenticateToken, async (req, res) => {
  try {
    const applications = await getUserApplications(req.user.userId);
    res.json(applications);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read applications', message: error.message });
  }
});

// GET application by ID
app.get('/api/applications/:id', authenticateToken, async (req, res) => {
  try {
    const applications = await getUserApplications(req.user.userId);
    const application = applications.find(app => app.id === req.params.id);
    
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }
    
    res.json(application);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read application', message: error.message });
  }
});

// POST create new application
app.post('/api/applications', authenticateToken, async (req, res) => {
  try {
    const applications = await getUserApplications(req.user.userId);
    const { company, position, status, dateApplied, location, link, notes, favorite, followUpDate, followUpNote } = req.body;
    
    // Prepare data for validation (set defaults for required fields)
    const dataToValidate = {
      company: company,
      position: position,
      status: status || 'Applied',
      dateApplied: dateApplied || new Date().toISOString().split('T')[0],
      followUpDate: followUpDate || null
    };
    
    // Validation
    const validation = validateApplication(dataToValidate);
    if (!validation.isValid) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: validation.errors 
      });
    }
    
    const newApplication = {
      id: generateId(),
      company: company.trim(),
      position: position.trim(),
      status: status || 'Applied',
      dateApplied: dateApplied || new Date().toISOString().split('T')[0],
      location: location ? location.trim() : null,
      link: link ? link.trim() : null,
      notes: notes ? notes.trim() : null,
      favorite: favorite === true || favorite === 'true',
      followUpDate: followUpDate && followUpDate.trim() !== '' ? followUpDate.trim() : null,
      followUpNote: followUpNote ? followUpNote.trim() : null,
      createdAt: getCurrentTimestamp(),
      updatedAt: getCurrentTimestamp()
    };
    
    applications.push(newApplication);
    await writeUserApplications(req.user.userId, applications);
    
    res.status(201).json(newApplication);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create application', message: error.message });
  }
});

// PUT update application
app.put('/api/applications/:id', authenticateToken, async (req, res) => {
  try {
    const applications = await getUserApplications(req.user.userId);
    const index = applications.findIndex(app => app.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Application not found' });
    }
    
    const existingApplication = applications[index];
    const { company, position, status, dateApplied, location, link, notes, favorite } = req.body;
    
    // Prepare data for validation (use existing values if not provided)
    const dataToValidate = {
      company: company !== undefined ? company : existingApplication.company,
      position: position !== undefined ? position : existingApplication.position,
      status: status !== undefined ? status : existingApplication.status,
      dateApplied: dateApplied !== undefined ? dateApplied : existingApplication.dateApplied
    };
    
    // Validation
    const validation = validateApplication(dataToValidate, true);
    if (!validation.isValid) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: validation.errors 
      });
    }
    
    applications[index] = {
      ...applications[index],
      company: company !== undefined ? company.trim() : existingApplication.company,
      position: position !== undefined ? position.trim() : existingApplication.position,
      status: status !== undefined ? status : existingApplication.status,
      dateApplied: dateApplied !== undefined ? dateApplied : existingApplication.dateApplied,
      location: location !== undefined ? (location ? location.trim() : null) : existingApplication.location,
      link: link !== undefined ? (link ? link.trim() : null) : existingApplication.link,
      notes: notes !== undefined ? (notes ? notes.trim() : null) : existingApplication.notes,
      favorite: favorite !== undefined ? (favorite === true || favorite === 'true') : existingApplication.favorite,
      followUpDate: followUpDate !== undefined ? (followUpDate && followUpDate.trim() !== '' ? followUpDate.trim() : null) : (existingApplication.followUpDate || null),
      followUpNote: followUpNote !== undefined ? (followUpNote ? followUpNote.trim() : null) : (existingApplication.followUpNote || null),
      updatedAt: getCurrentTimestamp()
    };
    
    await writeUserApplications(req.user.userId, applications);
    
    res.json(applications[index]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update application', message: error.message });
  }
});

// DELETE application
app.delete('/api/applications/:id', authenticateToken, async (req, res) => {
  try {
    const applications = await getUserApplications(req.user.userId);
    const index = applications.findIndex(app => app.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Application not found' });
    }
    
    applications.splice(index, 1);
    await writeUserApplications(req.user.userId, applications);
    
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete application', message: error.message });
  }
});

// GET applications by status
app.get('/api/applications/status/:status', authenticateToken, async (req, res) => {
  try {
    const applications = await getUserApplications(req.user.userId);
    const filtered = applications.filter(app => app.status === req.params.status);
    res.json(filtered);
  } catch (error) {
    res.status(500).json({ error: 'Failed to filter applications', message: error.message });
  }
});

// GET favorite applications
app.get('/api/applications/favorites', authenticateToken, async (req, res) => {
  try {
    const applications = await getUserApplications(req.user.userId);
    const favorites = applications.filter(app => app.favorite === true);
    res.json(favorites);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get favorites', message: error.message });
  }
});

// GET follow-ups
// Returns applications grouped by follow-up status: today, overdue, upcoming (next 7 days)
app.get('/api/applications/follow-ups', authenticateToken, async (req, res) => {
  try {
    const applications = await getUserApplications(req.user.userId);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayStr = today.toISOString().split('T')[0];
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    const nextWeekStr = nextWeek.toISOString().split('T')[0];
    
    const todayItems = [];
    const overdueItems = [];
    const upcomingItems = [];
    
    applications.forEach(app => {
      // Backward compatibility: if followUpDate doesn't exist, treat as null
      const followUpDate = app.followUpDate || null;
      
      if (!followUpDate) {
        return; // Skip applications without follow-up dates
      }
      
      const followUpDateObj = new Date(followUpDate);
      followUpDateObj.setHours(0, 0, 0, 0);
      const followUpDateStr = followUpDateObj.toISOString().split('T')[0];
      
      if (followUpDateStr === todayStr) {
        todayItems.push(app);
      } else if (followUpDateStr < todayStr) {
        overdueItems.push(app);
      } else if (followUpDateStr > todayStr && followUpDateStr <= nextWeekStr) {
        upcomingItems.push(app);
      }
    });
    
    // Sort overdue by date (oldest first), upcoming by date (soonest first)
    overdueItems.sort((a, b) => {
      const dateA = new Date(a.followUpDate || 0);
      const dateB = new Date(b.followUpDate || 0);
      return dateA - dateB;
    });
    
    upcomingItems.sort((a, b) => {
      const dateA = new Date(a.followUpDate || 0);
      const dateB = new Date(b.followUpDate || 0);
      return dateA - dateB;
    });
    
    res.json({
      today: todayItems,
      overdue: overdueItems,
      upcoming: upcomingItems
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get follow-ups', message: error.message });
  }
});

// GET export applications
app.get('/api/applications/export', authenticateToken, async (req, res) => {
  try {
    const applications = await readApplications();
    
    const exportData = {
      version: "1.0",
      exportDate: getCurrentTimestamp(),
      totalItems: applications.length,
      items: applications
    };
    
    const json = JSON.stringify(exportData, null, 2);
    const filename = `job-tracker-backup-${new Date().toISOString().split('T')[0].replace(/-/g, '')}.json`;
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(json);
  } catch (error) {
    res.status(500).json({ error: 'Failed to export applications', message: error.message });
  }
});

// POST import applications
app.post('/api/applications/import', authenticateToken, async (req, res) => {
  try {
    const mode = req.query.mode || 'merge'; // 'merge' or 'replace'
    
    if (mode !== 'merge' && mode !== 'replace') {
      return res.status(400).json({ 
        error: 'Invalid mode', 
        message: 'Mode must be either "merge" or "replace"' 
      });
    }
    
    let importData = req.body;
    
    // Check if it's a valid export file format
    let itemsToImport = [];
    if (importData.items && Array.isArray(importData.items)) {
      itemsToImport = importData.items;
    } else if (Array.isArray(importData)) {
      // Support direct array format too
      itemsToImport = importData;
    } else {
      return res.status(400).json({ 
        error: 'Invalid file format', 
        message: 'Expected an array or an object with "items" array' 
      });
    }
    
    if (itemsToImport.length === 0) {
      return res.status(400).json({ 
        error: 'No data to import', 
        message: 'File contains no items' 
      });
    }
    
    // Validate items structure
    const validItems = [];
    const invalidItems = [];
    
    itemsToImport.forEach((item, index) => {
      if (!item || typeof item !== 'object') {
        invalidItems.push({ index, reason: 'Not an object' });
        return;
      }
      
      // Check required fields
      if (!item.company || typeof item.company !== 'string' || item.company.trim().length === 0) {
        invalidItems.push({ index, reason: 'Company is required and cannot be empty' });
        return;
      }
      
      if (!item.position || typeof item.position !== 'string' || item.position.trim().length === 0) {
        invalidItems.push({ index, reason: 'Position is required and cannot be empty' });
        return;
      }
      
      // Validate status if provided
      if (item.status && !ALLOWED_STATUSES.includes(item.status)) {
        invalidItems.push({ index, reason: `Invalid status: ${item.status}. Must be one of: ${ALLOWED_STATUSES.join(', ')}` });
        return;
      }
      
      // Validate date format if provided
      if (item.dateApplied) {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(item.dateApplied)) {
          invalidItems.push({ index, reason: `Invalid date format: ${item.dateApplied}. Must be YYYY-MM-DD` });
          return;
        }
        
        const date = new Date(item.dateApplied);
        if (isNaN(date.getTime())) {
          invalidItems.push({ index, reason: `Invalid date: ${item.dateApplied}` });
          return;
        }
      }
      
      validItems.push(item);
    });
    
    if (validItems.length === 0) {
      return res.status(400).json({ 
        error: 'No valid items to import', 
        message: 'All items failed validation',
        report: {
          total: itemsToImport.length,
          valid: 0,
          invalid: invalidItems.length,
          invalidDetails: invalidItems
        }
      });
    }
    
    // Read current applications
    const currentApplications = await readApplications();
    const existingIds = new Set(currentApplications.map(app => app.id));
    
    let finalApplications = [];
    let createdCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;
    
    if (mode === 'replace') {
      // Replace mode: use only imported items
      finalApplications = validItems.map(item => {
        const { id, ...itemData } = item;
        
        // Validate the item
        const validation = validateApplication({
          company: itemData.company,
          position: itemData.position,
          status: itemData.status || 'Applied',
          dateApplied: itemData.dateApplied || new Date().toISOString().split('T')[0]
        });
        
        if (!validation.isValid) {
          skippedCount++;
          return null;
        }
        
        return {
          id: id || generateId(),
          company: itemData.company.trim(),
          position: itemData.position.trim(),
          status: itemData.status || 'Applied',
          dateApplied: itemData.dateApplied || new Date().toISOString().split('T')[0],
          location: itemData.location ? itemData.location.trim() : null,
          link: itemData.link ? itemData.link.trim() : null,
          notes: itemData.notes ? itemData.notes.trim() : null,
          favorite: itemData.favorite === true || itemData.favorite === 'true',
          createdAt: item.createdAt || getCurrentTimestamp(),
          updatedAt: getCurrentTimestamp()
        };
      }).filter(item => item !== null);
      
      createdCount = finalApplications.length;
    } else {
      // Merge mode: combine existing with imported
      finalApplications = [...currentApplications];
      
      for (const item of validItems) {
        const { id, ...itemData } = item;
        
        // Validate the item
        const validation = validateApplication({
          company: itemData.company,
          position: itemData.position,
          status: itemData.status || 'Applied',
          dateApplied: itemData.dateApplied || new Date().toISOString().split('T')[0]
        });
        
        if (!validation.isValid) {
          skippedCount++;
          continue;
        }
        
        if (id && existingIds.has(id)) {
          // Update existing
          const index = finalApplications.findIndex(app => app.id === id);
          if (index >= 0) {
            finalApplications[index] = {
              ...finalApplications[index],
              company: itemData.company.trim(),
              position: itemData.position.trim(),
              status: itemData.status || finalApplications[index].status,
              dateApplied: itemData.dateApplied || finalApplications[index].dateApplied,
              location: itemData.location !== undefined ? (itemData.location ? itemData.location.trim() : null) : finalApplications[index].location,
              link: itemData.link !== undefined ? (itemData.link ? itemData.link.trim() : null) : finalApplications[index].link,
              notes: itemData.notes !== undefined ? (itemData.notes ? itemData.notes.trim() : null) : finalApplications[index].notes,
              favorite: itemData.favorite !== undefined ? (itemData.favorite === true || itemData.favorite === 'true') : finalApplications[index].favorite,
              updatedAt: getCurrentTimestamp()
            };
            updatedCount++;
          }
        } else {
          // Create new
          finalApplications.push({
            id: id || generateId(),
            company: itemData.company.trim(),
            position: itemData.position.trim(),
            status: itemData.status || 'Applied',
            dateApplied: itemData.dateApplied || new Date().toISOString().split('T')[0],
            location: itemData.location ? itemData.location.trim() : null,
            link: itemData.link ? itemData.link.trim() : null,
            notes: itemData.notes ? itemData.notes.trim() : null,
            favorite: itemData.favorite === true || itemData.favorite === 'true',
            createdAt: item.createdAt || getCurrentTimestamp(),
            updatedAt: getCurrentTimestamp()
          });
          createdCount++;
        }
      }
    }
    
    // Write to file
    await writeUserApplications(req.user.userId, finalApplications);
    
    // Return report
    res.json({
      success: true,
      mode: mode,
      report: {
        total: itemsToImport.length,
        valid: validItems.length,
        invalid: invalidItems.length,
        created: createdCount,
        updated: updatedCount,
        skipped: skippedCount,
        finalTotal: finalApplications.length,
        invalidDetails: invalidItems.length > 0 ? invalidItems : undefined
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to import applications', message: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Job Tracker API is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Job Tracker API server running on http://localhost:${PORT}`);
  console.log(`📡 API endpoints available at http://localhost:${PORT}/api/applications`);
});

