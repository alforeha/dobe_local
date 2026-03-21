import { TimeViewTabs } from './TimeViewTabs';
import { CoachComment } from './CoachComment';
import { CoachNavButton } from './CoachNavButton';
import { MenuNavButton } from './MenuNavButton';
import type { TimeView } from '../timeViews/TimeViewContainer';

interface FooterProps {
  activeView: TimeView;
  onViewChange: (view: TimeView) => void;
  onCoachOpen: () => void;
  onMenuOpen: () => void;
}

export function Footer({ activeView, onViewChange, onCoachOpen, onMenuOpen }: FooterProps) {
  return (
    <footer className="shrink-0 border-t border-gray-200 bg-white">
      {/* Top row: time view nav */}
      <TimeViewTabs activeView={activeView} onViewChange={onViewChange} />
      {/* Bottom row: coach + ambient comment + menu */}
      <div className="flex items-center gap-2 px-3 pb-3">
        <CoachNavButton onOpen={onCoachOpen} />
        <CoachComment />
        <MenuNavButton onOpen={onMenuOpen} />
      </div>
    </footer>
  );
}
