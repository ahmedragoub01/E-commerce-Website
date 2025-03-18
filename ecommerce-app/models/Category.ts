import mongoose, { Schema, models } from 'mongoose';

const CategorySchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: String,
  image: String,
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }
}, { timestamps: true });

const Category = models.Category || mongoose.model('Category', CategorySchema);
export default Category;