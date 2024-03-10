import { getXataClient } from '@/xata'
import type { Adapter, DatabaseSession, RegisteredDatabaseSessionAttributes, DatabaseUser, RegisteredDatabaseUserAttributes, UserId } from 'lucia'

interface SessionSchema extends RegisteredDatabaseSessionAttributes {
  id: string
  user_id: string
  expires_at: Date
}

interface UserSchema extends RegisteredDatabaseUserAttributes {
  id: string
}

function transformIntoDatabaseSession(raw: SessionSchema): DatabaseSession {
  const { id, user_id: userId, expires_at: expiresAt, ...attributes } = raw
  return {
    userId,
    id,
    expiresAt,
    attributes,
  }
}

function transformIntoDatabaseUser(raw: UserSchema): DatabaseUser {
  const { id, ...attributes } = raw
  return {
    id,
    attributes,
  }
}

export class XataAdapter implements Adapter {
  private controller = getXataClient()

  public async deleteSession(sessionId: string): Promise<void> {
    await this.controller.sql`DELETE FROM "session" WHERE id=${sessionId}`
  }

  public async deleteUserSessions(userId: UserId): Promise<void> {
    await this.controller.sql`DELETE FROM "session" WHERE user_id=${userId}`
  }

  public async getSessionAndUser(sessionId: string): Promise<[session: DatabaseSession | null, user: DatabaseUser | null]> {
    const [databaseSession, databaseUser] = await Promise.all([this.getSession(sessionId), this.getUserFromSessionId(sessionId)])
    return [databaseSession, databaseUser]
  }

  public async getUserSessions(userId: UserId): Promise<DatabaseSession[]> {
    const records = await this.controller.db.session.filter('user_id', userId).getAll()
    return records.map((val) => {
      return transformIntoDatabaseSession(val)
    })
  }

  public async setSession(databaseSession: DatabaseSession): Promise<void> {
    await this.controller.db.session.create({
      id: databaseSession.id,
      user_id: databaseSession.userId,
      expires_at: databaseSession.expiresAt,
      ...databaseSession.attributes,
    })
  }

  public async updateSessionExpiration(sessionId: string, expiresAt: Date): Promise<void> {
    await this.controller.sql`UPDATE "session" SET expires_at=${expiresAt} WHERE id=${sessionId}`
  }

  public async deleteExpiredSessions(): Promise<void> {
    await this.controller.sql`DELETE FROM "session" WHERE expires_at <=${new Date()}`
  }

  private async getSession(sessionId: string): Promise<DatabaseSession | null> {
    const records = await this.controller.db.session.filter('session_id', sessionId).getFirst()
    return transformIntoDatabaseSession(records)
  }

  private async getUserFromSessionId(sessionId: string): Promise<DatabaseUser | null> {
    const theSession = await this.controller.db.session.filter('session_id', sessionId).getFirst()
    if (theSession) {
      const getUser = await this.controller.db.user.filter('user_id', theSession.user_id).getFirst()
      if (getUser) return transformIntoDatabaseUser(getUser)
    }
    return null
  }
}
