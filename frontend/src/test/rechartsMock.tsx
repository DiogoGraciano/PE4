import type { PropsWithChildren } from 'react';
import { vi } from 'vitest';

export const mockRecharts = () => {
  vi.mock('recharts', async () => {
    const actual = (await vi.importActual<typeof import('recharts')>('recharts'));
    const stub = ({ children }: PropsWithChildren) => <div data-testid="recharts-stub">{children}</div>;
    return {
      ...actual,
      ResponsiveContainer: stub,
    };
  });
};
