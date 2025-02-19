import axios from "axios";
import fs from "fs/promises";
import Parser from "rss-parser";
import { NextResponse } from "next/server";

const WORDPRESS_RSS_FEED = "https://wordpress.org/news/category/releases/feed/";
const HISTORY_FILE = "history.json";

export interface Release {
    title: string;
    type: string;
    version: string;
    date: string; // Ajout de la date
}

async function loadHistory(): Promise<{ releases: Release[] }> {
    try {
        const data = await fs.readFile(HISTORY_FILE, "utf-8");
        return JSON.parse(data);
    } catch {
        return { releases: [] };
    }
}

async function fetchWordPressReleases(): Promise<Release[]> {
    try {
        const parser = new Parser();
        const feed = await parser.parseURL(WORDPRESS_RSS_FEED);
        const today = new Date().toISOString().split('T')[0]; // Date au format YYYY-MM-DD
        return feed.items.map((item) => {
            const versionMatch = item.title?.match(/WordPress (.*)/);
            let version = versionMatch ? versionMatch[1] : 'unknown';
            version = version.replace('Wordpress', '');
            version = version.replace('Maintenance Release', '');
            version = version.replace('Release Candidate', 'RC');
            version = version.trim();
            return { title: 'Wordpress', type: 'release', version, date: today };
        });
    } catch (error) {
        console.error("Erreur lors de la récupération des versions WordPress:", error);
        return [];
    }
}

async function fetchLatestReleases(): Promise<Release[]> {
    const releases: Release[] = [];
    const GITHUB_REPOS = [
        { owner: "go-gitea", repo: "gitea" },
    ];

    const today = new Date().toISOString().split('T')[0]; // Date au format YYYY-MM-DD

    for (const { owner, repo } of GITHUB_REPOS) {
        try {
            const url = `https://api.github.com/repos/${owner}/${repo}/releases/latest`;
            const response = await axios.get(url, {
                headers: { "User-Agent": "Node.js" },
            });
            releases.push({ title: repo, type: "release", version: response.data.tag_name, date: today });
        } catch (error) {
            console.error(`Erreur lors de la récupération de ${repo}:`, error);
        }
    }
    return releases;
}

export async function GET() {
    const history = await loadHistory();
    const [releases, wpReleases] = await Promise.all([fetchLatestReleases(), fetchWordPressReleases()]);

    const newReleases = releases.filter((r) => !history.releases.some((h) => h.title === r.title && h.version === r.version && h.type === r.type));
    const newWpReleases = wpReleases.filter((wp) => !history.releases.some((h) => h.title === wp.title && h.version === wp.version && h.type === wp.type));

    history.releases = [...history.releases, ...newReleases, ...newWpReleases];

    // await fs.writeFile(HISTORY_FILE, JSON.stringify(history, null, 2));

    const today = new Date().toISOString().split('T')[0]; // Date au format YYYY-MM-DD
    const todayReleases = history.releases.filter((release) => release.date === today);

    return NextResponse.json({ releases: todayReleases });
}