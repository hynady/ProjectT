interface PasswordCriteria {
  length: boolean;
  hasNumber: boolean;
  hasLower: boolean;
  hasUpper: boolean;
  hasSpecial: boolean;
}

interface PasswordStrengthResult {
  score: number;
  criteria: PasswordCriteria;
}

export const checkPasswordStrength = (pass: string): PasswordStrengthResult => {
  let score = 0;
  const criteria: PasswordCriteria = {
    length: pass.length >= 8,
    hasNumber: /\d/.test(pass),
    hasLower: /[a-z]/.test(pass),
    hasUpper: /[A-Z]/.test(pass),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(pass)
  };

  Object.values(criteria).forEach(isMatch => {
    if (isMatch) score += 20;
  });

  return { score, criteria };
};