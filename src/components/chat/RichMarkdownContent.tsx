'use client';

import React from 'react';
import { Sun, Sunset, Moon, Clock, Pill, Sparkles } from 'lucide-react';

interface RichMarkdownContentProps {
  content: string;
}

/**
 * Parses inline formatting like **bold**, *italic*, `code` and converts markdown text into styled React nodes
 */
function renderFormattedInlineText(text: string): React.ReactNode[] {
  if (!text) return [];

  // Match **bold**, *italic*, `code`
  const regex = /(\*\*.*?\*\*|\*.*?\*|`.*?`)/g;
  const parts = text.split(regex);

  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      const inner = part.slice(2, -2);
      return (
        <strong key={idx} className="font-bold text-brand-teal dark:text-emerald-300">
          {inner}
        </strong>
      );
    }
    if (part.startsWith('*') && part.endsWith('*') && !part.startsWith('**') && part.length > 2) {
      const inner = part.slice(1, -1);
      return (
        <em key={idx} className="italic text-foreground/80">
          {inner}
        </em>
      );
    }
    if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      const inner = part.slice(1, -1);
      return (
        <code
          key={idx}
          className="px-1.5 py-0.5 rounded bg-surface-200 font-mono text-xs text-amber-600 dark:text-amber-300 border border-amber-500/20"
        >
          {inner}
        </code>
      );
    }
    return <span key={idx}>{part}</span>;
  });
}

export default function RichMarkdownContent({ content }: RichMarkdownContentProps) {
  if (!content) return null;

  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let currentListItems: React.ReactNode[] = [];

  const flushList = () => {
    if (currentListItems.length > 0) {
      elements.push(
        <ul key={`ul_${elements.length}`} className="space-y-2 my-2.5 pl-1">
          {currentListItems}
        </ul>
      );
      currentListItems = [];
    }
  };

  lines.forEach((line, i) => {
    const trimmed = line.trim();

    // 1. Horizontal Dividers
    if (trimmed === '---' || trimmed === '***' || trimmed === '___') {
      flushList();
      elements.push(
        <div
          key={`hr_${i}`}
          className="my-3.5 h-px bg-gradient-to-r from-transparent via-chestnut-600/30 dark:via-gray-800 to-transparent"
        />
      );
      return;
    }

    // 2. Headings (#, ##, ###, ####)
    if (trimmed.startsWith('#')) {
      flushList();
      const level = trimmed.match(/^#+/)?.[0].length || 1;
      const cleanHeading = trimmed.replace(/^#+\s*/, '').replace(/\*+/g, '');

      // Identify themed card types for visual flair
      const isMorning = cleanHeading.includes('সকাল') || cleanHeading.toLowerCase().includes('morning');
      const isAfternoon = cleanHeading.includes('দুপুর') || cleanHeading.toLowerCase().includes('afternoon');
      const isNight = cleanHeading.includes('রাত') || cleanHeading.toLowerCase().includes('night') || cleanHeading.toLowerCase().includes('evening');
      const isSchedule = cleanHeading.includes('সময়সূচি') || cleanHeading.toLowerCase().includes('schedule') || cleanHeading.includes('সেবন');

      if (level >= 3) {
        let cardBg = 'bg-surface-100 border-chestnut-600/20 dark:border-gray-800/80 text-brand-teal dark:text-emerald-300';
        let IconComponent = Sparkles;

        if (isMorning) {
          cardBg = 'bg-amber-500/10 border-amber-500/30 text-amber-800 dark:text-amber-300';
          IconComponent = Sun;
        } else if (isAfternoon) {
          cardBg = 'bg-sky-500/10 border-sky-500/30 text-sky-800 dark:text-sky-300';
          IconComponent = Sunset;
        } else if (isNight) {
          cardBg = 'bg-indigo-500/10 border-indigo-500/30 text-indigo-800 dark:text-indigo-300';
          IconComponent = Moon;
        } else if (isSchedule) {
          cardBg = 'bg-brand-teal/10 border-brand-teal/30 text-brand-teal dark:text-emerald-300';
          IconComponent = Clock;
        }

        elements.push(
          <div
            key={`h_${i}`}
            className={`mt-3.5 mb-2.5 p-3 rounded-xl border ${cardBg} flex items-center gap-2 shadow-sm transition-all`}
          >
            <IconComponent className="w-4 h-4 shrink-0" />
            <h4 className="font-bold text-xs sm:text-sm tracking-wide">
              {cleanHeading}
            </h4>
          </div>
        );
      } else {
        elements.push(
          <h3
            key={`h_${i}`}
            className="text-sm font-extrabold text-foreground mt-4 mb-2 flex items-center gap-2 border-b border-chestnut-600/20 dark:border-gray-800/80 pb-1.5"
          >
            <Pill className="w-4 h-4 text-brand-teal dark:text-emerald-400" />
            <span>{cleanHeading}</span>
          </h3>
        );
      }
      return;
    }

    // 3. Bullet points (* or - or +)
    if (trimmed.startsWith('* ') || trimmed.startsWith('- ') || trimmed.startsWith('+ ')) {
      const itemText = trimmed.replace(/^[\*\-\+]\s*/, '');
      currentListItems.push(
        <li
          key={`li_${i}_${currentListItems.length}`}
          className="flex items-start gap-2 text-xs sm:text-sm text-foreground/90 leading-relaxed"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-brand-teal dark:bg-emerald-400 mt-2 shrink-0 shadow-sm" />
          <div className="flex-1">{renderFormattedInlineText(itemText)}</div>
        </li>
      );
      return;
    }

    // Flush current list if non-list line encountered
    flushList();

    // 4. Blank lines
    if (!trimmed) {
      elements.push(<div key={`space_${i}`} className="h-1" />);
      return;
    }

    // 5. Standard text paragraphs
    elements.push(
      <p key={`p_${i}`} className="text-xs sm:text-sm text-foreground/90 leading-relaxed my-1">
        {renderFormattedInlineText(line)}
      </p>
    );
  });

  // Final list flush
  flushList();

  return <div className="space-y-1 text-foreground/90 leading-relaxed">{elements}</div>;
}
