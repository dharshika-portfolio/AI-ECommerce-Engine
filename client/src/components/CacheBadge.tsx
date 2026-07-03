import React from 'react';

export const CacheBadge = ({ hit }: { hit: boolean }) => (
  <span className={`
    inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium
    ${hit
      ? 'bg-emerald-100 text-emerald-700'
      : 'bg-amber-100 text-amber-700'
    }
  `}>
    <span className={`h-1.5 w-1.5 rounded-full ${hit ? 'bg-emerald-500' : 'bg-amber-500'}`} />
    {hit ? 'HIT' : 'MISS'}
  </span>
);
