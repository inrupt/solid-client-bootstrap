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

import React, { useEffect, useState } from "react";
import { FormControl, TextField } from "@material-ui/core";
import { Autocomplete } from "@material-ui/lab";

function getIdentityProviders() {
  return [
    {
      logo: "inrupt_logo-2020.svg",
      label: "pod.inrupt.com",
      iri: "https://broker.pod.inrupt.com/",
    },
    {
      logo: "solid-logo.svg",
      label: "Solidcommunity.net",
      iri: "https://solidcommunity.net/",
    },
    {
      logo: "solid-logo.svg",
      label: "Solidweb.org",
      iri: "https://solidweb.org/",
    },
    {
      logo: "inrupt_logo-2020.svg",
      label: "inrupt.net",
      iri: "https://inrupt.net/",
    },
  ];
}

export default function Home() {
  const [providerIri, setProviderIri] = useState();
  const [clientName, setClientName] = useState();
  const [loginError, setLoginError] = useState(
    "Please select your Identity Provider"
  );
  const [webId, setWebId] = useState();
  const [clientInfo, setClientInfo] = useState({});

  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.has("webId")) {
      setWebId(decodeURIComponent(url.searchParams.get("webId")));
    }
    if (url.searchParams.has("clientId")) {
      setClientInfo({
        clientId: url.searchParams.get("clientId"),
        clientSecret: url.searchParams.get("clientSecret"),
        refreshToken: url.searchParams.get("refreshToken"),
        issuer: url.searchParams.get("oidcIssuer"),
      });
    }
  }, [webId, clientInfo, clientName, providerIri]);

  const handleTokenGeneration = (e) => {
    // The default behaviour of the button is to resubmit.
    // This prevents the page from reloading.
    e.preventDefault();
    const redirectTo = new URL("http://localhost:3000/api/login");
    redirectTo.searchParams.set("name", clientName);
    redirectTo.searchParams.set("issuer", encodeURIComponent(providerIri));
    window.location.href = redirectTo.href;
  };

  function setupOnProviderChange(providerIriSetter, LoginErrorSetter) {
    return (e, newValue) => {
      LoginErrorSetter(null);
      if (typeof newValue === "string") {
        if (newValue.startsWith("https://") || newValue.startsWith("http://")) {
          providerIriSetter(newValue);
        } else {
          providerIriSetter(`https://${newValue}`);
        }
      } else {
        providerIriSetter(newValue?.iri || null);
      }
    };
  }

  const onProviderChange = setupOnProviderChange(setProviderIri, setLoginError);

  return (
    <div>
      <h1>Get an token for authenticating a Solid script</h1>
      <p>
        Logged in as <code>{webId}</code>
      </p>
      <p>Your credentials are:</p>
      <pre>{JSON.stringify(clientInfo, null, "  ")}</pre>
      <form>
        <div>
          <label>
            Identity provider{" "}
            <div className="tooltip">
              (?)
              <span className="tooltiptext">
                The Identity Provider is the service that provides you with an
                account associated to a login, password and/or other
                authentication methods.
              </span>
            </div>
          </label>
          <FormControl>
            <Autocomplete
              onChange={onProviderChange}
              onInputChange={onProviderChange}
              options={getIdentityProviders()}
              freeSolo
              style={{ width: 300 }}
              getOptionLabel={(option) => option.label}
              renderOption={(option) => {
                return <>{option.label}</>;
              }}
              inputValue={providerIri}
              renderInput={(params) => (
                <TextField
                  {...params}
                  error={!!loginError}
                  margin="none"
                  variant="outlined"
                  type="url"
                  aria-describedby={loginError ? "login-error-text" : null}
                />
              )}
            />
          </FormControl>
        </div>
        <div>
          <label>
            Application name{" "}
            <div className="tooltip">
              (?)
              <span className="tooltiptext">
                The application name is displayed to the user when they are
                asked to authorize the application to access their data.
              </span>
            </div>
          </label>

          <TextField
            margin="none"
            variant="outlined"
            aria-describedby={loginError ? "login-error-text" : null}
            value={clientName}
            onChange={(e) => {
              setClientName(e.target.value);
            }}
          />
        </div>
        <button onClick={(e) => handleTokenGeneration(e)}>Get a token</button>
      </form>
    </div>
  );
}
