import { z } from "zod";

export const careerGuidanceSchema = z.object({
  summary: z.string().describe("A brief, encouraging summary of the user's skill set and their general job title."),
  jobOptions: z.array(
    z.object({
      title: z.string().describe("The name of the job role."),
      responsibilities: z.string().describe("A description of what the user would do in this role."),
      why: z.string().describe("An explanation of why this role is a good fit for their skills.")
    })
  ).describe("Suggested job options based on the user's skills."),
  skillsToLearn: z.array(
    z.object({
      category: z.string().describe("A general category for skill improvement (e.g., 'Deepen Your Existing Stack Mastery', 'DevOps & Cloud')."),
      skills: z.array(
        z.object({
          title: z.string().describe("The name of the skill to learn."),
          why: z.string().describe("Why learning this skill is important."),
          how: z.string().describe("Specific examples of how to learn or apply this skill.")
        })
      ).describe("List of skills within this category.")
    })
  ).describe("Recommended skills to learn or improve."),
  learningApproach: z.object({
    title: z.string().describe("How to approach learning (e.g., 'How to Approach Learning')."),
    points: z.array(z.string()).describe("A list of actionable advice points for learning.")
  }).describe("General advice on how to approach learning these skills.")
});

export type CareerGuidance = z.infer<typeof careerGuidanceSchema>;
