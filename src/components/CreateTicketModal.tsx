import { useState } from 'react';
import { X, ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { type TeamMember } from '@/data/mockData';
import { toast } from 'sonner';
import { useTeamMembers } from '@/hooks/useTeamData';
import { createTicket } from '@/services/tickets';

interface CreateTicketModalProps {
  open: boolean;
  onClose: () => void;
}

const priorities = ['Low', 'Medium', 'High', 'Critical'] as const;
const types = ['Bug', 'Story', 'Task', 'Epic'] as const;
const projects = ['Payment Gateway', 'User Auth', 'Web Frontend', 'Backend Services', 'Notification Service'];

const CreateTicketModal = ({ open, onClose }: CreateTicketModalProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<typeof priorities[number]>('Medium');
  const [type, setType] = useState<typeof types[number]>('Task');
  const [project, setProject] = useState(projects[0]);
  const [assignee, setAssignee] = useState<TeamMember | null>(null);
  const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false);

  const { data: teamMembers } = useTeamMembers();

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error('Please enter a ticket title');
      return;
    }
    await createTicket({
      title,
      description,
      priority,
      type,
      project,
      assigneeId: assignee?.id,
    });
    toast.success(`Ticket created: ${title}`, {
      description: assignee ? `Assigned to ${assignee.name}` : 'Unassigned',
    });
    setTitle('');
    setDescription('');
    setPriority('Medium');
    setType('Task');
    setProject(projects[0]);
    setAssignee(null);
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

          <h2 className="text-2xl font-bold text-foreground mb-6">Create Ticket</h2>

          <div className="mb-5">
            <label className="block text-sm font-medium text-muted-foreground mb-2">Title</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter ticket title..." className="airbnb-input w-full" />
          </div>

          <div className="mb-5">
            <label className="block text-sm font-medium text-muted-foreground mb-2">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the ticket..." rows={3} className="airbnb-input w-full resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-5">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Type</label>
              <div className="flex flex-wrap gap-2">
                {types.map((t) => (
                  <button key={t} onClick={() => setType(t)} className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${type === t ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-foreground border-border hover:bg-secondary'}`}>{t}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Priority</label>
              <div className="flex flex-wrap gap-2">
                {priorities.map((p) => (
                  <button key={p} onClick={() => setPriority(p)} className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${priority === p ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-foreground border-border hover:bg-secondary'}`}>{p}</button>
                ))}
              </div>
            </div>
          </div>

          <div className="mb-5">
            <label className="block text-sm font-medium text-muted-foreground mb-2">Project</label>
            <div className="flex flex-wrap gap-2">
              {projects.map((p) => (
                <button key={p} onClick={() => setProject(p)} className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${project === p ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-foreground border-border hover:bg-secondary'}`}>{p}</button>
              ))}
            </div>
          </div>

          <div className="mb-8 relative">
            <label className="block text-sm font-medium text-muted-foreground mb-2">Assign To</label>
            <button onClick={() => setShowAssigneeDropdown(!showAssigneeDropdown)} className="airbnb-input w-full flex items-center justify-between text-left">
              {assignee ? (
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-medium text-white" style={{ backgroundColor: assignee.avatarColor }}>{assignee.initials}</div>
                  <div>
                    <span className="text-sm text-foreground">{assignee.name}</span>
                    <span className="text-xs text-muted-foreground ml-2">{assignee.role}</span>
                  </div>
                </div>
              ) : (
                <span className="text-sm text-muted-foreground">Select a team member...</span>
              )}
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </button>

            <AnimatePresence>
              {showAssigneeDropdown && (
                <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-2xl shadow-xl z-10 max-h-[240px] overflow-y-auto">
                  {(teamMembers ?? []).map((member) => (
                    <button key={member.id} onClick={() => { setAssignee(member); setShowAssigneeDropdown(false); }} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary transition-colors first:rounded-t-2xl last:rounded-b-2xl">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium text-white flex-shrink-0" style={{ backgroundColor: member.avatarColor }}>{member.initials}</div>
                      <div className="flex-1 text-left">
                        <div className="text-sm font-medium text-foreground">{member.name}</div>
                        <div className="text-xs text-muted-foreground">{member.role} · {Math.round(member.capacity * 100)}% utilized</div>
                      </div>
                      {assignee?.id === member.id && (<Check className="w-4 h-4 text-primary" />)}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 airbnb-btn-secondary rounded-full py-3">Cancel</button>
            <button onClick={handleSubmit} className="flex-1 airbnb-btn-pill py-3">Create Ticket</button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CreateTicketModal;
