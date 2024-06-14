const puppeteer = require('puppeteer');
const profiles = require('../linkedin_profiles.json');
const fs = require('fs');

// Function to delay execution
const delay = (time) => new Promise(resolve => setTimeout(resolve, time));

// Read and sanitize the base message
let message = fs.readFileSync('message.txt', 'utf-8').trim();
message = message.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

// Main function
const sendMessage = async () => {
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: { width: 1280, height: 720 },
    });
    
    const page = await browser.newPage();
    
    await page.setCookie({
        name: 'li_at',
        value: 'AQEDATd0ElYAundKAAABkAAvl9UAAAGQJDwb1U4Ae4qdcH7NHhRmfX2Kd4oPOrdLPx8NZROLCI2YWjI_zyCOwEPYD1s2vBNn-auG1zYYVJ5Ruk9q9uzG6hbXsqbYa_kQQent__wmd6_PPned4O51IRx8', // Your LinkedIn session cookie here
        domain: 'www.linkedin.com',
    });

    for (let profile of profiles) {
        await page.goto(profile.url);
        await delay(10000);
        try {
            const personalizedMessage = message.replace('[firstName]', profile.firstName);
            // Click message button
            const mssgButton = await page.$$('[class="artdeco-button__icon  rtl-flip"]');
            await mssgButton[1].click();
            await delay(10000);
            // Type message
            const messageBox = await page.$('.msg-form__contenteditable');
            await messageBox.focus();
            await messageBox.type(personalizedMessage);
            await delay(10000);
            // Click send button
            const sendButton = await page.$$('[href="#send-privately-small"]');
            await sendButton[2].click();
            await delay(10000);
        
        }
        catch (error) {
            console.log("Error:", error);
        }
    }
    await browser.close();
};

sendMessage();
