import { Db, MongoClient } from 'mongodb';
import config from '../config.json';

class Database {
    public get client() {
        return this._client;
    }

    public get db() {
        return this._db;
    }

    private _client: MongoClient;
    private _db: Db;

    private async _connect() {
        console.log("[DATABASE] Connecting to database...");
        const mongoURL = config.mongoURL
            .replace("{username}", process.env.MONGO_USER)
            .replace("{password}", process.env.MONGO_PASS);
        this._client = await new MongoClient(mongoURL).connect();
        console.log("[DATABASE] Connected");
        this._db = this._client.db();
    }

    private static __instance: Database;

    public static get instance() {
        if (!Database.__instance) {
            throw new Error("Can not get MongoDB instance before it has been created");
        }
        return Database.__instance;
    }

    static async connect() {
        Database.__instance = new Database();
        await Database.__instance._connect();
    }
}

export default Database;