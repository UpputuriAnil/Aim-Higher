// MemoryDB compatibility wrapper around localDB
const localDB = require('./localDB');

class MemoryDB {
  static async findOne(query) {
    const user = localDB.findUser(query);
    return user ? localDB.wrapModel(user) : null;
  }

  static async create(userData) {
    return localDB.createUser(userData);
  }

  static async findById(id) {
    const user = localDB.getUserById(id);
    return user ? localDB.wrapModel(user) : null;
  }

  static async findByIdAndUpdate(id, updates) {
    return localDB.updateUser(id, updates);
  }

  static async save() {
    return true;
  }
}

module.exports = MemoryDB;
