import { useState, useEffect, useCallback } from 'react';
import { backgroundContextService, BackgroundContext, BackgroundContextStats } from '../services/backgroundContextService';

export const useBackgroundContext = () => {
  const [contexts, setContexts] = useState<BackgroundContext[]>([]);
  const [stats, setStats] = useState<BackgroundContextStats>({ total: 0, active: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);

  // Load contexts
  const loadContexts = useCallback(async (page: number = 0, size: number = 10) => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await backgroundContextService.getAllContexts(page, size);
      setContexts(data);
      setCurrentPage(page);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load contexts');
      console.error('Error loading background contexts:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load statistics
  const loadStats = useCallback(async () => {
    try {
      const data = await backgroundContextService.getContextStats();
      setStats(data);
    } catch (err) {
      console.error('Error loading background context stats:', err);
    }
  }, []);
  // Create new context
  const createContext = useCallback(async (context: Omit<BackgroundContext, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setLoading(true);
      setError(null);
      
      const newContext = await backgroundContextService.createContext(context);
      
      // If new context is active, deactivate all existing contexts
      setContexts(prev => {
        const updatedContexts = newContext.isActive 
          ? prev.map(ctx => ({ ...ctx, isActive: false }))
          : prev;
        return [newContext, ...updatedContexts];
      });
      
      await loadStats();
      
      return newContext;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create context';
      setError(errorMessage);
      console.error('Error creating background context:', err);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [loadStats]);
  // Update context
  const updateContext = useCallback(async (id: number, context: Omit<BackgroundContext, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setLoading(true);
      setError(null);
      
      const updatedContext = await backgroundContextService.updateContext(id, context);
      
      if (updatedContext) {
        // Update contexts: set the updated one and deactivate others if this one is now active
        setContexts(prev => prev.map(ctx => {
          if (ctx.id === id) {
            return updatedContext;
          } else {
            // If the updated context is now active, deactivate all others
            return updatedContext.isActive ? { ...ctx, isActive: false } : ctx;
          }
        }));
        
        await loadStats();
      }
      
      return updatedContext;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update context';
      setError(errorMessage);
      console.error('Error updating background context:', err);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [loadStats]);

  // Delete context
  const deleteContext = useCallback(async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      
      await backgroundContextService.deleteContext(id);
      setContexts(prev => prev.filter(ctx => ctx.id !== id));
      await loadStats();
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete context';
      setError(errorMessage);
      console.error('Error deleting background context:', err);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [loadStats]);
  // Toggle active status
  const toggleActiveStatus = useCallback(async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      
      const updatedContext = await backgroundContextService.toggleActiveStatus(id);
      
      // Update contexts: set the toggled one and deactivate all others
      setContexts(prev => prev.map(ctx => {
        if (ctx.id === id) {
          return updatedContext;
        } else {
          // If the updated context is now active, deactivate all others
          return updatedContext.isActive ? { ...ctx, isActive: false } : ctx;
        }
      }));
      
      await loadStats();
      
      return updatedContext;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to toggle context status';
      setError(errorMessage);
      console.error('Error toggling background context status:', err);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [loadStats]);

  // Get context by ID
  const getContextById = useCallback(async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      
      const context = await backgroundContextService.getContextById(id);
      return context;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get context';
      setError(errorMessage);
      console.error('Error getting background context:', err);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load next page
  const loadNextPage = useCallback(() => {
    if (!loading) {
      loadContexts(currentPage + 1, pageSize);
    }
  }, [loading, currentPage, pageSize, loadContexts]);

  // Load previous page
  const loadPreviousPage = useCallback(() => {
    if (!loading && currentPage > 0) {
      loadContexts(currentPage - 1, pageSize);
    }
  }, [loading, currentPage, pageSize, loadContexts]);

  // Refresh current page
  const refresh = useCallback(() => {
    if (!loading) {
      loadContexts(currentPage, pageSize);
      loadStats();
    }
  }, [loading, currentPage, pageSize, loadContexts, loadStats]);

  // Initial load
  useEffect(() => {
    loadContexts(0, pageSize);
    loadStats();
  }, [loadContexts, loadStats, pageSize]);

  return {
    // Data
    contexts,
    stats,
    loading,
    error,
    currentPage,
    pageSize,
    
    // Actions
    createContext,
    updateContext,
    deleteContext,
    toggleActiveStatus,
    getContextById,
    
    // Pagination
    loadNextPage,
    loadPreviousPage,
    refresh,
    
    // Helpers
    hasNextPage: contexts.length === pageSize,
    hasPreviousPage: currentPage > 0,
    clearError: () => setError(null)
  };
};
