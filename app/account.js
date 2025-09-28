// maybe store by key rather than username
// maybe store pass in hash

const fs = require('fs');
const path = require('path');
const datafile = "data.json"
const filepath = path.join(__dirname, datafile);


const account = JSON.parse(fs.readFileSync(filepath, 'utf-8'));

// ---------- Read and write ----------------

function getData() {
    return JSON.parse(fs.readFileSync(filepath, 'utf-8'));
}

function save() {
    fs.writeFileSync(filepath, JSON.stringify(account, null, 2));
}

// ----------- Utilities -----------------------

// Ensure the scraper can parse it reasonably
//- done by extension but will recheck maybe still have one in case
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


// ----------------- core functions ---------------------

// Add a new website to an existing user (by key)
function addSite(siteName, siteUrl) {
    if (!account) {
        console.error(`Data could not be found.`);
        return;
    }

    // const cleanSite = ensureFormat(siteUrl);

    if (!account.websites[siteName]) {
        account.websites[siteName] = siteUrl;
        console.log(`Added site to ${account.username}: ${siteUrl}`);
        save();
    } else {
        console.log(`Site already exists for ${account.username}: ${siteUrl}`);
    }
}

// Add a new user context (email, password, websites)
// function addContext(username, context) {
//     if (account[username]) {
//         console.error(`User "${username}" already exists.`);
//         return;
//     }

//     account[username] = {
//         email: context.email,
//         password: context.password,
//         websites: []
//     };

//     context.websites.forEach(site => {
//         const { name, site } = ensureFormat(site);
//         if (!account[username].websites.includes(site)) {
//             account[username].websites.push(site);
//         }
//     });

//     console.log(`Added new user "${username}"`);
//     save();
// }





module.exports = {
    addSite, getData
}