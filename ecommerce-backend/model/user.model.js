import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
      validate: {
        validator: function (email) {
          return /^((?!\.)[\w\-_.]*[^.])(@\w+)(\.\w+(\.\w+)?[^.\W])$/.test(
            email
          );
        },
        message: "{VALUE} is not a valid email",
      },
    },
    address: {
      type: String,
      required: true,
    },
    contact: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    password: {
      type: String,
      required: true,
      select: false,
      match: [
        /^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[^\w\d\s:]).{8,16}$/,
        "Please enter a stronger password",
      ],
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);

  const hashedPassword = await bcrypt.hash(this.password, salt);
  this.password = hashedPassword;
});

userSchema.methods.comparePassword = async function (plainPassword) {
  try {
    return await bcrypt.compare(plainPassword, this.password);
  } catch (err) {
    console.error(err.message);
    throw err;
  }
};

const User = mongoose.model("Users", userSchema);

export default User;
