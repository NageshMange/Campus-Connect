import React from 'react';
import { FeedbackAnalysis, CollegeEvent } from '../types';
import { Printer, Download, Star } from 'lucide-react';

interface FeedbackReportViewProps {
  event: CollegeEvent;
  feedbackData: FeedbackAnalysis;
  onBack?: () => void;
}

export const FeedbackReportView: React.FC<FeedbackReportViewProps> = ({
  event,
  feedbackData,
  onBack,
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top action toolbar (hidden on print) */}
      <div className="flex items-center justify-between print:hidden bg-white p-4 rounded-xl border border-slate-200">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Student Feedback Analysis Report
          </h2>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
            <span>Record No: ACA/R/008A</span>
            <span aria-hidden="true">·</span>
            <span>Revision: 00</span>
            <span aria-hidden="true">·</span>
            <span>DoI: 01/02/2025</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onBack && (
            <button
              onClick={onBack}
              className="px-3.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg border border-slate-300"
            >
              Back to Events
            </button>
          )}
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
          >
            <Printer className="w-3.5 h-3.5" /> Print / Save PDF
          </button>
        </div>
      </div>

      {/* Printable Institutional Feedback Sheet (conforms to PDF ACA/R/008A) */}
      <div className="bg-white border border-slate-300 p-8 shadow-sm rounded-xl print:border-none print:shadow-none print:p-0 max-w-4xl mx-auto">
        {/* Institutional Header Table */}
        <div className="border border-slate-800 mb-6">
          <div className="grid grid-cols-12 items-center divide-x divide-slate-800">
            {/* Left Emblem */}
            <div className="col-span-2 p-2 flex flex-col items-center justify-center">
              <img
                src="/src/assets/images/college_emblem_1790754809679.jpg"
                alt="ABMSP Emblem"
                className="w-16 h-16 object-contain"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <span className="text-[8px] font-bold text-center mt-1 uppercase text-slate-700">
                ABMSP
              </span>
            </div>

            {/* Center Institution Title & Document Reference */}
            <div className="col-span-8 p-3 text-center">
              <h1 className="text-sm font-serif font-bold text-slate-900 leading-tight">
                Akhil Bharatiya Maratha Shikshan Parishad's
              </h1>
              <h2 className="text-base font-serif font-bold text-slate-900 leading-tight">
                Anantrao Pawar College of Engineering & Research
              </h2>

              <div className="border-t border-slate-800 mt-2 pt-2 grid grid-cols-2 divide-x divide-slate-800 text-[11px] text-left">
                <div className="px-3">
                  <span className="font-bold">Record No.: </span>ACA/R/008A
                  <br />
                  <span className="font-bold">Revision: </span>00
                </div>
                <div className="px-3">
                  <span className="font-bold">DoI: </span>01/02/2025
                </div>
              </div>

              <div className="border-t border-slate-800 mt-2 pt-1 font-bold text-xs uppercase tracking-wider text-slate-900">
                STUDENT FEEDBACK
              </div>
            </div>

            {/* Right Founder Portrait */}
            <div className="col-span-2 p-2 flex flex-col items-center justify-center">
              <img
                src="/src/assets/images/founder_portrait_1790754859861.jpg"
                alt="APCOER Pune"
                className="w-16 h-16 object-cover rounded-full border border-slate-300"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <span className="text-[9px] font-bold text-center mt-1 text-slate-700">
                APCOER PUNE
              </span>
            </div>
          </div>
        </div>

        {/* Event Name */}
        <div className="mb-6 pb-2 border-b border-slate-300 text-xs">
          <span className="font-bold text-slate-900">Event Name: </span>
          <span className="text-slate-800">{event.title}</span>
        </div>

        {/* Feedback Questions with Google Forms / APCOER Style Bar Distribution Charts */}
        <div className="space-y-8">
          {feedbackData.questions.map((q, idx) => (
            <div
              key={idx}
              className="border border-slate-200 rounded-lg p-5 bg-white space-y-4 break-inside-avoid"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div>
                  <h3 className="text-xs font-bold text-slate-900">{q.question}</h3>
                  <span className="text-[11px] text-slate-500">
                    {feedbackData.totalResponses} responses
                  </span>
                </div>
                <span className="text-xs font-mono font-bold text-slate-700 bg-slate-50 px-2.5 py-1 rounded border border-slate-200">
                  Average rating ({q.avgRating.toFixed(2)})
                </span>
              </div>

              {/* Star scale header */}
              <div className="flex items-center justify-center gap-10 py-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <div key={star} className="flex flex-col items-center">
                    <span className="text-xs font-mono font-semibold text-slate-600 mb-1">
                      {star}
                    </span>
                    <Star
                      className={`w-4 h-4 ${
                        star <= Math.round(q.avgRating)
                          ? 'fill-amber-400 text-amber-500'
                          : 'text-slate-300'
                      }`}
                    />
                  </div>
                ))}
              </div>

              {/* Distribution Bar Chart (exact representation matching PDF page 1-3) */}
              <div className="pt-3">
                <div className="h-44 flex items-end justify-around gap-4 border-b border-slate-300 pb-2 px-6">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const count = q.counts[star] || 0;
                    const percent = q.percentages[star] || 0;
                    const heightPercent = Math.max(percent, count > 0 ? 8 : 2);

                    return (
                      <div
                        key={star}
                        className="flex-1 flex flex-col items-center justify-end h-full"
                      >
                        {count > 0 ? (
                          <span className="text-[10px] font-mono font-bold text-slate-700 mb-1 text-center whitespace-nowrap">
                            {count} ({percent}%)
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono text-slate-400 mb-1 text-center">
                            0 (0%)
                          </span>
                        )}

                        <div
                          className="w-full max-w-[56px] bg-indigo-600/90 hover:bg-indigo-700 transition-all rounded-t-sm"
                          style={{ height: `${heightPercent}%` }}
                        ></div>

                        <span className="text-xs font-mono font-bold text-slate-700 mt-2">
                          {star}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Official Signatures Block matching PDF page 3 */}
        <div className="mt-12 pt-8 border-t border-slate-800 break-inside-avoid">
          <div className="text-xs font-bold text-slate-900 mb-8">
            Date: {new Date().toLocaleDateString('en-GB')}
          </div>

          <div className="grid grid-cols-3 gap-6 text-center text-xs pt-8">
            <div className="border-t border-slate-400 pt-2">
              <div className="font-bold text-slate-900">Event Coordinator</div>
              <div className="text-[11px] text-slate-600 mt-0.5">
                {event.facultyCoordinator}
              </div>
            </div>

            <div className="border-t border-slate-400 pt-2">
              <div className="font-bold text-slate-900">Head of Department</div>
              <div className="text-[11px] text-slate-600 mt-0.5">
                {event.department}
              </div>
            </div>

            <div className="border-t border-slate-400 pt-2">
              <div className="font-bold text-slate-900">Principal</div>
              <div className="text-[11px] text-slate-600 mt-0.5">
                Dr. Sunil Thakare
              </div>
            </div>
          </div>

          <div className="mt-8 text-center text-[10px] text-slate-400 font-mono">
            Page 1/1 · Institutional Feedback Record ACA/R/008A · APCOER Pune
          </div>
        </div>
      </div>
    </div>
  );
};
