require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/database');

// connect to mongo db
connectDB({ alter: true });

const PORT = process.env.PORT;

// server connection
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

 