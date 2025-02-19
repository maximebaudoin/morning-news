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
        return feed.items.map((item) => ({ title: 'Wordpress', type: 'release', version: item.title ?? '' }));
    } catch (error) {
        console.error("Erreur lors de la récupération des versions WordPress:", error);
        return [];
    }
}

async function fetchLatestReleases(): Promise<Release[]> {
    const releases: Release[] = [];
    const GITHUB_REPOS = [
        { owner: "facebook", repo: "react" },
        { owner: "vercel", repo: "next.js" },
    ];

    for (const { owner, repo } of GITHUB_REPOS) {
        try {
            const url = `https://api.github.com/repos/${owner}/${repo}/releases/latest`;
            const response = await axios.get(url, {
                headers: { "User-Agent": "Node.js" },
            });
            releases.push({ title: repo, type: "release", version: response.data.tag_name });
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

    return NextResponse.json({ releases: [...newReleases, ...newWpReleases] });
}