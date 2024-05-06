import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as validator from 'validator';
import { HydratedDocument } from 'mongoose';
import * as bcrypt from 'bcryptjs';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  @Prop({
    type: String,
    required: [true, 'Please enter your name.'],
    maxlength: [30, 'Your name cannot be longer than 30 characters.'],
  })
  name: string;

  @Prop({
    type: String,

    required: [true, 'Please enter your email address'],
    unique: true,
    validate: [validator.isEmail, 'Please enter a valid email address.'],
  })
  email: string;

  @Prop({
    type: String,

    required: [true, 'Please enter your password'],
    minlength: [6, 'Your password cannot be shorter than 6 characters.'],
    select: false,
  })
  password: string;

  @Prop(
    raw({
      public_id: { type: String },
      url: { type: String },
    }),
  )
  avatar: {
    public_id: string;
    url: string;
  };

  @Prop(
    raw({
      fullName: { type: String },
      phoneNumber: { type: String },
      fullAddress: { type: String },
      postalCode: { type: String },
      city: { type: String },
      country: { type: String },
      tag: { type: String, enum: ['Home', 'Office'] },
    }),
  )
  address: {
    fullName: string;
    phoneNumber: string;
    fullAddress: string;
    postalCode: string;
    city: string;
    country: string;
    tag: 'Home' | 'Office';
  };

  @Prop({ default: false })
  verified: boolean;

  @Prop({ default: 'user' })
  role: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop()
  resetPasswordToken: string;

  @Prop()
  resetPasswordExpiresAt: number;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }

  // Generate a random salt value
  const salt = await bcrypt.genSalt(10);

  // Hash the password with the generated salt
  this.password = await bcrypt.hash(this.password, salt);
});
