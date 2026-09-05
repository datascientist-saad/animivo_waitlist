export type MemorySignup = {
  emailNormalized: string;
  foundingMember: boolean;
  waitlistPosition: number;
  fullName: string;
  petType: string;
  petName: string | null;
  biggestChallenge: string | null;
};

export type JoinResult = {
  outcome: "joined" | "already_joined";
  foundingMember: boolean;
  waitlistPosition: number;
};

export class InMemoryWaitlist {
  private rows: MemorySignup[] = [];
  private lock: Promise<void> = Promise.resolve();

  constructor(existingCount = 0) {
    for (let i = 1; i <= existingCount; i += 1) {
      this.rows.push({
        emailNormalized: `seed-${i}@example.com`,
        foundingMember: i <= 100,
        waitlistPosition: i,
        fullName: `Seed ${i}`,
        petType: "dog",
        petName: null,
        biggestChallenge: null,
      });
    }
  }

  private async withLock<T>(fn: () => T | Promise<T>): Promise<T> {
    let release!: () => void;
    const previous = this.lock;
    this.lock = new Promise((resolve) => {
      release = resolve;
    });
    await previous;
    try {
      return await fn();
    } finally {
      release();
    }
  }

  async join(input: {
    email: string;
    fullName: string;
    petType: string;
    petName?: string | null;
    biggestChallenge?: string | null;
  }): Promise<JoinResult> {
    return this.withLock(() => {
      const emailNormalized = input.email.trim().toLowerCase();
      const existing = this.rows.find((row) => row.emailNormalized === emailNormalized);
      if (existing) {
        return {
          outcome: "already_joined" as const,
          foundingMember: existing.foundingMember,
          waitlistPosition: existing.waitlistPosition,
        };
      }

      const waitlistPosition =
        this.rows.reduce((max, row) => Math.max(max, row.waitlistPosition), 0) + 1;
      const foundingMember = waitlistPosition <= 100;
      this.rows.push({
        emailNormalized,
        foundingMember,
        waitlistPosition,
        fullName: input.fullName,
        petType: input.petType,
        petName: input.petName ?? null,
        biggestChallenge: input.biggestChallenge ?? null,
      });

      return {
        outcome: "joined" as const,
        foundingMember,
        waitlistPosition,
      };
    });
  }

  get size() {
    return this.rows.length;
  }
}
