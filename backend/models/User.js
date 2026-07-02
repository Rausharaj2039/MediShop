const bcrypt = require('bcryptjs');
const { getDb } = require('../config/db');

const mapUser = (row) => {
  if (!row) return null;

  const user = {
    _id: row.id,
    id: row.id,
    name: row.name,
    email: row.email,
    password: row.password,
    role: row.role,
    resetToken: row.reset_token,
    resetTokenExpiry: row.reset_token_expiry,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };

  user.matchPassword = async (enteredPassword) =>
    bcrypt.compare(enteredPassword, user.password);

  return user;
};

const User = {
  findOne: async ({ email }) => {
    const row = getDb()
      .prepare('SELECT * FROM users WHERE email = ?')
      .get(email.toLowerCase().trim());
    return mapUser(row);
  },

  findById: async (id, select) => {
    const row = getDb().prepare('SELECT * FROM users WHERE id = ?').get(id);
    const user = mapUser(row);

    if (user && select === '-password') {
      const { password, ...safeUser } = user;
      return {
        ...safeUser,
        matchPassword: user.matchPassword,
      };
    }

    return user;
  },

  findAll: async () => {
    const rows = getDb()
      .prepare('SELECT * FROM users ORDER BY created_at DESC')
      .all();
    return rows.map(mapUser);
  },

  create: async ({ name, email, password, role = 'user' }) => {
    const hashedPassword = await bcrypt.hash(password, 10);
    const now = new Date().toISOString();
    const normalizedEmail = email.toLowerCase().trim();

    const result = getDb()
      .prepare(
        `INSERT INTO users (name, email, password, role, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?)`
      )
      .run(name, normalizedEmail, hashedPassword, role, now, now);

    return User.findById(result.lastInsertRowid);
  },

  updateRole: async (id, role) => {
    const now = new Date().toISOString();
    getDb()
      .prepare('UPDATE users SET role = ?, updated_at = ? WHERE id = ?')
      .run(role, now, id);
    return User.findById(id);
  },

  saveResetToken: async (id, token, expiry) => {
    const now = new Date().toISOString();
    getDb()
      .prepare('UPDATE users SET reset_token = ?, reset_token_expiry = ?, updated_at = ? WHERE id = ?')
      .run(token, expiry, now, id);
    return User.findById(id);
  },

  resetPassword: async (id, hashedPassword) => {
    const now = new Date().toISOString();
    getDb()
      .prepare(
        `UPDATE users 
         SET password = ?, reset_token = NULL, reset_token_expiry = NULL, updated_at = ? 
         WHERE id = ?`
      )
      .run(hashedPassword, now, id);
    return User.findById(id);
  },

  delete: async (id) => {
    const user = await User.findById(id);
    if (!user) return null;
    getDb().prepare('DELETE FROM users WHERE id = ?').run(id);
    return user;
  },
};

module.exports = User;
