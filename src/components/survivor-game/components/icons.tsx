import React from 'react';
import { Rarity } from '../types';
import { rarityProgression } from '../constants';

interface IconProps {
  rarity: Rarity;
  name: string;
  className?: string;
}

const getRarityIndex = (rarity: Rarity) => rarityProgression.indexOf(rarity);

export const KunaiIcon: React.FC<IconProps> = ({ rarity, className }) => {
    const rarityIndex = getRarityIndex(rarity);
    // Base Kunai: gray blade, brown hilt
    let bladeFill = "#9CA3AF"; // gray-400
    let hiltFill = "#78350F"; // amber-800
    let ringFill = "#4B5563"; // gray-600
  
    if (rarityIndex >= 1) { // Magic+
      bladeFill = "#E5E7EB"; // gray-200
    }
    if (rarityIndex >= 4) { // Excellent+
      bladeFill = "#FBBF24"; // amber-400
      ringFill = "#B45309"; // amber-700
    }
    if (rarityIndex >= 7) { // Eternal+
      bladeFill = "#F472B6"; // pink-400
      hiltFill = "#581C87"; // purple-900
    }
    if (rarityIndex >= 10) { // Forever
        bladeFill = "url(#forever-grad)";
        hiltFill = "#FDF4FF"; // purple-50
    }

    return (
        <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
            {rarityIndex >= 10 && (
                <defs>
                    <linearGradient id="forever-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" style={{stopColor: '#FBCFE8', stopOpacity:1}} />
                        <stop offset="100%" style={{stopColor: '#A78BFA', stopOpacity:1}} />
                    </linearGradient>
                </defs>
            )}
            {/* Blade */}
            <path d="M 50 10 L 65 50 L 50 90 L 35 50 Z" fill={bladeFill} stroke="#1F2937" strokeWidth="3" />
            {/* Hilt */}
            <rect x="42" y="85" width="16" height="10" fill={hiltFill} stroke="#1F2937" strokeWidth="2" />
            {/* Ring */}
            <circle cx="50" cy="95" r="8" fill="none" stroke={ringFill} strokeWidth="4" />
        </svg>
    );
};

export const KatanaIcon: React.FC<IconProps> = ({ rarity, className }) => {
    const rarityIndex = getRarityIndex(rarity);
    return (
        <svg viewBox="0 0 100 100" className={className}>
            <g transform="rotate(45 50 50)">
                <rect x="45" y="10" width="10" height="70" fill={rarityIndex >= 4 ? "#FBBF24" : "#E5E7EB"} />
                <path d="M 45 10 C 40 20, 40 30, 45 40 L 45 10 Z" fill={rarityIndex >= 7 ? "#F472B6" : (rarityIndex >= 4 ? "#FBBF24" : "#E5E7EB")} />
                <rect x="40" y="80" width="20" height="5" fill="#78350F" />
                <rect x="35" y="85" width="30" height="10" fill="#422006" />
            </g>
        </svg>
    );
};

export const RevolverIcon: React.FC<IconProps> = ({ rarity, className }) => {
    const rarityIndex = getRarityIndex(rarity);
    return (
        <svg viewBox="0 0 100 100" className={className}>
            <g transform="rotate(15 50 50)">
                <rect x="20" y="40" width="50" height="15" fill={rarityIndex >= 4 ? "#FBBF24" : "#4B5563"} />
                <rect x="25" y="55" width="15" height="25" fill="#78350F" />
                <path d="M 70 40 L 90 35 L 90 60 L 70 55 Z" fill={rarityIndex >= 7 ? "#F472B6" : "#4B5563"} />
                <circle cx="45" cy="47.5" r="10" fill="#374151" />
            </g>
        </svg>
    );
};

export const ShotgunIcon: React.FC<IconProps> = ({ rarity, className }) => {
    const rarityIndex = getRarityIndex(rarity);
    return (
        <svg viewBox="0 0 100 100" className={className}>
            <g transform="rotate(15 50 50)">
                <rect x="10" y="40" width="80" height="10" fill={rarityIndex >= 4 ? "#FBBF24" : "#4B5563"} />
                <rect x="10" y="50" width="60" height="10" fill={rarityIndex >= 7 ? "#78350F" : "#78350F"} />
                <rect x="25" y="60" width="15" height="20" fill="#422006" />
                {rarityIndex >= 4 && <circle cx="85" cy="45" r="8" fill="#FBBF24" />}
            </g>
        </svg>
    );
};

export const BatIcon: React.FC<IconProps> = ({ rarity, className }) => {
    const rarityIndex = getRarityIndex(rarity);
    return (
        <svg viewBox="0 0 100 100" className={className}>
            <g transform="rotate(45 50 50)">
                <path d="M 45 10 L 55 10 L 65 80 L 35 80 Z" fill={rarityIndex >= 4 ? "#A16207" : "#78350F"} />
                <rect x="30" y="80" width="40" height="10" fill="#422006" />
                {rarityIndex >= 7 && <path d="M 45 15 L 40 20 L 45 25 Z M 55 25 L 60 30 L 55 35 Z" fill="#F472B6" />}
            </g>
        </svg>
    );
};

export const NecklaceIcon: React.FC<IconProps> = ({ rarity, className }) => {
    const rarityIndex = getRarityIndex(rarity);
    return (
        <svg viewBox="0 0 100 100" className={className}>
            <circle cx="50" cy="50" r="30" fill="none" stroke={rarityIndex >= 4 ? "#FBBF24" : "#9CA3AF"} strokeWidth="5" />
            <path d="M 50 80 L 65 65 L 50 50 L 35 65 Z" fill={rarityIndex >= 7 ? "#F472B6" : (rarityIndex >= 4 ? "#34D399" : "#60A5FA")} />
        </svg>
    );
};

export const GloveIcon: React.FC<IconProps> = ({ rarity, className }) => {
    const rarityIndex = getRarityIndex(rarity);
    return (
        <svg viewBox="0 0 100 100" className={className}>
            <path d="M 20 90 L 20 50 C 20 30, 30 30, 40 40 L 40 30 C 40 20, 50 20, 55 30 L 60 25 C 65 15, 75 15, 80 25 L 85 40 L 80 90 Z" 
                  fill={rarityIndex >= 7 ? "#581C87" : (rarityIndex >= 4 ? "#FBBF24" : "#4B5563")} />
        </svg>
    );
};

export const SuitIcon: React.FC<IconProps> = ({ rarity, className }) => {
    const rarityIndex = getRarityIndex(rarity);
    return (
        <svg viewBox="0 0 100 100" className={className}>
            <path d="M 20 20 L 80 20 L 90 40 L 80 90 L 20 90 L 10 40 Z" fill={rarityIndex >= 4 ? "#FBBF24" : "#E5E7EB"} />
            <path d="M 40 20 L 60 20 L 60 40 L 40 40 Z" fill={rarityIndex >= 7 ? "#F472B6" : "#374151"} />
        </svg>
    );
};

export const BeltIcon: React.FC<IconProps> = ({ rarity, className }) => {
    const rarityIndex = getRarityIndex(rarity);
    return (
        <svg viewBox="0 0 100 100" className={className}>
            <rect x="10" y="40" width="80" height="20" fill={rarityIndex >= 4 ? "#A16207" : "#78350F"} />
            <rect x="40" y="35" width="20" height="30" fill={rarityIndex >= 7 ? "#F472B6" : (rarityIndex >= 4 ? "#FBBF24" : "#9CA3AF")} />
        </svg>
    );
};

export const BootsIcon: React.FC<IconProps> = ({ rarity, className }) => {
    const rarityIndex = getRarityIndex(rarity);
    return (
        <svg viewBox="0 0 100 100" className={className}>
            <path d="M 20 90 L 20 50 L 50 50 L 50 80 Q 50 90, 40 90 Z" fill={rarityIndex >= 4 ? "#A16207" : "#78350F"} />
            <path d="M 55 90 L 55 50 L 85 50 L 85 80 Q 85 90, 75 90 Z" fill={rarityIndex >= 4 ? "#A16207" : "#78350F"} />
            {rarityIndex >= 7 && <rect x="15" y="40" width="75" height="10" fill="#F472B6" />}
        </svg>
    );
};
