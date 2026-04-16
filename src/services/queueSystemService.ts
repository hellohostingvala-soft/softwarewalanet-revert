// Queue System Service
// Job queue with retry + dead-letter queue (DLQ)

export interface Job {
  id: string;
  type: string;
  payload: any;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'dead';
  retryCount: number;
  maxRetries: number;
  nextRetryAt?: Date;
  createdAt: Date;
  processedAt?: Date;
  completedAt?: Date;
  failedAt?: Date;
  error?: string;
  metadata?: any;
}

// In-memory queues
const jobQueue: Map<string, Job> = new Map();
const deadLetterQueue: Map<string, Job> = new Map();

// Retry policy
const RETRY_DELAYS = [1000, 5000, 15000, 60000, 300000]; // Exponential backoff

/**
 * Add job to queue
 */
export function addJob(type: string, payload: any, maxRetries: number = 5): Job {
  const job: Job = {
    id: crypto.randomUUID(),
    type,
    payload,
    status: 'pending',
    retryCount: 0,
    maxRetries,
    createdAt: new Date(),
  };

  jobQueue.set(job.id, job);

  console.log(`[Queue] Job added: ${job.id} (${type})`);

  return job;
}

/**
 * Process next job
 */
export async function processNextJob(type?: string): Promise<Job | null> {
  const jobs = Array.from(jobQueue.values())
    .filter(j => j.status === 'pending' && (!type || j.type === type))
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

  if (jobs.length === 0) {
    return null;
  }

  const job = jobs[0];
  return await processJob(job.id);
}

/**
 * Process job by ID
 */
export async function processJob(jobId: string): Promise<Job> {
  const job = jobQueue.get(jobId);
  if (!job) {
    throw new Error('Job not found');
  }

  if (job.status !== 'pending' && job.status !== 'processing') {
    throw new Error(`Job is ${job.status}, cannot process`);
  }

  // Update status to processing
  job.status = 'processing';
  job.processedAt = new Date();
  jobQueue.set(jobId, job);

  try {
    // Execute job (this would call the actual job handler)
    console.log(`[Queue] Processing job: ${job.id} (${job.type})`);
    
    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 100));

    // Mark as completed
    job.status = 'completed';
    job.completedAt = new Date();
    jobQueue.set(jobId, job);

    console.log(`[Queue] Job completed: ${job.id}`);

    // Remove from queue after completion
    setTimeout(() => {
      jobQueue.delete(jobId);
    }, 60000); // Keep for 1 minute for inspection

    return job;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    job.retryCount++;
    job.error = errorMessage;

    if (job.retryCount >= job.maxRetries) {
      // Move to dead letter queue
      job.status = 'dead';
      job.failedAt = new Date();
      deadLetterQueue.set(jobId, job);
      jobQueue.delete(jobId);

      console.error(`[Queue] Job moved to DLQ: ${job.id} (${errorMessage})`);
    } else {
      // Schedule retry
      job.status = 'pending';
      const delay = RETRY_DELAYS[Math.min(job.retryCount - 1, RETRY_DELAYS.length - 1)];
      job.nextRetryAt = new Date(Date.now() + delay);

      console.log(`[Queue] Job scheduled for retry: ${job.id} (attempt ${job.retryCount}/${job.maxRetries}) in ${delay}ms`);
    }

    jobQueue.set(jobId, job);
    throw error;
  }
}

/**
 * Get job by ID
 */
export function getJob(jobId: string): Job | null {
  return jobQueue.get(jobId) || deadLetterQueue.get(jobId) || null;
}

/**
 * Get all jobs
 */
export function getJobs(type?: string, status?: Job['status']): Job[] {
  let jobs = Array.from(jobQueue.values());

  if (type) {
    jobs = jobs.filter(j => j.type === type);
  }

  if (status) {
    jobs = jobs.filter(j => j.status === status);
  }

  return jobs;
}

/**
 * Get dead letter queue
 */
export function getDeadLetterQueue(): Job[] {
  return Array.from(deadLetterQueue.values());
}

/**
 * Retry dead letter job
 */
export async function retryDeadLetterJob(jobId: string): Promise<Job> {
  const job = deadLetterQueue.get(jobId);
  if (!job) {
    throw new Error('Job not found in DLQ');
  }

  // Reset job
  job.status = 'pending';
  job.retryCount = 0;
  job.error = undefined;
  job.nextRetryAt = undefined;
  job.processedAt = undefined;
  job.failedAt = undefined;

  // Move back to main queue
  deadLetterQueue.delete(jobId);
  jobQueue.set(jobId, job);

  console.log(`[Queue] Job retried from DLQ: ${job.id}`);

  return job;
}

/**
 * Delete job from DLQ
 */
export function deleteDeadLetterJob(jobId: string): void {
  const job = deadLetterQueue.get(jobId);
  deadLetterQueue.delete(jobId);
  console.log(`[Queue] Job deleted from DLQ: ${jobId}`);
}

/**
 * Clear queue
 */
export function clearQueue(type?: string): void {
  if (type) {
    const jobsToDelete = Array.from(jobQueue.entries())
      .filter(([_, queueJob]) => queueJob.type === type)
      .map(([id]) => id);
    
    jobsToDelete.forEach(id => jobQueue.delete(id));
  } else {
    jobQueue.clear();
  }
}

/**
 * Get queue stats
 */
export function getQueueStats(): {
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  dead: number;
} {
  const queueJobs = Array.from(jobQueue.values());
  const dead = deadLetterQueue.size;

  return {
    pending: queueJobs.filter(j => j.status === 'pending').length,
    processing: queueJobs.filter(j => j.status === 'processing').length,
    completed: queueJobs.filter(j => j.status === 'completed').length,
    failed: queueJobs.filter(j => j.status === 'failed').length,
    dead,
  };
}
