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

import { Session } from "@inrupt/solid-client-authn-node";
import { storage } from "../../lib/storage";

export default async function login(req, res) {
  const session = new Session({
    storage,
  });
  const currentUrl = new URL(req.url, "http://localhost:3000");

  const clientName = currentUrl.searchParams.get("name");
  const issuer = decodeURIComponent(currentUrl.searchParams.get("issuer"));
  await session.login({
    redirectUrl: `http://localhost:3000/api/redirect/${session.info.sessionId}`,
    oidcIssuer: issuer,
    clientName,
    handleRedirect: (redirectUrl) => {
      res.redirect(301, redirectUrl);
    },
  });
}
