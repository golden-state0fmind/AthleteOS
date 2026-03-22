/**
 * Example usage of the Export Service
 * 
 * This file demonstrates how to use the exportUserData and importUserData functions
 * to backup and restore user data.
 */

import { exportUserData, importUserData } from '../services/exportService';
import type { ExportData } from '../types/db';

/**
 * Example: Export all user data to JSON
 * 
 * This function exports all user data and triggers a browser download.
 * Typically called from a settings page or backup button.
 */
export async function handleExportData(): Promise<void> {
  try {
    // Export all data from IndexedDB
    const exportData = await exportUserData();

    // Convert to JSON string
    const jsonString = JSON.stringify(exportData, null, 2);

    // Create a blob and trigger download
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // Create download link
    const link = document.createElement('a');
    link.href = url;
    link.download = `athleteos-backup-${new Date().toISOString().split('T')[0]}.json`;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    console.log('Data exported successfully');
  } catch (error) {
    console.error('Failed to export data:', error);
    throw error;
  }
}

/**
 * Example: Import user data from JSON file
 * 
 * This function reads a JSON file and imports the data into IndexedDB.
 * Typically called from a settings page with a file input.
 */
export async function handleImportData(file: File): Promise<void> {
  try {
    // Read file content
    const fileContent = await file.text();
    
    // Parse JSON
    const exportData: ExportData = JSON.parse(fileContent);

    // Import data into IndexedDB
    await importUserData(exportData);

    console.log('Data imported successfully');
  } catch (error) {
    console.error('Failed to import data:', error);
    throw error;
  }
}

/**
 * Example: React component usage
 * 
 * This shows how to integrate export/import in a React component.
 */
export function ExportImportExample() {
  const handleExport = async () => {
    try {
      await handleExportData();
      alert('Data exported successfully!');
    } catch (error) {
      alert('Failed to export data. Please try again.');
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      await handleImportData(file);
      alert('Data imported successfully!');
      // Optionally refresh the page or update state
      window.location.reload();
    } catch (error) {
      alert('Failed to import data. Please check the file format.');
    }
  };

  return (
    <div>
      <h2>Data Management</h2>
      
      {/* Export button */}
      <button onClick={handleExport}>
        Export Data
      </button>

      {/* Import file input */}
      <input
        type="file"
        accept=".json"
        onChange={handleImport}
      />
    </div>
  );
}

/**
 * Example: Programmatic backup before major operations
 * 
 * This shows how to create automatic backups before risky operations.
 */
export async function createBackupBeforeOperation(): Promise<ExportData> {
  try {
    // Create backup
    const backup = await exportUserData();
    
    // Store in localStorage as emergency backup
    localStorage.setItem('athleteos-emergency-backup', JSON.stringify(backup));
    
    console.log('Emergency backup created');
    return backup;
  } catch (error) {
    console.error('Failed to create backup:', error);
    throw error;
  }
}

/**
 * Example: Restore from emergency backup
 */
export async function restoreFromEmergencyBackup(): Promise<void> {
  try {
    const backupString = localStorage.getItem('athleteos-emergency-backup');
    
    if (!backupString) {
      throw new Error('No emergency backup found');
    }

    const backup: ExportData = JSON.parse(backupString);
    await importUserData(backup);
    
    console.log('Restored from emergency backup');
  } catch (error) {
    console.error('Failed to restore from backup:', error);
    throw error;
  }
}
