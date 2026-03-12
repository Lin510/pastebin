import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPaste extends Document {
  _id: mongoose.Types.ObjectId;
  pasteId: string;
  title: string;
  content: string;
  language: string;
  passwordHash: string | null;
  expiresAt: Date | null;
  groupId: string | null;
  partIndex: number | null;
  totalParts: number | null;
  createdAt: Date;
  updatedAt: Date;
}

const PasteSchema = new Schema<IPaste>(
  {
    pasteId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    title: {
      type: String,
      default: '',
      maxlength: 200,
    },
    content: {
      type: String,
      required: true,
      maxlength: 1_100_000,
    },
    language: {
      type: String,
      default: 'plaintext',
      maxlength: 50,
    },
    passwordHash: {
      type: String,
      default: null,
    },
    groupId: {
      type: String,
      default: null,
      index: { sparse: true },
    },
    partIndex: {
      type: Number,
      default: null,
    },
    totalParts: {
      type: Number,
      default: null,
    },
    expiresAt: {
      type: Date,
      default: null,
      index: { expireAfterSeconds: 0, sparse: true },
    },
  },
  {
    timestamps: true,
    collection: 'pastebin_pastes',
  }
);

const Paste: Model<IPaste> =
  mongoose.models.pastebin_paste ?? mongoose.model<IPaste>('pastebin_paste', PasteSchema);

export default Paste;
