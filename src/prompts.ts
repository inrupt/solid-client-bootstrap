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

import { IDP_POD_COMPAT, IDP_POD_INRUPT } from "./constants";
import inquirer from "inquirer";

const PROMPT_IDP_LIST = {
  type: "list",
  message: "What Identity Provider do you want to register your app to?",
  name: "identityProvider",
  choices: [
    { name: IDP_POD_INRUPT },
    { name: IDP_POD_COMPAT },
    { name: "My Identity provider is not on the list.", value: undefined },
  ],
};

const PROMPT_IDP_CUSTOM_INPUT = {
  type: "input",
  message:
    "What is the URL of the Identity Provider you want to register your app to?",
  name: "identityProvider",
  default: "",
};

export async function promptIdp(): Promise<string> {
  let { identityProvider } = await inquirer.prompt([PROMPT_IDP_LIST]);
  if (identityProvider === undefined) {
    identityProvider = (await inquirer.prompt([PROMPT_IDP_CUSTOM_INPUT]))
      .identityProvider;
  }
  return identityProvider;
}

const PROMPT_REGISTRATION_TYPE = {
  type: "list",
  message:
    "Do you want your app to go through static, or dynamic registration?",
  name: "registrationType",
  choices: [
    {
      name: "Static: more manual steps, but longer-lived credentials",
      value: "static",
    },
    {
      name: "Dynamic: less configuration, but credentials expire quicker.",
      value: "dynamic",
    },
  ],
  default: "dynamic",
};

export const promptRegistration = async () =>
  (await inquirer.prompt([PROMPT_REGISTRATION_TYPE])).registrationType;

const PROMPT_CLIENT_NAME = {
  type: "input",
  message: "What is the name of the app you are registering?",
  name: "clientName",
  default: undefined,
};

export const promptClientName = async () =>
  (await inquirer.prompt([PROMPT_CLIENT_NAME])).clientName;

const PROMPT_PORT = {
  type: "number",
  message: "On what port should the identity provider return the token?",
  name: "port",
  default: 3001,
};

export const promptPort = async () =>
  (await inquirer.prompt([PROMPT_PORT])).port;

const PROMPT_CLIENT_INFO = [
  {
    type: "input",
    message: "What is your registered client ID?",
    name: "clientId",
  },
  {
    type: "input",
    message: "What is your registered client secret?",
    name: "clientSecret",
  },
];
export const promptStaticClientInfo = async () =>
  inquirer.prompt(PROMPT_CLIENT_INFO);
