import { useState } from 'react';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { addTeamMember } from '@/services/team';

interface AddMemberModalProps {
  open: boolean;
  onClose: () => void;
}

const roles = ['Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'DevOps Engineer', 'QA Engineer', 'Designer', 'Product Manager'];
const expertiseOptions = ['React', 'TypeScript', 'Python', 'Node.js', 'Go', 'AWS', 'Docker', 'Kubernetes', 'PostgreSQL', 'MongoDB', 'GraphQL', 'CSS', 'Tailwind', 'Next.js', 'Jest', 'Cypress'];

const AddMemberModal = ({ open, onClose }: AddMemberModalProps) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [github, setGithub] = useState('');
  const [slack, setSlack] = useState('');
  const [selectedExpertise, setSelectedExpertise] = useState<string[]>([]);

  const toggleExpertise = (skill: string) => {
    setSelectedExpertise(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const handleSubmit = async () => {
    if (!name.trim() || !email.trim()) {
      toast.error('Please fill in name and email');
      return;
    }
    await addTeamMember({ name, email, role, github, slack, expertise: selectedExpertise });
    toast.success(`${name} added to the team!`);
    setName('');
    setEmail('');
    setRole('');
    setGithub('');
    setSlack('');
    setSelectedExpertise([]);
    onClose();
  };

  if (!open) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="relative bg-card rounded-3xl shadow-2xl w-full max-w-[560px] max-h-[90vh] overflow-y-auto"
      >
        <div className="p-8">
          <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-secondary rounded-xl transition-colors">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>

          <h2 className="text-2xl font-bold text-foreground mb-6">Add Team Member</h2>

          <div className="grid grid-cols-2 gap-4 mb-5">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Full Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" className="airbnb-input w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane@company.com" className="airbnb-input w-full" />
            </div>
          </div>

          <div className="mb-5">
            <label className="block text-sm font-medium text-muted-foreground mb-2">Role</label>
            <div className="flex flex-wrap gap-2">
              {roles.map((r) => (
                <button key={r} onClick={() => setRole(r)} className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${role === r ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-foreground border-border hover:bg-secondary'}`}>{r}</button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-5">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">GitHub</label>
              <input type="text" value={github} onChange={(e) => setGithub(e.target.value)} placeholder="@username" className="airbnb-input w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Slack</label>
              <input type="text" value={slack} onChange={(e) => setSlack(e.target.value)} placeholder="@username" className="airbnb-input w-full" />
            </div>
          </div>

          <div className="mb-8">
            <label className="block text-sm font-medium text-muted-foreground mb-2">Expertise</label>
            <div className="flex flex-wrap gap-2">
              {expertiseOptions.map((skill) => (
                <button key={skill} onClick={() => toggleExpertise(skill)} className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${selectedExpertise.includes(skill) ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-foreground border-border hover:bg-secondary'}`}>{skill}</button>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 airbnb-btn-secondary rounded-full py-3">Cancel</button>
            <button onClick={handleSubmit} className="flex-1 airbnb-btn-pill py-3">Add Member</button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AddMemberModal;
