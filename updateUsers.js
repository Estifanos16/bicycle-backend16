const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
};

const updateUsers = async () => {
  const User = require('./models/User');
  await User.updateMany(
    { role: { $exists: true } },
    [
      {
        $set: {
          roles: {
            $cond: {
              if: { $isArray: "$roles" },
              then: "$roles",
              else: ["$role"]
            }
          }
        }
      },
      { $unset: "role" }
    ],
    { updatePipeline: true }
  );
  console.log('Users updated');
};

connectDB().then(updateUsers).then(() => process.exit());