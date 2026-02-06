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
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="relative bg-card rounded-3xl shadow-2xl max-w-[600px] w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-8">
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 hover:bg-secondary rounded-xl transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>

          {/* Header */}
          <div className="flex items-start gap-5 mb-8">
            <div 
              className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-semibold text-white flex-shrink-0"
              style={{ backgroundColor: member.avatarColor }}
            >
              {member.initials}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-1">
                {member.name}
              </h2>
              <p className="text-base text-muted-foreground">
                {member.role}
              </p>
            </div>
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            <a 
              href={`mailto:${member.email}`}
              className="flex items-center gap-2 p-4 border border-border rounded-xl hover:bg-secondary transition-colors"
            >
              <Mail className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-foreground">Email</span>
            </a>
            <a 
              href={`https://github.com/${member.github.slice(1)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 p-4 border border-border rounded-xl hover:bg-secondary transition-colors"
            >
              <Github className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-foreground">{member.github}</span>
            </a>
            <div className="flex items-center gap-2 p-4 border border-border rounded-xl">
              <MessageCircle className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-foreground">{member.slack}</span>
            </div>
          </div>

          {/* Expertise */}
          <div className="mb-8">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">
              Expertise
            </h3>
            <div className="flex flex-wrap gap-2">
              {member.expertise.map((skill) => (
                <span key={skill} className="airbnb-tag">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Capacity */}
          <div className="mb-8">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">
              Current Capacity
            </h3>
            <div className="flex items-center gap-4">
              <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-300 ${
                    member.capacity > 0.8 ? 'bg-destructive' :
                    member.capacity > 0.6 ? 'bg-orange-500' :
                    'bg-airbnb-success'
                  }`}
                  style={{ width: `${member.capacity * 100}%` }}
                />
              </div>
              <span className="text-sm font-medium text-foreground">
                {Math.round(member.capacity * 100)}% utilized
              </span>
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">
              Recent Activity
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="p-5 bg-secondary rounded-2xl text-center">
                <div className="text-2xl font-bold text-foreground">
                  {member.recentActivity.commits}
                </div>
                <div className="text-xs text-muted-foreground">Commits</div>
              </div>
              <div className="p-5 bg-secondary rounded-2xl text-center">
                <div className="text-2xl font-bold text-foreground">
                  {member.recentActivity.reviews}
                </div>
                <div className="text-xs text-muted-foreground">Reviews</div>
              </div>
              <div className="p-5 bg-secondary rounded-2xl text-center">
                <div className="text-2xl font-bold text-foreground">
                  {member.recentActivity.prsOpened}
                </div>
                <div className="text-xs text-muted-foreground">PRs Opened</div>
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
    <div className="px-12 py-10">
      {/* Page Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-foreground mb-2">Team</h1>
        <p className="text-base text-muted-foreground">
          View team members, expertise, and current capacity
        </p>
      </div>

      {/* Team Stats */}
      <div className="grid grid-cols-4 gap-4 mb-10">
        <div className="airbnb-card-static p-5">
          <div className="text-sm text-muted-foreground mb-2">Total Members</div>
          <div className="text-3xl font-bold text-foreground">{teamStats.totalMembers}</div>
        </div>
        <div className="airbnb-card-static p-5">
          <div className="text-sm text-muted-foreground mb-2">Avg Velocity</div>
          <div className="text-3xl font-bold text-foreground">{teamStats.averageVelocity}</div>
          <div className="text-xs text-muted-foreground">points/sprint</div>
        </div>
        <div className="airbnb-card-static p-5">
          <div className="text-sm text-muted-foreground mb-2">Active Tasks</div>
          <div className="text-3xl font-bold text-foreground">{teamStats.activeTasks}</div>
        </div>
        <div className="airbnb-card-static p-5">
          <div className="text-sm text-muted-foreground mb-2">Expertise Coverage</div>
          <div className="text-3xl font-bold text-foreground">{teamStats.expertiseCoverage}%</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-8">
        <div className="relative flex-1 max-w-[320px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="airbnb-input w-full pl-11"
          />
        </div>
        <div className="flex items-center gap-3">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <div className="flex flex-wrap gap-2">
            {allExpertise.slice(0, 8).map((skill) => (
              <button
                key={skill}
                onClick={() => toggleExpertise(skill)}
                className={`px-4 py-2 rounded-full text-xs font-medium border transition-all ${
                  selectedExpertise.includes(skill)
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-card text-foreground border-border hover:bg-secondary'
                }`}
              >
                {skill}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Team Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredMembers.map((member) => (
          <motion.div
            key={member.id}
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="airbnb-card p-6 cursor-pointer"
            onClick={() => setSelectedMember(member)}
          >
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-semibold text-white mb-4"
              style={{ backgroundColor: member.avatarColor }}
            >
              {member.initials}
            </div>
            
            <h3 className="text-base font-semibold text-foreground mb-1">
              {member.name}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {member.role}
            </p>

            <div className="flex flex-wrap gap-1.5 mb-5">
              {member.expertise.slice(0, 5).map((skill) => (
                <span key={skill} className="airbnb-tag text-[11px]">
                  {skill}
                </span>
              ))}
              {member.expertise.length > 5 && (
                <span className="airbnb-tag text-[11px]">
                  +{member.expertise.length - 5} more
                </span>
              )}
            </div>

            <div>
              <div className="flex justify-between text-xs text-muted-foreground mb-2">
                <span>Current Capacity</span>
                <span className={`font-medium ${
                  member.capacity > 0.8 ? 'text-destructive' :
                  member.capacity > 0.6 ? 'text-orange-500' :
                  'text-airbnb-success'
                }`}>
                  {Math.round(member.capacity * 100)}%
                </span>
              </div>
              <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-300 ${
                    member.capacity > 0.8 ? 'bg-destructive' :
                    member.capacity > 0.6 ? 'bg-orange-500' :
                    'bg-airbnb-success'
                  }`}
                  style={{ width: `${member.capacity * 100}%` }}
                />
              </div>
            </div>

            <button className="w-full airbnb-btn-secondary mt-5 rounded-full py-2.5">
              View Profile
            </button>
          </motion.div>
        ))}
      </div>

      {filteredMembers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-base text-muted-foreground">
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
