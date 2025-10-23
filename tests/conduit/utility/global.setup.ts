import { expect, request } from '@playwright/test';
import user from '../../../auth/conduit-user.json';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { ApiHelper } from '../../helper/api.helper';
import { ConduitPage } from '../pages/conduit.page';
dotenv.config();

export default async function globalSetup() {
    const authFile = path.join('auth', 'conduit-user.json');
    const localCredPath = path.join('auth', 'conduit-credentials.json');
    const context = await request.newContext();

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

    const res = await ApiHelper.apiRequest(context, 'POST', '/users/login', {
        user: { email: creds.email, password: creds.password },
    });
    const body = await res.json();
    const token = body?.user?.token;
    if (!token) throw new Error('Login failed, token not returned');

    // Write token to storage-state file for Playwright usage (but keep that file gitignored)
    user.origins[0].localStorage[0].value = token;
    fs.writeFileSync(authFile, JSON.stringify(user, null, 2));

    process.env['ACCESS_TOKEN'] = token;

    const articleResponse = await ConduitPage.createArticleViaApi(
        context,
        {
            title: 'Global likes test article',
            description: 'This is a new description',
            body: 'This is a test body',
            tagList: [],
        },
        process.env.ACCESS_TOKEN
    );

    expect(articleResponse.status()).toEqual(201);
    const response = await articleResponse.json();
    const slugId = response.article.slug;
    process.env['SLUG_ID'] = slugId;
}
