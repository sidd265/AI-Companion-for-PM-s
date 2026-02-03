import { useState } from 'react';
import { Search, Filter, X, Mail, Github, MessageCircle } from 'lucide-react';
import { teamMembers, TeamMember } from '@/data/mockData';
import { motion, AnimatePresence } from 'framer-motion';

const TeamMemberModal = ({ member, onClose }: { member: TeamMember; onClose: () => void }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-[5px]"
        onClick={onClose}
      />
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="relative bg-white rounded-[8px] shadow-notion-modal max-w-[600px] w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-[32px]">
          <button 
            onClick={onClose}
            className="absolute top-[16px] right-[16px] p-[8px] hover:bg-notion-hover rounded-[4px] transition-colors duration-150"
          >
            <X className="w-[20px] h-[20px] text-notion-text-secondary" />
          </button>

          {/* Header */}
          <div className="flex items-start gap-[20px] mb-[24px]">
            <div 
              className="w-[64px] h-[64px] rounded-[6px] flex items-center justify-center text-[20px] font-semibold text-white flex-shrink-0"
              style={{ backgroundColor: member.avatarColor }}
            >
              {member.initials}
            </div>
            <div>
              <h2 className="text-[24px] font-semibold text-notion-text mb-[4px]">
                {member.name}
              </h2>
              <p className="text-[16px] text-notion-text-secondary">
                {member.role}
              </p>
            </div>
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-3 gap-[12px] mb-[24px]">
            <a 
              href={`mailto:${member.email}`}
              className="flex items-center gap-[8px] p-[12px] border border-notion-border rounded-[6px] hover:bg-notion-hover transition-colors duration-150"
            >
              <Mail className="w-[16px] h-[16px] text-notion-text-secondary" />
              <span className="text-[14px] text-notion-text">Email</span>
            </a>
            <a 
              href={`https://github.com/${member.github.slice(1)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-[8px] p-[12px] border border-notion-border rounded-[6px] hover:bg-notion-hover transition-colors duration-150"
            >
              <Github className="w-[16px] h-[16px] text-notion-text-secondary" />
              <span className="text-[14px] text-notion-text">{member.github}</span>
            </a>
            <div className="flex items-center gap-[8px] p-[12px] border border-notion-border rounded-[6px]">
              <MessageCircle className="w-[16px] h-[16px] text-notion-text-secondary" />
              <span className="text-[14px] text-notion-text">{member.slack}</span>
            </div>
          </div>

          {/* Expertise */}
          <div className="mb-[24px]">
            <h3 className="text-[14px] font-medium text-notion-text-secondary mb-[12px]">
              Expertise
            </h3>
            <div className="flex flex-wrap gap-[8px]">
              {member.expertise.map((skill) => (
                <span key={skill} className="notion-tag">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Capacity */}
          <div className="mb-[24px]">
            <h3 className="text-[14px] font-medium text-notion-text-secondary mb-[12px]">
              Current Capacity
            </h3>
            <div className="flex items-center gap-[12px]">
              <div className="flex-1 h-[8px] bg-notion-border rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-300 ${
                    member.capacity > 0.8 ? 'bg-notion-red' :
                    member.capacity > 0.6 ? 'bg-notion-orange' :
                    'bg-notion-green'
                  }`}
                  style={{ width: `${member.capacity * 100}%` }}
                />
              </div>
              <span className="text-[14px] font-medium text-notion-text">
                {Math.round(member.capacity * 100)}% utilized
              </span>
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <h3 className="text-[14px] font-medium text-notion-text-secondary mb-[12px]">
              Recent Activity
            </h3>
            <div className="grid grid-cols-3 gap-[12px]">
              <div className="p-[16px] bg-notion-sidebar rounded-[6px] text-center">
                <div className="text-[24px] font-bold text-notion-text">
                  {member.recentActivity.commits}
                </div>
                <div className="text-[12px] text-notion-text-secondary">Commits</div>
              </div>
              <div className="p-[16px] bg-notion-sidebar rounded-[6px] text-center">
                <div className="text-[24px] font-bold text-notion-text">
                  {member.recentActivity.reviews}
                </div>
                <div className="text-[12px] text-notion-text-secondary">Reviews</div>
              </div>
              <div className="p-[16px] bg-notion-sidebar rounded-[6px] text-center">
                <div className="text-[24px] font-bold text-notion-text">
                  {member.recentActivity.prsOpened}
                </div>
                <div className="text-[12px] text-notion-text-secondary">PRs Opened</div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const Team = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExpertise, setSelectedExpertise] = useState<string[]>([]);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  // Get all unique expertise tags
  const allExpertise = Array.from(
    new Set(teamMembers.flatMap(m => m.expertise))
  ).sort();

  // Filter team members
  const filteredMembers = teamMembers.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.role.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesExpertise = selectedExpertise.length === 0 ||
      selectedExpertise.some(skill => member.expertise.includes(skill));
    
    return matchesSearch && matchesExpertise;
  });

  // Team stats
  const teamStats = {
    totalMembers: teamMembers.length,
    averageVelocity: 42,
    activeTasks: 24,
    expertiseCoverage: 94,
  };

  const toggleExpertise = (skill: string) => {
    setSelectedExpertise(prev => 
      prev.includes(skill)
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  return (
    <div className="px-notion-massive py-notion-xxl">
      {/* Page Header */}
      <div className="mb-[32px]">
        <h1 className="notion-title mb-[4px]">Team</h1>
        <p className="text-[16px] text-notion-text-secondary">
          View team members, expertise, and current capacity
        </p>
      </div>

      {/* Team Stats */}
      <div className="grid grid-cols-4 gap-[12px] mb-notion-xxl">
        <div className="notion-card p-[16px]">
          <div className="text-[13px] text-notion-text-secondary mb-[8px]">Total Members</div>
          <div className="text-[32px] font-bold text-notion-text">{teamStats.totalMembers}</div>
        </div>
        <div className="notion-card p-[16px]">
          <div className="text-[13px] text-notion-text-secondary mb-[8px]">Avg Velocity</div>
          <div className="text-[32px] font-bold text-notion-text">{teamStats.averageVelocity}</div>
          <div className="text-[12px] text-notion-text-secondary">points/sprint</div>
        </div>
        <div className="notion-card p-[16px]">
          <div className="text-[13px] text-notion-text-secondary mb-[8px]">Active Tasks</div>
          <div className="text-[32px] font-bold text-notion-text">{teamStats.activeTasks}</div>
        </div>
        <div className="notion-card p-[16px]">
          <div className="text-[13px] text-notion-text-secondary mb-[8px]">Expertise Coverage</div>
          <div className="text-[32px] font-bold text-notion-text">{teamStats.expertiseCoverage}%</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-[12px] mb-[24px]">
        <div className="relative flex-1 max-w-[300px]">
          <Search className="absolute left-[12px] top-1/2 -translate-y-1/2 w-[16px] h-[16px] text-notion-text-secondary" />
          <input
            type="text"
            placeholder="Search by name or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="notion-input w-full pl-[36px]"
          />
        </div>
        <div className="flex items-center gap-[8px]">
          <Filter className="w-[16px] h-[16px] text-notion-text-secondary" />
          <div className="flex flex-wrap gap-[4px]">
            {allExpertise.slice(0, 8).map((skill) => (
              <button
                key={skill}
                onClick={() => toggleExpertise(skill)}
                className={`px-[8px] py-[4px] rounded-[3px] text-[12px] border transition-colors duration-150 ${
                  selectedExpertise.includes(skill)
                    ? 'bg-notion-blue text-white border-notion-blue'
                    : 'bg-notion-sidebar text-notion-text border-notion-border hover:bg-notion-hover'
                }`}
              >
                {skill}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Team Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[16px]">
        {filteredMembers.map((member) => (
          <motion.div
            key={member.id}
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="notion-card p-[20px] cursor-pointer"
            onClick={() => setSelectedMember(member)}
          >
            <div 
              className="w-[64px] h-[64px] rounded-[6px] flex items-center justify-center text-[20px] font-semibold text-white mb-[12px]"
              style={{ backgroundColor: member.avatarColor }}
            >
              {member.initials}
            </div>
            
            <h3 className="text-[16px] font-medium text-notion-text mb-[4px]">
              {member.name}
            </h3>
            <p className="text-[14px] text-notion-text-secondary mb-[12px]">
              {member.role}
            </p>

            <div className="flex flex-wrap gap-[4px] mb-[16px]">
              {member.expertise.slice(0, 5).map((skill) => (
                <span key={skill} className="notion-tag">
                  {skill}
                </span>
              ))}
              {member.expertise.length > 5 && (
                <span className="notion-tag">
                  +{member.expertise.length - 5} more
                </span>
              )}
            </div>

            <div>
              <div className="flex justify-between text-[12px] text-notion-text-secondary mb-[6px]">
                <span>Current Capacity</span>
                <span className={`font-medium ${
                  member.capacity > 0.8 ? 'text-notion-red' :
                  member.capacity > 0.6 ? 'text-notion-orange' :
                  'text-notion-green'
                }`}>
                  {Math.round(member.capacity * 100)}%
                </span>
              </div>
              <div className="h-[6px] bg-notion-border rounded-[3px] overflow-hidden">
                <div 
                  className={`h-full rounded-[3px] transition-all duration-300 ${
                    member.capacity > 0.8 ? 'bg-notion-red' :
                    member.capacity > 0.6 ? 'bg-notion-orange' :
                    'bg-notion-green'
                  }`}
                  style={{ width: `${member.capacity * 100}%` }}
                />
              </div>
            </div>

            <button className="w-full notion-btn-secondary mt-[16px]">
              View Profile
            </button>
          </motion.div>
        ))}
      </div>

      {filteredMembers.length === 0 && (
        <div className="text-center py-[48px]">
          <p className="text-[16px] text-notion-text-secondary">
            No team members match your search criteria
          </p>
        </div>
      )}

      {/* Member Modal */}
      <AnimatePresence>
        {selectedMember && (
          <TeamMemberModal
            member={selectedMember}
            onClose={() => setSelectedMember(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Team;
