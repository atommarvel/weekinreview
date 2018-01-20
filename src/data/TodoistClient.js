// In charge of interacting with Todoist APIs
// https://developer.todoist.com/
const Promise = require('bluebird');
const moment = require('moment');

// TODO: implement partial sync

class TodoistClient {
    constructor() {
        this.syncToken = "*";
        this.allItems = {};
        this.items = [{},{},{},{},{},{},{}];
    }

    getAPIKey() {
        if (this.apiKey) {
            return Promise.resolve(this.apiKey);
        }

        return new Promise((resolve, reject) => {
            chrome.storage.sync.get({
                todoKey: ""
            }, function(items) {
                this.apiKey = items.todoKey;
                console.log(this.apiKey);
                if (this.apiKey.length === 0) console.log('todoist api key is missing');
                this.apiKey ? resolve(this.apiKey) : reject();
            });
        });
    }

    async getSyncBody() {
        const apiKey = await this.getAPIKey();
        console.log(apiKey);
        const tokenParam = `token=${apiKey}`;
        const sync_tokenParam = `sync_token=${this.syncToken}`;
        const resource_typeParam = `resource_types=["all"]`;
        const body = `${tokenParam}&${sync_tokenParam}&${resource_typeParam}`;
        console.log(body);
        return body;
    }

    async sync() {
        const url = 'https://todoist.com/api/v7/sync';
        let headers = new Headers();
        headers.append('content-type','application/x-www-form-urlencoded');

        const body = await this.getSyncBody();
        const init = {
            method: 'POST',
            body: body,
            headers: headers
        };
        return fetch(url, init)
            .then(res => res.json());
    }

    parseItems(items) {
        this.allItems = {};
        this.resetItems();
        items.forEach(item => {
            console.log(item.content);
            this.allItems[item.id] = item;
            // organize items into next 7 days
            this.placeItemIntoDayArray(item);
        });

    }

    placeItemIntoDayArray(item) {
        const daysAhead = this.getDueDateDaysAhead(item);
        if (daysAhead === null) return;
        this.items[daysAhead][item.id] = item;
    }

    getDueDateDaysAhead(item) {
        if (!item.due_date_utc) return null;
        const allowableDaysAhead = 6;
        let curDaysAhead = 0;
        for (curDaysAhead; curDaysAhead <= allowableDaysAhead; curDaysAhead++) {
            if (this.isDueDateInDay(item, curDaysAhead)) {
                return curDaysAhead;
            }
        }
        return null;
    }

    isDueDateInDay(item, daysAhead) {
        let beginningOfDay = moment().startOf('day').add(daysAhead, 'd');
        let endOfDay = moment().endOf('day').add(daysAhead, 'd');
        let itemDueDate = moment.utc(item.due_date_utc);
        return itemDueDate.isBetween(beginningOfDay, endOfDay);
    }

    resetItems() {
        this.items = [{},{},{},{},{},{},{}];
    }

    async getThisWeeksItems() {
        const syncData = await this.sync();
        console.log(syncData);
        this.parseItems(syncData.items);
        return this.items;
    }
}

module.exports = TodoistClient;