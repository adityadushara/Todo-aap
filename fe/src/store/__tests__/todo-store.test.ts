import { useTodoStore } from '../todo-store';
import { supabase } from '../../lib/supabase';

// Mock Supabase
jest.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
    },
    from: jest.fn(),
  },
}));

describe('useTodoStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useTodoStore.setState({ todos: [], categories: [], tags: [], isLoading: false });
  });

  it('should have initial state', () => {
    const state = useTodoStore.getState();
    expect(state.todos).toEqual([]);
    expect(state.isLoading).toBe(false);
  });

  it('should fetch todos', async () => {
    // Mock user
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: { id: 'user1' } },
    });

    // Mock query chain
    const mockSelect = jest.fn().mockReturnThis();
    const mockEq = jest.fn().mockReturnThis();
    const mockOrder = jest.fn().mockResolvedValue({
      data: [{ id: '1', title: 'Test Todo', tags: [] }],
    });

    (supabase.from as jest.Mock).mockReturnValue({
      select: mockSelect,
      eq: mockEq,
      order: mockOrder,
    });

    await useTodoStore.getState().fetchTodos();

    expect(supabase.auth.getUser).toHaveBeenCalled();
    expect(supabase.from).toHaveBeenCalledWith('todos');
    expect(useTodoStore.getState().todos).toHaveLength(1);
    expect(useTodoStore.getState().todos[0].title).toBe('Test Todo');
  });
});
