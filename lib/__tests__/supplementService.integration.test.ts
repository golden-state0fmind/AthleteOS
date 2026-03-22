/**
 * Supplement Service Integration Tests
 * 
 * End-to-end tests for supplement service functionality.
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

describe('Supplement Service Integration', () => {
  beforeEach(async () => {
    await deleteDB();
    await initDB();
  });

  afterAll(async () => {
    await deleteDB();
  });

  it('should handle complete supplement lifecycle', async () => {
    // Add a supplement
    const supplement = await addSupplement({
      name: 'Vitamin D3',
      dosage: '5000 IU',
      frequency: 'daily',
      timing: 'morning',
      safetyNotes: 'Generally safe. Consult doctor if taking high doses.',
      effectiveness: 'Supports bone health and immune function.',
      active: true,
    });

    expect(supplement.id).toBeDefined();

    // Verify it appears in active supplements
    let activeSupplements = await getActiveSupplements();
    expect(activeSupplements).toHaveLength(1);
    expect(activeSupplements[0].name).toBe('Vitamin D3');

    // Check today's checklist (should show as not taken)
    const today = '2024-01-15';
    let checklist = await getTodayChecklist(today);
    expect(checklist).toHaveLength(1);
    expect(checklist[0].taken).toBe(false);

    // Mark as taken
    await markSupplementTaken(supplement.id, today);

    // Verify checklist shows as taken
    checklist = await getTodayChecklist(today);
    expect(checklist).toHaveLength(1);
    expect(checklist[0].taken).toBe(true);

    // Deactivate supplement
    await deactivateSupplement(supplement.id);

    // Verify it no longer appears in active supplements
    activeSupplements = await getActiveSupplements();
    expect(activeSupplements).toHaveLength(0);

    // Verify it no longer appears in checklist
    checklist = await getTodayChecklist(today);
    expect(checklist).toHaveLength(0);
  });

  it('should handle multiple supplements with different schedules', async () => {
    // Add multiple supplements
    const vitaminD = await addSupplement({
      name: 'Vitamin D3',
      dosage: '5000 IU',
      frequency: 'daily',
      timing: 'morning',
      safetyNotes: 'Safe',
      effectiveness: 'Effective',
      active: true,
    });

    const omega3 = await addSupplement({
      name: 'Omega-3',
      dosage: '1000 mg',
      frequency: 'twice_daily',
      timing: 'with meals',
      safetyNotes: 'Safe',
      effectiveness: 'Effective',
      active: true,
    });

    const magnesium = await addSupplement({
      name: 'Magnesium',
      dosage: '400 mg',
      frequency: 'daily',
      timing: 'evening',
      safetyNotes: 'Safe',
      effectiveness: 'Effective',
      active: true,
    });

    // Verify all appear in active supplements
    const activeSupplements = await getActiveSupplements();
    expect(activeSupplements).toHaveLength(3);

    // Check today's checklist
    const today = '2024-01-15';
    let checklist = await getTodayChecklist(today);
    expect(checklist).toHaveLength(3);
    expect(checklist.every((s) => !s.taken)).toBe(true);

    // Mark some as taken
    await markSupplementTaken(vitaminD.id, today);
    await markSupplementTaken(omega3.id, today);

    // Verify checklist reflects taken status
    checklist = await getTodayChecklist(today);
    expect(checklist).toHaveLength(3);

    const vitaminDChecklist = checklist.find((s) => s.name === 'Vitamin D3');
    const omega3Checklist = checklist.find((s) => s.name === 'Omega-3');
    const magnesiumChecklist = checklist.find((s) => s.name === 'Magnesium');

    expect(vitaminDChecklist?.taken).toBe(true);
    expect(omega3Checklist?.taken).toBe(true);
    expect(magnesiumChecklist?.taken).toBe(false);
  });

  it('should handle checklist across multiple days', async () => {
    const supplement = await addSupplement({
      name: 'Vitamin D3',
      dosage: '5000 IU',
      frequency: 'daily',
      timing: 'morning',
      safetyNotes: 'Safe',
      effectiveness: 'Effective',
      active: true,
    });

    // Mark as taken on different days
    await markSupplementTaken(supplement.id, '2024-01-15');
    await markSupplementTaken(supplement.id, '2024-01-16');

    // Verify each day's checklist is independent
    const checklist15 = await getTodayChecklist('2024-01-15');
    const checklist16 = await getTodayChecklist('2024-01-16');
    const checklist17 = await getTodayChecklist('2024-01-17');

    expect(checklist15[0].taken).toBe(true);
    expect(checklist16[0].taken).toBe(true);
    expect(checklist17[0].taken).toBe(false);
  });
});
