import React from 'react';
import { COLORS } from '@/constants/ui';

interface StatsCardProps {
    title: string;
    value: number | string;
    color?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
    title,
    value,
    color = COLORS.ERROR.DARK
}) => {
    return (
        <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '24px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e5e7eb',
            minHeight: '120px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
        }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px'
            }}>
                <h3 style={{
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#6b7280',
                    margin: 0
                }}>
                    {title}
                </h3>
            </div>

            <div style={{
                fontSize: '32px',
                fontWeight: '700',
                color: color,
                lineHeight: '1'
            }}>
                {value}
            </div>
        </div>
    );
};
