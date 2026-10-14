import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, ChevronLeft, ChevronRight, 
  Clock, DollarSign, User, Plus, CheckCircle2
} from 'lucide-react';
import { Task, Deal, Lead } from '../../types';

interface CalendarViewProps {
  tasks: Task[];
  deals: Deal[];
  leads: Lead[];
  onOpenNewTask: () => void;
  onOpenNewDeal: () => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  tasks,
  deals,
  leads,
  onOpenNewTask,
  onOpenNewDeal
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const getEventsForDay = (day: number) => {
    const formattedMonth = String(month + 1).padStart(2, '0');
    const formattedDay = String(day).padStart(2, '0');
    const dateStr = `${year}-${formattedMonth}-${formattedDay}`;

    const safeTasks = Array.isArray(tasks) ? tasks : [];
    const safeDeals = Array.isArray(deals) ? deals : [];
    const dayTasks = safeTasks.filter(t => t.dueDate === dateStr);
    const dayDeals = safeDeals.filter(d => d.expectedCloseDate === dateStr);

    return { tasks: dayTasks, deals: dayDeals };
  };

  return (
    <div id="sales-calendar-view" className="space-y-5 animate-in fade-in duration-150">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">Sales Calendar & Deadlines</h1>
            <span className="text-xs bg-indigo-500/20 text-indigo-300 font-semibold px-2 py-0.5 rounded-full border border-indigo-500/30">
              {monthNames[month]} {year}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Track daily follow-ups, scheduled client meetings, and projected deal closing dates.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-800 border border-slate-700 rounded-xl p-1 text-xs">
            <button
              onClick={prevMonth}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 font-bold text-slate-200">
              {monthNames[month]} {year}
            </span>
            <button
              onClick={nextMonth}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={onOpenNewTask}
            className="px-3.5 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Event</span>
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm overflow-hidden">
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-2">
          {days.map((day, idx) => {
            if (!day) {
              return (
                <div
                  key={`empty-${idx}`}
                  className="min-h-[100px] bg-slate-950/40 border border-slate-850 rounded-xl p-2 opacity-30"
                />
              );
            }

            const { tasks: dayTasks, deals: dayDeals } = getEventsForDay(day);
            const isToday = 
              new Date().getDate() === day &&
              new Date().getMonth() === month &&
              new Date().getFullYear() === year;

            return (
              <div
                key={`day-${day}`}
                className={`min-h-[105px] bg-slate-850/70 border rounded-xl p-2 text-xs flex flex-col justify-between transition-colors hover:border-slate-700 ${
                  isToday ? 'border-indigo-500/80 bg-indigo-950/20' : 'border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[11px] ${
                    isToday ? 'bg-indigo-600 text-white' : 'text-slate-300'
                  }`}>
                    {day}
                  </span>
                  {(dayTasks.length > 0 || dayDeals.length > 0) && (
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                  )}
                </div>

                <div className="space-y-1 my-1 overflow-y-auto max-h-[80px]">
                  {dayTasks.map(t => (
                    <div
                      key={t._id}
                      className="p-1 rounded bg-orange-950/40 border border-orange-800/60 text-[10px] text-orange-200 truncate flex items-center gap-1"
                      title={`${t.title} (${t.dueTime || ''})`}
                    >
                      <Clock className="w-2.5 h-2.5 text-orange-400 shrink-0" />
                      <span className="truncate">{t.title}</span>
                    </div>
                  ))}

                  {dayDeals.map(d => (
                    <div
                      key={d._id}
                      className="p-1 rounded bg-purple-950/40 border border-purple-800/60 text-[10px] text-purple-200 truncate flex items-center gap-1"
                      title={`Close Deal: ${d.title} (₹${d.value.toLocaleString('en-IN')})`}
                    >
                      <DollarSign className="w-2.5 h-2.5 text-purple-400 shrink-0" />
                      <span className="truncate">₹{(d.value / 1000).toFixed(0)}k • {d.title}</span>
                    </div>
                  ))}
                </div>

                <div className="text-[9px] text-slate-500 text-right">
                  {dayTasks.length + dayDeals.length > 0 && `${dayTasks.length + dayDeals.length} items`}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
