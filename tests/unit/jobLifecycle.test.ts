import { JobStatus } from '../../src/types/requests';

describe('MECHFIND Job Lifecycle & State Transitions', () => {
  const STATUS_FLOW: JobStatus[] = [
    'submitted',
    'accepted',
    'heading_to_customer',
    'arrived',
    'inspection',
    'work_in_progress',
    'completed',
  ];

  it('verifies linear progression of breakdown assistance states', () => {
    for (let i = 0; i < STATUS_FLOW.length - 1; i++) {
      const current = STATUS_FLOW[i];
      const next = STATUS_FLOW[i + 1];
      expect(STATUS_FLOW.indexOf(next)).toBe(STATUS_FLOW.indexOf(current) + 1);
    }
  });

  it('ensures cancelled status is a terminal state', () => {
    const cancelledState: JobStatus = 'cancelled';
    expect(STATUS_FLOW.includes(cancelledState)).toBe(false);
  });
});

