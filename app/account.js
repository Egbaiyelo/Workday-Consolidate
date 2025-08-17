// maybe store by key rather than username
// maybe store pass in hash

const fs = require('fs');
const path = "./data.json"

const account = JSON.parse(fs.readFileSync(path, 'utf-8'));
console.log(account);


function save() {
    fs.writeFileSync(path, JSON.stringify(account, null, 2));
}

// Ensure the scraper can parse it reasonably
function ensureFormat(site, lang = "en-US") {
    //- maybe add \
    const siteData = site.split('/').filter(Boolean);

    let hold = siteData.slice(1, 5);
    let siteHandle = hold.join('/');
    console.log(siteHandle)

    let cleanSite = "https://" + siteHandle + "/userHome";

    return {
        name: siteData[1].split('.')[0],
        site: cleanSite
    }
}



// Add a new website to an existing user (by key)
function addSite(username, siteUrl) {
    if (!account[username]) {
        console.error(`User "${username}" not found.`);
        return;
    }

    const cleanSite = ensureFormat(siteUrl);

    if (!account[username].websites.includes(cleanSite.site)) {
        account[username].websites.push(cleanSite.site);
        console.log(`Added site to ${username}: ${cleanSite.site}`);
        save();
    } else {
        console.log(`Site already exists for ${username}: ${cleanSite.site}`);
    }
}

// Add a new user context (email, password, websites)
function addContext(username, context) {
    if (account[username]) {
        console.error(`User "${username}" already exists.`);
        return;
    }

    account[username] = {
        email: context.email,
        password: context.password,
        websites: []
    };

    context.websites.forEach(site => {
        const { name, site } = ensureFormat(site);
        if (!account[username].websites.includes(site)) {
            account[username].websites.push(site);
        }
    });

    console.log(`Added new user "${username}"`);
    save();
}



module.exports = {
    addSite, addContext
}