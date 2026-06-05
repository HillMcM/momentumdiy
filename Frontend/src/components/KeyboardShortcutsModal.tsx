import { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const shortcuts = [
  { key: '/', description: 'Search features and tasks', category: 'Navigation' },
  { key: '?', description: 'Show keyboard shortcuts', category: 'Navigation' },
  { key: 'Esc', description: 'Close modals/drawers', category: 'Navigation' },
  { key: '⌘ + K', description: 'Quick search (Mac)', category: 'Navigation' },
  { key: 'Ctrl + K', description: 'Quick search (Windows/Linux)', category: 'Navigation' },
];

export default function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Group shortcuts by category
  const shortcutsByCategory = shortcuts.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = [];
    }
    acc[shortcut.category].push(shortcut);
    return acc;
  }, {} as Record<string, typeof shortcuts>);

  if (!mounted) return null;

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay style={{
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          position: 'fixed',
          inset: 0,
          animation: 'overlayShow 150ms cubic-bezier(0.16, 1, 0.3, 1)',
        }} />
        <Dialog.Content style={{
          backgroundColor: '#23233a',
          borderRadius: '16px',
          boxShadow: '0 16px 40px rgba(0, 0, 0, 0.35)',
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90vw',
          maxWidth: '600px',
          maxHeight: '85vh',
          padding: '2rem',
          color: '#FFF1E7',
          animation: 'contentShow 150ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <Dialog.Title style={{ fontSize: '1.5rem', fontWeight: 700, color: '#FFF1E7' }}>
              Keyboard Shortcuts
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#FFF1E7',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  padding: '0.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '4px',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
                aria-label="Close"
              >
                ×
              </button>
            </Dialog.Close>
          </div>

          <div style={{ maxHeight: '60vh', overflowY: 'auto', paddingRight: '0.5rem' }}>
            {Object.entries(shortcutsByCategory).map(([category, items]) => (
              <div key={category} style={{ marginBottom: '2rem' }}>
                <h3 style={{
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: 'rgba(255, 255, 255, 0.5)',
                  marginBottom: '1rem',
                }}>
                  {category}
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {items.map((shortcut, index) => (
                    <div
                      key={index}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0.75rem',
                        background: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: '8px',
                      }}
                    >
                      <span style={{ color: '#FFF1E7', fontSize: '0.9rem' }}>
                        {shortcut.description}
                      </span>
                      <kbd
                        style={{
                          background: '#191628',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          borderRadius: '6px',
                          padding: '0.375rem 0.75rem',
                          fontSize: '0.75rem',
                          fontFamily: 'monospace',
                          color: '#EF8E81',
                          fontWeight: 600,
                          minWidth: '3rem',
                          textAlign: 'center',
                        }}
                      >
                        {shortcut.key}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div style={{
            marginTop: '1.5rem',
            paddingTop: '1.5rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            fontSize: '0.875rem',
            color: 'rgba(255, 255, 255, 0.6)',
            textAlign: 'center',
          }}>
            Press <kbd style={{
              background: '#191628',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '4px',
              padding: '0.25rem 0.5rem',
              fontSize: '0.75rem',
              fontFamily: 'monospace',
              color: '#EF8E81',
              fontWeight: 600,
            }}>?</kbd> anytime to view shortcuts
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

