import { Modal } from '@/components/ui/modal';
import { MatchingPreferences } from './MatchingPreferences';

interface MatchingPreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MatchingPreferencesModal({ isOpen, onClose }: MatchingPreferencesModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Filtres de Matching"
      size="xl"
    >
      <div className="p-0">
        <MatchingPreferences onClose={onClose} />
      </div>
    </Modal>
  );
}