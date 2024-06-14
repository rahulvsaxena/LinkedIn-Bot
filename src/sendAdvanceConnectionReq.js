const puppeteer = require('puppeteer');
const fs = require('fs');

// Load the list of LinkedIn profile URLs
const profiles = require('../linkedin_profiles.json');

// Function to delay execution
const delay = (time) => new Promise(resolve => setTimeout(resolve, time));

const sendAdvanceConnectionRequests = async () => {
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
            await delay(5000);
            // Check if the 'Connect' button is available directly
            let moreButton = await page.waitForSelector('[aria-label="More actions"]');
            if (moreButton) {
                try {
                    const buttons = await page.$$('[aria-label="More actions"]');
                    await buttons[1].click();
                    await delay(5000);
                    const connect = await page.$$('[class="artdeco-dropdown__item artdeco-dropdown__item--is-dropdown ember-view full-width display-flex align-items-center"]');
                    await connect[6].click();
                    await delay(5000);
                    const withoutNote = await page.$$('[class="artdeco-button artdeco-button--2 artdeco-button--primary ember-view ml1"]');
                    await withoutNote[0].click();
                    await delay(5000);
                } catch (error) {
                    
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
sendAdvanceConnectionRequests();