import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { CollegeEvent, EventPOItem, OrganizerType } from '../types';
import { X, Plus, Trash2, Calendar, Clock, MapPin, Users, BookOpen } from 'lucide-react';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEventCreated: (event: CollegeEvent) => void;
}

export const CreateEventModal: React.FC<CreateEventModalProps> = ({
  isOpen,
  onClose,
  onEventCreated,
}) => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<CollegeEvent['category']>('Co-Curricular');
  const [organizerType, setOrganizerType] = useState<OrganizerType>(
    user?.organizerType || 'Faculty / Committee'
  );
  const [department, setDepartment] = useState(user?.department || 'First Year Engineering');
  const [facultyCoordinator, setFacultyCoordinator] = useState(
    user?.role === 'organizer' ? user.name : 'Prof. Poonam Sunil Jadhavar'
  );
  const [date, setDate] = useState('2026-10-25');
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('11:00');
  const [venue, setVenue] = useState('Seminar Hall 1, APCOER Campus');
  const [capacity, setCapacity] = useState(60);
  const [description, setDescription] = useState('');
  const [briefDescription, setBriefDescription] = useState('');

  // Objectives bullet list
  const [objectives, setObjectives] = useState<string[]>([
    'To develop all-round personality',
    'To improve communication skills',
    'To build confidence and self-esteem',
    'To develop teamwork and cooperation',
  ]);
  const [newObjective, setNewObjective] = useState('');

  // Outcomes bullet list
  const [outcomes, setOutcomes] = useState<string[]>([
    'Students showed improvement in confidence and self-expression',
    'Communication and interpersonal skills were enhanced',
    'Teamwork and cooperation among students increased',
  ]);
  const [newOutcome, setNewOutcome] = useState('');

  // PO/PEO/PSO Mappings
  const [mappedPO, setMappedPO] = useState<EventPOItem[]>([
    { po: 'PO1 (Knowledge)', peo: 'PEO1', pso: 'PSO1, PSO2' },
    { po: 'PO2 (Problem Analysis)', peo: 'PEO1', pso: 'PSO2' },
    { po: 'PO6 (Teamwork)', peo: 'PEO3', pso: 'PSO3' },
    { po: 'PO7 (Communication)', peo: 'PEO2, PEO3', pso: 'PSO3' },
  ]);

  const [poName, setPoName] = useState('PO3 (Design/Development)');
  const [peoName, setPeoName] = useState('PEO1, PEO3');
  const [psoName, setPsoName] = useState('PSO1, PSO2');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddObjective = () => {
    if (newObjective.trim()) {
      setObjectives([...objectives, newObjective.trim()]);
      setNewObjective('');
    }
  };

  const handleRemoveObjective = (idx: number) => {
    setObjectives(objectives.filter((_, i) => i !== idx));
  };

  const handleAddOutcome = () => {
    if (newOutcome.trim()) {
      setOutcomes([...outcomes, newOutcome.trim()]);
      setNewOutcome('');
    }
  };

  const handleRemoveOutcome = (idx: number) => {
    setOutcomes(outcomes.filter((_, i) => i !== idx));
  };

  const handleAddMapping = () => {
    if (poName.trim()) {
      setMappedPO([...mappedPO, { po: poName.trim(), peo: peoName.trim(), pso: psoName.trim() }]);
    }
  };

  const handleRemoveMapping = (idx: number) => {
    setMappedPO(mappedPO.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const created = await api.createEvent({
        title,
        category,
        organizerType,
        department,
        facultyCoordinator,
        date,
        startTime,
        endTime,
        venue,
        capacity,
        description: description || title,
        briefDescription: briefDescription || description || title,
        objectives,
        outcomes,
        mappedPO,
      });

      onEventCreated(created);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 rounded-t-xl">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Create New Institutional Event (Step 3)
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
              <span>Smart Event Management</span>
              <span aria-hidden="true">·</span>
              <span>NBA / NAAC Compliance Schema</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700">
              {error}
            </div>
          )}

          {/* Section 1: Basic Event Details */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              1. General Event Information
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Event Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Industry 4.0: Machine Learning in Smart Manufacturing"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-500 font-medium"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-900"
                >
                  <option value="Co-Curricular">Co-Curricular</option>
                  <option value="Technical">Technical</option>
                  <option value="Workshop">Workshop</option>
                  <option value="Placement">Placement</option>
                  <option value="Cultural">Cultural</option>
                  <option value="Seminar">Seminar</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Organizer Type
                </label>
                <select
                  value={organizerType}
                  onChange={(e) => setOrganizerType(e.target.value as OrganizerType)}
                  className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-900"
                >
                  <option value="Student Club / Society">Student Club / Society</option>
                  <option value="Department">Department</option>
                  <option value="Faculty / Committee">Faculty / Committee</option>
                  <option value="Placement Cell">Placement Cell</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Department
                </label>
                <input
                  type="text"
                  required
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g. Computer Engineering"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Faculty Coordinator Name *
                </label>
                <input
                  type="text"
                  required
                  value={facultyCoordinator}
                  onChange={(e) => setFacultyCoordinator(e.target.value)}
                  placeholder="e.g. Prof. Poonam Sunil Jadhavar"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Student Capacity Limit
                </label>
                <div className="relative">
                  <Users className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="number"
                    min="5"
                    max="500"
                    value={capacity}
                    onChange={(e) => setCapacity(Number(e.target.value))}
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 tabular-nums"
                  />
                </div>
              </div>
            </div>

            {/* Schedule & Venue */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Date of Event *
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Start Time *
                </label>
                <div className="relative">
                  <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  End Time *
                </label>
                <div className="relative">
                  <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="time"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Venue / Hall *
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={venue}
                    onChange={(e) => setVenue(e.target.value)}
                    placeholder="Seminar Hall 1"
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Program Description & Objectives (matching ACA/D/021) */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              2. Program Description & Objectives (For Institutional Report ACA/D/021)
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Brief About Event: (Detail Program Description)
              </label>
              <textarea
                rows={3}
                value={briefDescription}
                onChange={(e) => setBriefDescription(e.target.value)}
                placeholder="The event on ... was organized to highlight the importance of ... It included various activities..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900"
              />
            </div>

            {/* Objectives */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Objectives (Bullet Points)
              </label>
              <div className="space-y-2 mb-2">
                {objectives.map((obj, i) => (
                  <div key={i} className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-800">
                    <span className="text-slate-400"></span>
                    <span className="flex-1">{obj}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveObjective(i)}
                      className="text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newObjective}
                  onChange={(e) => setNewObjective(e.target.value)}
                  placeholder="e.g. To improve technical communication and public speaking"
                  className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-900"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddObjective();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddObjective}
                  className="px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>
            </div>

            {/* Outcomes */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Outcome of the Program (Bullet Points)
              </label>
              <div className="space-y-2 mb-2">
                {outcomes.map((out, i) => (
                  <div key={i} className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-800">
                    <span className="text-slate-400"></span>
                    <span className="flex-1">{out}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveOutcome(i)}
                      className="text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newOutcome}
                  onChange={(e) => setNewOutcome(e.target.value)}
                  placeholder="e.g. Students demonstrated mastery in agile software development"
                  className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-900"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddOutcome();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddOutcome}
                  className="px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>
            </div>
          </div>

          {/* Section 3: Mapped CO/PO/PSO Table (Step 3 & Report Format) */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                3. Mapped CO / PO / PSO Matrix
              </h3>
              <span className="text-[11px] text-slate-500">Accreditation Criterion 2 & 3</span>
            </div>

            <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
              <table className="w-full divide-y divide-slate-200">
                <thead className="bg-slate-50 font-bold text-slate-700">
                  <tr>
                    <th className="px-3 py-2 text-left">PO Mapped</th>
                    <th className="px-3 py-2 text-left">PEO Mapped</th>
                    <th className="px-3 py-2 text-left">PSO Mapped</th>
                    <th className="px-2 py-2 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {mappedPO.map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50/50">
                      <td className="px-3 py-2 font-medium text-slate-900">{row.po}</td>
                      <td className="px-3 py-2 text-slate-600">{row.peo}</td>
                      <td className="px-3 py-2 text-slate-600">{row.pso}</td>
                      <td className="px-2 py-2 text-right">
                        <button
                          type="button"
                          onClick={() => handleRemoveMapping(i)}
                          className="text-slate-400 hover:text-rose-600 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Quick add mapping row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 pt-1">
              <input
                type="text"
                value={poName}
                onChange={(e) => setPoName(e.target.value)}
                placeholder="PO e.g. PO8 (Ethics)"
                className="px-2.5 py-1.5 border border-slate-300 rounded text-xs"
              />
              <input
                type="text"
                value={peoName}
                onChange={(e) => setPeoName(e.target.value)}
                placeholder="PEO e.g. PEO3"
                className="px-2.5 py-1.5 border border-slate-300 rounded text-xs"
              />
              <input
                type="text"
                value={psoName}
                onChange={(e) => setPsoName(e.target.value)}
                placeholder="PSO e.g. PSO3"
                className="px-2.5 py-1.5 border border-slate-300 rounded text-xs"
              />
              <button
                type="button"
                onClick={handleAddMapping}
                className="px-3 py-1.5 text-xs font-semibold bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 rounded flex items-center justify-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Mapping
              </button>
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-sm disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Event for Admin Approval (Step 3 → 4)'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
