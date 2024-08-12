"use client";

import React from 'react';
import { Divider } from '@/components/divider';
import { Badge } from '@/components/badge';
import { LockOpenIcon, LockClosedIcon, FireIcon } from '@heroicons/react/16/solid';
import { formatAmount } from '@/utils/formatAmount';

interface StatProps {
  title: string;
  value: string | number;
  subvalue: string | number;
  issued?: number;
  burned?: number;
}

export function Stat({ title, value, subvalue, issued = 0, burned = 0 }: StatProps) {
  const isLocked = subvalue === 'Locked';
  const isUnlocked = subvalue === 'Unlocked';
  const burnPercentage = burned && issued > 0 ? (burned / issued) * 100 : 0;

  return (
    <div>
      <Divider />
      <div className="mt-6 text-xs/6 font-medium sm:text-sm/6">{title}</div>
      <div className="mt-3 text-xl/8 font-semibold sm:text-2xl/8">{value}</div>
      {subvalue && !isLocked && !isUnlocked && (
        <div className="mt-3 text-xs/6 sm:text-sm/6">
          <span className="text-zinc-500">{subvalue}</span>
        </div>
      )}
      {(isLocked || isUnlocked) && (
        <div className="mt-3 text-xs/6 sm:text-sm/6 flex items-center">
          <Badge color={isLocked ? 'lime' : 'pink'} className="flex items-center">
            {isLocked ? (
              <LockClosedIcon className="size-2 sm:size-3" />
            ) : (
              <LockOpenIcon className="size-2 sm:size-3" />
            )}
          </Badge>
          <span className="ml-2 text-zinc-500">{subvalue}</span>
          {burned > 0 && (
            <>
              <Badge color="orange" className="flex items-center ml-4">
                <FireIcon className="size-2 sm:size-3 text-red-500" />
              </Badge>
              <span className="ml-2 text-zinc-500">{formatAmount(burnPercentage, false, true)}% Burned</span>
            </>
          )}
        </div>
      )}
    </div>
  );
}
