require('dotenv').config();
const express = require('express'), cors = require('cors'), mongoose = require('mongoose');
const bcrypt = require('bcryptjs'), jwt = require('jsonwebtoken');
const app = express(); app.use(cors(), express.json());

const { Schema, model } = mongoose;
const User = model('User', new Schema({
  name: { type: String, required: true }, email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true }, phone: { type: String, required: true },
  userType: { type: String, enum: ['Admin', 'Ordinary'], required: true } }, { timestamps: true }));
const Room = model('Room', new Schema({
  type: { type: String, required: true }, price: { type: Number, required: true }, description: String,
  image: String, features: [String], count: { type: Number, default: 1 } }, { timestamps: true }));
const Booking = model('Booking', new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User' }, room: { type: Schema.Types.ObjectId, ref: 'Room' },
  roomType: String, from: Date, to: Date, total: Number, phone: String,
  status: { type: String, enum: ['Active', 'Cancelled'], default: 'Active' } }, { timestamps: true }));

const wrap = fn => (req, res) => fn(req, res).catch(e => res.status(500).json({ message: e.message }));
const auth = (req, res, next) => {
  try { req.user = jwt.verify((req.headers.authorization || '').replace('Bearer ', ''), process.env.JWT_SECRET); next(); }
  catch { res.status(401).json({ message: 'Unauthorized' }); }
};
const admin = (req, res, next) => req.user.userType === 'Admin' ? next() : res.status(403).json({ message: 'Admins only' });

app.post('/SignUp', wrap(async (req, res) => {
  const { name, email, password, phone, userType } = req.body;
  if (!name || !email || !password || !phone || !userType) return res.status(400).json({ message: 'All fields required' });
  if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });
  if (await User.findOne({ email })) return res.status(409).json({ message: 'Email already registered' });
  await User.create({ name, email, phone, userType, password: await bcrypt.hash(password, 10) });
  res.status(201).json({ message: 'Account created successfully' });
}));

app.post('/Login', wrap(async (req, res) => {
  const u = await User.findOne({ email: (req.body.email || '').toLowerCase() });
  if (!u || !(await bcrypt.compare(req.body.password || '', u.password))) return res.status(401).json({ message: 'Invalid email or password' });
  const user = { id: u._id, name: u.name, email: u.email, phone: u.phone, userType: u.userType };
  res.json({ token: jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '1d' }), user });
}));

app.get('/rooms', wrap(async (_, res) => res.json(await Room.find().sort('-createdAt'))));
app.post('/rooms', auth, admin, wrap(async (req, res) => {
  const { features, ...rest } = req.body;
  res.status(201).json(await Room.create({ ...rest, features: (features || '').toString().split(',').map(s => s.trim()).filter(Boolean) }));
}));

app.post('/book', auth, wrap(async (req, res) => {
  const { roomId, from, to } = req.body, f = new Date(from), t = new Date(to);
  const room = await Room.findById(roomId);
  if (!room) return res.status(404).json({ message: 'Room not found' });
  if (!(f < t) || f < new Date().setHours(0, 0, 0, 0)) return res.status(400).json({ message: 'Invalid dates' });
  const clashes = await Booking.countDocuments({ room: roomId, status: 'Active', from: { $lt: t }, to: { $gt: f } });
  if (clashes >= room.count) return res.status(409).json({ message: 'Room not available for these dates' });
  const total = Math.ceil((t - f) / 864e5) * room.price;
  res.status(201).json(await Booking.create({ user: req.user.id, room: roomId, roomType: room.type, from: f, to: t, total, phone: req.user.phone }));
}));

app.get('/mybookings', auth, wrap(async (req, res) => res.json(await Booking.find({ user: req.user.id }).sort('-createdAt'))));
app.post('/cancelbooking', auth, wrap(async (req, res) => {
  const b = await Booking.findById(req.body.bookingId);
  if (!b || (String(b.user) !== req.user.id && req.user.userType !== 'Admin')) return res.status(404).json({ message: 'Booking not found' });
  if (b.status === 'Cancelled') return res.status(400).json({ message: 'Already cancelled' });
  b.status = 'Cancelled'; await b.save(); res.json(b);
}));

app.get('/allbookings', auth, admin, wrap(async (_, res) => res.json(await Booking.find().populate('user', 'name email').sort('-createdAt'))));
app.get('/users', auth, admin, wrap(async (_, res) => res.json(await User.find().select('-password').sort('-createdAt'))));

mongoose.connect(process.env.MONGO_URI).then(() =>
  app.listen(process.env.PORT || 5000, () => console.log('HotelPro API running'))).catch(console.error);
