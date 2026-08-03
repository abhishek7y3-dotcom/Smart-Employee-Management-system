import { Request, Response } from 'express';
import Note from '../models/Note';

export const getAllNotes = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;
    // Find all notes for this user, sort by newest date first
    const notes = await Note.find({ userId }).sort({ dateStr: -1 });
    res.status(200).json({ success: true, data: notes });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching all notes' });
  }
};

export const getNoteByDate = async (req: Request, res: Response) => {
  try {
    const { date } = req.params;
    const userId = (req as any).user._id;

    // Return the most recent note for this date
    const note = await Note.findOne({ userId, dateStr: date }).sort({ createdAt: -1 });
    if (!note) {
      return res.status(200).json({ success: true, data: { content: '' } });
    }
    res.status(200).json({ success: true, data: note });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching note' });
  }
};

export const saveNote = async (req: Request, res: Response) => {
  try {
    const { date } = req.params;
    const { content, noteId } = req.body;
    const userId = (req as any).user._id;

    let note;
    if (noteId) {
      note = await Note.findOneAndUpdate(
        { _id: noteId, userId },
        { content },
        { new: true }
      );
    } 
    
    if (!note) {
      note = await Note.create({ userId, dateStr: date, content });
    }

    res.status(200).json({ success: true, data: note });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error saving note' });
  }
};
