import * as authService from "../services/auth.service.js";

export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const user = await authService.registerUser({ name, email, password, role });
    res.status(201).json({ message: "User registered", user });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const data = await authService.loginUser({ email, password });
    res.json({ message: "Login successful", ...data });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const me = async (req, res) => {
  res.json({ user: req.user });
};
