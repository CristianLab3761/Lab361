'use client';

import * as React from 'react';
import { Bot } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Solicitud, AIAnalysis } from '@/lib/types';
import { cn } from '@/lib/utils';

interface SummaryDisplayProps {
  summary: AIAnalysis | undefined;
}

export function SummaryDisplay({ summary }: SummaryDisplayProps) {
  if (!summary) return null;
  
  return (
    <Card className="mt-8 border-slate-200 shadow-mango bg-white overflow-hidden relative group">
      <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-all duration-1000">
        <Bot className="h-32 w-32 text-slate-400 rotate-12" />
      </div>
      <CardHeader className="flex-row items-center gap-6 space-y-0 pb-5 relative z-10 border-b border-slate-50">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-white shadow-mango">
          <Bot className="h-7 w-7 animate-pulse" />
        </div>
        <div>
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-900">Neural Intelligence Core</CardTitle>
          <CardDescription className="text-slate-600 font-bold leading-relaxed max-w-3xl mt-1.5">{summary.summary}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="relative z-10 pt-8">
        <div className="grid sm:grid-cols-2 gap-5">
          {summary.keyPoints.map((point: string, i: number) => (
            <div 
              key={i} 
              className={cn(
                "flex items-start gap-4 p-5 rounded-2xl border transition-all duration-500",
                summary.anomaliesDetected && point.includes('significativamente') 
                  ? 'bg-red-50 border-red-100 text-red-700' 
                  : 'bg-slate-50/50 border-slate-100 text-slate-700 hover:bg-white hover:border-primary/20 hover:shadow-sm'
              )}
            >
              <div className={cn(
                "mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full",
                summary.anomaliesDetected && point.includes('significativamente') ? 'bg-red-500 shadow-sm' : 'bg-accent shadow-sm'
              )} />
              <p className="text-[11px] font-bold leading-normal uppercase tracking-tight opacity-80">{point}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
