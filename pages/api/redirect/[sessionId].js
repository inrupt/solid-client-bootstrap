/**
 * Copyright 2020 Inrupt Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the
 * Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
 * INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
 * PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import { getSessionFromStorage } from "@inrupt/solid-client-authn-node";
import { storage, clearStorage } from "../../../lib/storage";

export default async function handleRedirect(req, res) {
  const { sessionId } = req.query;
  const session = await getSessionFromStorage(sessionId, storage);
  if (session === undefined) {
    res.status(400).send(`<p>No session stored for ID [${sessionId}]</p>`);
  } else {
    console.log(
      `Handling redirect from ${new URL(req.url, "http://localhost:3000").href}`
    );
    await session.handleIncomingRedirect(
      new URL(req.url, "http://localhost:3000").href
    );
    const rawStoredSession = await storage.get(
      `solidClientAuthenticationUser:${session.info.sessionId}`
    );
    if (rawStoredSession === undefined) {
      throw new Error(
        `Cannot find session with ID [${session.info.sessionId}] in storage.`
      );
    }
    const storedSession = JSON.parse(rawStoredSession);
    const redirectUrl = new URL("http://localhost:3000");
    redirectUrl.searchParams.set(
      "webId",
      encodeURIComponent(session.info.webId)
    );
    redirectUrl.searchParams.set("refreshToken", storedSession.refreshToken);
    redirectUrl.searchParams.set("clientId", storedSession.clientId);
    redirectUrl.searchParams.set("clientSecret", storedSession.clientSecret);
    redirectUrl.searchParams.set("oidcIssuer", storedSession.issuer);
    await clearStorage();
    if (session.info.isLoggedIn) {
      console.log(
        `Logged in as [<strong>${session.info.webId}</strong>] after redirect`
      );
      res.redirect(301, redirectUrl.href);
    } else {
      res.status(400).send(`<p>Not logged in after redirect</p>`);
    }
  }
  res.end();
}
