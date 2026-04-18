import React from 'react';

const SegmentBadge = ({ totalSpent }) => {
  if (totalSpent === undefined || totalSpent === null) return null;
  
  let segmentName = '';
  let colorClass = '';

  if (totalSpent >= 1500) {
    segmentName = 'GOLD';
    colorClass = 'bg-yellow-50 text-yellow-600 ring-yellow-200/50';
  } else if (totalSpent >= 801) {
    segmentName = 'SILVER';
    colorClass = 'bg-slate-100 text-slate-500 ring-slate-200';
  } else if (totalSpent > 0) {
    segmentName = 'SP';
    colorClass = 'bg-blue-50 text-blue-500 ring-blue-100';
  } else {
    return null;
  }

  return (
    <span className={`px-2 py-0.5 rounded-md ring-1 text-[8px] font-black tracking-widest uppercase ml-2 ${colorClass}`}>
      {segmentName}
    </span>
  );
};

export default SegmentBadge;
