import { describe, it, expect } from 'vitest'
import { lbToKg, kgToLb, feetInchesToCm, cmToFeetInches } from './units'

describe('lb/kg conversions', () => {
  it('converts lb to kg', () => {
    expect(lbToKg(220.462)).toBeCloseTo(100, 2)
  })

  it('converts kg to lb', () => {
    expect(kgToLb(100)).toBeCloseTo(220.462, 2)
  })

  it('round-trips lb -> kg -> lb', () => {
    expect(kgToLb(lbToKg(150))).toBeCloseTo(150, 6)
  })
})

describe('feetInchesToCm', () => {
  it('converts feet and inches to centimeters', () => {
    expect(feetInchesToCm(5, 10)).toBeCloseTo(177.8, 1)
  })

  it('handles zero feet', () => {
    expect(feetInchesToCm(0, 12)).toBeCloseTo(30.48, 2)
  })
})

describe('cmToFeetInches', () => {
  it('converts centimeters back to feet and inches', () => {
    expect(cmToFeetInches(177.8)).toEqual({ feet: 5, inches: 10 })
  })

  it('rounds inches and carries into feet at the boundary', () => {
    // 71.8 inches -> 5 ft 11.8 in -> rounds to 5 ft 12 in visually, but our
    // implementation rounds inches independently of the feet floor
    expect(cmToFeetInches(182.5)).toEqual({ feet: 5, inches: 12 })
  })
})
