import { Response } from 'express';
import Conversation from '../models/Conversation';
import Message from '../models/Message';
import Announcement from '../models/Announcement';
import User from '../models/User';
import { AuthRequest } from '../middleware/authMiddleware';

// ─── Employees ───────────────────────────────────────────────────────────────
export async function getEmployees(req: AuthRequest, res: Response) {
  try {
    const currentUserId = req.user?._id.toString();
    const users = await User.find(
      { _id: { $ne: currentUserId }, isVerified: true },
      'name email role designation profilePicture'
    );

    const employees = users.map((u) => ({
      id: u._id.toString(),
      name: u.name,
      email: u.email,
      role: u.role,
      designation: u.designation || 'Employee',
      profilePicture: u.profilePicture || '',
    }));

    return res.status(200).json({
      success: true,
      message: 'Employees retrieved successfully.',
      data: { employees },
    });
  } catch (error) {
    console.error('communicationController: getEmployees error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while fetching employees.',
      errors: [],
    });
  }
}

// ─── Conversations ──────────────────────────────────────────────────────────
export async function getConversations(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?._id.toString();
    const { type, isArchived, search } = req.query;

    const filter: any = { participants: userId };
    if (type) filter.type = type;
    if (isArchived === 'true') filter.isArchived = true;
    else if (isArchived === 'false') filter.isArchived = false;
    if (search) {
      filter.$or = [
        { subject: { $regex: search, $options: 'i' } },
        { lastMessage: { $regex: search, $options: 'i' } },
      ];
    }

    const conversations = await Conversation.find(filter).sort({ isPinned: -1, updatedAt: -1 });

    return res.status(200).json({
      success: true,
      message: 'Conversations retrieved successfully.',
      data: {
        conversations: conversations.map(formatConversation),
      },
    });
  } catch (error) {
    console.error('communicationController: getConversations error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while fetching conversations.',
      errors: [],
    });
  }
}

export async function getConversationById(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const conversation = await Conversation.findById(id);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found.',
        errors: [],
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Conversation retrieved successfully.',
      data: { conversation: formatConversation(conversation) },
    });
  } catch (error) {
    console.error('communicationController: getConversationById error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while fetching the conversation.',
      errors: [],
    });
  }
}

export async function createConversation(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?._id.toString();
    const { to, subject, project, relatedTaskId, priority, content, attachments } = req.body;

    if (!to || to.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one recipient is required.',
        errors: [],
      });
    }

    if (!subject || !subject.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Subject is required.',
        errors: [],
      });
    }

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message content is required.',
        errors: [],
      });
    }

    // Fetch recipient details
    const recipients = await User.find({ _id: { $in: to } }, 'name profilePicture');
    const sender = req.user;

    const participantIds = [userId, ...to];
    const participantNames = [sender?.name || 'You', ...recipients.map((r) => r.name)];
    const participantAvatars = [sender?.profilePicture || '', ...recipients.map((r) => r.profilePicture || '')];

    const conversation = await Conversation.create({
      type: 'direct',
      subject,
      project: project || '',
      relatedTaskId: relatedTaskId || '',
      priority: priority || 'medium',
      participants: participantIds,
      participantNames,
      participantAvatars,
      lastMessage: content.substring(0, 80),
      lastMessageTime: new Date(),
      lastMessageSender: sender?.name || 'You',
      unreadCount: 0,
      isRead: true,
      isPinned: false,
      isArchived: false,
      hasAttachments: attachments && attachments.length > 0,
      status: 'sent',
      createdBy: userId,
    });

    // Create the first message
    const message = await Message.create({
      conversationId: conversation._id.toString(),
      senderId: userId,
      senderName: sender?.name || 'You',
      senderAvatar: sender?.profilePicture || '',
      content,
      timestamp: new Date(),
      status: 'sent',
      attachments: attachments || [],
      mentions: [],
      isEdited: false,
    });

    return res.status(201).json({
      success: true,
      message: 'Message sent successfully.',
      data: {
        conversation: formatConversation(conversation),
        message: formatMessage(message),
      },
    });
  } catch (error) {
    console.error('communicationController: createConversation error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while sending the message.',
      errors: [],
    });
  }
}

export async function updateConversation(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const updates = req.body;

    const conversation = await Conversation.findByIdAndUpdate(id, updates, { new: true });
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found.',
        errors: [],
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Conversation updated successfully.',
      data: { conversation: formatConversation(conversation) },
    });
  } catch (error) {
    console.error('communicationController: updateConversation error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while updating the conversation.',
      errors: [],
    });
  }
}

export async function deleteConversation(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const conversation = await Conversation.findByIdAndDelete(id);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found.',
        errors: [],
      });
    }

    // Delete associated messages
    await Message.deleteMany({ conversationId: id });

    return res.status(200).json({
      success: true,
      message: 'Conversation deleted successfully.',
      data: {},
    });
  } catch (error) {
    console.error('communicationController: deleteConversation error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while deleting the conversation.',
      errors: [],
    });
  }
}

// ─── Messages ────────────────────────────────────────────────────────────────
export async function getMessages(req: AuthRequest, res: Response) {
  try {
    const { conversationId } = req.params;
    const messages = await Message.find({ conversationId }).sort({ timestamp: 1 });

    return res.status(200).json({
      success: true,
      message: 'Messages retrieved successfully.',
      data: {
        messages: messages.map(formatMessage),
      },
    });
  } catch (error) {
    console.error('communicationController: getMessages error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while fetching messages.',
      errors: [],
    });
  }
}

export async function sendMessage(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?._id.toString();
    const { conversationId } = req.params;
    const { content, attachments } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message content is required.',
        errors: [],
      });
    }

    const sender = req.user;

    const message = await Message.create({
      conversationId,
      senderId: userId,
      senderName: sender?.name || 'You',
      senderAvatar: sender?.profilePicture || '',
      content,
      timestamp: new Date(),
      status: 'sent',
      attachments: attachments || [],
      mentions: [],
      isEdited: false,
    });

    // Update conversation's last message
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: content.substring(0, 80),
      lastMessageTime: new Date(),
      lastMessageSender: sender?.name || 'You',
      status: 'replied',
      updatedAt: new Date(),
    });

    return res.status(201).json({
      success: true,
      message: 'Reply sent successfully.',
      data: { message: formatMessage(message) },
    });
  } catch (error) {
    console.error('communicationController: sendMessage error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while sending the reply.',
      errors: [],
    });
  }
}

// ─── Announcements ───────────────────────────────────────────────────────────
export async function getAnnouncements(req: AuthRequest, res: Response) {
  try {
    const announcements = await Announcement.find().sort({ isPinned: -1, createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: 'Announcements retrieved successfully.',
      data: {
        announcements: announcements.map(formatAnnouncement),
      },
    });
  } catch (error) {
    console.error('communicationController: getAnnouncements error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while fetching announcements.',
      errors: [],
    });
  }
}

export async function createAnnouncement(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?._id.toString();
    const { title, description, priority, publishDate, expiryDate } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Title is required.',
        errors: [],
      });
    }

    if (!description || !description.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Description is required.',
        errors: [],
      });
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    if (publishDate && new Date(publishDate) < todayStart) {
      return res.status(400).json({
        success: false,
        message: 'Publish date cannot be set in the past.',
        errors: [],
      });
    }

    if (expiryDate && new Date(expiryDate) < todayStart) {
      return res.status(400).json({
        success: false,
        message: 'Expiry date cannot be set in the past.',
        errors: [],
      });
    }

    const sender = req.user;

    const announcement = await Announcement.create({
      title,
      description,
      priority: priority || 'medium',
      authorId: userId,
      authorName: sender?.name || 'Admin',
      authorAvatar: sender?.profilePicture || '',
      publishDate: publishDate ? new Date(publishDate) : new Date(),
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      isPinned: false,
      readBy: [],
    });

    return res.status(201).json({
      success: true,
      message: 'Announcement published successfully.',
      data: { announcement: formatAnnouncement(announcement) },
    });
  } catch (error) {
    console.error('communicationController: createAnnouncement error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while creating the announcement.',
      errors: [],
    });
  }
}

export async function updateAnnouncement(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { title, description, priority, publishDate, expiryDate } = req.body;

    if (req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. Admin privileges required.',
        errors: [],
      });
    }

    const announcement = await Announcement.findById(id);
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found.',
        errors: [],
      });
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    if (publishDate) {
      const newPubDate = new Date(publishDate);
      if (newPubDate.getTime() !== new Date(announcement.publishDate).getTime() && newPubDate < todayStart) {
        return res.status(400).json({
          success: false,
          message: 'Publish date cannot be set in the past.',
          errors: [],
        });
      }
      announcement.publishDate = newPubDate;
    }

    if (expiryDate) {
      const newExpDate = new Date(expiryDate);
      const currentExpTime = announcement.expiryDate ? new Date(announcement.expiryDate).getTime() : 0;
      if (newExpDate.getTime() !== currentExpTime && newExpDate < todayStart) {
        return res.status(400).json({
          success: false,
          message: 'Expiry date cannot be set in the past.',
          errors: [],
        });
      }
      announcement.expiryDate = newExpDate;
    } else if (expiryDate === null) {
      announcement.expiryDate = undefined;
    }

    if (title !== undefined) announcement.title = title;
    if (description !== undefined) announcement.description = description;
    if (priority !== undefined) announcement.priority = priority;

    await announcement.save();

    return res.status(200).json({
      success: true,
      message: 'Announcement updated successfully.',
      data: { announcement: formatAnnouncement(announcement) },
    });
  } catch (error) {
    console.error('communicationController: updateAnnouncement error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while updating the announcement.',
      errors: [],
    });
  }
}

export async function togglePinAnnouncement(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const announcement = await Announcement.findById(id);
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found.',
        errors: [],
      });
    }

    announcement.isPinned = !announcement.isPinned;
    await announcement.save();

    return res.status(200).json({
      success: true,
      message: `Announcement ${announcement.isPinned ? 'pinned' : 'unpinned'} successfully.`,
      data: { announcement: formatAnnouncement(announcement) },
    });
  } catch (error) {
    console.error('communicationController: togglePinAnnouncement error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while toggling pin.',
      errors: [],
    });
  }
}

export async function deleteAnnouncement(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const announcement = await Announcement.findByIdAndDelete(id);
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found.',
        errors: [],
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Announcement deleted successfully.',
      data: {},
    });
  } catch (error) {
    console.error('communicationController: deleteAnnouncement error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while deleting the announcement.',
      errors: [],
    });
  }
}

// ─── Broadcast ───────────────────────────────────────────────────────────────
export async function sendBroadcast(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?._id.toString();
    const { subject, project, priority, content, attachments } = req.body;

    if (!subject || !subject.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Subject is required.',
        errors: [],
      });
    }

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message content is required.',
        errors: [],
      });
    }

    const sender = req.user;

    // Get all verified users as participants
    const allUsers = await User.find({ isVerified: true }, '_id name profilePicture');
    const participantIds = allUsers.map((u) => u._id.toString());
    const participantNames = allUsers.map((u) => u.name);
    const participantAvatars = allUsers.map((u) => u.profilePicture || '');

    const conversation = await Conversation.create({
      type: 'broadcast',
      subject,
      project: project || '',
      priority: priority || 'medium',
      participants: participantIds,
      participantNames,
      participantAvatars,
      lastMessage: content.substring(0, 80),
      lastMessageTime: new Date(),
      lastMessageSender: sender?.name || 'Admin',
      unreadCount: 0,
      isRead: true,
      isPinned: false,
      isArchived: false,
      hasAttachments: attachments && attachments.length > 0,
      status: 'sent',
      createdBy: userId,
    });

    const message = await Message.create({
      conversationId: conversation._id.toString(),
      senderId: userId,
      senderName: sender?.name || 'Admin',
      senderAvatar: sender?.profilePicture || '',
      content,
      timestamp: new Date(),
      status: 'sent',
      attachments: attachments || [],
      mentions: [],
      isEdited: false,
    });

    return res.status(201).json({
      success: true,
      message: 'Broadcast sent successfully.',
      data: {
        conversation: formatConversation(conversation),
        message: formatMessage(message),
      },
    });
  } catch (error) {
    console.error('communicationController: sendBroadcast error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while sending the broadcast.',
      errors: [],
    });
  }
}

// ─── Analytics ───────────────────────────────────────────────────────────────
export async function getAnalytics(req: AuthRequest, res: Response) {
  try {
    const totalMessages = await Message.countDocuments();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const messagesToday = await Message.countDocuments({ timestamp: { $gte: today } });
    const unreadMessages = await Conversation.countDocuments({ isRead: false, isArchived: false });
    const totalAnnouncements = await Announcement.countDocuments();

    // Weekly trend: messages per day for the last 7 days
    const weeklyTrend = [];
    for (let i = 6; i >= 0; i--) {
      const day = new Date();
      day.setDate(day.getDate() - i);
      day.setHours(0, 0, 0, 0);
      const nextDay = new Date(day);
      nextDay.setDate(nextDay.getDate() + 1);
      const count = await Message.countDocuments({ timestamp: { $gte: day, $lt: nextDay } });
      weeklyTrend.push({
        day: day.toLocaleDateString('en-US', { weekday: 'short' }),
        count,
      });
    }

    // Monthly trend: messages per month for the last 6 months
    const monthlyTrend = [];
    for (let i = 5; i >= 0; i--) {
      const month = new Date();
      month.setMonth(month.getMonth() - i);
      month.setDate(1);
      month.setHours(0, 0, 0, 0);
      const nextMonth = new Date(month);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      const count = await Message.countDocuments({ timestamp: { $gte: month, $lt: nextMonth } });
      monthlyTrend.push({
        month: month.toLocaleDateString('en-US', { month: 'short' }),
        count,
      });
    }

    // Most active employee (by message count)
    const mostActiveResult = await Message.aggregate([
      { $group: { _id: '$senderId', senderName: { $first: '$senderName' }, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 },
    ]);
    const mostActiveEmployee = mostActiveResult[0]?.senderName || 'N/A';

    // Most active project (by conversation count, exclude empty/broadcast)
    const mostActiveProjectResult = await Conversation.aggregate([
      { $match: { project: { $exists: true, $ne: '' } } },
      { $group: { _id: '$project', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 },
    ]);
    const mostActiveProject = mostActiveProjectResult[0]?._id || 'N/A';

    // Average response time: compute from consecutive messages in same conversation
    // We approximate by measuring avg gap between consecutive messages per conversation
    const conversationIds = await Conversation.distinct('_id');
    let totalGapMs = 0;
    let gapCount = 0;
    for (const convId of conversationIds.slice(0, 20)) { // cap to 20 conversations for performance
      const msgs = await Message.find({ conversationId: convId.toString() }).sort({ timestamp: 1 }).limit(10);
      for (let i = 1; i < msgs.length; i++) {
        const gap = new Date(msgs[i].timestamp).getTime() - new Date(msgs[i - 1].timestamp).getTime();
        if (gap > 0 && gap < 24 * 60 * 60 * 1000) { // ignore gaps > 24h
          totalGapMs += gap;
          gapCount++;
        }
      }
    }
    let averageResponseTime = 'N/A';
    if (gapCount > 0) {
      const avgMs = totalGapMs / gapCount;
      const avgH = Math.floor(avgMs / 3600000);
      const avgM = Math.floor((avgMs % 3600000) / 60000);
      averageResponseTime = avgH > 0 ? `~${avgH}h ${avgM}m` : `~${avgM}m`;
    }

    return res.status(200).json({
      success: true,
      message: 'Analytics retrieved successfully.',
      data: {
        analytics: {
          totalMessages,
          messagesToday,
          unreadMessages,
          totalAnnouncements,
          averageResponseTime,
          mostActiveEmployee,
          mostActiveProject,
          weeklyTrend,
          monthlyTrend,
        },
      },
    });
  } catch (error) {
    console.error('communicationController: getAnalytics error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while fetching analytics.',
      errors: [],
    });
  }
}

// ─── Formatters ──────────────────────────────────────────────────────────────
function formatConversation(conv: any) {
  return {
    id: conv._id.toString(),
    type: conv.type,
    subject: conv.subject,
    project: conv.project || undefined,
    relatedTaskId: conv.relatedTaskId || undefined,
    relatedTaskTitle: conv.relatedTaskTitle || undefined,
    priority: conv.priority,
    participants: conv.participants.map((p: any) => p.toString()),
    participantNames: conv.participantNames,
    participantAvatars: conv.participantAvatars,
    lastMessage: conv.lastMessage,
    lastMessageTime: conv.lastMessageTime?.toISOString() || new Date().toISOString(),
    lastMessageSender: conv.lastMessageSender,
    unreadCount: conv.unreadCount,
    isRead: conv.isRead,
    isPinned: conv.isPinned,
    isArchived: conv.isArchived,
    hasAttachments: conv.hasAttachments,
    status: conv.status,
    createdAt: conv.createdAt?.toISOString() || new Date().toISOString(),
    updatedAt: conv.updatedAt?.toISOString() || new Date().toISOString(),
  };
}

function formatMessage(msg: any) {
  return {
    id: msg._id.toString(),
    conversationId: msg.conversationId,
    senderId: msg.senderId,
    senderName: msg.senderName,
    senderAvatar: msg.senderAvatar || undefined,
    content: msg.content,
    timestamp: msg.timestamp?.toISOString() || new Date().toISOString(),
    status: msg.status,
    attachments: msg.attachments || [],
    mentions: msg.mentions || [],
    isEdited: msg.isEdited,
    replyToId: msg.replyToId || undefined,
  };
}

function formatAnnouncement(ann: any) {
  return {
    id: ann._id.toString(),
    title: ann.title,
    description: ann.description,
    priority: ann.priority,
    authorId: ann.authorId,
    authorName: ann.authorName,
    authorAvatar: ann.authorAvatar || undefined,
    publishDate: ann.publishDate?.toISOString() || new Date().toISOString(),
    expiryDate: ann.expiryDate?.toISOString() || undefined,
    isPinned: ann.isPinned,
    readBy: ann.readBy || [],
    createdAt: ann.createdAt?.toISOString() || new Date().toISOString(),
  };
}