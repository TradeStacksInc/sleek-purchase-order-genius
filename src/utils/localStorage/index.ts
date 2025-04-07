
// Export all functionality from localStorage modules
export * from './core';
export * from './appState';
export * from './constants';
export * from './export';
export * from './types';

import { PaginationParams, PaginatedResult } from './types';

export function getPaginatedData<T>(items: T[], params: PaginationParams): PaginatedResult<T> {
  const { page, limit } = params;
  const start = (page - 1) * limit;
  const end = start + limit;
  const data = items.slice(start, end);
  
  return {
    data,
    page,
    pageSize: limit,
    totalItems: items.length,
    totalPages: Math.ceil(items.length / limit)
  };
}

export function fetchFromSupabase<T>(resource: string, params?: any): Promise<T> {
  console.log(`Fetching from Supabase: ${resource}`, params);
  // This is a stub implementation. The actual implementation would be provided elsewhere.
  return Promise.resolve({} as T);
}

export function syncToSupabase<T>(resource: string, data: T): Promise<T> {
  console.log(`Syncing to Supabase: ${resource}`, data);
  // This is a stub implementation. The actual implementation would be provided elsewhere.
  return Promise.resolve(data);
}

export function exportDataToFile(data: any, filename: string, format: 'json' | 'csv' = 'json'): void {
  let content: string;
  let mimeType: string;
  
  if (format === 'json') {
    content = JSON.stringify(data, null, 2);
    mimeType = 'application/json';
    filename = `${filename}.json`;
  } else {
    // Simple CSV conversion - would need enhancement for complex data
    const headers = Object.keys(data[0] || {}).join(',');
    const rows = data.map((item: any) => Object.values(item).join(','));
    content = [headers, ...rows].join('\n');
    mimeType = 'text/csv';
    filename = `${filename}.csv`;
  }
  
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
