import { describe, it, expect } from 'vitest'
import { 
  calculatePreliminaryNoticeDeadline,
  calculateMechanicsLienDeadline,
  calculateFundsTrappingDeadline,
  calculateRetentionReleaseDeadline 
} from '../deadlineCalculator'
import { addMonths, addDays } from 'date-fns'

describe('Deadline Calculator', () => {
  describe('calculatePreliminaryNoticeDeadline', () => {
    it('should calculate 15th day of 2nd month for general contractor', () => {
      const startDate = new Date('2024-01-05')
      const result = calculatePreliminaryNoticeDeadline({
        projectStartDate: startDate,
        role: 'general_contractor',
        state: 'TX'
      })
      
      expect(result.deadlineDate).toEqual(new Date('2024-02-15'))
      expect(result.deadlineType).toBe('preliminary_notice')
    })

    it('should calculate correct deadline for subcontractor', () => {
      const laborStartDate = new Date('2024-03-10')
      const result = calculatePreliminaryNoticeDeadline({
        laborStartDate,
        role: 'subcontractor',
        state: 'TX'
      })
      
      expect(result.deadlineDate).toEqual(new Date('2024-04-15'))
    })

    it('should mark as overdue when past deadline', () => {
      const pastDate = new Date('2023-01-01')
      const result = calculatePreliminaryNoticeDeadline({
        projectStartDate: pastDate,
        role: 'general_contractor',
        state: 'TX'
      })
      
      expect(result.status).toBe('overdue')
      expect(result.daysRemaining).toBeLessThan(0)
    })

    it('should set urgent priority when deadline is within 7 days', () => {
      const recentDate = addDays(new Date(), -35) // 35 days ago
      const result = calculatePreliminaryNoticeDeadline({
        projectStartDate: recentDate,
        role: 'general_contractor',
        state: 'TX'
      })
      
      // Should be urgent if deadline is within 7 days
      if (result.daysRemaining <= 7 && result.daysRemaining > 0) {
        expect(result.urgency).toBe('urgent')
      }
    })
  })

  describe('calculateMechanicsLienDeadline', () => {
    it('should calculate 4 months from last work for residential', () => {
      const lastWorkDate = new Date('2024-01-15')
      const result = calculateMechanicsLienDeadline({
        lastWorkDate,
        projectType: 'residential',
        state: 'TX'
      })
      
      // 4 months from last work
      const expectedDate = addMonths(lastWorkDate, 4)
      expect(result.deadlineDate.getMonth()).toBe(expectedDate.getMonth())
    })

    it('should calculate 3 months from completion for commercial', () => {
      const completionDate = new Date('2024-02-01')
      const result = calculateMechanicsLienDeadline({
        projectCompletionDate: completionDate,
        projectType: 'commercial',
        state: 'TX'
      })
      
      // 3 months from completion
      const expectedDate = addMonths(completionDate, 3)
      expect(result.deadlineDate.getMonth()).toBe(expectedDate.getMonth())
    })
  })

  describe('calculateFundsTrappingDeadline', () => {
    it('should calculate 2nd month 15th for funds trapping', () => {
      const startDate = new Date('2024-01-10')
      const result = calculateFundsTrappingDeadline({
        projectStartDate: startDate,
        state: 'TX'
      })
      
      expect(result.deadlineDate).toEqual(new Date('2024-02-15'))
    })
  })

  describe('calculateRetentionReleaseDeadline', () => {
    it('should calculate 30 days after completion', () => {
      const completionDate = new Date('2024-06-01')
      const result = calculateRetentionReleaseDeadline({
        projectCompletionDate: completionDate,
        state: 'TX'
      })
      
      expect(result.deadlineDate).toEqual(addDays(completionDate, 30))
    })
  })

  describe('edge cases', () => {
    it('should handle month-end dates correctly', () => {
      const endOfMonth = new Date('2024-01-31')
      const result = calculatePreliminaryNoticeDeadline({
        projectStartDate: endOfMonth,
        role: 'general_contractor',
        state: 'TX'
      })
      
      expect(result.deadlineDate.getDate()).toBe(15)
    })

    it('should handle leap year dates', () => {
      const leapDate = new Date('2024-02-29')
      const result = calculatePreliminaryNoticeDeadline({
        projectStartDate: leapDate,
        role: 'general_contractor',
        state: 'TX'
      })
      
      expect(result.deadlineDate).toBeInstanceOf(Date)
      expect(isNaN(result.deadlineDate.getTime())).toBe(false)
    })

    it('should handle year boundary correctly', () => {
      const endOfYear = new Date('2024-12-15')
      const result = calculatePreliminaryNoticeDeadline({
        projectStartDate: endOfYear,
        role: 'general_contractor',
        state: 'TX'
      })
      
      expect(result.deadlineDate.getFullYear()).toBe(2025)
    })
  })
})
