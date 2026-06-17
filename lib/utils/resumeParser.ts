import { PDFParse } from 'pdf-parse';

const SKILLS_DICTIONARY = [
  // Languages
  "javascript", "typescript", "python", "java", "c++", "c#", "go", "rust", "ruby", "php", "swift", "kotlin", "html", "css", "sql", "bash",
  // Frameworks/Libs
  "react", "next.js", "node.js", "express", "nestjs", "django", "flask", "spring boot", "laravel", "vue", "angular", "svelte", "tailwind", "bootstrap",
  // Databases
  "mongodb", "postgresql", "mysql", "redis", "elasticsearch", "cassandra", "dynamodb", "supabase", "firebase",
  // Cloud & DevOps
  "aws", "gcp", "azure", "docker", "kubernetes", "terraform", "ansible", "jenkins", "github actions", "gitlab ci", "vercel", "heroku",
  // Architecture & Tools
  "graphql", "rest api", "grpc", "microservices", "kafka", "rabbitmq", "git", "linux", "jira", "agile", "scrum"
];

export async function parseResumeBuffer(buffer: Buffer): Promise<{
  extractedSkills: string[];
  experienceSummary: string | null;
}> {
  try {
    const parser = new PDFParse({ data: buffer });
    const data = await parser.getText();
    const text = data.text.toLowerCase();

    // 1. Extract Skills
    const extractedSkills = new Set<string>();
    for (const skill of SKILLS_DICTIONARY) {
      // Use word boundary to prevent partial matches (e.g., 'go' matching in 'good')
      // Note: ++ and # are tricky in regex boundary, so we escape them carefully or just use simple indexOf for special chars
      if (skill === "c++" || skill === "c#") {
        if (text.includes(skill)) extractedSkills.add(skill);
      } else {
        const regex = new RegExp(`\\b${skill.replace(/\./g, '\\.')}\\b`, 'i');
        if (regex.test(text)) {
          extractedSkills.add(skill);
        }
      }
    }

    // 2. Guess Experience
    // Look for patterns like "5 years of experience", "5+ years", etc.
    let experienceSummary: string | null = null;
    const expRegex = /(\d+)\+?\s*years?\s+(?:of\s+)?experience/i;
    const match = text.match(expRegex);
    if (match && match[1]) {
      experienceSummary = `${match[1]} years`;
    }

    return {
      extractedSkills: Array.from(extractedSkills),
      experienceSummary,
    };
  } catch (error) {
    console.error("Error parsing PDF resume:", error);
    return {
      extractedSkills: [],
      experienceSummary: null,
    };
  }
}
