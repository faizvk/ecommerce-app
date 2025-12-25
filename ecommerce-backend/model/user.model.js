import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    age: {
      type: Number,
      required: false,
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
      required: false,
    },

    contact: {
      type: String,
      required: false,
      trim: true,
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    password: {
      type: String,
      required: function () {
        return this.provider === "local";
      },
      select: false,
      match: [
        /^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[^\w\d\s:]).{8,16}$/,
        "Please enter a stronger password",
      ],
    },

    googleId: {
      type: String,
      default: null,
      index: true,
    },

    provider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function () {
  if (!this.password) return;
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function (plainPassword) {
  return bcrypt.compare(plainPassword, this.password);
};

userSchema.methods.isProfileComplete = function () {
  return Boolean(this.age && this.address && this.contact);
};

const User = mongoose.model("User", userSchema);

export default User;
