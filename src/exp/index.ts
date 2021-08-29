import Database from "../db";
import levels from "../levels.json";

const usersCollection = Database.instance.db.collection<{ exp: number, userId: string, level: number }>("usersLevels");

export async function addExp(userId: string) {
    let userDocument = await usersCollection.findOne({
        userId,
    });
    if (!userDocument) {
        userDocument = {
            userId,
            exp: 0,
            level: 1
        }
    }
    userDocument.exp += Math.ceil(Math.random() * 4);
    const nextLevel = levelByExp(userDocument.exp);
    let levelIncreased = false;
    if (userDocument.level < nextLevel) {
        userDocument.level = nextLevel;
        levelIncreased = true;
    }
    await usersCollection.updateOne({
        userId
    }, { $set: { ...userDocument } }, { upsert: true });
    return levelIncreased ? userDocument.level : false;
}

function levelByExp(exp: number) {
    const level = levels.findIndex(level => level.min >= exp);
    return level >= 0 ? level : levels.length;
}

export async function userLevel(user: string) {

}