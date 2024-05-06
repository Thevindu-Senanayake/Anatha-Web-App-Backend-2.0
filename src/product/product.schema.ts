import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ProductDocument = HydratedDocument<Product>;

@Schema()
export class Product {
  @Prop({
    type: String,
    required: [true, 'Please enter your name.'],
    maxlength: [30, 'Your name cannot be longer than 30 characters.'],
    trim: true,
  })
  name: string;

  @Prop({
    type: Number,
    required: [true, 'Please enter price for product'],
  })
  price: string;

  @Prop({
    type: Number,
    required: [true, 'Please enter shipping price for product'],
  })
  shippingPrice: string;

  @Prop({
    type: String,
    required: [true, 'Please enter your password'],
    minlength: [6, 'Product description cannot be shorter than 6 characters.'],
  })
  description: string;

  @Prop({
    type: Number,
    default: 0,
  })
  rating: string;

  @Prop({
    type: Number,
    default: 0,
  })
  numOfReviews: string;

  @Prop({
    type: Number,
    required: [true, 'Please enter product stock'],
    maxlength: [5, 'Product stock cannot be longer than 5 characters'],
  })
  stocks: string;

  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
  })
  seller: Types.ObjectId;

  @Prop({
    type: String,
    required: true,
    enum: {
      values: [
        'Electronics',
        'Cameras',
        'Laptops',
        'Accessories',
        'Headphones',
        'Food',
        'Books',
        'Clothes/Shoes',
        'Beauty/Health',
        'Sports',
        'Outdoor',
        'Home',
      ],
      message: 'Please select correct category for product',
    },
  })
  category: string;

  @Prop(
    raw([
      {
        public_id: { type: String },
        url: { type: String },
      },
    ]),
  )
  images: [
    {
      public_id: string;
      url: string;
    },
  ];

  @Prop(
    raw([
      {
        user: { type: Types.ObjectId, ref: 'User', required: true },
        name: { type: String, required: true },
        rating: { type: Number, required: true },
        comment: { type: String, required: true },
      },
    ]),
  )
  reviews: [
    {
      user: Types.ObjectId;
      name: string;
      rating: number;
      comment: string;
    },
  ];

  @Prop({ default: Date.now })
  createdAt: Date;
}
export const ProductSchema = SchemaFactory.createForClass(Product);
