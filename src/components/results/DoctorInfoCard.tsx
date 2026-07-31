'use client';

import React from 'react';
import { Stethoscope, Calendar, MapPin, User } from 'lucide-react';
import { DoctorInfo, PatientInfo } from '@/types/prescription';

interface DoctorInfoCardProps {
  doctorInfo: DoctorInfo;
  patientInfo: PatientInfo;
}

export default function DoctorInfoCard({ doctorInfo, patientInfo }: DoctorInfoCardProps) {
  return (
    <div className="w-full glass-panel rounded-2xl p-4 sm:p-5 border border-chestnut-600/20 dark:border-gray-800/80 bg-surface-100/60 backdrop-blur-xl shadow-xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Doctor Details */}
        <div className="flex items-start gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-brand-teal/15 border border-brand-teal/30 flex items-center justify-center text-brand-teal shrink-0">
            <Stethoscope className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <h4 className="text-[10px] uppercase tracking-wider font-bold text-brand-teal">Prescribing Doctor</h4>
            <p className="text-sm sm:text-base font-extrabold text-foreground leading-tight">
              {doctorInfo.name || 'Prescription Doctor'}
            </p>
            {doctorInfo.specialization && (
              <p className="text-xs text-foreground/80 font-medium">
                {doctorInfo.specialization}
              </p>
            )}
            {doctorInfo.chamber && (
              <p className="text-xs text-foreground/60 flex items-center gap-1 pt-0.5">
                <MapPin className="w-3.5 h-3.5 text-brand-teal shrink-0" />
                <span>{doctorInfo.chamber}</span>
              </p>
            )}
            {doctorInfo.date && (
              <p className="text-xs text-foreground/60 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-brand-teal shrink-0" />
                <span>Date: {doctorInfo.date}</span>
              </p>
            )}
          </div>
        </div>

        {/* Patient Details */}
        <div className="flex items-start gap-3.5 border-t md:border-t-0 md:border-l border-chestnut-600/20 dark:border-gray-800/80 pt-4 md:pt-0 md:pl-5">
          <div className="w-9 h-9 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-700 dark:text-sky-400 shrink-0">
            <User className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <h4 className="text-[10px] uppercase tracking-wider font-bold text-sky-700 dark:text-sky-400">Patient Information</h4>
            <p className="text-sm sm:text-base font-extrabold text-foreground leading-tight">
              {patientInfo.name || 'Patient'}
            </p>
            <div className="flex flex-wrap items-center gap-2 text-xs text-foreground/80 pt-1">
              {patientInfo.age && (
                <span className="px-2.5 py-0.5 rounded-full bg-surface-200 border border-chestnut-600/20 dark:border-gray-800/80 text-xs">
                  Age: <strong className="text-foreground font-bold">{patientInfo.age}</strong>
                </span>
              )}
              {patientInfo.gender && (
                <span className="px-2.5 py-0.5 rounded-full bg-surface-200 border border-chestnut-600/20 dark:border-gray-800/80 text-xs">
                  Gender: <strong className="text-foreground font-bold">{patientInfo.gender}</strong>
                </span>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
