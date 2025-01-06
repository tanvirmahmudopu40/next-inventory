'use client';
import { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';

export default function DateRangePicker({ dateRange, onUpdate }) {
  const [isOpen, setIsOpen] = useState(false);
  const pickerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const displayValue = dateRange.from && dateRange.to
    ? `${format(dateRange.from, 'MMM d, yyyy')} - ${format(dateRange.to, 'MMM d, yyyy')}`
    : 'Select date range';

  return (
    <div className="relative" ref={pickerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full md:w-64 p-2 border rounded-lg focus:ring-2 focus:ring-[#321fdb]/50 focus:border-[#321fdb] text-left"
      >
        {displayValue}
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 bg-white rounded-lg shadow-lg p-4">
          <DayPicker
            mode="range"
            selected={dateRange}
            onSelect={(range) => {
              onUpdate(range || { from: null, to: null });
              if (range?.from && range?.to) {
                setIsOpen(false);
              }
            }}
          />
        </div>
      )}
    </div>
  );
} 