import { useState, useEffect } from 'react';
import { adminApi } from '../services/adminApi';

interface TrackDefinition {
  id: string;
  slug: string;
  title: string;
  description: string;
  industry_tags?: string[];
  duration_weeks: number;
  phases?: any;
  created_at: string;
}

interface TrackEditorProps {
  track: TrackDefinition | null;
  onSave: (savedTrack: TrackDefinition) => void;
  onCancel: () => void;
  isCreating?: boolean;
}

interface TrackPhase {
  id: string;
  title: string;
  description: string;
  startWeek: number;
  endWeek: number;
  color: string;
}

export default function TrackEditor({ track, onSave, onCancel, isCreating = false }: TrackEditorProps) {
  const [formData, setFormData] = useState({
    slug: '',
    title: '',
    description: '',
    industry_tags: '',
    duration_weeks: 12
  });
  
  const [phases, setPhases] = useState<TrackPhase[]>([
    { id: '1', title: 'Phase 1: Foundation', description: 'Building your strategy foundation', startWeek: 1, endWeek: 3, color: '#EF8E81' },
    { id: '2', title: 'Phase 2: Implementation', description: 'Putting strategies into action', startWeek: 4, endWeek: 6, color: '#D4AF37' },
    { id: '3', title: 'Phase 3: Growth', description: 'Scaling and expanding your reach', startWeek: 7, endWeek: 9, color: '#8B5CF6' },
    { id: '4', title: 'Phase 4: Optimization', description: 'Refining and optimizing performance', startWeek: 10, endWeek: 12, color: '#10B981' }
  ]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize form data when track changes
  useEffect(() => {
    if (track) {
      setFormData({
        slug: track.slug,
        title: track.title,
        description: track.description,
        industry_tags: track.industry_tags?.join(', ') || '',
        duration_weeks: track.duration_weeks
      });
      
      // Load phases from track
      if (track.phases) {
        try {
          const trackPhases = typeof track.phases === 'string' ? JSON.parse(track.phases) : track.phases;
          if (Array.isArray(trackPhases)) {
            setPhases(trackPhases);
          }
        } catch (error) {
          console.error('Error parsing phases:', error);
        }
      }
    } else if (isCreating) {
      setFormData({
        slug: '',
        title: '',
        description: '',
        industry_tags: '',
        duration_weeks: 12
      });
      // Reset to default phases for new tracks
      setPhases([
        { id: '1', title: 'Phase 1: Foundation', description: 'Building your strategy foundation', startWeek: 1, endWeek: 3, color: '#EF8E81' },
        { id: '2', title: 'Phase 2: Implementation', description: 'Putting strategies into action', startWeek: 4, endWeek: 6, color: '#D4AF37' },
        { id: '3', title: 'Phase 3: Growth', description: 'Scaling and expanding your reach', startWeek: 7, endWeek: 9, color: '#8B5CF6' },
        { id: '4', title: 'Phase 4: Optimization', description: 'Refining and optimizing performance', startWeek: 10, endWeek: 12, color: '#10B981' }
      ]);
    }
  }, [track, isCreating]);

  const handleSave = async () => {
    if (!formData.slug || !formData.title || !formData.description) {
      setError('Please fill in all required fields (slug, title, description)');
      return;
    }

    // Validate phases - ensure all have complete titles and descriptions
    const incompletePhases = phases.filter(phase => 
      !phase.title || 
      phase.title.trim() === '' || 
      phase.title.endsWith(':') ||
      !phase.description ||
      phase.description.trim() === ''
    );
    if (incompletePhases.length > 0) {
      setError('Please complete all phase titles and descriptions. Phase titles cannot be empty or end with a colon.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🔍 TrackEditor - Phases data:', phases);
      
      const trackData = {
        ...formData,
        industry_tags: formData.industry_tags.split(',').map(t => t.trim()).filter(Boolean),
        phases: phases // Send phases as array, let adminApi handle JSON.stringify
      };
      
      console.log('🔍 TrackEditor - Final track data being sent:', trackData);

      let response;
      if (isCreating) {
        response = await adminApi.createTrackDefinition(trackData);
      } else {
        response = await adminApi.updateTrackDefinition(track!.id, trackData);
      }

      if (response.success) {
        onSave(response.data);
      } else {
        setError(response.error || 'Failed to save track');
      }
    } catch (error) {
      setError('Failed to save track');
    } finally {
      setLoading(false);
    }
  };

  const addPhase = () => {
    const lastPhase = phases[phases.length - 1];
    const newPhaseId = (phases.length + 1).toString();
    const startWeek = lastPhase ? lastPhase.endWeek + 1 : 1;
    const endWeek = Math.min(startWeek + 2, 12);
    
    const newPhase: TrackPhase = {
      id: newPhaseId,
      title: `Phase ${newPhaseId}`,
      description: 'New phase description',
      startWeek,
      endWeek,
      color: '#6B7280'
    };
    
    setPhases([...phases, newPhase]);
  };

  const removePhase = (phaseIndex: number) => {
    if (phases.length <= 1) return; // Keep at least one phase
    const updatedPhases = [...phases];
    updatedPhases.splice(phaseIndex, 1);
    setPhases(updatedPhases);
  };

  const updatePhase = (index: number, updates: Partial<TrackPhase>) => {
    const updatedPhases = [...phases];
    updatedPhases[index] = { ...updatedPhases[index], ...updates };
    setPhases(updatedPhases);
  };

  return (
    <div className="bg-[#1B1628] rounded-2xl border border-[#2A243E] p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">
          {isCreating ? 'Create New Track' : `Edit Track: ${track?.title}`}
        </h2>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="bg-gray-600 text-white border border-gray-600 rounded-full px-4 py-2 text-sm font-medium hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="bg-green-600 text-white border border-green-600 rounded-full px-4 py-2 text-sm font-medium hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Track'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-500/20 border border-red-500/30 rounded-lg p-4">
          <p className="text-red-300">{error}</p>
        </div>
      )}

      {/* Track Basic Information */}
      <div className="space-y-4 mb-8">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Track Slug:</label>
          <input
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            className="w-full px-3 py-2 rounded bg-[#141127] border border-[#2A243E] text-white"
            placeholder="social-media-strategy"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Track Title:</label>
          <input
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3 py-2 rounded bg-[#141127] border border-[#2A243E] text-white text-2xl font-bold"
            placeholder="Improve Social Media Strategy & Engagement"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Track Description:</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full h-24 px-3 py-2 rounded bg-[#141127] border border-[#2A243E] text-white text-lg"
            placeholder="Transform your social media presence with our comprehensive 12-week strategy..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Industry Tags (comma-separated):</label>
          <input
            value={formData.industry_tags}
            onChange={(e) => setFormData({ ...formData, industry_tags: e.target.value })}
            className="w-full px-3 py-2 rounded bg-[#141127] border border-[#2A243E] text-white"
            placeholder="Social Media, Marketing, Engagement"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Duration (weeks):</label>
          <input
            type="number"
            min="1"
            max="52"
            value={formData.duration_weeks}
            onChange={(e) => setFormData({ ...formData, duration_weeks: parseInt(e.target.value) || 12 })}
            className="w-full px-3 py-2 rounded bg-[#141127] border border-[#2A243E] text-white"
          />
        </div>
      </div>

      {/* Phase Section */}
      <div className="pt-6 border-t border-[#2A243E]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Track Phases</h3>
          <button
            onClick={addPhase}
            className="text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
          >
            + Add Phase
          </button>
        </div>
        
        <div className="space-y-4">
          {phases.map((phase, index) => (
            <div key={phase.id} className="bg-[#141127] rounded-lg p-4 border border-[#2A243E] relative">
              {phases.length > 1 && (
                <button
                  onClick={() => removePhase(index)}
                  className="absolute top-2 right-2 text-red-400 hover:text-red-300 text-sm"
                >
                  ✕
                </button>
              )}
              
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Phase Title:</label>
                  <input
                    value={phase.title}
                    onChange={(e) => updatePhase(index, { title: e.target.value })}
                    className="w-full px-3 py-2 rounded bg-[#1B1628] border border-[#2A243E] text-white"
                    placeholder="Foundation Phase"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Color:</label>
                  <input
                    type="color"
                    value={phase.color}
                    onChange={(e) => updatePhase(index, { color: e.target.value })}
                    className="w-full h-10 rounded bg-[#1B1628] border border-[#2A243E]"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Start Week:</label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={phase.startWeek}
                    onChange={(e) => updatePhase(index, { startWeek: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 rounded bg-[#1B1628] border border-[#2A243E] text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">End Week:</label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={phase.endWeek}
                    onChange={(e) => updatePhase(index, { endWeek: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 rounded bg-[#1B1628] border border-[#2A243E] text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Description:</label>
                <input
                  value={phase.description}
                  onChange={(e) => updatePhase(index, { description: e.target.value })}
                  className="w-full px-3 py-2 rounded bg-[#1B1628] border border-[#2A243E] text-white"
                  placeholder="Building your strategy foundation"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
// Force new hash: 1758727952915265000
