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

import { IStorage } from "@inrupt/solid-client-authn-node";
import {
  existsSync,
  writeFileSync,
  readFileSync,
  promises as fsPromises,
} from "fs";

const { readFile } = fsPromises;

export default class JsonFileStorage implements IStorage {
  constructor(private path: string) {
    if (!existsSync(path)) {
      writeFileSync(path, "{}", {
        encoding: "utf-8",
      });
    }
  }

  async get(key: string): Promise<string | undefined> {
    const rawContent = await readFile(this.path, {
      encoding: "utf-8",
    });
    const jsonContent = JSON.parse(rawContent);
    return jsonContent[key] || undefined;
  }

  async set(key: string, value: string): Promise<void> {
    const rawContent = readFileSync(this.path, {
      encoding: "utf-8",
    });
    const jsonContent = JSON.parse(rawContent);
    jsonContent[key] = value;
    writeFileSync(this.path, JSON.stringify(jsonContent), {
      encoding: "utf-8",
    });
  }

  async delete(key: string): Promise<void> {
    const rawContent = readFileSync(this.path, {
      encoding: "utf-8",
    });
    const jsonContent = JSON.parse(rawContent);

    delete jsonContent[key];
    writeFileSync(this.path, JSON.stringify(jsonContent), {
      encoding: "utf-8",
    });
  }
}

export const storage = new JsonFileStorage("./storage.json");
