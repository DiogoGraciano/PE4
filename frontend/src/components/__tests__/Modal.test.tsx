import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import Modal from '../Modal';

describe('Modal', () => {
  it('renders nothing when closed', () => {
    const { container } = render(
      <Modal isOpen={false} onClose={() => {}} title="X">
        <p>content</p>
      </Modal>,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders title and children when open', () => {
    render(
      <Modal isOpen title="Hello" onClose={() => {}}>
        <p>body</p>
      </Modal>,
    );
    expect(screen.getByText('Hello')).toBeInTheDocument();
    expect(screen.getByText('body')).toBeInTheDocument();
  });

  it('calls onClose when close button clicked', async () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen title="X" onClose={onClose}>
        <p>body</p>
      </Modal>,
    );
    await userEvent.click(screen.getByRole('button'));
    expect(onClose).toHaveBeenCalled();
  });

  it('calls onClose when Escape pressed', () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen title="X" onClose={onClose}>
        <p>body</p>
      </Modal>,
    );
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });

  it('locks body scroll while open and restores on unmount', () => {
    const { unmount } = render(
      <Modal isOpen title="X" onClose={() => {}}>
        <p>body</p>
      </Modal>,
    );
    expect(document.body.style.overflow).toBe('hidden');
    unmount();
    expect(document.body.style.overflow).toBe('unset');
  });

  it.each(['sm', 'md', 'lg', 'xl', '2xl'] as const)('renders with size %s', (size) => {
    render(
      <Modal isOpen title="X" onClose={() => {}} size={size}>
        <p>body</p>
      </Modal>,
    );
    expect(screen.getByText('X')).toBeInTheDocument();
  });
});
