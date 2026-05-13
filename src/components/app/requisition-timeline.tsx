'use client';

import React from 'react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  PlusCircle, 
  CheckCircle2, 
  XCircle, 
  FileEdit, 
  ShoppingCart, 
  Info,
  Clock,
  User as UserIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TimelineEvent {
  id: string;
  date: string;
  event: string;
  user: string;
  description: string;
  type: 'creation' | 'update' | 'approval' | 'rejection' | 'po_generated' | 'system';
}

interface RequisitionTimelineProps {
  events: TimelineEvent[];
  className?: string;
}

const getIcon = (type: TimelineEvent['type']) => {
  switch (type) {
    case 'creation': return <PlusCircle className="h-4 w-4" />;
    case 'approval': return <CheckCircle2 className="h-4 w-4" />;
    case 'rejection': return <XCircle className="h-4 w-4" />;
    case 'update': return <FileEdit className="h-4 w-4" />;
    case 'po_generated': return <ShoppingCart className="h-4 w-4" />;
    default: return <Info className="h-4 w-4" />;
  }
};

const getTypeStyles = (type: TimelineEvent['type']) => {
  switch (type) {
    case 'creation': return 'bg-blue-50 text-blue-600 border-blue-100';
    case 'approval': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
    case 'rejection': return 'bg-red-50 text-red-600 border-red-100';
    case 'update': return 'bg-amber-50 text-amber-600 border-amber-100';
    case 'po_generated': return 'bg-purple-50 text-purple-600 border-purple-100';
    default: return 'bg-slate-50 text-slate-600 border-slate-100';
  }
};

export function RequisitionTimeline({ events, className }: RequisitionTimelineProps) {
  if (!events || events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-slate-400 space-y-2">
        <Clock className="h-8 w-8 opacity-20" />
        <p className="text-[10px] font-black uppercase tracking-widest">Sin historial registrado</p>
      </div>
    );
  }

  // Sort events by date descending
  const sortedEvents = [...events].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className={cn("space-y-6 relative before:absolute before:inset-y-0 before:left-[19px] before:w-px before:bg-slate-100", className)}>
      {sortedEvents.map((event, idx) => (
        <div key={event.id} className="relative pl-10 group">
          {/* Dot/Icon */}
          <div className={cn(
            "absolute left-0 top-0 h-10 w-10 rounded-xl border flex items-center justify-center z-10 transition-all shadow-sm group-hover:scale-110",
            getTypeStyles(event.type)
          )}>
            {getIcon(event.type)}
          </div>

          <div className="space-y-1 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">
                {event.event}
              </span>
              <span className="text-[9px] font-bold text-slate-400">
                {format(parseISO(event.date), "d 'de' MMM, HH:mm", { locale: es })}
              </span>
            </div>
            
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              {event.description}
            </p>

            <div className="flex items-center gap-1.5 pt-1">
              <div className="h-4 w-4 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
                <UserIcon className="h-2.5 w-2.5 text-slate-400" />
              </div>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">
                {event.user}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
