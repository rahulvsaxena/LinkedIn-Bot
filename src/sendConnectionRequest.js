const puppeteer = require('puppeteer');
const fs = require('fs');

// Load the list of LinkedIn profile URLs
const profiles = require('../linkedin_profiles.json');

// Function to delay execution
const delay = (time) => new Promise(resolve => setTimeout(resolve, time));

const sendConnectionRequests = async () => {
    const browser = await puppeteer.launch({
        headless: false, // Set to true for headless mode
        defaultViewport: { width: 1280, height: 720 },
    });
    const page = await browser.newPage();
    await page.setCookie({
        name: 'li_at',
        value: 'AQEDATd0ElYAundKAAABkAAvl9UAAAGQJDwb1U4Ae4qdcH7NHhRmfX2Kd4oPOrdLPx8NZROLCI2YWjI_zyCOwEPYD1s2vBNn-auG1zYYVJ5Ruk9q9uzG6hbXsqbYa_kQQent__wmd6_PPned4O51IRx8', // Your LinkedIn session cookie here
        domain: 'www.linkedin.com',
    });

    try {
        for (let profile of profiles) {
            await page.goto(profile.url);
            // Check if the 'Connect' button is available directly
            let connectButton = await page.waitForSelector('[class="artdeco-button artdeco-button--2 artdeco-button--primary ember-view pvs-profile-actions__action"]');
            if (connectButton) {
                const connectButtons = await page.$$('[class="artdeco-button artdeco-button--2 artdeco-button--primary ember-view pvs-profile-actions__action"]');
                //used when you try to connect with already connected person or when you have sent them a request
                try{
                    await connectButtons[0].click();
                    const withoutNote = await page.$$('[class="artdeco-button artdeco-button--2 artdeco-button--primary ember-view ml1"]');
                    await withoutNote[0].click();
                    await delay(10000);
                }
                catch{
                    console.log("3 possibilties: ");
                    console.log("+ You have already sent a connection request");
                    console.log("+ He/She is already your connection");
                    console.log("+ LinkdIn UI might have changed");
                    console.log("");
                }
            }
            else {
                console.log(`No Connect button found for ${profile.url}`);
                console.log("");
            }
            await delay(10000); // Adding a delay to prevent overwhelming LinkedIn
        }
    }
    catch (error) {
        console.error('Error:', error);
    }
    finally {
        await browser.close();
    }
};

// Run the function to send connection requests
sendConnectionRequests();