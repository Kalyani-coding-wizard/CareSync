'use client';

import React, { useState } from 'react';
import { useProfile, Appointment } from '@/contexts/ProfileContext';
import {
  Calendar,
  Clock,
  MapPin,
  Plus,
  Trash2,
  MailCheck,
  FileText,
  User,
  ArrowUpRight,
  X,
  Sparkles,
} from 'lucide-react';

export default function AppointmentsPage() {
  const { appointments, addAppointment, deleteAppointment, activeProfile } = useProfile();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [nowMs, setNowMs] = useState(0);

  React.useEffect(() => {
    setNowMs(Date.now());
  }, []);

  // Form states
  const [doctorName, setDoctorName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('10:00');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctorName || !date) return;

    const combinedDateTime = new Date(`${date}T${time}:00`).toISOString();

    await addAppointment({
      doctorName: doctorName.startsWith('Dr.') ? doctorName : `Dr. ${doctorName}`,
      specialty: specialty || 'General Healthcare Follow-up',
      dateTime: combinedDateTime,
      location: location || 'Clinic / Telehealth',
      notes: notes || 'Routine visit.',
    });

    setIsAddOpen(false);
    // Reset
    setDoctorName('');
    setSpecialty('');
    setDate('');
    setLocation('');
    setNotes('');
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <Calendar className="w-8 h-8 text-blue-600" />
            Medical Appointments
          </h1>
          <p className="text-slate-600 text-lg mt-1">
            Upcoming doctor consultations &amp; proactive email notification schedules for {activeProfile?.name}.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold px-5 py-3 rounded-2xl shadow-md shadow-blue-600/20 flex items-center gap-2 text-base transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-5 h-5" />
          <span>Schedule Appointment</span>
        </button>
      </div>

      {/* Proactive Notification Banner (Slide 13 requirement) */}
      <div className="bg-blue-50/80 border border-blue-200 rounded-3xl p-5 flex items-start gap-4">
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white flex-shrink-0 mt-0.5">
          <MailCheck className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-base font-bold text-blue-950">Automated Multi-Channel Email Reminders Active</h3>
          <p className="text-sm text-blue-800 mt-0.5 leading-relaxed">
            CareSync automatically dispatches reminder emails to the patient, registered caretakers, and family members <strong>24 hours prior</strong> and <strong>1 hour before</strong> each appointment with directions &amp; questions list.
          </p>
        </div>
      </div>

      {/* Appointments List */}
      <div className="space-y-4">
        {appointments.map((appt) => {
          const apptDate = new Date(appt.dateTime);
          const isUpcoming = nowMs > 0 ? apptDate.getTime() > nowMs : true;

          return (
            <div
              key={appt.id}
              className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-slate-200 shadow-xs hover:border-blue-400 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="flex items-start gap-5">
                {/* Date Badge */}
                <div className="bg-slate-100 border border-slate-200 rounded-2xl p-3.5 text-center min-w-[85px] flex-shrink-0">
                  <div className="text-xs uppercase font-extrabold text-blue-600">
                    {apptDate.toLocaleDateString('en-US', { month: 'short' })}
                  </div>
                  <div className="text-3xl font-black text-slate-900 leading-tight">
                    {apptDate.getDate()}
                  </div>
                  <div className="text-xs font-semibold text-slate-500">
                    {apptDate.toLocaleDateString('en-US', { weekday: 'short' })}
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-2xl font-black text-slate-900">{appt.doctorName}</h3>
                    <span className="text-xs bg-blue-100 text-blue-800 font-bold px-2.5 py-0.5 rounded-full">
                      {appt.specialty}
                    </span>
                    {isUpcoming && (
                      <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <MailCheck className="w-3.5 h-3.5" />
                        Email Alert Active
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 font-medium">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-blue-600" />
                      {apptDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-rose-500" />
                      {appt.location}
                    </span>
                  </div>

                  {appt.notes && (
                    <div className="flex items-start gap-1.5 text-sm text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100 mt-2">
                      <FileText className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                      <span>{appt.notes}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 self-end md:self-center">
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(appt.location)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2.5 rounded-xl text-sm flex items-center gap-1.5 transition-colors"
                >
                  <span>Map</span>
                  <ArrowUpRight className="w-4 h-4" />
                </a>

                <button
                  type="button"
                  onClick={() => deleteAppointment(appt.id)}
                  className="p-2.5 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-colors"
                  title="Cancel appointment"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          );
        })}

        {appointments.length === 0 && (
          <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-300">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-xl font-bold text-slate-700">No Doctor Appointments Scheduled</h3>
            <p className="text-slate-500 mt-1 mb-4">Keep your care circle informed by logging your next clinic visit.</p>
            <button
              onClick={() => setIsAddOpen(true)}
              className="bg-blue-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-blue-700"
            >
              + Schedule Appointment
            </button>
          </div>
        )}
      </div>

      {/* Add Appointment Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                <Calendar className="w-6 h-6 text-blue-600" />
                Schedule Medical Visit
              </h2>
              <button onClick={() => setIsAddOpen(false)} className="p-2 text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Doctor / Clinic Name</label>
                <input
                  type="text"
                  required
                  value={doctorName}
                  onChange={(e) => setDoctorName(e.target.value)}
                  placeholder="e.g. Dr. Sarah Jenkins"
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 text-lg font-medium focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Specialty / Visit Purpose</label>
                <input
                  type="text"
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  placeholder="e.g. Cardiology, Eye Exam, Geriatric Checkup"
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Time</label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Location / Clinic Address</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. 1200 Healthcare Blvd, Suite 300"
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 font-medium"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Notes / Instructions</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Fast 8 hours prior for blood tests, bring medication list"
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 font-medium"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3.5 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-md shadow-blue-500/20"
                >
                  Confirm &amp; Set Email Alert
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
