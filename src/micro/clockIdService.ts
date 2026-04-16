// Clock/ID Micro Service
// UUIDv7 + monotonic guard + clock skew tolerance + snowflake fallback

interface ClockSkewConfig {
  toleranceMs: number; // ±5s default
  maxAdjustmentMs: number;
}

interface MonotonicGuard {
  lastTimestamp: number;
  sequence: number;
  maxSequence: number;
}

interface SnowflakeConfig {
  workerId: number;
  datacenterId: number;
  epoch: number;
}

class ClockIdService {
  private monotonicGuard: MonotonicGuard = {
    lastTimestamp: 0,
    sequence: 0,
    maxSequence: 4095,
  };

  private clockSkewConfig: ClockSkewConfig = {
    toleranceMs: 5000, // ±5s
    maxAdjustmentMs: 10000,
  };

  private snowflakeConfig: SnowflakeConfig = {
    workerId: 1,
    datacenterId: 1,
    epoch: 1704067200000, // 2024-01-01
  };

  private lastClockSync: number = Date.now();
  private clockOffset: number = 0;

  /**
   * Generate UUIDv7 with monotonic guard
   */
  generateUUIDv7(): string {
    const now = this.getMonotonicTimestamp();
    const timestamp = now;
    const randA = this.randomBytes(4);
    const randB = this.randomBytes(2);
    const randC = this.randomBytes(2);

    // UUIDv7 format: time_low (48) + time_mid (16) + time_high (4) + version (4) + clock_seq (8) + node (48)
    const timeLow = (timestamp & BigInt(0xFFFFFFFFFFFF)) >> BigInt(16);
    const timeMid = (timestamp & BigInt(0xFFFF));
    const timeHigh = (timestamp >> BigInt(48)) & BigInt(0x0FFF);
    const version = BigInt(0x7000); // Version 7
    const clockSeq = BigInt(randB);
    const node = BigInt(randA) << BigInt(16) | BigInt(randC);

    const hex = [
      this.padHex(timeLow, 12),
      this.padHex(timeMid, 4),
      this.padHex(timeHigh | version, 4),
      this.padHex(clockSeq, 4),
      this.padHex(node, 12),
    ].join('-');

    return hex;
  }

  /**
   * Get monotonic timestamp with guard
   */
  private getMonotonicTimestamp(): bigint {
    const now = Date.now();
    const adjustedNow = now + this.clockOffset;

    if (adjustedNow <= this.monotonicGuard.lastTimestamp) {
      // Clock went backward or same timestamp
      if (this.monotonicGuard.sequence < this.monotonicGuard.maxSequence) {
        this.monotonicGuard.sequence++;
      } else {
        // Sequence overflow, wait for next millisecond
        while (Date.now() + this.clockOffset <= this.monotonicGuard.lastTimestamp) {
          // Busy wait (in production, use exponential backoff)
        }
        this.monotonicGuard.sequence = 0;
        this.monotonicGuard.lastTimestamp = Date.now() + this.clockOffset;
      }
    } else {
      // Clock moved forward
      this.monotonicGuard.sequence = 0;
      this.monotonicGuard.lastTimestamp = adjustedNow;
    }

    return BigInt(this.monotonicGuard.lastTimestamp);
  }

  /**
   * Check and adjust for clock skew
   */
  checkClockSkew(referenceTime: number): { skewed: boolean; adjustment: number } {
    const now = Date.now();
    const diff = now - referenceTime;

    if (Math.abs(diff) > this.clockSkewConfig.toleranceMs) {
      // Clock skew detected
      const adjustment = Math.min(diff, this.clockSkewConfig.maxAdjustmentMs);
      this.clockOffset += adjustment;
      this.lastClockSync = now;

      console.warn(`[Clock Skew] Detected: ${diff}ms, adjusted by: ${adjustment}ms`);

      return { skewed: true, adjustment };
    }

    return { skewed: false, adjustment: 0 };
  }

  /**
   * Generate Snowflake ID (fallback)
   */
  generateSnowflakeId(): string {
    const now = Date.now() - this.snowflakeConfig.epoch;
    const workerIdBits = 5;
    const datacenterIdBits = 5;
    const sequenceBits = 12;

    const workerIdShift = sequenceBits;
    const datacenterIdShift = sequenceBits + workerIdBits;
    const timestampShift = sequenceBits + workerIdBits + datacenterIdBits;

    const timestamp = BigInt(now << timestampShift);
    const datacenterId = BigInt(this.snowflakeConfig.datacenterId << datacenterIdShift);
    const workerId = BigInt(this.snowflakeConfig.workerId << workerIdShift);
    const sequence = BigInt(this.monotonicGuard.sequence);

    const snowflake = timestamp | datacenterId | workerId | sequence;

    return snowflake.toString();
  }

  /**
   * Generate ID with fallback
   */
  generateId(): string {
    try {
      return this.generateUUIDv7();
    } catch (error) {
      console.error('[Clock ID] UUIDv7 failed, falling back to Snowflake:', error);
      return this.generateSnowflakeId();
    }
  }

  /**
   * Validate UUIDv7 format
   */
  validateUUIDv7(uuid: string): boolean {
    const uuidv7Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidv7Regex.test(uuid);
  }

  /**
   * Extract timestamp from UUIDv7
   */
  extractTimestamp(uuid: string): number | null {
    if (!this.validateUUIDv7(uuid)) return null;

    const parts = uuid.split('-');
    const timeLow = parseInt(parts[0], 16);
    const timeMid = parseInt(parts[1], 16);
    const timeHigh = parseInt(parts[2].substring(0, 3), 16);

    const timestamp = (BigInt(timeHigh) << BigInt(48)) | (BigInt(timeMid) << BigInt(32)) | BigInt(timeLow);

    return Number(timestamp);
  }

  /**
   * Sync clock with reference (NTP, etc.)
   */
  syncClock(referenceTime: number): void {
    const { skewed, adjustment } = this.checkClockSkew(referenceTime);

    if (skewed) {
      console.log(`[Clock Sync] Adjusted clock by ${adjustment}ms`);
    }
  }

  /**
   * Get current clock offset
   */
  getClockOffset(): number {
    return this.clockOffset;
  }

  /**
   * Reset clock offset
   */
  resetClockOffset(): void {
    this.clockOffset = 0;
    this.lastClockSync = Date.now();
  }

  /**
   * Helper: Pad hex with leading zeros
   */
  private padHex(value: bigint | number, length: number): string {
    const hex = value.toString(16);
    return hex.padStart(length, '0');
  }

  /**
   * Helper: Generate random bytes
   */
  private randomBytes(length: number): number {
    let result = 0;
    for (let i = 0; i < length * 2; i++) {
      result = (result << 4) | Math.floor(Math.random() * 16);
    }
    return result;
  }
}

// Singleton instance
const clockIdService = new ClockIdService();

export default clockIdService;
export { ClockIdService, ClockSkewConfig, MonotonicGuard, SnowflakeConfig };
