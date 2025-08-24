import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  Calendar,
  Clock,
  Eye,
  Users,
  TrendingUp,
  Download,
  QrCode,
  Edit,
  Copy,
  Trash2,
  ExternalLink,
  Share2,
  MoreHorizontal,
  AlertCircle
} from 'lucide-react';
import { format, isAfter, isBefore, startOfDay, endOfDay } from 'date-fns';
import { LinkCard } from './LinkCard';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Modal } from '../ui/Modal';
import { TimeInput } from '../TimeInput';
import { QRCodeGenerator } from '../QRCodeGenerator';
import { supabase } from '../../lib/supabase';
import { generateSlug } from '../../lib/timezone';
import { canCreateLink, incrementLinksCreated, getDefaultExpiration } from '../../lib/plans';
import { logUserActivity } from '../../lib/activity';
import type { TimezoneLink } from '../../lib/supabase';

interface LinkManagementProps {
  user: any;
  userProfile: any;
  links: TimezoneLink[];
  onLinksUpdate: () => void;
}

export const LinkManagement: React.FC<LinkManagementProps> = ({
  user,
  userProfile,
  links,
  onLinksUpdate
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<'all' | 'upcoming' | 'past' | 'this_week' | 'this_month'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'expired' | 'inactive'>('all');
  const [sortBy, setSortBy] = useState<'created_at' | 'scheduled_time' | 'view_count' | 'title'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedLink, setSelectedLink] = useState<TimezoneLink | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionInProgress, setActionInProgress] = useState<'creating' | 'updating' | 'deleting' | null>(null);

  const handleCreateLink = async (date: Date, timezone: string, title: string, description?: string) => {
    try {
      setError(null);
      setLoading(true);
      setActionInProgress('creating');
      
      if (!user) return;

      // Check if user can create more links
      const { canCreate, reason } = await canCreateLink(user.id);
      if (!canCreate) {
        setError(reason ? reason : 'Unable to create link');
        return;
      }

      const slug = generateSlug(title, date);
      const expirationDate = getDefaultExpiration(userProfile?.plan || 'starter');
      
      const { data, error } = await supabase
        .from('timezone_links')
        .insert({
          title,
          description: description || null,
          scheduled_time: date.toISOString(),
          timezone,
          slug,
          is_active: true,
          expires_at: expirationDate.toISOString(),
          user_id: user?.id,
          view_count: 0,
          unique_viewers: 0
        })
        .select()
        .single();

      if (error) throw error;

      // Increment the user's monthly link count
      await incrementLinksCreated(user.id);
      
      // Log activity
      await logUserActivity(user.id, 'link_created', { 
        linkId: data.id, 
        title, 
        scheduled_time: date.toISOString() 
      });

      setShowCreateModal(false);
      onLinksUpdate();
    } catch (error) {
      console.error('Error creating link:', error);
      setError('Failed to create link. Please try again.');
    } finally {
      setLoading(false);
      setActionInProgress(null);
    }
  };

  const handleEditLink = async (date: Date, timezone: string, title: string, description?: string) => {
    if (!selectedLink) return;

    try {
      setError(null);
      setLoading(true);
      setActionInProgress('updating');
      const { error } = await supabase
        .from('timezone_links')
        .update({
          title,
          description: description || null,
          scheduled_time: date.toISOString(),
          timezone,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedLink.id);

      if (error) throw error;

      // Log activity
      await logUserActivity(user.id, 'link_updated', { 
        linkId: selectedLink.id, 
        title, 
        scheduled_time: date.toISOString() 
      });

      setShowEditModal(false);
      setSelectedLink(null);
      onLinksUpdate();
    } catch (error) {
      console.error('Error updating link:', error);
      setError('Failed to update link. Please try again.');
    } finally {
      setLoading(false);
      setActionInProgress(null);
    }
  };

  const handleDeleteLink = async (linkId: string) => {
    try {
      setError(null);
      setLoading(true);
      setActionInProgress('deleting');
      const { error } = await supabase
        .from('timezone_links')
        .delete()
        .eq('id', linkId);

      if (error) throw error;

      // Log activity
      await logUserActivity(user.id, 'link_deleted', { linkId });

      onLinksUpdate();
    } catch (error) {
      console.error('Error deleting link:', error);
      setError('Failed to delete link. Please try again.');
    } finally {
      setLoading(false);
      setActionInProgress(null);
    }
  };

  const handleDuplicateLink = async (link: TimezoneLink) => {
    try {
      setError(null);
      setLoading(true);
      setActionInProgress('creating');
      
      if (!user) return;
      
      // Check if user can create more links
      const { canCreate, reason } = await canCreateLink(user.id);
      if (!canCreate) {
        setError(reason);
        return;
      }
      
      const newSlug = generateSlug(link.title + ' Copy', new Date(link.scheduled_time));
      const expirationDate = getDefaultExpiration(userProfile?.plan || 'starter');
      
      const { error } = await supabase
        .from('timezone_links')
        .insert({
          title: link.title + ' (Copy)',
          description: link.description,
          scheduled_time: link.scheduled_time,
          timezone: link.timezone,
          slug: newSlug,
          is_active: true,
          expires_at: expirationDate.toISOString(),
          user_id: user?.id,
        });

      if (error) throw error;
      
      // Increment the user's monthly link count
      await incrementLinksCreated(user.id);
      
      // Log activity
      await logUserActivity(user.id, 'link_duplicated', { 
        originalLinkId: link.id, 
        title: link.title + ' (Copy)' 
      });
      
      onLinksUpdate();
    } catch (error) {
      console.error('Error duplicating link:', error);
      setError('Failed to duplicate link. Please try again.');
    } finally {
      setLoading(false);
      setActionInProgress(null);
    }
  };

  const handleToggleStatus = async (linkId: string, isActive: boolean) => {
    try {
      setError(null);
      setLoading(true);
      
      const { error } = await supabase
        .from('timezone_links')
        .update({ is_active: !isActive })
        .eq('id', linkId);

      if (error) throw error;

      // Log activity
      await logUserActivity(user.id, isActive ? 'link_deactivated' : 'link_activated', { linkId });

      onLinksUpdate();
    } catch (error) {
      console.error('Error toggling link status:', error);
      setError('Failed to update link status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const exportToCalendar = (link: TimezoneLink) => {
    const eventTime = new Date(link.scheduled_time);
    const endTime = new Date(eventTime.getTime() + 60 * 60 * 1000); // 1 hour duration

    const formatCalendarDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const calendarContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Timelyr//Timezone Link//EN
BEGIN:VEVENT
UID:${link.id}@timelyr.com
DTSTAMP:${formatCalendarDate(new Date())}
DTSTART:${formatCalendarDate(eventTime)}
DTEND:${formatCalendarDate(endTime)}
SUMMARY:${link.title}
DESCRIPTION:${link.description || 'Scheduled via Timelyr'}
URL:${window.location.origin}/link/${link.slug}
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([calendarContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${link.title.replace(/[^a-z0-9]/gi, '-')}.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const filteredAndSortedLinks = React.useMemo(() => {
    let filtered = links.filter(link => {
      // Search filter
      const matchesSearch = link.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           link.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           link.slug.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (!matchesSearch) return false;

      // Date filter
      const now = new Date();
      const linkDate = new Date(link.scheduled_time);
      
      switch (dateFilter) {
        case 'upcoming':
          if (!isAfter(linkDate, now)) return false;
          break;
        case 'past':
          if (!isBefore(linkDate, now)) return false;
          break;
        case 'this_week':
          const weekStart = startOfDay(new Date(now.setDate(now.getDate() - now.getDay())));
          const weekEnd = endOfDay(new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000));
          if (isBefore(linkDate, weekStart) || isAfter(linkDate, weekEnd)) return false;
          break;
        case 'this_month':
          const monthStart = startOfDay(new Date(now.getFullYear(), now.getMonth(), 1));
          const monthEnd = endOfDay(new Date(now.getFullYear(), now.getMonth() + 1, 0));
          if (isBefore(linkDate, monthStart) || isAfter(linkDate, monthEnd)) return false;
          break;
      }

      // Status filter
      const isExpired = link.expires_at && new Date(link.expires_at) < new Date();
      switch (statusFilter) {
        case 'active':
          if (!link.is_active || isExpired) return false;
          break;
        case 'expired':
          if (!isExpired) return false;
          break;
        case 'inactive':
          if (link.is_active && !isExpired) return false;
          break;
      }

      return true;
    });

    // Sort
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'scheduled_time':
          aValue = new Date(a.scheduled_time);
          bValue = new Date(b.scheduled_time);
          break;
        case 'view_count':
          aValue = a.view_count;
          bValue = b.view_count;
          break;
        default:
          aValue = new Date(a.created_at);
          bValue = new Date(b.created_at);
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [links, searchQuery, dateFilter, statusFilter, sortBy, sortOrder]);

  const stats = React.useMemo(() => {
    const now = new Date();
    return {
      total: links.length,
      active: links.filter(l => l.is_active && (!l.expires_at || new Date(l.expires_at) > now)).length,
      upcoming: links.filter(l => new Date(l.scheduled_time) > now).length,
      totalViews: links.reduce((sum, l) => sum + l.view_count, 0),
    };
  }, [links]);

  // Error display component
  const ErrorMessage = ({ message, onDismiss }: { message: string, onDismiss: () => void }) => (
    <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4 rounded">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <AlertCircle className="h-5 w-5 text-red-400" />
        </div>
        <div className="ml-3">
          <p className="text-sm text-red-700">{message}</p>
        </div>
        <button 
          onClick={onDismiss}
          className="ml-auto pl-3"
        >
          <span className="text-red-500 hover:text-red-600 text-sm">Dismiss</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Error Message */}
      {error && (
        <ErrorMessage 
          message={error} 
          onDismiss={() => setError(null)} 
        />
      )}
      
      {/* Header with Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Links</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            <div className="text-sm text-gray-600">Active Links</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.upcoming}</div>
            <div className="text-sm text-gray-600">Upcoming Events</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.totalViews}</div>
            <div className="text-sm text-gray-600">Total Views</div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search links by title, description, or slug..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex gap-2">
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Dates</option>
                <option value="upcoming">Upcoming</option>
                <option value="past">Past</option>
                <option value="this_week">This Week</option>
                <option value="this_month">This Month</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="expired">Expired</option>
                <option value="inactive">Inactive</option>
              </select>

              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-');
                  setSortBy(field as any);
                  setSortOrder(order as any);
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="created_at-desc">Newest First</option>
                <option value="created_at-asc">Oldest First</option>
                <option value="scheduled_time-asc">Event Date (Earliest)</option>
                <option value="scheduled_time-desc">Event Date (Latest)</option>
                <option value="title-asc">Title (A-Z)</option>
                <option value="title-desc">Title (Z-A)</option>
                <option value="view_count-desc">Most Views</option>
                <option value="view_count-asc">Least Views</option>
              </select>

              <div className="flex border border-gray-300 rounded-lg">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-2 text-sm ${viewMode === 'grid' ? 'bg-blue-100 text-blue-700' : 'text-gray-600'}`}
                >
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-2 text-sm ${viewMode === 'list' ? 'bg-blue-100 text-blue-700' : 'text-gray-600'}`}
                >
                  List
                </button>
              </div>

              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Link
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Links Display */}
      {filteredAndSortedLinks.length > 0 ? (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
          {filteredAndSortedLinks.map((link) => (
            <LinkCard
              key={link.id}
              link={link}
              userPlan={userProfile?.plan as 'starter' | 'pro' || 'starter'}
              viewMode={viewMode}
              onEdit={(link) => {
                setSelectedLink(link);
                setShowEditModal(true);
              }}
              onDelete={handleDeleteLink}
              onDuplicate={handleDuplicateLink}
              onToggleStatus={handleToggleStatus}
              onExportCalendar={exportToCalendar}
              onShowQR={(link) => {
                setSelectedLink(link);
                setShowQRModal(true);
              }}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery || dateFilter !== 'all' || statusFilter !== 'all' 
                ? 'No links match your filters' 
                : 'No links created yet'
              }
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || dateFilter !== 'all' || statusFilter !== 'all'
                ? 'Try adjusting your search or filters to find what you\'re looking for.'
                : 'Create your first timezone link to get started with coordinating meetings across time zones.'
              }
            </p>
            {searchQuery || dateFilter !== 'all' || statusFilter !== 'all' ? (
              <Button variant="secondary" onClick={() => {
                setSearchQuery('');
                setDateFilter('all');
                setStatusFilter('all');
              }}>
                Clear Filters
              </Button>
            ) : (
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Link
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Create Link Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          if (!loading && !actionInProgress) {
            setShowCreateModal(false);
            setError(null);
            setLoading(false);
            setActionInProgress(null);
          }
        }}
        title="Create New Timezone Link"
        maxWidth="lg"
      >
        {error && (
          <div className="mb-4">
            <ErrorMessage 
              message={error} 
              onDismiss={() => setError(null)} 
            />
          </div>
        )}
        <TimeInput 
          onTimeSelect={handleCreateLink} 
          userPlan={userProfile?.plan as 'starter' | 'pro' || 'starter'}
          loading={loading && actionInProgress === 'creating'}
        />
      </Modal>

      {/* Edit Link Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          if (!loading && !actionInProgress) {
          setShowEditModal(false);
          setSelectedLink(null);
            setError(null);
            setLoading(false);
            setActionInProgress(null);
          }
        }}
        title="Edit Timezone Link"
        maxWidth="lg"
      >
        {error && (
          <div className="mb-4">
            <ErrorMessage 
              message={error} 
              onDismiss={() => setError(null)} 
            />
          </div>
        )}
        {selectedLink && (
          <TimeInput 
            onTimeSelect={handleEditLink}
            initialData={{
              title: selectedLink.title,
              description: selectedLink.description || '',
              date: new Date(selectedLink.scheduled_time),
              timezone: selectedLink.timezone
            }}
            userPlan={userProfile?.plan as 'starter' | 'pro' || 'starter'}
            loading={loading && actionInProgress === 'updating'}
          />
        )}
      </Modal>

      {/* QR Code Modal */}
      <Modal
        isOpen={showQRModal}
        onClose={() => {
          setShowQRModal(false);
          setSelectedLink(null);
        }}
        title="QR Code"
        maxWidth="sm"
      >
        {selectedLink && (
          <QRCodeGenerator
            url={`${window.location.origin}/link/${selectedLink.slug}`}
            title={selectedLink.title}
          />
        )}
      </Modal>
    </div>
  );
};