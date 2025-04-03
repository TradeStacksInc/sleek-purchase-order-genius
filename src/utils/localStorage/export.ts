
// Export data to file functionality
export const exportDataToFile = (data: any, filename: string = 'export.json', type: 'json' | 'csv' = 'json'): void => {
  try {
    let content: string;
    let mimeType: string;
    
    if (type === 'json') {
      content = JSON.stringify(data, null, 2);
      mimeType = 'application/json';
      if (!filename.endsWith('.json')) filename += '.json';
    } else {
      // Simple CSV conversion for array of objects
      if (!Array.isArray(data)) {
        throw new Error('CSV export only supports arrays of objects');
      }
      
      // Get headers from first object
      const headers = Object.keys(data[0] || {});
      // Convert each object to CSV row
      const rows = data.map(obj => 
        headers.map(header => {
          const value = obj[header];
          // Handle special cases
          if (value instanceof Date) return value.toISOString();
          if (typeof value === 'object') return JSON.stringify(value);
          return String(value);
        }).join(',')
      );
      
      content = [headers.join(','), ...rows].join('\n');
      mimeType = 'text/csv';
      if (!filename.endsWith('.csv')) filename += '.csv';
    }
    
    // Create download link
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);
    
    console.info(`Successfully exported data as ${filename}`);
  } catch (error) {
    console.error('Error exporting data:', error);
    throw error;
  }
};
