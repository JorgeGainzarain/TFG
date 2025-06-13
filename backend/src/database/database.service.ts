import sqlite3 from 'sqlite3';
import { Database, open } from 'sqlite';
import { Service } from 'typedi';
import { config } from '../config/environment';
import path from 'path';
import { DBQuery } from './models/db-query';
import { DBQueryResult } from './models/db-query-result';
import { EntityConfig } from '../app/base/base.model';

// Define the base directory as the project root
const baseDir = process.cwd();

@Service()
export class DatabaseService {
  private db: Database | null = null;
  private isInitializing: boolean = false;
  private initPromise: Promise<Database> | null = null;
  public databasePath: string = path.resolve(baseDir, `src/data/${config.dbOptions.database}`);

  public async openDatabase(): Promise<Database> {
    // Si ya tenemos una conexión activa, devolverla
    if (this.db) {
      return this.db;
    }

    // Si ya se está inicializando, esperar a que termine
    if (this.isInitializing && this.initPromise) {
      return this.initPromise;
    }

    // Marcar como inicializando y crear promesa
    this.isInitializing = true;
    this.initPromise = this.initializeConnection();

    try {
      this.db = await this.initPromise;
      console.log('✅ Database connection established successfully');
      return this.db;
    } catch (error) {
      console.error('❌ Failed to initialize database connection:', error);
      throw error;
    } finally {
      this.isInitializing = false;
      this.initPromise = null;
    }
  }

  private async initializeConnection(): Promise<Database> {
    console.log(`Opening database at ${this.databasePath}`);

    const db = await open({
      filename: this.databasePath,
      driver: sqlite3.Database
    });

    await db.exec(`PRAGMA foreign_keys = ON;`);

    // Asegurar que las tablas existen al abrir la conexión
    await this.ensureTablesExist(db);

    return db;
  }

  private async ensureTablesExist(db: Database): Promise<void> {
    try {
      for (const table of Object.values(config.entityValues) as EntityConfig<any>[]) {
        if (table.requiredFields.length === 0) {
          console.error(`Table ${table.table_name} has no required fields.`);
          continue;
        }

        const createTableSQL = `
          CREATE TABLE IF NOT EXISTS ${table.table_name.toLowerCase().replace(' ', '_')} (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            ${table.requiredFields.map(field => `${String(field.name)} ${field.type}`).join(', ')}
          )
        `;
        await db.exec(createTableSQL);
      }
      console.log('✅ Database tables verified/created');
    } catch (error) {
      console.error('❌ Error ensuring tables exist:', error);
      throw error;
    }
  }

  public async closeDatabase(): Promise<void> {
    if (this.db) {
      await this.db.close();
      this.db = null;
      console.log('🔒 Database connection closed');
    }
  }

  public async execQuery(query: DBQuery): Promise<DBQueryResult> {
    const dbClient = await this.openDatabase();
    let { sql, params } = query;

    // If the query is an INSERT statement, add a RETURNING * clause to return the inserted row
    if (sql.startsWith('INSERT') || sql.startsWith('UPDATE') || sql.startsWith('DELETE')) {
      sql = sql + ' RETURNING *';
    }

    try {
      const rows: [] = await dbClient.all(sql, params);
      return { rows: rows, rowCount: rows.length };
    } catch (error) {
      console.error('❌ Database query error:', error);
      console.error('Query:', sql);
      console.error('Params:', params);
      throw error;
    }
    // NOTA: Ya no cerramos la conexión después de cada query
    // Esto mantiene la conexión activa y evita problemas de timing
  }

  public async clearDatabase(): Promise<void> {
    const db = await this.openDatabase();

    try {
      for (const table of Object.values(config.entityValues) as EntityConfig<any>[]) {
        const deleteTableSQL = `DELETE FROM ${table.table_name.toLowerCase().replace(' ', '_')}`;
        await db.exec(deleteTableSQL);
      }
      console.log('🧹 Database cleared successfully');
    } catch (error) {
      console.error('❌ Error clearing database:', error);
      throw error;
    }
  }

  public async initializeDatabase(): Promise<void> {
    // Este método ahora solo asegura que la conexión esté inicializada
    // Las tablas se crean automáticamente en ensureTablesExist()
    await this.openDatabase();
    console.log('✅ Database initialized successfully');
  }

  // Método para cerrar la conexión de manera controlada (útil en shutdown)
  public async gracefulShutdown(): Promise<void> {
    if (this.isInitializing && this.initPromise) {
      // Esperar a que termine la inicialización antes de cerrar
      await this.initPromise;
    }
    await this.closeDatabase();
  }

  // Método de utilidad para verificar el estado de la conexión
  public isConnected(): boolean {
    return this.db !== null;
  }

  // Método para reconectar en caso de pérdida de conexión
  public async reconnect(): Promise<void> {
    await this.closeDatabase();
    await this.openDatabase();
  }
}