const LB_PER_KG = 2.20462
const CM_PER_INCH = 2.54

export function lbToKg(lb) {
  return lb / LB_PER_KG
}

export function kgToLb(kg) {
  return kg * LB_PER_KG
}

export function feetInchesToCm(feet, inches) {
  return (feet * 12 + inches) * CM_PER_INCH
}

export function cmToFeetInches(cm) {
  const totalInches = cm / CM_PER_INCH
  const feet = Math.floor(totalInches / 12)
  const inches = Math.round(totalInches - feet * 12)
  return { feet, inches }
}
