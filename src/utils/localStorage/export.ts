
/**
 * Export data to a JSON file or other formats
 */
export const exportDataToJson = <T>(data: T, filename: string): boolean => {
  try {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    console.error('Error exporting data to JSON:', error);
    return false;
  }
};

/**
 * Export data to CSV or other formats
 */
export const exportDataToFile = <T>(data: T, filename: string, format: 'csv' | 'json' = 'json'): boolean => {
  try {
    if (format === 'json') {
      return exportDataToJson(data, filename);
    } else if (format === 'csv') {
      // For object data that's not an array, wrap in array
      const dataArray = Array.isArray(data) ? data : [data];
      
      // Basic CSV conversion - expand as needed
      if (!dataArray.length) return false;
      
      const headers = Object.keys(dataArray[0] as object).join(',');
      const rows = dataArray.map(item => {
        return Object.values(item as object)
          .map(val => {
            // Handle different data types appropriately
            if (typeof val === 'string') return `"${val.replace(/"/g, '""')}"`;
            if (val instanceof Date) return `"${val.toISOString()}"`;
            if (val === null || val === undefined) return '';
            if (typeof val === 'object') return `"${JSON.stringify(val).replace(/"/g, '""')}"`;
            return val;
          })
          .join(',');
      });
      
      const csv = [headers, ...rows].join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`Error exporting data to ${format}:`, error);
    return false;
  }
};
