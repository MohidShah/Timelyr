import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, Grid, List, Calendar, Copy, Trash2, Edit, ExternalLink, BarChart3, Share2 } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { TimeInput } from '../components/TimeInput';
import { BusinessHoursIndicator } from '../components/BusinessHoursIndicator';
import { supabase } from '../lib/supabase';
import { formatInTimezone, getUserTimezone, generateSlug } from '../lib/timezone';
import type { Database } from '../lib/supabase';

type TimezoneLink = Database['public']['Tables']['timezone_links']['Row'];

export const DashboardPage: React.FC = () => {
  const [links, setLinks] = useState<TimezoneLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedLink, setSelectedLink] = useState<TimezoneLink | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingLink, setEditingLink] = useState<TimezoneLink | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/');
        return;
      }

      const { data, error } = await supabase
        .from('timezone_links')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLinks(data || []);
    } catch (error) {
      console.error('Error fetching links:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLink = async (date: Date, timezone: string, title: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const slug = generateSlug(title, date);
      
      const { data, error } = await supabase
        .from('timezone_links')
        .insert({
          title,
          scheduled_time: date.toISOString(),
          timezone,
          slug,
          is_active: true,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      setLinks([data, ...links]);
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating link:', error);
    }
  };

  const handleCopyLink = async (link: TimezoneLink) => {
    try {
      const url = `${window.location.origin}/link/${link.slug}`;
      await navigator.clipboard.writeText(url);
      setCopiedId(link.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  const handleDeleteLink = async (linkId: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this link? This action cannot be undone.');
    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from('timezone_links')
        .delete()
        .eq('id', linkId);

      if (error) throw error;
      setLinks(links.filter(link => link.id !== linkId));
    } catch (error) {
      console.error('Error deleting link:', error);
    }
  };

  const handleEditLink = async (linkId: string, newTitle: string, newDescription?: string) => {
    try {
      const { error } = await supabase
        .from('timezone_links')
        .update({
          title: newTitle,
          description: newDescription || null,
        })
        .eq('id', linkId);

      if (error) throw error;
      
      setLinks(links.map(link => 
        link.id === linkId 
          ? { ...link, title: newTitle, description: newDescription || null }
          : link
      ));
      setEditingLink(null);
    } catch (error) {
      console.error('Error updating link:', error);
    }
  };

  const handleShareLink = async (link: TimezoneLink) => {
    const url = `${window.location.origin}/link/${link.slug}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: link.title,
          text: `Join me for: ${link.title}`,
          url: url,
        });
      } catch (error) {
        // Fallback to copy
        handleCopyLink(link);
      }
    } else {
      handleCopyLink(link);
    }
  };

  const filteredLinks = links.filter(link =>
    link.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    link.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getBusinessHoursStatus = (scheduledTime: string) => {
    const date = new Date(scheduledTime);
    const userTz = getUserTimezone();
    const hour = new Date(date.toLocaleString("en-US", {timeZone: userTz})).getHours();
    return hour >= 9 && hour < 17;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Timezone Links</h1>
            <p className="text-gray-600">Manage and track your shared meeting times</p>
          </div>
          <Button onClick={() => setShowCreateModal(true)} size="lg">
            <Plus className="w-4 h-4 mr-2" />
            Create New Link
          </Button>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search links..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex space-x-2">
            <Button
              variant={viewMode === 'grid' ? 'primary' : 'tertiary'}
              onClick={() => setViewMode('grid')}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'primary' : 'tertiary'}
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Links Display */}
        {filteredLinks.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {searchQuery ? 'No links found' : 'No links created yet'}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchQuery 
                  ? 'Try adjusting your search terms'
                  : 'Create your first timezone link to get started'
                }
              </p>
              {!searchQuery && (
                <Button onClick={() => setShowCreateModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Link
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className={viewMode === 'grid' ? 'grid md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
            {filteredLinks.map((link) => {
              const scheduledTime = new Date(link.scheduled_time);
              const isBusinessHours = getBusinessHoursStatus(link.scheduled_time);
              const localTime = formatInTimezone(scheduledTime, getUserTimezone());
              
              return (
                <Card key={link.id} className="relative shadow-sm hover:shadow-md transition-shadow" hover>
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {editingLink?.id === link.id ? (
                          <div className="space-y-2">
                            <Input
                              value={editingLink.title}
                              onChange={(e) => setEditingLink({ ...editingLink, title: e.target.value })}
                              className="text-sm"
                            />
                            <Input
                              value={editingLink.description || ''}
                              onChange={(e) => setEditingLink({ ...editingLink, description: e.target.value })}
                              placeholder="Description (optional)"
                              className="text-sm"
                            />
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                onClick={() => handleEditLink(editingLink.id, editingLink.title, editingLink.description)}
                              >
                                Save
                              </Button>
                              <Button
                                size="sm"
                                variant="tertiary"
                                onClick={() => setEditingLink(null)}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <h3 className="font-semibold text-gray-800 mb-1 text-lg">{link.title}</h3>
                            {link.description && (
                              <p className="text-sm text-gray-600">{link.description}</p>
                            )}
                          </>
                        )}
                      </div>
                      {editingLink?.id !== link.id && (
                        <div className={`w-3 h-3 rounded-full ${
                          isBusinessHours ? 'bg-green-400' : 'bg-red-400'
                        }`} title={isBusinessHours ? 'Business Hours' : 'Outside Business Hours'} />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {editingLink?.id !== link.id && (
                      <div className="space-y-4">
                        <div className="bg-blue-50 rounded-lg p-3">
                          <p className="text-sm text-blue-600 font-medium mb-1">Your Local Time</p>
                          <p className="font-semibold text-blue-800">
                            {format(scheduledTime, 'MMM d, yyyy \'at\' h:mm a')}
                          </p>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <span className="flex items-center">
                            <BarChart3 className="w-3 h-3 mr-1" />
                            {link.view_count} views
                          </span>
                          <span>{format(new Date(link.created_at), 'MMM d')}</span>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleCopyLink(link)}
                            className="text-xs"
                          >
                            <Copy className="w-3 h-3 mr-1" />
                            {copiedId === link.id ? 'Copied!' : 'Copy'}
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleShareLink(link)}
                            className="text-xs"
                          >
                            <Share2 className="w-3 h-3 mr-1" />
                            Share
                          </Button>
                        </div>

                        <div className="flex space-x-2">
                          <Link to={`/link/${link.slug}`} className="flex-1">
                            <Button size="sm" variant="tertiary" className="w-full text-xs">
                              <ExternalLink className="w-3 h-3 mr-1" />
                              View
                            </Button>
                          </Link>
                          <Button
                            size="sm"
                            variant="tertiary"
                            onClick={() => setEditingLink(link)}
                            className="text-xs"
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="tertiary"
                            onClick={() => handleDeleteLink(link.id)}
                            className="text-red-600 hover:text-red-700 text-xs"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Create Link Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">Create New Link</h2>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors text-2xl"
                  >
                    ×
                  </button>
                </div>
                <TimeInput onTimeSelect={handleCreateLink} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};