import { supabase } from './supabase';
import type { UserProfile } from './supabase';

export interface PlanLimits {
  linksPerMonth: number | null; // null means unlimited
  linkExpirationDays: number;
  hasAdvancedAnalytics: boolean;
  hasCustomBranding: boolean;
  hasCustomSlugs: boolean;
  hasQRCodes: boolean;
  hasEmailReminders: boolean;
  has2FA: boolean;
  hasPrioritySupport: boolean;
  hasBusinessHoursIntelligence: boolean;
}

export const PLAN_LIMITS: Record<'starter' | 'pro', PlanLimits> = {
  starter: {
    linksPerMonth: 50,
    linkExpirationDays: 30,
    hasAdvancedAnalytics: false,
    hasCustomBranding: false,
    hasCustomSlugs: false,
    hasQRCodes: false,
    hasEmailReminders: false,
    has2FA: false,
    hasPrioritySupport: false,
    hasBusinessHoursIntelligence: false,
  },
  pro: {
    linksPerMonth: null, // unlimited
    linkExpirationDays: 365,
    hasAdvancedAnalytics: true,
    hasCustomBranding: true,
    hasCustomSlugs: true,
    hasQRCodes: true,
    hasEmailReminders: true,
    has2FA: true,
    hasPrioritySupport: true,
    hasBusinessHoursIntelligence: true,
  },
};

export const getPlanLimits = (plan: 'starter' | 'pro'): PlanLimits => {
  return PLAN_LIMITS[plan];
};

export const canCreateLink = async (userId: string): Promise<{ canCreate: boolean; reason?: string }> => {
  try {
    // Check if we're in mock mode
    const isMockMode = !import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_USE_MOCK_DB === 'true';
    
    if (isMockMode) {
      // In mock mode, always allow creation for demo purposes
      return { canCreate: true };
    }
    
    // Get user profile
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('plan, links_created_this_month')
      .eq('id', userId)
      .single();

    if (error) throw error;

    const limits = getPlanLimits(profile.plan as 'starter' | 'pro');
    
    // Pro users have unlimited links
    if (limits.linksPerMonth === null) {
      return { canCreate: true };
    }

    // Check if user has reached monthly limit
    if (profile.links_created_this_month >= limits.linksPerMonth) {
      return { 
        canCreate: false, 
        reason: `You've reached your monthly limit of ${limits.linksPerMonth} links. Upgrade to Pro for unlimited links.` 
      };
    }

    return { canCreate: true };
  } catch (error) {
    console.error('Error checking link creation limits:', error);
    // In case of error, allow creation to not block users
    return { canCreate: true };
  }
};

export const incrementLinksCreated = async (userId: string): Promise<void> => {
  try {
    // Check if we're in mock mode
    const isMockMode = !import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_USE_MOCK_DB === 'true';
    
    if (isMockMode) {
      // In mock mode, simulate the increment
      console.log('Mock: Incrementing links created for user:', userId);
      return;
    }
    
    const { error } = await supabase
      .from('user_profiles')
      .update({})
      .raw('links_created_this_month = links_created_this_month + 1')
      .eq('id', userId);

    if (error) throw error;
  } catch (error) {
    console.error('Error incrementing links created:', error);
    // Don't throw error to not block link creation
  }
};

export const getDefaultExpiration = (plan: 'starter' | 'pro'): Date => {
  const limits = getPlanLimits(plan);
  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() + limits.linkExpirationDays);
  return expirationDate;
};

export const hasFeatureAccess = (userPlan: 'starter' | 'pro', feature: keyof PlanLimits): boolean => {
  const limits = getPlanLimits(userPlan);
  return limits[feature] as boolean;
};