export interface JobRequirements {
  title: string;
  skills: string[];
  experienceRequired: string; // e.g. "5+ years" or "3 years"
  education: string;
}

export interface CandidateProfile {
  name: string;
  skills: string[];
  yearsOfExperience: number;
  education: string;
  experienceText: string;
}

export interface MatchResult {
  matchScore: number;
  recommendation: 'STRONG_MATCH' | 'MATCH' | 'PARTIAL_MATCH' | 'LOW_MATCH';
  matchedSkills: string[];
  missingSkills: string[];
  relevantExperience: string;
  potentialConcerns: string;
  matchExplanation: string;
}

export function matchCandidateToJob(candidate: CandidateProfile, job: JobRequirements): MatchResult {
  // Normalize skills lists
  const candidateSkillsLower = candidate.skills.map((s) => s.toLowerCase());
  const jobSkills = job.skills.map((s) => s.trim());

  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];

  jobSkills.forEach((skill) => {
    if (candidateSkillsLower.includes(skill.toLowerCase())) {
      matchedSkills.push(skill);
    } else {
      missingSkills.push(skill);
    }
  });

  // Calculate experience requirement from string
  const requiredExpMatch = job.experienceRequired.match(/(\d+)/);
  const requiredYears = requiredExpMatch ? parseInt(requiredExpMatch[1], 10) : 2;

  // Skills match percentage (weight: 60%)
  const skillsScore = jobSkills.length > 0 ? (matchedSkills.length / jobSkills.length) * 100 : 80;

  // Experience match percentage (weight: 40%)
  let experienceScore = 100;
  if (candidate.yearsOfExperience < requiredYears) {
    // Deduct points for missing experience
    const deficit = requiredYears - candidate.yearsOfExperience;
    experienceScore = Math.max(30, 100 - deficit * 20);
  } else {
    // Add small bonus for exceeding experience
    experienceScore = Math.min(100, 100 + (candidate.yearsOfExperience - requiredYears) * 5);
  }

  // Calculate overall score
  const matchScore = Math.round(skillsScore * 0.6 + experienceScore * 0.4);

  // Recommendations and potential concerns
  let recommendation: 'STRONG_MATCH' | 'MATCH' | 'PARTIAL_MATCH' | 'LOW_MATCH' = 'LOW_MATCH';
  let potentialConcerns = 'None identified. The candidate has relevant skills and experience matching the requirements.';
  let relevantExperience = `Candidate has ${candidate.yearsOfExperience} years of experience, aligning well with the requested ${job.experienceRequired}.`;

  if (matchScore >= 85) {
    recommendation = 'STRONG_MATCH';
  } else if (matchScore >= 70) {
    recommendation = 'MATCH';
  } else if (matchScore >= 50) {
    recommendation = 'PARTIAL_MATCH';
    if (missingSkills.length > 2) {
      potentialConcerns = `Candidate is missing key skills: ${missingSkills.slice(0, 3).join(', ')}.`;
    }
    if (candidate.yearsOfExperience < requiredYears) {
      relevantExperience = `Candidate has ${candidate.yearsOfExperience} years of experience, which is below the requested ${job.experienceRequired}.`;
      potentialConcerns += ' Years of experience are less than required.';
    }
  } else {
    recommendation = 'LOW_MATCH';
    potentialConcerns = `Significant skills gap. Missing: ${missingSkills.join(', ')}.`;
    if (candidate.yearsOfExperience < requiredYears) {
      relevantExperience = `Candidate has ${candidate.yearsOfExperience} years of experience, falling short of the required ${job.experienceRequired}.`;
    }
  }

  // Explanation
  const matchExplanation = `Candidate matches ${matchedSkills.length} out of ${jobSkills.length} required skills. ${relevantExperience} Recommended action: ${
    recommendation === 'STRONG_MATCH' || recommendation === 'MATCH' ? 'Shortlist and advance to screening' : 'Review for potential fit or rejection'
  }.`;

  return {
    matchScore,
    recommendation,
    matchedSkills,
    missingSkills,
    relevantExperience,
    potentialConcerns,
    matchExplanation,
  };
}
