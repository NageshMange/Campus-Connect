import React, { useState } from 'react';
import { InstitutionalReport, UserRole } from '../types';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Printer, Download, CheckCircle2, Stamp, MapPin, Calendar, Clock, Edit3 } from 'lucide-react';

interface InstitutionalReportViewProps {
  report: InstitutionalReport;
  onReportUpdated?: (updated: InstitutionalReport) => void;
  onBack?: () => void;
}

export const InstitutionalReportView: React.FC<InstitutionalReportViewProps> = ({
  report,
  onReportUpdated,
  onBack,
}) => {
  const { user } = useAuth();
  const [currentReport, setCurrentReport] = useState<InstitutionalReport>(report);
  const [signing, setSigning] = useState(false);
  const [signRemarks, setSignRemarks] = useState('');

  const isAdmin = user?.role === 'admin';
  const isOrganizer = user?.role === 'organizer';

  const handlePrint = () => {
    window.print();
  };

  const handleSignOff = async (
    signType: 'eventCoordinatorSign' | 'headOfDepartmentSign' | 'iqacCoordinatorSign' | 'principalSign'
  ) => {
    try {
      setSigning(true);
      const updated = await api.verifyReport(
        currentReport._id,
        signType,
        user?.name,
        signRemarks || 'Verified and approved for institutional NBA/NAAC records.'
      );
      setCurrentReport(updated);
      if (onReportUpdated) onReportUpdated(updated);
    } catch (e) {
      console.error('Sign off failed:', e);
    } finally {
      setSigning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top action toolbar (hidden on print) */}
      <div className="flex flex-wrap items-center justify-between gap-4 print:hidden bg-white p-4 rounded-xl border border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              RECORD: ACA/D/021
            </span>
            <h2 className="text-base font-bold text-slate-900">
              Institutional Event Accreditation Report
            </h2>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
            <span>Revision: 00</span>
            <span aria-hidden="true">·</span>
            <span>DoI: 01/02/2025</span>
            <span aria-hidden="true">·</span>
            <span className="font-semibold text-blue-600">
              Status: {currentReport.verification.status.replace(/_/g, ' ').toUpperCase()}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onBack && (
            <button
              onClick={onBack}
              className="px-3.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg border border-slate-300"
            >
              Back
            </button>
          )}

          {/* Quick Verification Actions for Faculty/Admin (Step 11) */}
          {isAdmin && !currentReport.verification.principalSign.signed && (
            <button
              onClick={() => handleSignOff('principalSign')}
              disabled={signing}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
            >
              <Stamp className="w-3.5 h-3.5" /> Sign as Principal (Step 11)
            </button>
          )}

          {isOrganizer && !currentReport.verification.eventCoordinatorSign.signed && (
            <button
              onClick={() => handleSignOff('eventCoordinatorSign')}
              disabled={signing}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
            >
              <Stamp className="w-3.5 h-3.5" /> Sign as Coordinator
            </button>
          )}

          {isAdmin && !currentReport.verification.iqacCoordinatorSign.signed && (
            <button
              onClick={() => handleSignOff('iqacCoordinatorSign')}
              disabled={signing}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-700 hover:bg-indigo-800 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
            >
              <Stamp className="w-3.5 h-3.5" /> Sign as IQAC Head
            </button>
          )}

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
          >
            <Printer className="w-3.5 h-3.5" /> Print / Save Final PDF (Step 12)
          </button>
        </div>
      </div>

      {/* Official College Event Report Document (Conforms EXACTLY to PDF ACA/D/021) */}
      <div className="bg-white border border-slate-300 p-8 shadow-sm rounded-xl print:border-none print:shadow-none print:p-0 max-w-4xl mx-auto font-serif text-slate-900">
        {/* Institutional Header Table */}
        <div className="border border-slate-800 mb-6">
          <div className="grid grid-cols-12 items-center divide-x divide-slate-800">
            {/* Left APCOER Official Logo */}
            <div className="col-span-2 p-2 flex flex-col items-center justify-center">
              <img
                src="/assets/aistudio/ap1_3c1c1923.jpg"
                alt="APCOER Logo"
                className="w-16 h-20 object-contain"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <span className="text-[9px] font-bold text-center mt-0.5 uppercase tracking-wider text-slate-800">
                APCOER
              </span>
            </div>

            {/* Center Header Details */}
            <div className="col-span-8 p-3 text-center">
              <h1 className="text-sm font-bold text-slate-900 leading-tight">
                {currentReport.collegeHeader.trustName}
              </h1>
              <h2 className="text-base font-bold text-slate-900 leading-tight">
                {currentReport.collegeHeader.collegeName}
              </h2>

              <div className="border-t border-slate-800 mt-2 pt-2 grid grid-cols-2 divide-x divide-slate-800 text-[11px] text-left font-sans">
                <div className="px-3">
                  <span className="font-bold font-serif">Record No.: </span>
                  {currentReport.collegeHeader.recordNo}
                  <br />
                  <span className="font-bold font-serif">Revision: </span>
                  {currentReport.collegeHeader.revision}
                </div>
                <div className="px-3">
                  <span className="font-bold font-serif">DoI: </span>
                  {currentReport.collegeHeader.doi}
                </div>
              </div>

              <div className="border-t border-slate-800 mt-2 pt-1 font-bold text-xs uppercase tracking-wider">
                Event Report
              </div>
            </div>

            {/* Right Side APCOER Seal */}
            <div className="col-span-2 p-2 flex flex-col items-center justify-center">
              <img
                src="/assets/aistudio/ap1_3c1c1923.jpg"
                alt="APCOER Pune"
                className="w-16 h-20 object-contain"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <span className="text-[9px] font-bold text-center mt-0.5 uppercase tracking-wider text-slate-800">
                PUNE
              </span>
            </div>
          </div>
        </div>

        {/* Report Content Body */}
        <div className="space-y-4 text-xs font-sans leading-relaxed">
          {/* Metadata Block */}
          <div className="space-y-1.5 border-b border-slate-200 pb-3">
            <p>
              <span className="font-bold font-serif">Name of Event: </span>
              {currentReport.nameOfEvent}
            </p>
            <p>
              <span className="font-bold font-serif">Date of Event: </span>
              {currentReport.dateOfEvent}
            </p>
            <p>
              <span className="font-bold font-serif">Time of event: </span>
              {currentReport.timeOfEvent}
            </p>
            <p>
              <span className="font-bold font-serif">Name of Event Coordinator: </span>
              {currentReport.nameOfCoordinator}
            </p>
          </div>

          {/* Objectives */}
          <div>
            <h3 className="font-bold font-serif text-slate-900 mb-1.5 text-xs">
              Objectives:
            </h3>
            <ul className="space-y-1 pl-2">
              {currentReport.objectives.map((obj, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-slate-700"></span>
                  <span>{obj}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Brief About Event */}
          <div className="pt-2">
            <h3 className="font-bold font-serif text-slate-900 mb-1.5 text-xs">
              Brief About Event: (Detail Program Description)
            </h3>
            <div className="text-slate-800 whitespace-pre-line text-justify leading-relaxed">
              {currentReport.briefAboutEvent}
            </div>
          </div>

          {/* Beneficiaries Count */}
          <div className="pt-2">
            <p>
              <span className="font-bold font-serif">No. Of beneficiaries: </span>
              <span className="font-bold text-slate-900">{currentReport.beneficiariesCount}</span>
            </p>
          </div>

          {/* Outcome of Program */}
          <div className="pt-2">
            <h3 className="font-bold font-serif text-slate-900 mb-1.5 text-xs">
              Outcome of the Program:
            </h3>
            <ul className="space-y-1 pl-2">
              {currentReport.outcomes.map((out, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-slate-700"></span>
                  <span>{out}</span>
                </li>
              ))}
            </ul>
          </div>

          <p className="pt-1 italic text-slate-700">
            The program successfully contributed to the all-round growth of students.
          </p>

          {/* Mapped CO/PO/PSO Table (Matching PDF page 2) */}
          <div className="pt-4 break-inside-avoid">
            <h3 className="font-bold font-serif text-slate-900 mb-2 text-xs">
              Mapped CO/PO/PSO:
            </h3>
            <table className="w-full border-collapse border border-slate-800 text-xs">
              <thead>
                <tr className="bg-slate-100 font-bold border-b border-slate-800">
                  <th className="border-r border-slate-800 p-2 text-left w-1/3">PO Mapped</th>
                  <th className="border-r border-slate-800 p-2 text-left w-1/3">PEO Mapped</th>
                  <th className="p-2 text-left w-1/3">PSO Mapped</th>
                </tr>
              </thead>
              <tbody>
                {currentReport.mappedCOPO.map((row, i) => (
                  <tr key={i} className="border-b border-slate-800">
                    <td className="border-r border-slate-800 p-2"> {row.po}</td>
                    <td className="border-r border-slate-800 p-2">{row.peo}</td>
                    <td className="p-2">{row.pso}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Geotagged Photographs Section (Matching PDF page 2 & 3) */}
          <div className="pt-6 space-y-4 break-inside-avoid">
            <h3 className="font-bold font-serif text-slate-900 mb-2 text-xs">
              Photographs:
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentReport.photographs.map((photo, i) => (
                <div
                  key={i}
                  className="border border-slate-300 rounded overflow-hidden bg-slate-900 relative shadow-xs"
                >
                  <img
                    src={photo.url}
                    alt={`Event Photo ${i + 1}`}
                    className="w-full h-56 object-cover object-center"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />

                  {/* Geotag Stamp Overlay (exact replica of GPS Map Camera in PDF) */}
                  <div className="absolute bottom-0 inset-x-0 bg-black/75 backdrop-blur-xs text-white p-2.5 text-[10px] font-mono leading-tight">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-white text-xs">
                        {photo.location ? 'Pune, Maharashtra, India 🇮🇳' : 'Pune, India'}
                      </span>
                      <span className="text-[9px] text-slate-400">GPS Map Camera</span>
                    </div>
                    <div className="text-slate-300 text-[9px] truncate">
                      {photo.location}
                    </div>
                    <div className="flex items-center justify-between text-slate-300 text-[9px] pt-0.5">
                      <span>{photo.latLong}</span>
                      <span>{photo.timestamp}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Signatures & Accreditation Approvals Block (Matching PDF page 3) */}
          <div className="mt-12 pt-8 border-t border-slate-800 break-inside-avoid font-serif">
            <div className="text-xs font-bold mb-6">
              Date: {currentReport.dateOfEvent}
            </div>

            <div className="grid grid-cols-4 gap-4 text-center text-xs pt-8">
              {/* Event Coordinator */}
              <div className="border-t border-slate-400 pt-2 flex flex-col justify-between h-20">
                <div className="font-bold">Event Coordinator</div>
                {currentReport.verification.eventCoordinatorSign.signed ? (
                  <div className="text-emerald-700 text-[10px] font-sans font-semibold">
                    ✓ Signed ({currentReport.verification.eventCoordinatorSign.name})
                    <div className="text-[9px] text-slate-500">
                      {currentReport.verification.eventCoordinatorSign.date}
                    </div>
                  </div>
                ) : (
                  <div className="text-slate-400 text-[10px] font-sans italic">
                    (Pending signature)
                  </div>
                )}
              </div>

              {/* Head of Department */}
              <div className="border-t border-slate-400 pt-2 flex flex-col justify-between h-20">
                <div className="font-bold">Head of Department</div>
                {currentReport.verification.headOfDepartmentSign.signed ? (
                  <div className="text-emerald-700 text-[10px] font-sans font-semibold">
                    ✓ Verified ({currentReport.verification.headOfDepartmentSign.name})
                    <div className="text-[9px] text-slate-500">
                      {currentReport.verification.headOfDepartmentSign.date}
                    </div>
                  </div>
                ) : (
                  <div className="text-slate-400 text-[10px] font-sans italic">
                    (Pending verification)
                  </div>
                )}
              </div>

              {/* IQAC Coordinator */}
              <div className="border-t border-slate-400 pt-2 flex flex-col justify-between h-20">
                <div className="font-bold">IQAC Coordinator</div>
                {currentReport.verification.iqacCoordinatorSign.signed ? (
                  <div className="text-emerald-700 text-[10px] font-sans font-semibold">
                    ✓ Verified ({currentReport.verification.iqacCoordinatorSign.name})
                    <div className="text-[9px] text-slate-500">
                      {currentReport.verification.iqacCoordinatorSign.date}
                    </div>
                  </div>
                ) : (
                  <div className="text-slate-400 text-[10px] font-sans italic">
                    (Pending verification)
                  </div>
                )}
              </div>

              {/* Principal */}
              <div className="border-t border-slate-400 pt-2 flex flex-col justify-between h-20">
                <div className="font-bold">Principal</div>
                {currentReport.verification.principalSign.signed ? (
                  <div className="text-emerald-700 text-[10px] font-sans font-semibold">
                    ✓ Approved ({currentReport.verification.principalSign.name})
                    <div className="text-[9px] text-slate-500">
                      {currentReport.verification.principalSign.date}
                    </div>
                  </div>
                ) : (
                  <div className="text-slate-400 text-[10px] font-sans italic">
                    (Pending approval)
                  </div>
                )}
              </div>
            </div>

            <div className="mt-8 text-center text-[10px] text-slate-400 font-mono">
              APCOER Pune · Institutional Co-Curricular & Activity Documentation (Record ACA/D/021)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
