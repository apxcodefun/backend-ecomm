import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";
const { Schema } = mongoose;

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique:[true, "Email already register"],
    validate: [validator.isEmail, "Please enter a valid email"],
  },
  password: {
    type: String,
    required: true,
    minLength: [6, "Password must be at least 6 characters"],
  },
  role : {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
});

userSchema.pre("save",async function(){
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
})

userSchema.methods.matchPassword =async function(reqBody){
    return await bcrypt.compare(reqBody, this.password);
}

const User = mongoose.model("User", userSchema);

export default User;
