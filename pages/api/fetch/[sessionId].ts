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

import "reflect-metadata";
import { getSessionFromStorage } from "@inrupt/solid-client-authn-node";
import { storage } from "../../../lib/storage";

export default async function handleRedirect(req, res) {
  const { sessionId } = req.query;
  console.log(JSON.stringify(storage));
  const session = await getSessionFromStorage(sessionId, storage);
  console.log(`fetching ${req.url}`);
  const params = new URL(req.url, "http://localhost:3000").searchParams;
  const resource = params.get("resource");
  console.log(`params has resource: ${params.has("resource")}, ${resource}`);
  if (!params.has("resource")) {
    res
      .status(400)
      .send(
        "<p>Expected a 'resource' query param, for example <strong>http://localhost:3001/fetch?resource=https://pod.inrupt.com/MY_USERNAME/</strong> to fetch the resource at the root of your Pod (which, by default, only <strong>you</strong> will have access to).</p>"
      );
  } else {
    res.send(
      `<pre>${(await (await session?.fetch(resource)).text()).replace(
        /</g,
        "&lt;"
      )}</pre>`
    );
  }
}
