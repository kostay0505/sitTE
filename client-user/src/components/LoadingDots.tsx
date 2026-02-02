'use client';

import React from 'react';

export function LoadingDots() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '3px',
      }}
    >
      <div
        className='typing-dot'
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: '#000',
          animation: 'typingAnimation 1s infinite ease-in-out',
          animationDelay: '0s',
        }}
      ></div>
      <div
        className='typing-dot'
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: '#000',
          animation: 'typingAnimation 1s infinite ease-in-out',
          animationDelay: '0.2s',
        }}
      ></div>
      <div
        className='typing-dot'
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: '#000',
          animation: 'typingAnimation 1s infinite ease-in-out',
          animationDelay: '0.4s',
        }}
      ></div>
      <style jsx>{`
        @keyframes typingAnimation {
          0% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5px);
          }
          100% {
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
