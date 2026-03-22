/**
 * Supplement Service Tests
 * 
 * Tests for supplement CRUD operations and daily checklist functionality.
 * Requirements: 11.4, 14.1, 14.2, 14.3
 */

import { initDB, deleteDB } from '../db';
import {
  addSupplement,
  getActiveSupplements,
  deactivateSupplement,
  getTodayChecklist,
  markSupplementTaken,
} from '../services/supplementService';
import type { SupplementEntry } from '../types/db';

describe('Supplement Service', () => {
  beforeEach(async () => {
    // Clean up database before each test
    await deleteDB();
    await initDB();
  });

  afterAll(async () => {
    // Clean up after all tests
    await deleteDB();
  });

  describe('addSupplement', () => {
    it('should add a new supplement with all required fields', async () => {
      const supplementData: Omit<SupplementEntry, 'id' | 'createdAt' | 'updatedAt'> = {
        name: 'Vitamin D3',
        dosage: '5000 IU',
        frequency: 'daily',
        timing: 'morning',
        safetyNotes: 'Generally safe. Consult doctor if taking high doses.',
        effectiveness: 'Supports bone health and immune function.',
        active: true,
      };

      const result = await addSupplement(supplementData);

      expect(result.id).toBeDefined();
      expect(result.name).toBe('Vitamin D3');
      expect(result.dosage).toBe('5000 IU');
      expect(result.frequency).toBe('daily');
      expect(result.timing).toBe('morning');
      expect(result.active).toBe(true);
      expect(result.createdAt).toBeDefined();
      expect(result.updatedAt).toBeDefined();
    });

    it('should generate unique IDs for multiple supplements', async () => {
      const supplement1 = await addSupplement({
        name: 'Vitamin D3',
        dosage: '5000 IU',
        frequency: 'daily',
        timing: 'morning',
        safetyNotes: 'Safe',
        effectiveness: 'Effective',
        active: true,
      });

      const supplement2 = await addSupplement({
        name: 'Omega-3',
        dosage: '1000 mg',
        frequency: 'daily',
        timing: 'with meals',
        safetyNotes: 'Safe',
        effectiveness: 'Effective',
        active: true,
      });

      expect(supplement1.id).not.toBe(supplement2.id);
    });
  });

  describe('getActiveSupplements', () => {
    it('should return only active supplements', async () => {
      // Add active supplement
      await addSupplement({
        name: 'Vitamin D3',
        dosage: '5000 IU',
        frequency: 'daily',
        timing: 'morning',
        safetyNotes: 'Safe',
        effectiveness: 'Effective',
        active: true,
      });

      // Add inactive supplement
      await addSupplement({
        name: 'Omega-3',
        dosage: '1000 mg',
        frequency: 'daily',
        timing: 'with meals',
        safetyNotes: 'Safe',
        effectiveness: 'Effective',
        active: false,
      });

      const activeSupplements = await getActiveSupplements();

      expect(activeSupplements).toHaveLength(1);
      expect(activeSupplements[0].name).toBe('Vitamin D3');
      expect(activeSupplements[0].active).toBe(true);
    });

    it('should return empty array when no active supplements exist', async () => {
      const activeSupplements = await getActiveSupplements();
      expect(activeSupplements).toHaveLength(0);
    });

    it('should return multiple active supplements', async () => {
      await addSupplement({
        name: 'Vitamin D3',
        dosage: '5000 IU',
        frequency: 'daily',
        timing: 'morning',
        safetyNotes: 'Safe',
        effectiveness: 'Effective',
        active: true,
      });

      await addSupplement({
        name: 'Omega-3',
        dosage: '1000 mg',
        frequency: 'daily',
        timing: 'with meals',
        safetyNotes: 'Safe',
        effectiveness: 'Effective',
        active: true,
      });

      const activeSupplements = await getActiveSupplements();
      expect(activeSupplements).toHaveLength(2);
    });
  });

  describe('deactivateSupplement', () => {
    it('should deactivate an active supplement', async () => {
      const supplement = await addSupplement({
        name: 'Vitamin D3',
        dosage: '5000 IU',
        frequency: 'daily',
        timing: 'morning',
        safetyNotes: 'Safe',
        effectiveness: 'Effective',
        active: true,
      });

      await deactivateSupplement(supplement.id);

      const activeSupplements = await getActiveSupplements();
      expect(activeSupplements).toHaveLength(0);
    });

    it('should throw error when supplement ID does not exist', async () => {
      await expect(deactivateSupplement('non-existent-id')).rejects.toThrow(
        'Supplement with id non-existent-id not found'
      );
    });

    it('should update the updatedAt timestamp when deactivating', async () => {
      const supplement = await addSupplement({
        name: 'Vitamin D3',
        dosage: '5000 IU',
        frequency: 'daily',
        timing: 'morning',
        safetyNotes: 'Safe',
        effectiveness: 'Effective',
        active: true,
      });

      const originalUpdatedAt = supplement.updatedAt;

      // Wait a bit to ensure timestamp difference
      await new Promise((resolve) => setTimeout(resolve, 10));

      await deactivateSupplement(supplement.id);

      // Verify by checking the database directly
      const db = await initDB();
      const transaction = db.transaction('supplements', 'readonly');
      const store = transaction.objectStore('supplements');
      const getRequest = store.get(supplement.id);

      const updatedSupplement = await new Promise<SupplementEntry>((resolve) => {
        getRequest.onsuccess = () => resolve(getRequest.result);
      });

      expect(updatedSupplement.updatedAt).not.toBe(originalUpdatedAt);
      expect(updatedSupplement.active).toBe(false);
    });
  });

  describe('getTodayChecklist', () => {
    it('should return active supplements with taken status false when no checklist entries exist', async () => {
      await addSupplement({
        name: 'Vitamin D3',
        dosage: '5000 IU',
        frequency: 'daily',
        timing: 'morning',
        safetyNotes: 'Safe',
        effectiveness: 'Effective',
        active: true,
      });

      const checklist = await getTodayChecklist('2024-01-15');

      expect(checklist).toHaveLength(1);
      expect(checklist[0].name).toBe('Vitamin D3');
      expect(checklist[0].taken).toBe(false);
    });

    it('should return active supplements with taken status true when marked as taken', async () => {
      const supplement = await addSupplement({
        name: 'Vitamin D3',
        dosage: '5000 IU',
        frequency: 'daily',
        timing: 'morning',
        safetyNotes: 'Safe',
        effectiveness: 'Effective',
        active: true,
      });

      await markSupplementTaken(supplement.id, '2024-01-15');

      const checklist = await getTodayChecklist('2024-01-15');

      expect(checklist).toHaveLength(1);
      expect(checklist[0].name).toBe('Vitamin D3');
      expect(checklist[0].taken).toBe(true);
    });

    it('should return empty array when no active supplements exist', async () => {
      const checklist = await getTodayChecklist('2024-01-15');
      expect(checklist).toHaveLength(0);
    });

    it('should return multiple supplements with mixed taken status', async () => {
      const supplement1 = await addSupplement({
        name: 'Vitamin D3',
        dosage: '5000 IU',
        frequency: 'daily',
        timing: 'morning',
        safetyNotes: 'Safe',
        effectiveness: 'Effective',
        active: true,
      });

      const supplement2 = await addSupplement({
        name: 'Omega-3',
        dosage: '1000 mg',
        frequency: 'daily',
        timing: 'with meals',
        safetyNotes: 'Safe',
        effectiveness: 'Effective',
        active: true,
      });

      // Mark only the first supplement as taken
      await markSupplementTaken(supplement1.id, '2024-01-15');

      const checklist = await getTodayChecklist('2024-01-15');

      expect(checklist).toHaveLength(2);
      
      const vitaminD = checklist.find((s) => s.name === 'Vitamin D3');
      const omega3 = checklist.find((s) => s.name === 'Omega-3');

      expect(vitaminD?.taken).toBe(true);
      expect(omega3?.taken).toBe(false);
    });

    it('should not include deactivated supplements in checklist', async () => {
      const supplement = await addSupplement({
        name: 'Vitamin D3',
        dosage: '5000 IU',
        frequency: 'daily',
        timing: 'morning',
        safetyNotes: 'Safe',
        effectiveness: 'Effective',
        active: true,
      });

      await deactivateSupplement(supplement.id);

      const checklist = await getTodayChecklist('2024-01-15');
      expect(checklist).toHaveLength(0);
    });
  });

  describe('markSupplementTaken', () => {
    it('should create a new checklist entry when marking supplement as taken', async () => {
      const supplement = await addSupplement({
        name: 'Vitamin D3',
        dosage: '5000 IU',
        frequency: 'daily',
        timing: 'morning',
        safetyNotes: 'Safe',
        effectiveness: 'Effective',
        active: true,
      });

      await markSupplementTaken(supplement.id, '2024-01-15');

      const checklist = await getTodayChecklist('2024-01-15');
      expect(checklist[0].taken).toBe(true);
    });

    it('should update existing checklist entry when marking supplement as taken again', async () => {
      const supplement = await addSupplement({
        name: 'Vitamin D3',
        dosage: '5000 IU',
        frequency: 'daily',
        timing: 'morning',
        safetyNotes: 'Safe',
        effectiveness: 'Effective',
        active: true,
      });

      // Mark as taken first time
      await markSupplementTaken(supplement.id, '2024-01-15');

      // Mark as taken again (should update, not create duplicate)
      await markSupplementTaken(supplement.id, '2024-01-15');

      const checklist = await getTodayChecklist('2024-01-15');
      expect(checklist).toHaveLength(1);
      expect(checklist[0].taken).toBe(true);
    });

    it('should handle different dates independently', async () => {
      const supplement = await addSupplement({
        name: 'Vitamin D3',
        dosage: '5000 IU',
        frequency: 'daily',
        timing: 'morning',
        safetyNotes: 'Safe',
        effectiveness: 'Effective',
        active: true,
      });

      await markSupplementTaken(supplement.id, '2024-01-15');
      await markSupplementTaken(supplement.id, '2024-01-16');

      const checklist15 = await getTodayChecklist('2024-01-15');
      const checklist16 = await getTodayChecklist('2024-01-16');

      expect(checklist15[0].taken).toBe(true);
      expect(checklist16[0].taken).toBe(true);
    });

    it('should set takenAt timestamp when marking supplement as taken', async () => {
      const supplement = await addSupplement({
        name: 'Vitamin D3',
        dosage: '5000 IU',
        frequency: 'daily',
        timing: 'morning',
        safetyNotes: 'Safe',
        effectiveness: 'Effective',
        active: true,
      });

      await markSupplementTaken(supplement.id, '2024-01-15');

      // Verify by checking the database directly
      const db = await initDB();
      const transaction = db.transaction('supplementChecklist', 'readonly');
      const store = transaction.objectStore('supplementChecklist');
      const index = store.index('date_supplementId');
      const getRequest = index.get(['2024-01-15', supplement.id]);

      const checklistEntry = await new Promise<any>((resolve) => {
        getRequest.onsuccess = () => resolve(getRequest.result);
      });

      expect(checklistEntry.takenAt).toBeDefined();
      expect(checklistEntry.taken).toBe(true);
    });
  });
});
