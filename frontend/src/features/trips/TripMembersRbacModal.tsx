import { useState } from 'react'
import { Check, Copy, Crown, KeyRound, Shield, Trash2, UserPlus, X } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'

export type TravelerRole = 'admin' | 'manager' | 'companion' | 'viewer'

interface TravelerMember {
  id: string
  name: string
  email: string
  role: TravelerRole
  avatar: string
}

const INITIAL_MEMBERS: TravelerMember[] = [
  {
    id: 'm-1',
    name: 'Aarav Mehta',
    email: 'aarav@tripwise.demo',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
  },
  {
    id: 'm-2',
    name: 'Rohan Sharma',
    email: 'rohan.s@example.com',
    role: 'manager',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
  },
  {
    id: 'm-3',
    name: 'Pooja Iyer',
    email: 'pooja.i@example.com',
    role: 'companion',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
  },
]

export function TripMembersRbacModal({
  open,
  onClose,
  tripName,
}: {
  open: boolean
  onClose: () => void
  tripName: string
}) {
  const [members, setMembers] = useState<TravelerMember[]>(INITIAL_MEMBERS)
  const [newName, setNewName] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newRole, setNewRole] = useState<TravelerRole>('companion')
  const [copied, setCopied] = useState(false)

  if (!open) return null

  function handleAddMember() {
    if (!newName.trim() || !newEmail.trim()) return
    const member: TravelerMember = {
      id: `m-${Date.now()}`,
      name: newName.trim(),
      email: newEmail.trim(),
      role: newRole,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    }
    setMembers((prev) => [...prev, member])
    setNewName('')
    setNewEmail('')
  }

  function handleRoleChange(id: string, role: TravelerRole) {
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, role } : m)))
  }

  function handleRemoveMember(id: string) {
    setMembers((prev) => prev.filter((m) => m.id !== id))
  }

  function copyInviteCode() {
    navigator.clipboard?.writeText('GT-TRIP-7492')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <Card className="w-full max-w-xl p-6 rounded-3xl bg-white shadow-2xl border border-slate-200 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="size-10 rounded-2xl bg-indigo-50 text-[#4F46E5] flex items-center justify-center">
              <Shield size={20} />
            </div>
            <div>
              <h3 className="font-display text-xl font-bold text-slate-900">Trip Roles & Collaboration</h3>
              <p className="text-xs text-slate-500">RBAC permissions for {tripName}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <X size={20} />
          </button>
        </div>

        {/* Invite Code Quick Share Box */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <KeyRound size={16} className="text-[#4F46E5]" />
            <div>
              <p className="text-[11px] font-bold text-slate-800">Trip Team Passcode: <span className="font-mono text-indigo-600">GT-TRIP-7492</span></p>
              <p className="text-[10px] text-slate-400">Share with co-travelers to join via app</p>
            </div>
          </div>
          <Button size="sm" variant="secondary" onClick={copyInviteCode} className="text-xs rounded-full">
            {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
            {copied ? 'Copied' : 'Copy'}
          </Button>
        </div>

        {/* Member List */}
        <div className="space-y-2.5 max-h-56 overflow-y-auto">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Travel Crew ({members.length})</p>
          {members.map((m) => (
            <div key={m.id} className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 bg-white hover:bg-slate-50/50 transition-all">
              <div className="flex items-center gap-2.5">
                <img src={m.avatar} alt={m.name} className="size-8 rounded-full object-cover" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    {m.name}
                    {m.role === 'admin' && <Crown size={12} className="text-amber-500" />}
                  </h4>
                  <p className="text-[10px] text-slate-400">{m.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={m.role}
                  disabled={m.role === 'admin'}
                  onChange={(e) => handleRoleChange(m.id, e.target.value as TravelerRole)}
                  className="text-[11px] font-semibold bg-slate-100 border border-slate-200 rounded-lg px-2 py-1 text-slate-700 disabled:opacity-50"
                >
                  <option value="admin">👑 Trip Admin</option>
                  <option value="manager">🛠️ Co-Organizer</option>
                  <option value="companion">🎒 Companion</option>
                  <option value="viewer">👁️ Read-Only</option>
                </select>

                {m.role !== 'admin' && (
                  <button
                    type="button"
                    onClick={() => handleRemoveMember(m.id)}
                    className="p-1 text-slate-400 hover:text-red-500 rounded"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Add Member Form */}
        <div className="border-t border-slate-100 pt-4 space-y-3">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Invite New Traveler</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <input
              type="text"
              placeholder="Name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <input
              type="email"
              placeholder="Email address"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value as TravelerRole)}
              className="px-2 py-1.5 text-xs rounded-xl border border-slate-200 bg-white"
            >
              <option value="manager">🛠️ Co-Organizer</option>
              <option value="companion">🎒 Companion</option>
              <option value="viewer">👁️ Read-Only</option>
            </select>
          </div>
          <Button size="sm" onClick={handleAddMember} icon={<UserPlus size={14} />} className="w-full rounded-full text-xs">
            Send Trip Invitation & Assign Role
          </Button>
        </div>
      </Card>
    </div>
  )
}
