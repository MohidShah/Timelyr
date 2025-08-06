import { supabase } from './supabase';
import { createNotification } from './notifications';
import { logUserActivity } from './activity';

export interface SupportTicket {
  id: string;
  user_id: string;
  subject: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  category?: 'technical' | 'billing' | 'feature_request' | 'bug_report';
  created_at: string;
  updated_at: string;
}

export interface UserFeedback {
  id: string;
  user_id: string;
  type: 'bug' | 'feature_request' | 'improvement' | 'compliment';
  rating?: number;
  message: string;
  page_url: string;
  user_agent?: string;
  status: 'open' | 'reviewed' | 'implemented' | 'closed';
  created_at: string;
}

// Create support ticket
export const createSupportTicket = async (userId: string, ticket: {
  subject: string;
  message: string;
  category?: 'technical' | 'billing' | 'feature_request' | 'bug_report';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
}) => {
  const { data, error } = await supabase
    .from('support_tickets')
    .insert({
      user_id: userId,
      ...ticket,
      priority: ticket.priority || 'medium'
    })
    .select()
    .single();
    
  if (error) throw error;
  
  // Send confirmation notification
  await createNotification(userId, {
    type: 'support_ticket_created',
    title: 'Support ticket created',
    message: `We've received your ticket: ${ticket.subject}. We'll respond within 24 hours.`,
    action_url: `/support/tickets/${data.id}`
  });
  
  // Log activity
  await logUserActivity(userId, 'support_ticket_created', { 
    ticketId: data.id, 
    subject: ticket.subject,
    category: ticket.category 
  });
  
  return data;
};

// Get user support tickets
export const getUserSupportTickets = async (userId: string) => {
  const { data, error } = await supabase
    .from('support_tickets')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
    
  if (error) throw error;
  return data;
};

// Get support ticket by ID
export const getSupportTicket = async (userId: string, ticketId: string) => {
  const { data, error } = await supabase
    .from('support_tickets')
    .select('*')
    .eq('id', ticketId)
    .eq('user_id', userId)
    .single();
    
  if (error) throw error;
  return data;
};

// Update support ticket
export const updateSupportTicket = async (userId: string, ticketId: string, updates: Partial<SupportTicket>) => {
  const { data, error } = await supabase
    .from('support_tickets')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', ticketId)
    .eq('user_id', userId)
    .select()
    .single();
    
  if (error) throw error;
  return data;
};

// Submit user feedback
export const submitFeedback = async (userId: string, feedback: {
  type: 'bug' | 'feature_request' | 'improvement' | 'compliment';
  rating?: number;
  message: string;
  page_url: string;
}) => {
  const { data, error } = await supabase
    .from('user_feedback')
    .insert({
      user_id: userId,
      ...feedback,
      user_agent: navigator.userAgent
    })
    .select()
    .single();
    
  if (error) throw error;
  
  // Send thank you notification
  await createNotification(userId, {
    type: 'feedback_received',
    title: 'Thanks for your feedback!',
    message: 'Your feedback helps us improve Timelyr. We review every submission.'
  });
  
  // Log activity
  await logUserActivity(userId, 'feedback_submitted', { 
    feedbackId: data.id, 
    type: feedback.type,
    rating: feedback.rating 
  });
  
  return data;
};

// Get user feedback history
export const getUserFeedback = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_feedback')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
    
  if (error) throw error;
  return data;
};

// Get support statistics for dashboard
export const getSupportStatistics = async (userId: string) => {
  const [tickets, feedback] = await Promise.all([
    getUserSupportTickets(userId),
    getUserFeedback(userId)
  ]);
  
  const ticketStats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'open').length,
    resolved: tickets.filter(t => t.status === 'resolved').length,
    byPriority: tickets.reduce((acc, ticket) => {
      acc[ticket.priority] = (acc[ticket.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  };
  
  const feedbackStats = {
    total: feedback.length,
    byType: feedback.reduce((acc, item) => {
      acc[item.type] = (acc[item.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    averageRating: feedback.filter(f => f.rating).reduce((sum, f) => sum + (f.rating || 0), 0) / feedback.filter(f => f.rating).length || 0
  };
  
  return {
    tickets: ticketStats,
    feedback: feedbackStats
  };
};

// Common support categories
export const SUPPORT_CATEGORIES = {
  TECHNICAL: 'technical',
  BILLING: 'billing',
  FEATURE_REQUEST: 'feature_request',
  BUG_REPORT: 'bug_report'
};

// Support priorities
export const SUPPORT_PRIORITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent'
};

// Feedback types
export const FEEDBACK_TYPES = {
  BUG: 'bug',
  FEATURE_REQUEST: 'feature_request',
  IMPROVEMENT: 'improvement',
  COMPLIMENT: 'compliment'
};