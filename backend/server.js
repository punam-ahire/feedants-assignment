require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const fakeAuth = require('./middleware/fakeAuth');
const competitionRoutes = require('./routes/competitionRoutes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(fakeAuth);

app.use('/api/competitions', competitionRoutes);

app.get('/', (req, res) => res.send('Feedants API is running'));

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });