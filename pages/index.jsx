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
import { TextField } from "@material-ui/core";
import { Autocomplete } from "@material-ui/lab";

const providers = [
  {
    logo: "solid-logo.svg",
    label: "broker.pod.inrupt.com",
    iri: "https://broker.pod.inrupt.com",
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
];

function setupOnProviderChange(setProviderIri) {
  return (e, newValue) => {
    console.log("New value: ", newValue);
    if (typeof newValue === "string") {
      if (newValue.startsWith("https://") || newValue.startsWith("http://")) {
        setProviderIri(newValue);
      } else if (newValue !== "") {
        setProviderIri(`https://${newValue}`);
      } else {
        setProviderIri("");
      }
    } else {
      setProviderIri(newValue?.iri || null);
    }
  };
}

function Form({
  providerIri,
  setProviderIri,
  clientName,
  setClientName,
  handleTokenGeneration,
}) {
  const onProviderChange = setupOnProviderChange(setProviderIri);
  return (
    <form>
      <label>
        Identity provider *{" "}
        <div className="tooltip">
          (?)
          <span className="tooltiptext">
            The Identity Provider is the service that provides you with an
            account associated to a login, password and/or other authentication
            methods.
          </span>
        </div>
        <Autocomplete
          options={providers}
          onChange={onProviderChange}
          onInputChange={onProviderChange}
          getOptionLabel={(option) => option.label}
          renderOption={(option) => {
            return <>{option.label}</>;
          }}
          inputValue={providerIri}
          renderInput={(params) => (
            <TextField
              {...params}
              margin="none"
              variant="outlined"
              type="url"
              style={{ width: 300 }}
            />
          )}
        />
      </label>
      <br />
      <label>
        Application name{" "}
        <div className="tooltip">
          (?)
          <span className="tooltiptext">
            The application name is displayed to the user when they are asked to
            authorize the application to access their data.
          </span>
        </div>
        <TextField
          margin="none"
          variant="outlined"
          value={clientName}
          style={{ width: 300 }}
          onChange={(e) => {
            setClientName(e.target.value);
          }}
        />
      </label>
      <br />
      <button type="button" onClick={(e) => handleTokenGeneration(e)}>
        Get a token
      </button>
    </form>
  );
}

function SessionInfo({ webId }) {
  if (webId) {
    return (
      <p>
        Logged in as <code>{webId}</code>
      </p>
    );
  }
  return <></>;
}

function ClientInfo({ clientInfo }) {
  if (clientInfo.clientId) {
    return (
      <div>
        <p>Your credentials are:</p>
        <pre>{JSON.stringify(clientInfo, null, "  ")}</pre>
      </div>
    );
  }
  return <></>;
}

function Dashboard({
  providerIri,
  setProviderIri,
  clientName,
  setClientName,
  handleTokenGeneration,
  clientInfo,
  webId,
}) {
  if (clientInfo.clientId) {
    return (
      <div>
        <SessionInfo webId={webId} />
        <ClientInfo clientInfo={clientInfo} />
        <Form
          providerIri={providerIri}
          setProviderIri={setProviderIri}
          clientName={clientName}
          setClientName={setClientName}
          handleTokenGeneration={handleTokenGeneration}
        />
      </div>
    );
  }
  return (
    <Form
      providerIri={providerIri}
      setProviderIri={setProviderIri}
      clientName={clientName}
      setClientName={setClientName}
      handleTokenGeneration={handleTokenGeneration}
    />
  );
}

export default function Home() {
  const [providerIri, setProviderIri] = useState("");
  const [clientName, setClientName] = useState("");
  const [webId, setWebId] = useState("");
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
  }, []);

  const handleTokenGeneration = (e) => {
    // The default behaviour of the button is to resubmit.
    // This prevents the page from reloading.
    e.preventDefault();
    if (providerIri) {
      const redirectTo = new URL("http://localhost:3000/api/login");
      redirectTo.searchParams.set("name", clientName);
      redirectTo.searchParams.set("issuer", encodeURIComponent(providerIri));
      window.location.href = redirectTo.href;
    } else {
      setInputErrorMessage("Setting an Identity Provider is required.");
    }
  };

  return (
    <div>
      <h1>Get an token for authenticating a Solid script</h1>
      <Dashboard
        clientInfo={clientInfo}
        clientName={clientName}
        setClientName={setClientName}
        providerIri={providerIri}
        setProviderIri={setProviderIri}
        handleTokenGeneration={handleTokenGeneration}
        webId={webId}
      />
    </div>
  );
}
