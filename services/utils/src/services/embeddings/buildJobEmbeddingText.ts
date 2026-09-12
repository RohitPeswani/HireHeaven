export interface JobEmbeddingInput {
  title?: string | null;
  role?: string | null;
  description?: string | null;
  companyName?: string | null;
  city?: string | null;
  state?: string | null;
  jobType?: string | null;
  workLocation?: string | null;
}

/**
 * Converts job information into a structured semantic text representation suitable for embeddings.
 * Handles missing or empty fields safely without generating 'undefined' placeholders.
 *
 * @param job The input job data
 * @returns A structured semantic string representation of the job
 */
export function buildJobEmbeddingText(job: JobEmbeddingInput): string {
  if (!job) {
    return "";
  }

  const isNonEmpty = (val?: string | null): val is string =>
    typeof val === "string" && val.trim().length > 0;

  const headerLines: string[] = [];
  if (isNonEmpty(job.title)) {
    headerLines.push(`Job Title: ${job.title.trim()}`);
  }
  if (isNonEmpty(job.role)) {
    headerLines.push(`Role: ${job.role.trim()}`);
  }
  if (isNonEmpty(job.companyName)) {
    headerLines.push(`Company: ${job.companyName.trim()}`);
  }

  const detailLines: string[] = [];

  const hasCity = isNonEmpty(job.city);
  const hasState = isNonEmpty(job.state);
  if (hasCity && hasState) {
    detailLines.push(`Location: ${job.city?.trim()}, ${job.state?.trim()}`);
  } else if (hasCity) {
    detailLines.push(`Location: ${job.city?.trim()}`);
  } else if (hasState) {
    detailLines.push(`Location: ${job.state?.trim()}`);
  }

  if (isNonEmpty(job.workLocation)) {
    detailLines.push(`Work Mode: ${job.workLocation.trim()}`);
  }
  if (isNonEmpty(job.jobType)) {
    detailLines.push(`Employment Type: ${job.jobType.trim()}`);
  }

  const sections: string[] = [];

  if (headerLines.length > 0) {
    sections.push(headerLines.join("\n"));
  }
  if (detailLines.length > 0) {
    sections.push(detailLines.join("\n"));
  }
  if (isNonEmpty(job.description)) {
    sections.push(`Job Description:\n${job.description.trim()}`);
  }

  return sections.join("\n\n");
}
