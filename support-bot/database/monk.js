const monk = require('monk');
const db = monk(process.env.MONGO_URL);

class Calls {

    static async insertGuild(id) {
        const collection = db.get('guilds')
        return (await collection.insert({
            guild_id: id,
            toggle :{
                autorole: false,
            }
        }))
    }

    static async removeGuild(id) {
        const collection = db.get('guilds')
        return (await collection.findOneAndDelete({ guild_id: id }))
    }

    static async updateDbSetting(id, props, value) {
        const collection = db.get('guilds')
        return (await collection.findOneAndUpdate({ guild_id: id }, { $set: { [props]: value } }))
    }

    static async getData(id) {
        const collection = db.get('guilds')
        return (await collection.findOne({ guild_id: id }))
    }

    static async updateFilterPushOrPull(id, props, value, pop) {
        const collection = db.get('guilds')
        if (pop = 'push') {
            return (await collection.update({ id: id }, { $push: { [props]: value } }));
        } else {
            return (await collection.update({ id: id }, { $pull: { [props]: value } }));
        }
    }
    
}

module.exports = Calls;