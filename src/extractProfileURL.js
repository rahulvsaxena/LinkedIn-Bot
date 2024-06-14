const puppeteer = require('puppeteer');
const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const askQuestion = (query) => {
    return new Promise(resolve => rl.question(query, resolve));
};

const delay = (time) => new Promise(resolve => setTimeout(resolve, time));

const scrapeLinkedInProfiles = async (page, url, pageNumber) => {
    try {
        const pageUrl = `${url}&page=${pageNumber}`;
        await page.goto(pageUrl, { waitUntil: 'networkidle2' });

        const results = await page.evaluate(() => {
            const nodes = document.querySelectorAll('.reusable-search__result-container');
            return Array.from(nodes).map(node => {
                const urlElement = node.querySelector('.entity-result__title-text a');
                const nameElement = node.querySelector('.entity-result__title-text a span[aria-hidden="true"]');
                
                if (urlElement && nameElement) {
                    const profileUrl = urlElement.href.split('?')[0]; // Trimming at '?'
                    const fullName = nameElement.textContent.trim();
                    const firstName = fullName.split(' ')[0]; // Extract the first name

                    return {
                        firstName: firstName,
                        url: profileUrl
                    };
                }
                return null;
            }).filter(item => item !== null); // Remove null values
        });
        return results;
    } catch (error) {
        console.error(`Error scraping page ${pageNumber}:`, error);
        return [];
    }
};

const scrapeAndSaveLinkedInProfiles = async (linkedInUrl, maxPages) => {
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: { width: 1280, height: 720 },
    });

    const page = await browser.newPage();

    await page.setCookie({
        name: 'li_at',
        value: 'AQEDATd0ElYAundKAAABkAAvl9UAAAGQJDwb1U4Ae4qdcH7NHhRmfX2Kd4oPOrdLPx8NZROLCI2YWjI_zyCOwEPYD1s2vBNn-auG1zYYVJ5Ruk9q9uzG6hbXsqbYa_kQQent__wmd6_PPned4O51IRx8', // Your LinkedIn session cookie here
        domain: '.www.linkedin.com',
    });

    try {
        let allProfiles = [];

        for (let pageNumber = 1; pageNumber <= maxPages; pageNumber++) {
            console.log(`Scraping page ${pageNumber}`);
            const profiles = await scrapeLinkedInProfiles(page, linkedInUrl, pageNumber);
            allProfiles = allProfiles.concat(profiles);
            await delay(5000); // Adding delay to prevent overwhelming the server
        }

        fs.writeFileSync('linkedin_profiles.json', JSON.stringify(allProfiles, null, 2), 'utf-8');
        console.log(`Scraping completed. ${allProfiles.length} profiles saved to 'linkedin_profiles.json'.`);
    }
    catch (error) {
        console.error('Error during scraping:', error);
    }
    finally {
        await browser.close();
    }
};

const run = async () => {
    const linkedInUrl = await askQuestion('Enter the LinkedIn URL: ');
    const maxPages = parseInt(await askQuestion('Enter the maximum number of pages to scrape: '), 10);

    await scrapeAndSaveLinkedInProfiles(linkedInUrl, maxPages);

    rl.close();
};

// Call the function
run();
