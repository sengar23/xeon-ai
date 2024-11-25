import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import XeonAIChat from '@/components/XeonAIChat';

describe('XeonAIChat Component', () => {
  let webllmMock: any;

  beforeEach(async () => {
    // Clear mocks before each test
    vi.clearAllMocks();

    // Dynamically import the ES module to resolve compatibility issues
    webllmMock = await import('@mlc-ai/web-llm');

    // Mock the module
    vi.mock('@mlc-ai/web-llm', () => ({
      prebuiltAppConfig: { model_list: [{ model_id: 'test-model' }] },
      MLCEngine: vi.fn(() => ({
        setInitProgressCallback: vi.fn(),
        reload: vi.fn(),
        chat: {
          completions: {
            create: vi.fn(() => ({
              [Symbol.asyncIterator]: async function* () {
                yield { choices: [{ delta: { content: 'AI response' } }] };
              },
            })),
          },
        },
      })),
    }));
  });

  

  test('downloads the model and updates the UI', async () => {
    render(<XeonAIChat />);

    const downloadButton = screen.getByRole('button', { name: /Download/i });

    fireEvent.click(downloadButton);

    await waitFor(() => {
      expect(screen.queryByText(/Loading/i)).toBeNull(); // Confirm download ends
    });
  });

});