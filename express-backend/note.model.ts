import mongoose, { Schema, Document } from "mongoose";

export interface INote extends Document {
    id: string;
    title: string;
    body: string;
    updated: Date;
}

const NoteSchema: Schema = new Schema({
    id: {type: String, required: true, unique: true},
    title: {type: String, required: true},
    body: {type: String, required: true},
    color: {type: String, required: true},
    updated: {type: Date, default: Date.now}
});;

// Export Note model
export default mongoose.model<INote>('Note', NoteSchema);