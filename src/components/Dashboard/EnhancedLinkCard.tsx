import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ExternalLink, 
  Copy, 
  Edit, 
  Trash2, 
  MoreHorizontal,
  Eye,
  Calendar,
  Clock,
  Globe,
  Share2,
  QrCode,
  Play,
  Pause,
  Download,
  Users,
  TrendingUp
} from 'lucide-react';
import { format, isAfter, isBefore } from 'date-fns';
import { formatInTimezone, getUserTimezone } from '../../lib/timezone';
import { hasFeatureAccess } from '../../lib/plans';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import type { TimezoneLink } from '../../lib/supabase';

interface EnhancedLinkCardProps {
  link: TimezoneLink;
  userPlan?: 'starter' | 'pro';
  viewMode?: 'grid' | 'list';
  onEdit: (link: TimezoneLink) => void;
  onDelete: (linkId: string) => void;
  onDuplicate: (link: TimezoneLink) => void;
  onToggleStatus: (linkId: string, isActive: boolean) => void;
  onExportCalendar: (link: TimezoneLink) => void;
  onShowQR: (link: TimezoneLink) => void;
}

export const EnhancedLinkCard: React.FC<EnhancedLinkCardProps> = ({ 
  link, 
  userPlan = 'starter',
  viewMode = 'grid',
  onEdit, 
  onDelete, 
  onDuplicate,
  onToggleStatus,
  onExportCalendar,
  onShowQR
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [copied, setCopied] = useState(false);

  const userTimezone = getUserTimezone();
  const scheduledTime = new Date(link.scheduled_time);
  const isExpired = link.expires_at && new Date(link.expires_at) < new Date();
  const isPast = isBefore(scheduledTime, new Date());
  const isUpcoming = isAfter(scheduledTime, new Date());
  const hasQRAccess = hasFeatureAccess(userPlan, 'hasQRCodes');
  
  const linkUrl = `${window.location.origin}/link/${link.slug}`;
  const localTimeString = formatInTimezone(scheduledTime, userTimezone);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(linkUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: link.title,
          text: `Join me for: ${link.title}`,
          url: linkUrl,
        });
      } catch (error) {
        handleCopy();
      }
    } else {
      handleCopy();
    }
  };

  const getStatusBadge = () => {
    if (!link.is_active) {
      return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">Inactive</span>;
    }
    if (isExpired) {
      return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-600 rounded-full">Expired</span>;
    }
    if (isPast) {
      return <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-600 rounded-full">Past</span>;
    }
    
    const daysUntilExpiry = link.expires_at ? 
      Math.ceil((new Date(link.expires_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 
      null;
    
    return (
      <div className="flex items-center space-x-2">
        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-600 rounded-full">Active</span>
        {daysUntilExpiry && daysUntilExpiry <= 7 && (
          <span className="px-2 py-1 text-xs font-medium bg-amber-100 text-amber-600 rounded-full">
            {daysUntilExpiry}d left
          </span>
        )}
      </div>
    );
  };

  const getTimeStatus = () => {
    if (isPast) {
      return { text: 'Event passed', color: 'text-gray-500', icon: Clock };
    }
    if (isUpcoming) {
      const hoursUntil = Math.ceil((scheduledTime.getTime() - new Date().getTime()) / (1000 * 60 * 60));
      if (hoursUntil <= 24) {
        return { text: `In ${hoursUntil}h`, color: 'text-orange-600', icon: Clock };
      }
      const daysUntil = Math.ceil(hoursUntil / 24);
      return { text: `In ${daysUntil}d`, color: 'text-blue-600', icon: Calendar };
    }
    return { text: 'Now', color: 'text-green-600', icon: Play };
  };

  const timeStatus = getTimeStatus();

  if (viewMode === 'list') {
    return (
      <>
        <Card className="hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 flex-1 min-w-0">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="text-lg font-semibold text-gray-800 truncate">
                      {link.title}
                    </h3>
                    {getStatusBadge()}
                  </div>
                  {link.description && (
                    <p className="text-sm text-gray-600 line-clamp-1 mb-2">
                      {link.description}
                    </p>
                  )}
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <timeStatus.icon className="w-4 h-4 mr-1" />
                      <span className={timeStatus.color}>{timeStatus.text}</span>
                    </div>
                    <div className="flex items-center">
                      <Globe className="w-4 h-4 mr-1" />
                      {format(scheduledTime, 'MMM d, yyyy \'at\' h:mm a')}
                    </div>
                    <div className="flex items-center">
                      <Eye className="w-4 h-4 mr-1" />
                      {link.view_count} views
                    </div>
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      {link.unique_viewers} unique
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 ml-4">
                <Button variant="tertiary" size="sm" onClick={handleCopy}>
                  <Copy className="w-4 h-4 mr-1" />
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
                
                <Button variant="tertiary" size="sm" onClick={() => onExportCalendar(link)}>
                  <Download className="w-4 h-4 mr-1" />
                  .ics
                </Button>

                <div className="relative">
                  <Button
                    variant="tertiary"
                    size="sm"
                    onClick={() => setShowMenu(!showMenu)}
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                  {showMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                      <Link
                        to={`/link/${link.slug}`}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowMenu(false)}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View Link
                      </Link>
                      <button
                        onClick={() => {
                          onEdit(link);
                          setShowMenu(false);
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          onDuplicate(link);
                          setShowMenu(false);
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Duplicate
                      </button>
                      <button
                        onClick={() => {
                          onToggleStatus(link.id, link.is_active);
                          setShowMenu(false);
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        {link.is_active ? (
                          <>
                            <Pause className="w-4 h-4 mr-2" />
                            Deactivate
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 mr-2" />
                            Activate
                          </>
                        )}
                      </button>
                      {hasQRAccess && (
                        <button
                          onClick={() => {
                            onShowQR(link);
                            setShowMenu(false);
                          }}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <QrCode className="w-4 h-4 mr-2" />
                          QR Code
                        </button>
                      )}
                      <hr className="my-1" />
                      <button
                        onClick={() => {
                          setShowDeleteDialog(true);
                          setShowMenu(false);
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <ConfirmDialog
          isOpen={showDeleteDialog}
          onClose={() => setShowDeleteDialog(false)}
          onConfirm={() => onDelete(link.id)}
          title="Delete Link"
          message={`Are you sure you want to delete "${link.title}"? This action cannot be undone.`}
          confirmText="Delete"
          variant="danger"
        />
      </>
    );
  }

  // Grid view (default)
  return (
    <>
      <Card className="hover:shadow-md transition-shadow duration-200">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-800 truncate mb-1">
                {link.title}
              </h3>
              {link.description && (
                <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                  {link.description}
                </p>
              )}
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <timeStatus.icon className="w-4 h-4 mr-1" />
                  <span className={timeStatus.color}>{timeStatus.text}</span>
                </div>
                <div className="flex items-center">
                  <Globe className="w-4 h-4 mr-1" />
                  {format(scheduledTime, 'MMM d, yyyy')}
                </div>
                {link.expires_at && (
                  <div className="flex items-center text-xs">
                    <Calendar className="w-3 h-3 mr-1" />
                    Expires {format(new Date(link.expires_at), 'MMM d')}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2 ml-4">
              {getStatusBadge()}
              <div className="relative">
                <Button
                  variant="tertiary"
                  size="sm"
                  onClick={() => setShowMenu(!showMenu)}
                >
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
                {showMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                    <Link
                      to={`/link/${link.slug}`}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowMenu(false)}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View Link
                    </Link>
                    <button
                      onClick={() => {
                        onEdit(link);
                        setShowMenu(false);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        onDuplicate(link);
                        setShowMenu(false);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Duplicate
                    </button>
                    <button
                      onClick={() => {
                        onToggleStatus(link.id, link.is_active);
                        setShowMenu(false);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      {link.is_active ? (
                        <>
                          <Pause className="w-4 h-4 mr-2" />
                          Deactivate
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Activate
                        </>
                      )}
                    </button>
                    {hasQRAccess && (
                      <button
                        onClick={() => {
                          onShowQR(link);
                          setShowMenu(false);
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <QrCode className="w-4 h-4 mr-2" />
                        QR Code
                      </button>
                    )}
                    <hr className="my-1" />
                    <button
                      onClick={() => {
                        setShowDeleteDialog(true);
                        setShowMenu(false);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="text-sm font-medium text-gray-800">
              {format(scheduledTime, 'h:mm a')} • {localTimeString.split(' at ')[0]}
            </div>
            
            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <Eye className="w-4 h-4 mr-1" />
                  {link.view_count} views
                </div>
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  {link.unique_viewers} unique
                </div>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  Created {format(new Date(link.created_at), 'MMM d')}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-200 mt-4">
            <div className="flex items-center space-x-2">
              <Button
                variant="tertiary"
                size="sm"
                onClick={handleCopy}
              >
                <Copy className="w-4 h-4 mr-1" />
                {copied ? 'Copied!' : 'Copy'}
              </Button>
              <Button
                variant="tertiary"
                size="sm"
                onClick={handleShare}
              >
                <Share2 className="w-4 h-4 mr-1" />
                Share
              </Button>
              <Button
                variant="tertiary"
                size="sm"
                onClick={() => onExportCalendar(link)}
              >
                <Download className="w-4 h-4 mr-1" />
                .ics
              </Button>
            </div>
            
            {hasQRAccess && (
              <Button
                variant="tertiary"
                size="sm"
                onClick={() => onShowQR(link)}
              >
                <QrCode className="w-4 h-4 mr-1" />
                QR
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={() => onDelete(link.id)}
        title="Delete Link"
        message={`Are you sure you want to delete "${link.title}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </>
  );
};