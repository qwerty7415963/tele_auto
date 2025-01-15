import express from 'express';

class UserRoutes {
  constructor() {
    this.router = express.Router();
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.get('/', this.getAllUsers);
    this.router.post('/', this.createUser);
    this.router.get('/:id', this.getUserById);
    this.router.put('/:id', this.updateUser);
    this.router.delete('/:id', this.deleteUser);
  }

  getAllUsers = (req, res) => {
    res.json({ users: [] });
  }

  createUser = (req, res) => {
    res.status(201).json({ message: 'User created' });
  }

  getUserById = (req, res) => {
    res.json({ user: { id: req.params.id } });
  }

  updateUser = (req, res) => {
    res.json({ message: 'User updated', id: req.params.id });
  }

  deleteUser = (req, res) => {
    res.json({ message: 'User deleted', id: req.params.id });
  }
}

export default UserRoutes;