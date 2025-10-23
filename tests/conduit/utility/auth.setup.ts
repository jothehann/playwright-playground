import { test as setup } from '@playwright/test';
import user from '../../../auth/conduit-user.json';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { ApiHelper } from '../../helper/api.helper';

dotenv.config(); // loads .env into process.env

const authFile = path.join('auth', 'conduit-user.json');
const localCredPath = path.join('auth', 'conduit-credentials.json');

setup('authentication', async ({ request }) => {
    // Prefer env vars (CI-friendly), then fallback to a local gitignored file
    const email = process.env.CONDUIT_EMAIL;
    const password = process.env.CONDUIT_PASSWORD;

    let creds = { email, password };

    if (!email || !password) {
        if (fs.existsSync(localCredPath)) {
            const raw = fs.readFileSync(localCredPath, 'utf8');
            const json = JSON.parse(raw);
            creds = { email: json.email, password: json.password };
        }
    }

    if (!creds.email || !creds.password) {
        throw new Error('Missing credentials: set CONDUIT_EMAIL and CONDUIT_PASSWORD as env vars, or create a gitignored auth/conduit-credentials.json');
    }

    const res = await ApiHelper.apiRequest(request, 'POST', '/users/login', {
        user: { email: creds.email, password: creds.password },
    });
    const body = await res.json();
    const token = body?.user?.token;
    if (!token) throw new Error('Login failed, token not returned');

    // Write token to storage-state file for Playwright usage (but keep that file gitignored)
    user.origins[0].localStorage[0].value = token;
    fs.writeFileSync(authFile, JSON.stringify(user, null, 2));

    process.env['ACCESS_TOKEN'] = token;
});
