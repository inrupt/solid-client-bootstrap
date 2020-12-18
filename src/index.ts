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

// The only import we need from the Node AuthN library is the Session class.
import {
  Session,
  InMemoryStorage,
  ILoginInputOptions,
} from "@inrupt/solid-client-authn-node";
import express from "express";

import {
  promptClientName,
  promptIdp,
  promptPort,
  promptRegistration,
  promptStaticClientInfo,
} from "./prompts";

type InputOptions = {
  identityProvider?: string;
  clientName?: string;
  registrationType?: ["static, dynamic"];
};

type ValidatedOptions = {
  identityProvider: string;
  registrationType: "static" | "dynamic";
  clientName?: string;
};

async function main(): Promise<void> {
  // Get CLI arguments
  const argv = require("yargs/yargs")(process.argv.slice(2))
    .describe(
      "identityProvider",
      "The identity provider at which the user should authenticate."
    )
    .alias("idp", "identityProvider")
    .describe("clientName", "The name of the bootstrapped app.")
    .describe(
      "registration",
      "[static] if you want to manually register the client, [dynamic] otherwise."
    )
    .describe(
      "port",
      "The port number on which the identity provider will return the token."
    )
    .locale("en")
    .help().argv;

  const inputOptions: InputOptions = argv;
  // Complete CLI arguments with user prompt
  const validatedOptions: ValidatedOptions = {
    identityProvider: inputOptions.identityProvider ?? (await promptIdp()),
    registrationType:
      inputOptions.registrationType ?? (await promptRegistration()),
    clientName: inputOptions.clientName ?? (await promptClientName()),
  };
  const port = argv.port ?? (await promptPort());

  const app = express();
  const iriBase = `http://localhost:${port}`;
  const storage = new InMemoryStorage();

  const session: Session = new Session({
    insecureStorage: storage,
    secureStorage: storage,
  });

  const server = app.listen(port, async () => {
    console.log(`Listening at: [${iriBase}].`);
    const loginOptions: ILoginInputOptions = {
      clientName: validatedOptions.clientName,
      oidcIssuer: validatedOptions.identityProvider,
      redirectUrl: iriBase,
      tokenType: "DPoP",
      handleRedirect: (url) => {
        console.log(`\nPlease visit ${url} in a web browser.\n`);
      },
    };
    let clientInfo;
    if (validatedOptions.registrationType === "static") {
      console.log(
        `Please go perform the static registration of your application to [${validatedOptions.identityProvider}].`
      );
      console.log(`The redirect IRI will be ${iriBase}`);
      console.log(
        "At the end of the registration process, you should get a client ID and secret."
      );
      clientInfo = await promptStaticClientInfo();
      loginOptions.clientId = clientInfo.clientId;
      loginOptions.clientSecret = clientInfo.clientSecret;
    }

    console.log(
      `Logging in ${validatedOptions.identityProvider} to get a refresh token.`
    );
    session.login(loginOptions).catch((e) => {
      throw new Error(`Login failed: ${e.toString()}`);
    });
  });

  app.get("/", async (_req, res) => {
    console.log("Login successful.");
    await session.handleIncomingRedirect(`${iriBase}${_req.url}`);
    // NB: This is a temporary approach, and we have work planned to properly
    // collect the token. Please note that the next line is not part of the public
    // API, and is therefore likely to break on non-major changes.
    const rawStoredSession = await storage.get(
      `solidClientAuthenticationUser:${session.info.sessionId}`
    );
    if (rawStoredSession === undefined) {
      throw new Error(
        `Cannot find session with ID [${session.info.sessionId}] in storage.`
      );
    }
    const storedSession = JSON.parse(rawStoredSession);
    console.log(`\nRefresh token: [${storedSession.refreshToken}]`);
    console.log(`Client ID: [${storedSession.clientId}]`);
    console.log(`Client Secret: [${storedSession.clientSecret}]`);

    res.send(
      "The tokens have been sent to the bootstraping app. You can close this window."
    );
    server.close();
  });
}

// Asynchronous operations are required to get user prompt, and top-level await
// are not supported yet, which is why an async main is used.
void main();
