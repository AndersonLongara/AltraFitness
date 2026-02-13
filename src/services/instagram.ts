
const RAPID_API_KEY = process.env.RAPID_API_KEY;
const RAPID_API_HOST = 'instagram120.p.rapidapi.com';

interface InstagramProfile {
    name: string;
    photoUrl: string;
    bio: string;
    followers: number;
    following: number;
    posts: number;
}

export async function getInstagramProfile(handle: string): Promise<InstagramProfile | null> {
    if (!RAPID_API_KEY) {
        console.warn("RAPID_API_KEY not found via environment variables");
        return null;
    }

    try {
        const url = `https://${RAPID_API_HOST}/api/instagram/profile`;
        console.log(`Fetching from: ${url} for ${handle}`);

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'x-rapidapi-key': RAPID_API_KEY,
                'x-rapidapi-host': RAPID_API_HOST,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username: handle }),
            next: { revalidate: 3600 } // Cache for 1 hour
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Instagram API Error: ${response.status} ${response.statusText}`, errorText);
            return null;
        }

        const json = await response.json();

        // Handle response structure from user: { result: { ... } }
        // Fallback to other common structures just in case
        const user = json.result || json.data || json.user || json;

        if (user) {
            return {
                name: user.full_name || user.username || handle,
                photoUrl: user.profile_pic_url_hd || user.profile_pic_url,
                bio: user.biography,
                followers: user.edge_followed_by?.count || user.followers || 0,
                following: user.edge_follow?.count || user.following || 0,
                posts: user.edge_owner_to_timeline_media?.count || user.posts || 0
            };
        }

        return null;
    } catch (error) {
        console.error("Failed to fetch Instagram profile", error);
        return null;
    }
}
