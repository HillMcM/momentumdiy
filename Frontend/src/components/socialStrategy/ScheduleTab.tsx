import * as React from 'react';
import type { PostingSchedule } from '../../types';

interface ScheduleTabProps {
  schedule: PostingSchedule;
  onChange: (schedule: PostingSchedule) => void;
}

const DAYS_OF_WEEK = [
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
  { value: 'saturday', label: 'Saturday' },
  { value: 'sunday', label: 'Sunday' },
];

const POST_TYPES: Array<{ value: 'educate' | 'promote' | 'connect'; label: string; color: string; description: string }> = [
  {
    value: 'educate',
    label: 'Educate',
    color: '#3b82f6',
    description: 'Share tips, how-tos, tutorials, or valuable information'
  },
  {
    value: 'promote',
    label: 'Promote',
    color: '#EF8E81',
    description: 'Highlight products, services, offers, or announcements'
  },
  {
    value: 'connect',
    label: 'Connect',
    color: '#10b981',
    description: 'Share stories, behind-the-scenes, or build community'
  },
];

export default function ScheduleTab({ schedule, onChange }: ScheduleTabProps) {
  const toggleDay = (day: string) => {
    const days = schedule.days || [];
    if (days.includes(day)) {
      onChange({
        ...schedule,
        days: days.filter(d => d !== day),
        postTypes: { ...schedule.postTypes, [day]: undefined }
      });
    } else {
      onChange({
        ...schedule,
        days: [...days, day]
      });
    }
  };

  const setPostType = (day: string, type: 'educate' | 'promote' | 'connect' | null) => {
    if (type === null) {
      const newPostTypes = { ...schedule.postTypes };
      delete newPostTypes[day];
      onChange({
        ...schedule,
        postTypes: newPostTypes
      });
    } else {
      onChange({
        ...schedule,
        postTypes: {
          ...schedule.postTypes,
          [day]: type
        }
      });
    }
  };

  const setFrequency = (freq: number) => {
    onChange({
      ...schedule,
      frequency: freq
    });
  };

  const getTypeColor = (type: string | undefined) => {
    return POST_TYPES.find(t => t.value === type)?.color || '#6b7280';
  };

  const getTypeLabel = (type: string | undefined) => {
    return POST_TYPES.find(t => t.value === type)?.label || 'Select Type';
  };

  const selectedDays = schedule.days || [];

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-[#FFF1E7] mb-2">Posting Schedule</h3>
        <p className="text-[#FFF1E7]/60 text-sm mb-4">
          Define when you'll post and what type of content you'll share each day. This creates a consistent routine for your social media.
        </p>
      </div>

      {/* Frequency Selector */}
      <div className="bg-[#1A1625]/50 rounded-lg p-6 border border-[#2A2438]">
        <label className="text-[#FFF1E7]/80 font-medium block mb-3">
          Weekly Posting Frequency
        </label>
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5, 6, 7].map(num => (
            <button
              key={num}
              onClick={() => setFrequency(num)}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                schedule.frequency === num
                  ? 'bg-[#EF8E81] text-white'
                  : 'bg-[#2A2438] text-[#FFF1E7]/60 hover:bg-[#3A3448]'
              }`}
            >
              {num}x per week
            </button>
          ))}
        </div>
        <p className="text-[#FFF1E7]/40 text-sm mt-3">
          Select {schedule.frequency} day{schedule.frequency !== 1 ? 's' : ''} below to complete your schedule
        </p>
      </div>

      {/* Post Type Legend */}
      <div className="bg-[#1A1625]/50 rounded-lg p-6 border border-[#2A2438]">
        <h4 className="text-[#FFF1E7] font-medium mb-4">Post Types</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {POST_TYPES.map(type => (
            <div key={type.value} className="flex items-start space-x-3">
              <div
                className="w-4 h-4 rounded-full mt-0.5 flex-shrink-0"
                style={{ backgroundColor: type.color }}
              />
              <div>
                <div className="text-[#FFF1E7] font-medium text-sm">{type.label}</div>
                <div className="text-[#FFF1E7]/60 text-xs mt-0.5">{type.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly Calendar */}
      <div className="space-y-2">
        <h4 className="text-[#FFF1E7] font-medium mb-3">Weekly Schedule</h4>
        {DAYS_OF_WEEK.map(day => {
          const isSelected = selectedDays.includes(day.value);
          const postType = schedule.postTypes?.[day.value];
          
          return (
            <div
              key={day.value}
              className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
                isSelected
                  ? 'bg-[#1A1625]/50 border-[#EF8E81]'
                  : 'bg-[#1A1625]/30 border-[#2A2438] hover:border-[#3A3448]'
              }`}
            >
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => toggleDay(day.value)}
                  className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
                    isSelected
                      ? 'bg-[#EF8E81] border-[#EF8E81]'
                      : 'border-[#3A3448] hover:border-[#EF8E81]'
                  }`}
                >
                  {isSelected && (
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
                <span className={`font-medium ${isSelected ? 'text-[#FFF1E7]' : 'text-[#FFF1E7]/40'}`}>
                  {day.label}
                </span>
              </div>

              {isSelected && (
                <div className="flex items-center space-x-3">
                  <div className="flex bg-[#2A2438] rounded-lg overflow-hidden">
                    {POST_TYPES.map((type, index) => (
                      <button
                        key={type.value}
                        onClick={() => setPostType(day.value, type.value)}
                        className={`px-4 py-2 text-sm font-medium transition-all ${
                          postType === type.value
                            ? 'text-white'
                            : 'text-[#FFF1E7]/60 hover:text-[#FFF1E7]'
                        } ${index > 0 ? 'border-l border-[#3A3448]' : ''}`}
                        style={{
                          backgroundColor: postType === type.value ? type.color : 'transparent'
                        }}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                  {postType && (
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: getTypeColor(postType) }}
                      title={getTypeLabel(postType)}
                    />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Schedule Summary */}
      {selectedDays.length > 0 && (
        <div className="bg-[#2A2438]/50 rounded-lg p-6 border border-[#3A3448]">
          <h4 className="text-[#FFF1E7] font-medium mb-3">Schedule Summary</h4>
          <div className="space-y-2">
            {selectedDays.map(day => {
              const postType = schedule.postTypes?.[day];
              const dayLabel = DAYS_OF_WEEK.find(d => d.value === day)?.label;
              
              return (
                <div key={day} className="flex items-center justify-between text-sm">
                  <span className="text-[#FFF1E7]/80">{dayLabel}</span>
                  {postType ? (
                    <span
                      className="px-3 py-1 rounded-full text-white font-medium"
                      style={{ backgroundColor: getTypeColor(postType) }}
                    >
                      {getTypeLabel(postType)}
                    </span>
                  ) : (
                    <span className="text-[#FFF1E7]/40 italic">No type assigned</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {selectedDays.length === 0 && (
        <div className="bg-[#2A2438]/30 border border-[#3A3448] rounded-lg p-8 text-center">
          <div className="text-[#FFF1E7]/40 mb-4">
            <svg className="w-16 h-16 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h4 className="text-[#FFF1E7] text-lg font-medium mb-2">No Days Selected</h4>
          <p className="text-[#FFF1E7]/60 text-sm">
            Choose your posting days to create your weekly content schedule
          </p>
        </div>
      )}
    </div>
  );
}

